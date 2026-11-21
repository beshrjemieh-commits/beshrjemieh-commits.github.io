/* Small quality details (Beshr 2026-11-22): two soft sounds, Undo after delete, true black dark mode option. Kept light. */
(function(){
  const LS = { get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set(k, v){ try { localStorage.setItem(k, v); } catch(e){} } };
  const T = s => (window.T ? window.T(s) : s);

  /* ---- look: Light (default, even when the iPhone is in dark mode), Dark, or True black (Beshr 2026-11-22: "it feels so dark") ---- */
  const theme = () => { const t = LS.get("w-theme"); if(t === "dark" || t === "black") return t; return LS.get("w-black") === "1" ? "black" : "light"; };
  const off = new WeakSet();
  function fixRules(list){ if(!list) return; for(const r of list){
      if(r.media && r.conditionText !== undefined && /prefers-color-scheme:\s*dark/.test(r.media.mediaText) && !off.has(r)){ off.add(r); r._orig = r.media.mediaText; }
      if(r._orig){ r.media.mediaText = theme() === "light" ? "not all" : "all"; }
      if(r.cssRules) fixRules(r.cssRules); } }
  function applyTheme(){
    const t = theme(), h = document.documentElement;
    h.classList.toggle("oled", t === "black"); h.classList.toggle("force-light", t === "light");
    for(const sh of document.styleSheets){ try { fixRules(sh.cssRules); } catch(e){} }
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => { const isLight = !/^#[0-9A-F]{6}$/i.test(m.content) || m.content.toUpperCase() === "#D6E8FF"; m.setAttribute("media", (t === "light") === isLight ? "all" : "not all"); });
  }
  applyTheme();
  // styles keep arriving while the page loads (and from other scripts): re-apply when a <style> is added
  new MutationObserver(ms => { if(ms.some(m => [...m.addedNodes].some(n => n.nodeName === "STYLE" || n.nodeName === "LINK"))) applyTheme(); })
    .observe(document.documentElement, {childList:true, subtree:true});
  document.addEventListener("DOMContentLoaded", applyTheme); window.addEventListener("load", applyTheme);
  window.walletTheme = t => { LS.set("w-theme", t); LS.set("w-black", t === "black" ? "1" : "0"); applyTheme(); };
  window.walletThemeNow = theme;
  const st = document.createElement("style");
  st.textContent = `@media (prefers-color-scheme: dark){html.oled:root:not([data-theme="light"]){--bg:#000!important;--surface:#121212!important;--card:#121212!important;--card-line:#262626!important;--line:#262626!important;--chip:#1C1C1C!important;--field-line:#333!important}html.oled body{background:#000!important}}
#undoBar{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:3000;display:flex;align-items:center;gap:12px;
 max-width:calc(100vw - 32px);white-space:nowrap;padding:8px 8px 8px 16px;border-radius:14px;background:#0F172A;color:#fff;font-size:15px;box-shadow:0 10px 30px -10px rgba(0,0,0,.5)}
#undoBar[hidden]{display:none!important}
#undoBar button{min-height:44px;padding:0 16px;border:0;border-radius:10px;background:#2563EB;color:#fff;font:inherit;font-weight:600}
@media (prefers-color-scheme: dark){#undoBar{background:#F1F5F9;color:#0F172A}}
.empty .btn{margin-top:10px}`;
  (document.head || document.documentElement).appendChild(st);

  /* ---- sounds: soft, short, made in the browser (no files). Off switch in Settings. Respects the silent switch on iPhone. ---- */
  let ac = null;
  const soundOn = () => LS.get("w-sound") !== "0";
  window.walletSound = on => LS.set("w-sound", on ? "1" : "0");
  window.walletSoundOn = soundOn;
  function ctx(){
    if(ac) return ac;
    try { if(navigator.audioSession) navigator.audioSession.type = "ambient"; } catch(e){}
    const C = window.AudioContext || window.webkitAudioContext; if(!C) return null;
    ac = new C(); return ac;
  }
  // unlock audio on the first tap (iPhone only plays sound after a tap)
  document.addEventListener("touchend", function u(){ const c = ctx(); if(c && c.state === "suspended") c.resume(); document.removeEventListener("touchend", u); }, {passive:true});
  function tones(notes){
    if(!soundOn() || document.hidden) return; const c = ctx(); if(!c) return;
    if(c.state === "suspended") c.resume();
    const t0 = c.currentTime + 0.02;
    notes.forEach(([f, at, dur]) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + at); g.gain.exponentialRampToValueAtTime(0.12, t0 + at + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
      o.connect(g).connect(c.destination); o.start(t0 + at); o.stop(t0 + at + dur + 0.02);
    });
  }
  window.soundMoneyIn = () => tones([[784, 0, 0.18], [1175, 0.09, 0.32]]);          // soft rising two-note chime
  window.soundDeal    = () => tones([[1319, 0, 0.12], [1568, 0.07, 0.12], [2093, 0.14, 0.35]]); // light sparkle

  // deal found: a new deal arrives while the app is open (not on first load)
  let seen = null;
  setInterval(() => {
    let list; try { list = (typeof deals !== "undefined" && deals) || []; } catch(e){ return; }
    const real = list.filter(d => d.status !== "hidden" && (d.profit > 0 || /^cmp-/.test(d.id)));
    if(!real.length && seen === null) return;
    const ids = new Set(real.map(d => d.id));
    if(seen === null){ seen = ids; return; }
    if([...ids].some(id => !seen.has(id))) window.soundDeal();
    seen = ids;
  }, 4000);

  /* ---- Undo instead of "Are you sure?": delete right away, offer Undo for 6 seconds ---- */
  let bar, timer, pending = null;
  function finish(){ if(pending && pending.after) { try { pending.after(); } catch(e){} } pending = null; if(bar) bar.hidden = true; }
  window.deleteWithUndo = async function(path, label, after){
    if(typeof db === "undefined" || !db) return;
    if(pending) finish();
    const ref = db.doc(path); let data = null;
    try { const s = await ref.get(); data = s.exists ? s.data() : null; } catch(e){}
    await ref.delete();
    if(!bar){ bar = document.createElement("div"); bar.id = "undoBar"; bar.setAttribute("role", "status");
      bar.innerHTML = '<span id="undoTxt"></span><button type="button" id="undoBtn"></button>'; document.body.appendChild(bar);
      bar.querySelector("#undoBtn").onclick = async () => { const p = pending; pending = null; clearTimeout(timer); bar.hidden = true;
        if(p && p.data){ try { await db.doc(p.path).set(p.data); } catch(e){} } }; }
    bar.querySelector("#undoTxt").textContent = T(label || "Deleted");
    bar.querySelector("#undoBtn").textContent = T("Undo");
    pending = {path, data, after}; bar.hidden = false;
    clearTimeout(timer); timer = setTimeout(finish, 6000);
  };
})();
