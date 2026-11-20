/* Smart Wallet: sign-in + a small saving layer on Supabase.
   It gives the app the same calls it used inside Claude (doc/collection, get/set/update/delete/add, onSnapshot),
   so the app code stays the same. Every row belongs to the signed-in user (row level security). */
(function(){
  const SUPABASE_URL = "https://rvqjjbgeossfygaglohe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_DSFK-TyIwyuAzYjF0mWWNA_vOedk4zz"; // publishable key: safe in the browser
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {auth:{persistSession:true, autoRefreshToken:true}});
  window.__sb = sb;
  let user = null, readyResolve; const ready = new Promise(r => readyResolve = r);

  /* ---------- data layer ---------- */
  const cache = {};            // coll -> Map(id -> data)
  const loaded = {};           // coll -> Promise
  const collSubs = {};         // coll -> Set(fn)
  const docSubs = {};          // "coll/id" -> Set(fn)
  const clone = o => o == null ? o : JSON.parse(JSON.stringify(o));
  const split = p => { const a = String(p).split("/"); return [a[0], a.slice(1).join("/")]; };
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  function err(e){ const x = new Error(e && e.message || "error"); x.code = /permission|denied|rls/i.test(x.message) ? "permission_denied" : "error"; return x; }
  async function load(c, force){
    if(loaded[c] && !force) return loaded[c];
    loaded[c] = (async () => {
      const m = new Map(); let from = 0;
      for(;;){
        const {data, error} = await sb.from("app_docs").select("id,data").eq("coll", c).range(from, from + 999);
        if(error) { delete loaded[c]; throw err(error); }
        data.forEach(r => m.set(r.id, r.data)); if(data.length < 1000) break; from += 1000;
      }
      cache[c] = m; return m;
    })();
    return loaded[c];
  }
  const docSnap = (c, id) => { const m = cache[c]; const has = !!(m && m.has(id)); const d = has ? m.get(id) : undefined; return {id, exists: has, data: () => clone(d)}; };
  const collSnap = c => { const docs = [...(cache[c] || new Map()).entries()].map(([id, d]) => ({id, exists: true, data: () => clone(d)})); return {docs, size: docs.length, empty: !docs.length, forEach: f => docs.forEach(f)}; };
  function emit(c, id){
    (collSubs[c] || []).forEach(f => { try{ f(collSnap(c)); }catch(e){ console.error(e); } });
    if(id != null) (docSubs[c + "/" + id] || []).forEach(f => { try{ f(docSnap(c, id)); }catch(e){ console.error(e); } });
    else Object.keys(docSubs).filter(k => k.startsWith(c + "/")).forEach(k => docSubs[k].forEach(f => { try{ f(docSnap(c, k.slice(c.length + 1))); }catch(e){} }));
  }
  async function write(c, id, data){
    await load(c);
    const {error} = await sb.from("app_docs").upsert({coll: c, id, data, updated_at: new Date().toISOString()}, {onConflict: "user_id,coll,id"});
    if(error) throw err(error);
    cache[c].set(id, clone(data)); emit(c, id);
  }
  function docRef(path){
    const [c, id] = split(path);
    return {
      id, path,
      async get(){ await load(c); return docSnap(c, id); },
      async set(data){ return write(c, id, clone(data) || {}); },
      async update(patch){ await load(c); if(!cache[c].has(id)) throw Object.assign(new Error("not found"), {code: "not_found"});
        const cur = clone(cache[c].get(id)) || {}; Object.entries(patch || {}).forEach(([k, v]) => { if(v && v.__delete__) delete cur[k]; else cur[k] = clone(v); }); return write(c, id, cur); },
      async delete(){ await load(c); const {error} = await sb.from("app_docs").delete().eq("coll", c).eq("id", id); if(error) throw err(error); cache[c].delete(id); emit(c, id); },
      onSnapshot(fn, onErr){ const k = c + "/" + id; (docSubs[k] = docSubs[k] || new Set()).add(fn);
        load(c).then(() => fn(docSnap(c, id))).catch(e => onErr && onErr(e)); return () => docSubs[k].delete(fn); }
    };
  }
  function collRef(c){
    return {
      doc: id => docRef(c + "/" + (id || newId())),
      async add(data){ const id = newId(); await write(c, id, clone(data) || {}); return docRef(c + "/" + id); },
      async get(){ await load(c); return collSnap(c); },
      onSnapshot(fn, onErr){ (collSubs[c] = collSubs[c] || new Set()).add(fn);
        load(c).then(() => fn(collSnap(c))).catch(e => onErr && onErr(e)); return () => collSubs[c].delete(fn); }
    };
  }
  const db = {doc: docRef, collection: collRef};
  // pick up changes made on another device when the app comes back to the front
  document.addEventListener("visibilitychange", () => { if(document.visibilityState === "visible" && user)
    Object.keys(loaded).forEach(c => load(c, true).then(() => emit(c)).catch(() => {})); });

  /* ---------- receipt and product photos: private storage, one folder per user ---------- */
  const assets = {
    async upload(blob){
      const byExt = {png:"image/png", jpg:"image/jpeg", jpeg:"image/jpeg", webp:"image/webp", gif:"image/gif", heic:"image/heic", heif:"image/heif", pdf:"application/pdf"};
      const type = blob.type || byExt[String(blob.name || "").split(".").pop().toLowerCase()] || "application/octet-stream", ext = (type.split("/")[1] || "bin").replace(/[^a-z0-9]/gi, "").slice(0, 5);
      const path = user.id + "/" + newId() + "." + ext;
      const {error} = await sb.storage.from("receipts").upload(path, blob, {contentType: type});
      if(error) throw err(error);
      const {data, error: e2} = await sb.storage.from("receipts").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      if(e2) throw err(e2);
      return {id: path, url: data.signedUrl, contentType: type, sizeBytes: blob.size};
    },
    async delete(id){ await sb.storage.from("receipts").remove([id]); },
    async list(){ return {assets: [], usage: {}}; }
  };

  /* ---------- claude.use("sample"): Claude through the "ai" Edge Function ---------- */
  function makeSample(sb, fnUrl){
    const err = (code, message, text) => { const e = {code, message}; if (text) e.text = text; if (code === "cancelled") e.name = "AbortError"; return e; };
    const IMG_TYPES = ["image/jpeg","image/png","image/webp","image/gif"];

    // Downsize to ~1.2 MP JPEG, like the claude.ai runtime does
    async function toImageBlock(blob){
      if (!(blob instanceof Blob)) throw err("invalid_request","images must be Blobs");
      if (blob.size > 20e6) throw err("image_rejected","Image over 20 MB");
      let bmp;
      try { bmp = await createImageBitmap(blob, {imageOrientation:"from-image"}); }
      catch {
        // Fallback (e.g. HEIC or a file with no type): let the browser decode it as an <img>
        bmp = await new Promise((ok, no) => { const u = URL.createObjectURL(blob), im = new Image();
          im.onload = () => { URL.revokeObjectURL(u); ok({width: im.naturalWidth, height: im.naturalHeight, img: im}); };
          im.onerror = () => { URL.revokeObjectURL(u); no(err("image_rejected","Could not open that image")); }; im.src = u; });
      }
      const k = Math.min(1, Math.sqrt(1.2e6 / (bmp.width * bmp.height)));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
      c.getContext("2d").drawImage(bmp.img || bmp, 0, 0, c.width, c.height);
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
  const sampleNS = makeSample(sb, SUPABASE_URL + "/functions/v1/ai");

  window.claude = { use: async name => { if(name === "db"){ await ready; return db; } if(name === "assets"){ await ready; return assets; } if(name === "sample"){ await ready; return sampleNS; } return null; } };

  /* ---------- sign-in screen ---------- */
  const css = `#authGate{position:fixed;inset:0;z-index:1000;background:#121614;color:#e7ece8;display:flex;align-items:center;justify-content:center;padding:max(24px,env(safe-area-inset-top)) 20px max(24px,env(safe-area-inset-bottom));font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;overflow:auto}
#authGate .box{width:100%;max-width:400px;display:flex;flex-direction:column;gap:12px}
#authGate img{width:64px;height:64px;border-radius:16px}
#authGate h1{font-size:30px;margin:4px 0 0;letter-spacing:-.02em}
#authGate p{margin:0;color:#9aa69f}
#authGate form{background:#1a201d;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;margin-top:8px}
#authGate label{font-size:13px;font-weight:600;color:#9aa69f}
#authGate input{height:46px;border-radius:12px;border:1px solid #2c3531;background:#121614;color:#e7ece8;padding:0 12px;font-size:16px;width:100%;box-sizing:border-box}
#authGate button{height:46px;border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer}
#authGate .go{background:#5fc3a6;color:#0f1a16}
#authGate .sw{background:none;color:#5fc3a6}
#authGate .st{min-height:1.3em;font-size:14px;text-align:center;color:#9aa69f}
#authGate .st.err{color:#f07b7b}`;
  function gate(){
    if(document.getElementById("authGate")) return;
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    const g = document.createElement("div"); g.id = "authGate";
    g.innerHTML = `<div class="box"><img src="icon-192.png" alt=""><h1>Smart Wallet</h1><p>Your balance, spending, prices and deals in one place.</p>
      <form novalidate><label for="gEmail">Email</label><input id="gEmail" type="email" autocomplete="email" inputmode="email">
      <label for="gPass">Password</label><input id="gPass" type="password" autocomplete="current-password">
      <button class="go" type="submit">Sign in</button><div class="st" role="status"></div></form>
      <button class="sw" type="button">New here? Create an account</button></div>`;
    document.body.appendChild(g);
    let signup = false; const go = g.querySelector(".go"), sw = g.querySelector(".sw"), s = g.querySelector(".st");
    sw.onclick = () => { signup = !signup; go.textContent = signup ? "Create account" : "Sign in"; sw.textContent = signup ? "Have an account? Sign in" : "New here? Create an account"; s.textContent = ""; };
    g.querySelector("form").onsubmit = async e => {
      e.preventDefault(); const email = g.querySelector("#gEmail").value.trim(), password = g.querySelector("#gPass").value;
      s.className = "st"; if(!email || password.length < 6){ s.textContent = "Enter your email and a password of at least 6 characters."; s.className = "st err"; return; }
      go.disabled = true; s.textContent = signup ? "Creating your account…" : "Signing in…";
      const {data, error} = signup ? await sb.auth.signUp({email, password}) : await sb.auth.signInWithPassword({email, password});
      go.disabled = false;
      if(error){ s.textContent = /confirm/i.test(error.message) ? "Please tap the confirm link in your email first, then sign in." : error.message; s.className = "st err"; return; }
      if(signup && !data.session){ sw.click(); s.textContent = "Check your email and tap the confirm link, then sign in here."; }
    };
  }
  function start(u){
    if(user) { if(!u || u.id !== user.id) location.reload(); return; }
    if(!u){ if(document.body) gate(); else document.addEventListener("DOMContentLoaded", gate); return; }
    user = u; const g = document.getElementById("authGate"); if(g) g.remove(); readyResolve();
  }
  window.walletSignOut = async () => { await sb.auth.signOut(); location.reload(); };
  sb.auth.getSession().then(({data}) => start(data.session && data.session.user));
  sb.auth.onAuthStateChange((ev, session) => { if(ev === "SIGNED_IN" || ev === "SIGNED_OUT") start(session && session.user); });
  if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
