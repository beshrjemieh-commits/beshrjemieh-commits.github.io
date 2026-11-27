// Supabase Edge Function "push" (Bani, JC-015): hourly web push for the Smart Wallet.
// ONE file on purpose (paste it into Dashboard > Edge Functions > push). No secrets in here:
// the VAPID keys are made on the first call and kept in private.push_config; pg_cron sends header x-cron.
// Reads the database directly with SUPABASE_DB_URL because schema "private" is not exposed by the API.
// The pure rules (what to send, caps) are exported and tested by tests/push.test.js (node tests/push.test.js).
// Body {"dry":true} (with x-cron) returns what WOULD be sent and sends nothing.

// ================= pure rules (no network, no Deno) =================
const H = 3600e3, D = 864e5, RIYADH = 3 * H;
export const KINDS = ["hunt", "price", "bank", "quiet"]; // priority order
export const CAP = { perDay: 1, perWeek: 3, pauseDays: 14, quietEvery: 14, huntWindowH: 2, priceWindowH: 24, minPct: 15 };

export type Log = { kind: string; ref: string; sent: number; clicked: boolean };
export type Doc = { id: string; [k: string]: unknown };
export type Input = {
  now: number; kinds: Record<string, boolean>; log: Log[];
  terms: string[]; acted: Record<string, string>;
  deals: Doc[]; prices: Doc[]; expenses: Doc[]; smscheck: Doc[];
};
export type Pick = { kind: string; ref: string; url: string; vars: Record<string, string | number> };

const pad = (n: number) => String(n).padStart(2, "0");
// Riyadh wall clock from a UTC millisecond time
export function riyadh(ms: number) {
  const d = new Date(ms + RIYADH);
  return { ymd: d.toISOString().slice(0, 10), h: d.getUTCHours(), m: d.getUTCMinutes(), dow: d.getUTCDay() };
}
export const ymdShift = (ymd: string, days: number) => new Date(Date.parse(ymd + "T00:00:00Z") + days * D).toISOString().slice(0, 10);
const dayDiff = (a: string, b: string) => Math.round((Date.parse(a + "T00:00:00Z") - Date.parse(b + "T00:00:00Z")) / D);

// Why we may NOT send right now (null = ok): quiet hours 22:00-09:00, Friday before 13:30, 1/day, 3/week
export function blocked(now: number, log: Log[]): string | null {
  const r = riyadh(now), mins = r.h * 60 + r.m;
  if (mins >= 22 * 60 || mins < 9 * 60) return "quiet-hours";
  if (r.dow === 5 && mins < 13 * 60 + 30) return "friday-morning";
  const today = r.ymd;
  if (log.some((l) => riyadh(l.sent).ymd === today)) return "daily-cap";
  if (log.filter((l) => now - l.sent < 7 * D).length >= CAP.perWeek) return "weekly-cap";
  return null;
}
// A kind whose last two pushes were both not opened is paused for 14 days after the latest one
export function paused(kind: string, log: Log[], now: number): boolean {
  const k = log.filter((l) => l.kind === kind).sort((a, b) => b.sent - a.sent);
  return k.length >= 2 && !k[0].clicked && !k[1].clicked && now - k[0].sent < CAP.pauseDays * D;
}

