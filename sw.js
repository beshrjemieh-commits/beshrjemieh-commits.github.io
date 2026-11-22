// Keeps the app shell on the phone so it opens instantly, even on weak 4G; data always comes live from Supabase.
// 2026-11-22: blank white screen on slow 4G (Beshr). Before, every file waited for the network with no time limit.
const CACHE = "wallet-v77";
const SHELL = ["./", "index.html", "shim.js", "i18n.js", "home.js", "extras.js", "motion.js", "icons.js", "riyal.js", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
const CDN = /^https:\/\/(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
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
