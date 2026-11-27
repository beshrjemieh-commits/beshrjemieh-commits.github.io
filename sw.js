// Keeps the app shell on the phone so it opens instantly, even on weak 4G; data always comes live from Supabase.
// 2026-11-22: blank white screen on slow 4G (Beshr). Before, every file waited for the network with no time limit.
const CACHE = "wallet-v207";
const SHELL = ["./", "index.html", "new/app.js", "new/onboard.js", "new/track.js", "new/style.css", "old.html", "shim.js", "i18n.js", "home.js", "extras.js", "motion.js", "icons.js", "riyal.js", "manifest.webmanifest", "vendor/supabase-2.118.0.js", "icon-180.png", "icon-192.png", "icon-512.png"];
const CDN = /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
const WAIT = 1500; // ms to wait for the network before showing the saved copy

self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));

self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const u = new URL(req.url);
  // fixed-version libraries and fonts: keep the saved copy, fetch once
  if (CDN.test(req.url)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === "opaque") { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return r; })));
    return;
  }
  if (u.origin !== location.origin) return;
  // videos: let Safari stream them itself (range requests)
  if (req.headers.has("range") || u.pathname.endsWith(".mp4")) return;
  // our own files: try the network for a moment (so updates show up), otherwise show the saved copy right away
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const saved = await cache.match(req, {ignoreSearch: true});
    const net = fetch(req, {cache: "no-cache"}).then(r => { if (r.ok) cache.put(req, r.clone()); return r; });
    if (!saved) return net.catch(() => cache.match("index.html"));
    e.waitUntil(net.catch(() => {}));
    return Promise.race([net.catch(() => saved), new Promise(res => setTimeout(() => res(saved), WAIT))]);
  })());
});

// Push (JC-015): the server sends {title, body, kind, url, id}; a tap opens the app on that screen (same site only)
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { return; }
  if (!d.title) return;
  const rtl = /[\u0600-\u06FF]/.test(d.title);
  e.waitUntil(self.registration.showNotification(String(d.title).slice(0, 80), {
    body: String(d.body || "").slice(0, 240), icon: "icon-192.png", badge: "icon-192.png", tag: String(d.kind || "wallet"),
    dir: rtl ? "rtl" : "ltr", lang: rtl ? "ar" : "en", data: { url: String(d.url || ""), id: String(d.id || "") }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const d = e.notification.data || {};
  let u; try { u = new URL(d.url || "", self.registration.scope); } catch (_) { u = new URL(self.registration.scope); }
  if (u.origin !== location.origin) u = new URL(self.registration.scope);
  if (d.id) u.searchParams.set("p", d.id);
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => x.url.startsWith(self.registration.scope));
    if (c) return c.focus().then(() => c.postMessage({ push: 1, url: u.href }));
    return self.clients.openWindow(u.href);
  }));
});