// ---- hunt words (same as new/app.js: hN, HP, hAlts) ----
const hN = (v: unknown) => String(v || "").toLowerCase().replace(/[ً-ٟـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\s+/g, " ").trim();
const norm = (s: unknown) => String(s || "").trim().replace(/\s+/g, " ");
const HP = [["ايفون", "iphone"], ["ايباد", "ipad"], ["ماك بوك", "macbook"], ["ايربودز", "airpods"], ["ساعه ابل", "apple watch"], ["سامسونج", "samsung"], ["جالكسي", "galaxy"], ["شاومي", "xiaomi"], ["هواوي", "huawei"], ["بلايستيشن", "playstation"], ["سوني", "sony"], ["اكس بوكس", "xbox"], ["نينتندو", "nintendo"], ["سويتش", "switch"], ["دايسون", "dyson"], ["لابتوب", "laptop"], ["شاشه", "tv"], ["كاميرا", "camera"], ["درون", "drone"], ["كامري", "camry"], ["كورولا", "corolla"], ["النترا", "elantra"], ["اكسنت", "accent"], ["سوناتا", "sonata"], ["لاندكروزر", "land cruiser"], ["تاهو", "tahoe"], ["يوكن", "yukon"], ["هايلكس", "hilux"], ["باترول", "patrol"], ["كنب", "sofa"], ["ثلاجه", "fridge"], ["غساله", "washing machine"], ["مكيف", "air conditioner"], ["دراجه", "bike"]];
const hAlts = (t: string) => { const n = hN(norm(t)); let o = " " + n + " "; HP.forEach(([a, e]) => { if (o.includes(" " + a + " ")) o = o.split(" " + a + " ").join(" " + e + " "); else if (o.includes(" " + e + " ")) o = o.split(" " + e + " ").join(" " + a + " "); }); o = o.trim(); return o && o !== n ? [n, o] : [n]; };
export function matchesHunt(deal: Doc, terms: string[]): boolean {
  const raw = (deal.match ?? "") as string;
  return terms.some((t) => {
    const tn = hN(t), alts = hAlts(t).map((a) => a.split(" ").filter((x) => x.length > 1)).filter((w) => w.length);
    if (!alts.length) return false;
    const h = hN(String(deal.title || "") + " " + String(deal.category || ""));
    return (raw && hN(raw) === tn) || alts.some((w) => w.every((x) => h.includes(x)));
  });
}
const dealPct = (d: Doc) => +(d.price as number) > 0 && +(d.market as number) > 0 ? Math.max(0, Math.round((1 - +(d.price as number) / +(d.market as number)) * 100)) : Math.round(+(d.pct as number) || 0);
const cut = (s: string, n: number) => { s = norm(s); if (s.length <= n) return s; const c = s.slice(0, n); return c.slice(0, Math.max(n - 12, c.lastIndexOf(" "))).trim() + "…"; };
const money = (n: number) => n.toFixed(2);

// ---- the four ideas: each returns a Pick or null ----
export function pickHunt(i: Input): Pick | null {
  if (!i.terms.length) return null;
  let best: { d: Doc; pct: number } | null = null;
  for (const d of i.deals) {
    const found = +(d.foundAt as number) || 0, pct = dealPct(d);
    if (!found || i.now - found > CAP.huntWindowH * H || found > i.now + 5 * 6e4) continue;
    if (pct < CAP.minPct || pct > 75 || !(+(d.price as number) > 0)) continue; // >75% off is more often a trap than a deal (same as the app's top pick)
    const st = String(i.acted[d.id] || d.status || "");
    if (/^(saved|hidden|dismissed)$/.test(st) || d.ended || d.reserved) continue;
    if (!matchesHunt(d, i.terms)) continue;
    if (!best || pct > best.pct) best = { d, pct };
  }
  if (!best) return null;
  return { kind: "hunt", ref: String(best.d.id), url: "?go=hunt&d=" + encodeURIComponent(String(best.d.id)), vars: { name: cut(String(best.d.title || "Deal"), 42), pct: best.pct, mins: Math.max(0, Math.round((i.now - +(best.d.foundAt as number)) / 6e4)) } };
}
// Same grouping as G2 in new/app.js: group by item|size, newest first, the newest record's store history; drop = newest below the one before
export function pickPrice(i: Input): Pick | null {
  const groups = new Map<string, { item: string; size: string; recs: { store: string; price: number; date: string; at: number }[] }>();
  for (const p of i.prices) {
    const item = norm(p.item), size = norm(p.size), store = norm(p.store), price = +(p.price as number) || 0;
    if (!item || !(price > 0) || !store || /\((shared|online)\)/i.test(store)) continue;
    const k = (item + "|" + size).toLowerCase();
    if (!groups.has(k)) groups.set(k, { item, size, recs: [] });
    groups.get(k)!.recs.push({ store, price, date: String(p.date || ""), at: +(p.createdAt as number) || 0 });
  }
  let best: { k: string; g: { item: string; size: string }; from: number; to: number; store: string; pct: number } | null = null;
  for (const [k, g] of groups) {
    g.recs.sort((a, b) => b.date.localeCompare(a.date) || b.at - a.at);
    const last = g.recs[0], hist = g.recs.filter((r) => r.store === last.store);
    if (hist.length < 2 || !(hist[0].price < hist[1].price)) continue;
    if (!last.at || i.now - last.at > CAP.priceWindowH * H || last.at > i.now + 5 * 6e4) continue;
    const pct = (hist[1].price - hist[0].price) / hist[1].price;
    if (!best || pct > best.pct) best = { k, g, from: hist[1].price, to: hist[0].price, store: last.store, pct };
  }
  if (!best) return null;
  return { kind: "price", ref: best.k + "|" + best.to + "|" + best.store, url: "?go=price&k=" + encodeURIComponent(best.k), vars: { item: cut((best.g.item + " " + best.g.size).trim(), 40), store: cut(best.store, 24), from: money(best.from), to: money(best.to) } };
}
export function pickQuiet(i: Input): Pick | null {
  const today = riyadh(i.now).ymd, dates = i.expenses.map((e) => String(e.date || "").slice(0, 10)).filter((d) => /^\d{4}-\d\d-\d\d$/.test(d) && d <= today);
  const recent = dates.filter((d) => d >= ymdShift(today, -6)).length;
  const before = dates.filter((d) => d >= ymdShift(today, -36) && d <= ymdShift(today, -7)).length;
  if (recent > 0 || before < 3) return null;
  if (i.log.some((l) => l.kind === "quiet" && i.now - l.sent < CAP.quietEvery * D)) return null;
  const last = dates.sort().at(-1)!;
  return { kind: "quiet", ref: "quiet-" + today, url: "?go=quiet", vars: { days: dayDiff(today, last) } };
}
export function pickBank(i: Input): Pick | null {
  const ids = i.smscheck.map((r) => String(r.id)).sort();
  if (!ids.length) return null;
  const old = new Set<string>();
  i.log.filter((l) => l.kind === "bank").forEach((l) => l.ref.replace(/^bank:/, "").split(",").forEach((x) => old.add(x)));
  if (!ids.some((x) => !old.has(x))) return null; // nothing new since the last bank push
  const pay = i.smscheck.filter((r) => r.kind === "pay").length;
  return { kind: "bank", ref: "bank:" + ids.join(",").slice(0, 600), url: "?go=bank", vars: { n: ids.length, pay, inn: ids.length - pay } };
}
const PICKERS: Record<string, (i: Input) => Pick | null> = { hunt: pickHunt, price: pickPrice, bank: pickBank, quiet: pickQuiet };

// The one thing to send this user now (or why not)
export function decide(i: Input): { pick: Pick | null; why: string } {
  const b = blocked(i.now, i.log);
  if (b) return { pick: null, why: b };
  const seen = new Set(i.log.map((l) => l.kind + "\u0000" + l.ref));
  for (const k of KINDS) {
    if (i.kinds[k] === false || paused(k, i.log, i.now)) continue;
    const p = PICKERS[k](i);
    if (p && !seen.has(p.kind + "\u0000" + p.ref)) return { pick: p, why: "ok" };
  }
  return { pick: null, why: "nothing-new" };
}

// ---- words (from mockups/ideas.json; Western digits; "SAR"/"ريال" because the new riyal sign may not show in a notification) ----
const arMin = (n: number) => n < 2 ? "قبل شوي" : n < 60 ? (n <= 10 ? `قبل ${n} دقايق` : `قبل ${n} دقيقة`) : n < 90 ? "قبل ساعة" : "قبل ساعتين";
const enMin = (n: number) => n < 2 ? "just now" : n < 60 ? `${n} min ago` : n < 90 ? "1 h ago" : "2 h ago";
const arCount = (n: number) => n === 1 ? "رسالة" : n === 2 ? "رسالتين" : n <= 10 ? `${n} رسائل` : `${n} رسالة`;
export function words(p: Pick, lang: string): { title: string; body: string } {
  const v = p.vars, ar = lang === "ar";
  if (p.kind === "hunt") return ar
    ? { title: "لقينا لك فرصة", body: `${v.name} أقل من السوق بـ ${v.pct}%، نزل ${arMin(+v.mins).replace("قبل شوي", "الحين")}. شوفه قبل لا يروح.` }
    : { title: "Your hunt found one", body: `${v.name} is ${v.pct}% below market, listed ${enMin(+v.mins)}. Worth a look before it goes.` };
  if (p.kind === "price") return ar
    ? { title: "صار أرخص اليوم", body: `${v.item} نزل إلى ${v.to} ريال في ${v.store}. آخر مرة دفعت ${v.from} ريال.` }
    : { title: "Cheaper today", body: `${v.item} dropped to SAR ${v.to} at ${v.store}. You paid SAR ${v.from} last time.` };
  if (p.kind === "quiet") return ar
    ? { title: "أسبوع هادي؟", body: `ما سجلت شي من ${+v.days <= 10 ? v.days + " أيام" : v.days + " يوم"}. ما صرفت ولا نسيت؟ ضيفه بـ 5 ثواني.` }
    : { title: "A quiet week?", body: `Nothing logged for ${v.days} days. Spent nothing, or forgot one? Add it in 5 seconds.` };
  const n = +v.n, pay = +v.pay, inn = +v.inn;
  const enMix = n === 1 ? "It looks like " + (pay ? "a purchase" : "money in") + ". One tap to sort it." : pay && inn ? `${inn} look${inn === 1 ? "s" : ""} like money in, ${pay} like ${pay === 1 ? "a purchase" : "purchases"}. One tap each to sort them.` : `${pay ? "They look like purchases" : "They look like money in"}. One tap each to sort them.`;
  const arMix = n === 1 ? "شكلها " + (pay ? "شراء" : "دخل") + ". ضغطة وتترتب." : pay && inn ? `${inn} شكلها دخل و${pay} شراء. ضغطة لكل وحدة وتترتب.` : `${pay ? "شكلها شراء" : "شكلها دخل"}. ضغطة لكل وحدة وتترتب.`;
  return ar
    ? { title: n === 1 ? "رسالة من البنك تحتاجك" : `${arCount(n)} من البنك تحتاجك`, body: arMix }
    : { title: n === 1 ? "1 bank message to check" : `${n} bank messages to check`, body: enMix };
}

// ================= web push (RFC 8030 + 8291 aes128gcm + RFC 8292 VAPID), WebCrypto only =================
const enc = new TextEncoder();
export const b64u = (b: ArrayBuffer | Uint8Array) => { const u = b instanceof Uint8Array ? b : new Uint8Array(b); let s = ""; u.forEach((c) => (s += String.fromCharCode(c))); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
export const unb64u = (s: string) => { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; const r = atob(s), u = new Uint8Array(r.length); for (let i = 0; i < r.length; i++) u[i] = r.charCodeAt(i); return u; };
const cat = (...a: Uint8Array[]) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let p = 0; a.forEach((x) => { o.set(x, p); p += x.length; }); return o; };
const hkdf = async (salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number) => new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]), len * 8));

