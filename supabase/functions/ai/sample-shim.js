/* ---------- claude.use("sample"): Claude through the "ai" Edge Function ---------- */
function makeSample(sb, fnUrl){
  const err = (code, message, text) => { const e = {code, message}; if (text) e.text = text; return e; };
  const IMG_TYPES = ["image/jpeg","image/png","image/webp","image/gif"];

  // Downsize to ~1.2 MP JPEG, like the claude.ai runtime does
  async function toImageBlock(blob){
    if (!(blob instanceof Blob)) throw err("invalid_request","images must be Blobs");
    if (blob.size > 20e6) throw err("image_rejected","Image over 20 MB");
    let bmp;
    try { bmp = await createImageBitmap(blob, {imageOrientation:"from-image"}); }
    catch { throw err("image_rejected","Could not open that image"); }
    const k = Math.min(1, Math.sqrt(1.2e6 / (bmp.width * bmp.height)));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const url = c.toDataURL("image/jpeg", 0.85);
    return {type:"image", source:{type:"base64", media_type:"image/jpeg", data:url.slice(url.indexOf(",")+1)}};
  }

  function toTurns(input){
    if (typeof input === "string") { if (!input.trim()) throw err("invalid_request","input is empty"); return [{role:"user", content:input}]; }
    if (!Array.isArray(input) || !input.length) throw err("invalid_request","input must be a string or a list of turns");
    const out = [];
    for (const t of input) {
      if (!t || (t.role !== "user" && t.role !== "assistant") || typeof t.content !== "string" || !t.content.trim()) throw err("invalid_request","each turn needs role user|assistant and text content");
      const last = out[out.length-1];
      if (last && last.role === t.role) last.content += "\n\n" + t.content; else out.push({role:t.role, content:t.content});
    }
    if (out[0].role !== "user" || out[out.length-1].role !== "user") throw err("invalid_request","turns must start and end with a user turn");
    return out;
  }

  async function round(body, signal){
    const {data:{session}} = await sb.auth.getSession();
    if (!session) throw err("session_expired","Sign in again.");
    let res;
    try {
      res = await fetch(fnUrl, {method:"POST", signal, headers:{"Content-Type":"application/json", Authorization:"Bearer "+session.access_token, apikey:SUPABASE_KEY}, body:JSON.stringify(body)});
    } catch (e) { throw signal?.aborted ? err("cancelled","Stopped") : err("upstream_error","No connection"); }
    let data = null; try { data = await res.json(); } catch {}
    if (!res.ok || !data || data.error) {
      const e = data?.error || {};
      if (res.status === 401) throw err("session_expired", e.message || "Sign in again.");
      throw err(e.code || "upstream_error", e.message || ("AI error " + res.status));
    }
    return data;
  }

  async function run(input, opts, asJson){
    opts = opts || {};
    if (Object.prototype.toString.call(opts) !== "[object Object]") throw err("invalid_request","options must be a plain object");
    const signal = opts.signal;
    if (signal && !(signal instanceof AbortSignal)) throw err("invalid_request","signal must be an AbortSignal (pass ctl.signal)");
    if (signal?.aborted) throw err("cancelled","Stopped");
    const turns = toTurns(input);
    const msgs = turns.map(t => ({role:t.role, content:[{type:"text", text:t.content}]}));
    let imgs = opts.images ? (opts.images instanceof Blob ? [opts.images] : Array.from(opts.images)) : [];
    if (imgs.length > 5) throw err("image_rejected","At most 5 images");
    if (imgs.length) { const blocks = await Promise.all(imgs.map(toImageBlock)); msgs[msgs.length-1].content.unshift(...blocks); }
    const tools = Array.isArray(opts.tools) ? opts.tools : [];
    const byName = Object.fromEntries(tools.map(t => [t.name, t]));
    const toolDefs = tools.map(t => ({name:t.name, description:t.description, input_schema:t.inputSchema || {type:"object", properties:{}}}));
    const tier = ({quick:1, default:1, complex:1})[opts.modelTier] ? opts.modelTier : "default";
    let all = "", last = "", truncated = false;
    for (let r = 0; r < 6; r++) {
      const data = await round({messages:msgs, tools: toolDefs, tier, effort:opts.effort, json:asJson}, signal);
      if (signal?.aborted) throw err("cancelled","Stopped", all || undefined);
      if (data.stop_reason === "refusal") throw err("refused","Claude declined this request.");
      last = data.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
      if (last) { all = all ? all + "\n\n" + last : last; try { opts.onText?.({text:all, delta: all === last ? last : "\n\n"+last}); } catch(e){ console.error(e); } }
      truncated = data.stop_reason === "max_tokens";
      const uses = data.content.filter(b => b.type === "tool_use");
      if (data.stop_reason !== "tool_use" || !uses.length) break;
      msgs.push({role:"assistant", content:data.content});
      const results = await Promise.all(uses.map(async u => {
        const t = byName[u.name];
        try {
          if (!t) throw new Error("Unknown tool " + u.name);
          const out = await t.execute(u.input || {}, {signal: signal || new AbortController().signal});
          return {type:"tool_result", tool_use_id:u.id, content: (typeof out === "string" ? out : JSON.stringify(out ?? null)).slice(0, 32000)};
        } catch (e) { return {type:"tool_result", tool_use_id:u.id, is_error:true, content:"Error: " + (e?.message || e)}; }
      }));
      msgs.push({role:"user", content:results});
    }
    if (!all) throw err("empty_completion","Claude wrote no text.");
    if (!asJson) return {text:all, truncated, modelTierApplied:tier};
    const src = last || all;
    const tryParse = s => { try { return {ok:true, v:JSON.parse(s)}; } catch { return {ok:false}; } };
    let p = tryParse(src.trim());
    if (!p.ok) { const m = src.match(/```(?:json)?\s*([\s\S]*?)```/); if (m) p = tryParse(m[1].trim()); }
    if (!p.ok) { const i = src.search(/[\[{]/), j = Math.max(src.lastIndexOf("}"), src.lastIndexOf("]")); if (i >= 0 && j > i) p = tryParse(src.slice(i, j+1)); }
    if (!p.ok || truncated) throw err("invalid_json", truncated ? "Answer was cut short" : "No JSON in the answer", all);
    return p.v;
  }

  const sample = (input, opts) => run(input, opts, false);
  sample.json = (input, opts) => run(input, opts, true);
  sample.limits = async () => ({maxPromptBytes:262144, images:{maxCount:5, maxInputBytes:20e6, mediaTypes:IMG_TYPES}, tools:{maxCount:20}, modelTiers:["default","complex","quick"]});
  return Object.freeze(sample);
}
