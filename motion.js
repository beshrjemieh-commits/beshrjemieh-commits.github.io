/* Motion, kept light (Beshr 2026-11-22: no screen transitions, app must feel instant).
   Only a quick press feedback, the struck-through old price on deals, and a check when something is saved. */
(function(){
  const css = `
button,.btn,.chip,.hcard,a.btn{transition:transform .08s ease-out}
button:active,.btn:active,.chip:active,.hcard:active,a.btn:active{transform:scale(.97)}
.conf.high{background:var(--deal-soft,#FEF3C7)!important;color:var(--deal-ink,#92400E)!important}
.conf.medium,.conf.low{background:var(--chip,#F1F5F9)!important;color:var(--muted)!important}
.deal .was{display:block;font-size:12px;font-weight:400;color:var(--muted);text-decoration:line-through;text-align:end}
.deal .diff-down{color:var(--deal-ink,#92400E)!important}
.deal.mv-drop .num{color:var(--deal,#F59E0B)!important;font-weight:600}
#mvCheck{position:fixed;left:50%;top:40%;z-index:3000;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;background:var(--card,#fff);box-shadow:0 8px 24px -10px rgba(15,23,42,.4);display:grid;place-items:center;opacity:0;pointer-events:none}
#mvCheck.on{opacity:1}#mvCheck svg{width:36px;height:36px}#mvCheck path{fill:none;stroke:var(--gain,#16A34A);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
@media (prefers-reduced-motion: reduce){button,.btn,.chip,.hcard,a.btn{transition:none}}`;
  const st = document.createElement("style"); st.id = "mvCss"; st.textContent = css; (document.head || document.documentElement).appendChild(st);
  window.mvStagger = () => {};

  /* deals: show the struck-through market price above the deal price */
  function dealFx(box){
    const list = (typeof deals !== "undefined" && deals) || [];
    box.querySelectorAll(".deal[data-d]:not([data-mv])").forEach(el => { el.dataset.mv = "1";
      const d = list.find(x => x.id === el.dataset.d); const num = el.querySelector(".num");
      if(!d || !num || !(d.market > d.price) || !(d.price > 0)) return;
      const was = document.createElement("s"); was.className = "was"; was.textContent = (window.RIYAL || "") + Math.round(d.market).toLocaleString("en-US");
      num.prepend(was); el.classList.add("mv-drop"); });
  }

  /* saved: a check for a moment; error: a short vibration */
  let chk;
  function check(){ if(!chk){ chk = document.createElement("div"); chk.id = "mvCheck"; chk.innerHTML = '<svg viewBox="0 0 40 40"><path d="M11 21l6 6 12-13"/></svg>'; document.body.appendChild(chk); }
    chk.classList.add("on"); try { navigator.vibrate && navigator.vibrate(12); } catch(e){}
    clearTimeout(chk._t); chk._t = setTimeout(() => chk.classList.remove("on"), 600); }
  window.mvCheck = check;
  function onStatus(el){
    if(el.classList.contains("err")){ try { navigator.vibrate && navigator.vibrate([20, 40, 20]); } catch(e){} }
    else if(/^Saved\b|^تم الحفظ|^حُفظ|^تم /.test(el.textContent.trim())) check();
  }

  const mo = new MutationObserver(list => {
    let fl = false;
    for(const m of list){
      const t = m.target.nodeType === 1 ? m.target : m.target.parentElement; if(!t || !t.closest) continue;
      if(!fl && t.closest("#fList")) fl = true;
      const s = t.closest(".status"); if(s && s.textContent.trim()) onStatus(s);
    }
    if(fl){ const b = document.getElementById("fList"); if(b) dealFx(b); }
  });
  const start = () => mo.observe(document.body, {subtree:true, childList:true, characterData:true});
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