export async function makeVapid() {
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const pub = b64u(await crypto.subtle.exportKey("raw", kp.publicKey));
  const jwk = await crypto.subtle.exportKey("jwk", kp.privateKey);
  return { vapid_public: pub, vapid_private: JSON.stringify({ kty: "EC", crv: "P-256", x: jwk.x, y: jwk.y, d: jwk.d }) };
}
async function vapidHeader(endpoint: string, pub: string, priv: string, subject: string) {
  const key = await crypto.subtle.importKey("jwk", JSON.parse(priv), { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const head = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const body = b64u(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })));
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(head + "." + body)));
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${pub}`;
}
export async function encrypt(payload: string, p256dh: string, authSecret: string) {
  const ua = unb64u(p256dh), auth = unb64u(authSecret), salt = crypto.getRandomValues(new Uint8Array(16));
  const eph = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPub = new Uint8Array(await crypto.subtle.exportKey("raw", eph.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", ua, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const secret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, eph.privateKey, 256));
  const prk = await hkdf(auth, secret, cat(enc.encode("WebPush: info\0"), ua, asPub), 32);
  const cek = await hkdf(salt, prk, enc.encode("Content-Encoding: aes128gcm\0"), 16), nonce = await hkdf(salt, prk, enc.encode("Content-Encoding: nonce\0"), 12);
  const data = cat(enc.encode(payload), new Uint8Array([2])); // 0x02 = last record
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]), data));
  return cat(salt, new Uint8Array([0, 0, 0x10, 0]), new Uint8Array([asPub.length]), asPub, ct); // record size 4096
}
// Only real push services (Security, Hares 2026-11-27): https, no port, known host. Anything else is never contacted.
export const PUSH_HOST = /^(web\.push\.apple\.com|fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9-]+\.notify\.windows\.com)$/;
export function endpointOk(endpoint: string): boolean {
  try { const u = new URL(endpoint); return u.protocol === "https:" && !u.port && !u.username && !u.password && PUSH_HOST.test(u.hostname); } catch (_) { return false; }
}
async function sendPush(sub: { endpoint: string; p256dh: string; auth: string }, payload: object, cfg: { vapid_public: string; vapid_private: string }, subject: string) {
  if (!endpointOk(sub.endpoint)) return 0;
  const body = await encrypt(JSON.stringify(payload), sub.p256dh, sub.auth);
  const r = await fetch(sub.endpoint, { method: "POST", headers: { Authorization: await vapidHeader(sub.endpoint, cfg.vapid_public, cfg.vapid_private, subject), "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream", TTL: "86400", Urgency: "normal" }, body, redirect: "manual", signal: AbortSignal.timeout(10000) });
  await r.text().catch(() => "");
  return r.status;
}

// ================= the job (Deno only) =================
// deno-lint-ignore no-explicit-any
export async function run(sql: any, dry: boolean, now: number) {
  const [cfg] = await sql`select vapid_public, vapid_private from private.push_config where id = 1`;
  const subject = (globalThis as { Deno?: { env: { get(k: string): string | undefined } } }).Deno?.env.get("VAPID_SUBJECT") || "https://beshrjemieh-commits.github.io";
  const subs = await sql`select endpoint, user_id, p256dh, auth, lang, kinds from public.push_subs order by created_at`;
  const byUser = new Map<string, typeof subs>();
  subs.forEach((s: { user_id: string }) => { if (!byUser.has(s.user_id)) byUser.set(s.user_id, []); byUser.get(s.user_id)!.push(s); });
  // shared Forsa feed = deals of the account whose hunt ran last (same rule as rpc shared_deals, which needs a signed-in caller)
  const [own] = await sql`select user_id from public.app_docs where coll = 'settings' and id = 'hunt' and data->'lastRunAt' is not null order by (case when data->>'lastRunAt' ~ '^[0-9]+$' then (data->>'lastRunAt')::numeric else 0 end) desc limit 1`;
  const since = now - CAP.huntWindowH * H - 6e5, today = riyadh(now).ymd, from36 = ymdShift(today, -40);
  const FOUND = sql`case when data->>'foundAt' ~ '^[0-9]+$' then (data->>'foundAt')::numeric else 0 end`;
  const sum = { users: byUser.size, sent: 0, skipped: 0, failed: 0, would: [] as unknown[], reasons: {} as Record<string, number> };
  const why = (w: string) => { sum.skipped++; sum.reasons[w] = (sum.reasons[w] || 0) + 1; };
  const shared = own ? await sql`select id, data from public.app_docs where user_id = ${own.user_id} and coll = 'deals' and id not like 'cmp-%' and coalesce(data->>'status','') <> 'hidden' and ${FOUND} >= ${since}::numeric` : [];
  for (const [uid, list] of byUser) {
    try {
      const logRows = await sql`select kind, ref, sent_at, clicked_at from public.push_log where user_id = ${uid} and sent_at > now() - interval '60 days'`;
      const log: Log[] = logRows.map((r: { kind: string; ref: string; sent_at: Date; clicked_at: Date | null }) => ({ kind: r.kind, ref: String(r.ref || ""), sent: +new Date(r.sent_at), clicked: !!r.clicked_at }));
      // cheap early exit before reading any of his data
      const b = blocked(now, log); if (b) { why(b); continue; }
      const kinds = Object.assign({ hunt: true, price: true, quiet: true, bank: true }, list.find((s: { kinds: unknown }) => s.kinds)?.kinds || {});
      const docs = async (coll: string, extra = sql``) => (await sql`select id, data from public.app_docs where user_id = ${uid} and coll = ${coll} ${extra}`).map((r: { id: string; data: Record<string, unknown> }) => ({ ...(r.data || {}), id: r.id }));
      const settings = await sql`select id, data from public.app_docs where user_id = ${uid} and coll = 'settings' and id in ('hunt','forsa')`;
      const set = Object.fromEntries(settings.map((r: { id: string; data: Record<string, unknown> }) => [r.id, r.data || {}]));
      const ownDeals = await docs("deals", sql`and ${FOUND} >= ${since}::numeric`);
      const seen = new Set(ownDeals.map((d: Doc) => d.id));
      const sharedDeals = own && own.user_id === uid ? [] : shared.map((r: { id: string; data: Record<string, unknown> }) => ({ ...(r.data || {}), id: r.id })).filter((d: Doc) => !seen.has(d.id));
      const input: Input = {
        now, kinds, log,
        terms: (((set.hunt as { terms?: string[] }) || {}).terms || []).map(String),
        acted: ((set.forsa as { acted?: Record<string, string> }) || {}).acted || {},
        deals: ownDeals.concat(sharedDeals),
        prices: kinds.price === false ? [] : await docs("prices"),
        expenses: kinds.quiet === false ? [] : await docs("expenses", sql`and substr(coalesce(data->>'date',''),1,10) >= ${from36}::text`),
        smscheck: kinds.bank === false ? [] : await docs("smscheck"),
      };
      const { pick, why: w } = decide(input);
      if (!pick) { why(w); continue; }
      if (dry) { sum.would.push({ user: String(uid).slice(0, 8), kind: pick.kind, ref: pick.ref.slice(0, 60), en: words(pick, "en"), ar: words(pick, "ar") }); sum.sent++; continue; }
      const [row] = await sql`insert into public.push_log (user_id, kind, ref) values (${uid}, ${pick.kind}, ${pick.ref}) returning id`;
      let ok = 0;
      for (const s of list) {
        const t = words(pick, s.lang === "ar" ? "ar" : "en");
        const st = await sendPush(s, { title: t.title, body: t.body, kind: pick.kind, url: pick.url, id: String(row.id) }, cfg, subject).catch(() => 0);
        if (st === 404 || st === 410) await sql`delete from public.push_subs where endpoint = ${s.endpoint}`;
        else if (st >= 200 && st < 300) ok++;
      }
      if (ok) sum.sent++; else { await sql`delete from public.push_log where id = ${row.id}`; sum.failed++; why("send-failed"); }
    } catch (e) { sum.failed++; why("error:" + String((e as Error).message).slice(0, 60)); }
  }
  return sum;
}

if (typeof Deno !== "undefined" && (import.meta as { main?: boolean }).main !== false) {
  Deno.serve(async (req) => {
    const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });
    // deno-lint-ignore no-explicit-any
    let sql: any;
    try {
      const { default: postgres } = await import("npm:postgres@3.4.5");
      sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { max: 1, prepare: false, idle_timeout: 5 });
      let [cfg] = await sql`select vapid_public, vapid_private, cron_secret from private.push_config where id = 1`;
      if (!cfg) { await sql`insert into private.push_config (id) values (1) on conflict (id) do nothing`; [cfg] = await sql`select vapid_public, vapid_private, cron_secret from private.push_config where id = 1`; }
      // first call ever: make the VAPID key pair (nobody has to handle keys). Needs no secret, and only fills an empty row.
      if (!cfg.vapid_public || !cfg.vapid_private) {
        const k = await makeVapid();
        await sql`update private.push_config set vapid_public = ${k.vapid_public}, vapid_private = ${k.vapid_private} where id = 1 and (vapid_public is null or vapid_private is null)`;
      }
      const got = req.headers.get("x-cron") || "";
      if (!cfg.cron_secret || got !== cfg.cron_secret) return json({ error: "unauthorized", keys: "ready" }, 401);
      const body = await req.json().catch(() => ({}));
      return json(await run(sql, !!(body && body.dry), Date.now()));
    } catch (e) {
      return json({ error: String((e as Error).message).slice(0, 200) }, 500);
    } finally { try { await sql?.end({ timeout: 2 }); } catch (_) { /* closed */ } }
  });
}
