/* Motion guide (Beshr): micro 100–200 ms, screens 250–350 ms, celebrations ≤ 800 ms, spring ease-out, never blocks taps,
   same action = same animation everywhere, nothing under Reduce Motion. */
(function(){
  const RM = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(.2,.9,.3,1.15)", OUT = "cubic-bezier(.2,.8,.2,1)";
  const css = `
button,.btn,.chip,.hcard,a.btn{transition:transform .12s ${OUT}}
button:active,.btn:active,.chip:active,.hcard:active,a.btn:active{transform:scale(.97)}
@keyframes mvIn{from{opacity:0;transform:translate3d(0,8px,0)}to{opacity:1;transform:none}}
.mv-stagger>*{animation:mvIn .24s ${OUT} both}
@keyframes mvShake{10%,90%{transform:translateX(-2px)}20%,80%{transform:translateX(4px)}30%,50%,70%{transform:translateX(-6px)}40%,60%{transform:translateX(6px)}}
.mv-shake{animation:mvShake .32s ${OUT}}
/* deals: amber only */
.conf.high{background:var(--deal-soft,#FEF3C7)!important;color:var(--deal-ink,#92400E)!important;position:relative;overflow:hidden}
.conf.medium,.conf.low{background:var(--chip,#F1F5F9)!important;color:var(--muted)!important}
.conf.high::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.75) 50%,transparent 70%);transform:translateX(-120%);animation:mvShine 4.5s ease-in-out infinite}
@keyframes mvShine{0%,70%{transform:translateX(-120%)}100%{transform:translateX(120%)}}
.deal .was{display:block;font-size:12px;font-weight:400;color:var(--muted);text-decoration:line-through;text-align:end}
.deal .diff-down{color:var(--deal-ink,#92400E)!important}
.deal.mv-drop .num{color:var(--deal,#F59E0B)!important;font-weight:600;animation:mvDrop .42s ${EASE} both}
@keyframes mvDrop{from{opacity:0;transform:translate3d(0,-14px,0)}to{opacity:1;transform:none}}
/* odometer */
.odo{display:inline-flex;overflow:hidden;height:1.15em;line-height:1.15em;vertical-align:bottom}
.odo>span{display:inline-block}.odo .col{display:inline-flex;flex-direction:column;transition:transform .7s ${OUT}}
/* success check */
#mvCheck{position:fixed;left:50%;top:40%;z-index:3000;width:72px;height:72px;margin:-36px 0 0 -36px;border-radius:50%;background:var(--card,#fff);box-shadow:0 10px 30px -10px rgba(15,23,42,.4);display:grid;place-items:center;pointer-events:none;opacity:0;transition:opacity .15s}
#mvCheck.on{opacity:1}#mvCheck svg{width:40px;height:40px}#mvCheck path{fill:none;stroke:var(--gain,#16A34A);stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:40;stroke-dashoffset:40}
#mvCheck.on path{animation:mvDraw .4s ${OUT} .05s forwards}@keyframes mvDraw{to{stroke-dashoffset:0}}
::view-transition-group(*){animation-duration:.3s;animation-timing-function:${OUT}}
@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation:none!important;transition:none!important}::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}`;
  const st = document.createElement("style"); st.id = "mvCss"; st.textContent = css; (document.head || document.documentElement).appendChild(st);

  /* ---- card expand: a Home card grows into its screen (View Transitions where the phone supports them) ---- */
  document.addEventListener("click", e => {
    const c = e.target.closest && e.target.closest(".hcard[data-go]"); if(!c || RM() || !document.startViewTransition) return;
    e.stopImmediatePropagation(); e.preventDefault();
    const t = c.dataset.go, view = document.getElementById(((typeof TABS !== "undefined" && TABS[t]) || [])[1]);
    c.style.viewTransitionName = "mvHero";
    const vt = document.startViewTransition(() => { c.style.viewTransitionName = ""; if(view) view.style.viewTransitionName = "mvHero"; window.showTab(t); window.scrollTo({top:0}); });
    vt.finished.finally(() => { if(view) view.style.viewTransitionName = ""; });
    // a second tap skips straight to the end
    document.addEventListener("pointerdown", () => { try { vt.skipTransition(); } catch(_){} }, {once:true});
  }, true);

  /* ---- staggered list load: Home cards and deals appear 40 ms apart ---- */
  function stagger(box){ if(!box || RM()) return; [...box.children].forEach((el, i) => { el.style.animationDelay = Math.min(i, 10) * 40 + "ms"; }); box.classList.remove("mv-stagger"); void box.offsetWidth; box.classList.add("mv-stagger"); }
  window.mvStagger = stagger;

  /* ---- odometer: each digit of the balance rolls when it changes ---- */
  function odometer(el, from, to){
    const a = String(from), b = String(to); if(RM() || a === b || !/\d/.test(b)) return;
    const pad = Math.max(a.length, b.length), A = a.padStart(pad, " "), B = b.padStart(pad, " ");
    el.innerHTML = [...B].map((ch, i) => /\d/.test(ch) && /\d/.test(A[i]) && ch !== A[i]
      ? `<span class="odo"><span class="col" data-to="${ch}">${[...Array(10).keys()].map(k => `<span>${(+A[i] + k) % 10}</span>`).join("")}</span></span>`
      : `<span>${ch === " " ? "" : ch}</span>`).join("");
    requestAnimationFrame(() => requestAnimationFrame(() => el.querySelectorAll(".col").forEach(col => { const k = ((+col.dataset.to - +col.firstChild.textContent) + 10) % 10; col.style.transform = `translateY(-${k * 1.15}em)`; })));
    setTimeout(() => { el.textContent = b; }, 800);
  }
  let lastBal = null; try { lastBal = localStorage.getItem("w-lastbal"); } catch(e){}
  function rollBalance(){
    const big = document.querySelector('.hcard[data-go=bal] .big bdi'); if(!big) return;
    const now = big.textContent; if(lastBal && lastBal !== now && !big.dataset.rolled){ big.dataset.rolled = "1"; odometer(big, lastBal, now); }
    lastBal = now; try { localStorage.setItem("w-lastbal", now); } catch(e){}
  }

  /* ---- deals: struck-through market price, new price drops in (amber) ---- */
  function dealFx(box){
    const list = (typeof deals !== "undefined" && deals) || [];
    box.querySelectorAll(".deal[data-d]:not([data-mv])").forEach(el => { el.dataset.mv = "1";
      const d = list.find(x => x.id === el.dataset.d); const num = el.querySelector(".num");
      if(!d || !num || !(d.market > d.price) || !(d.price > 0)) return;
      const was = document.createElement("s"); was.className = "was"; was.textContent = (window.RIYAL || "") + Math.round(d.market).toLocaleString("en-US");
      num.prepend(was); if(!RM()) el.classList.add("mv-drop"); });
  }

  /* ---- shake on error + success check ---- */
  let chk;
  function check(){ if(!chk){ chk = document.createElement("div"); chk.id = "mvCheck"; chk.innerHTML = '<svg viewBox="0 0 40 40"><path d="M11 21l6 6 12-13"/></svg>'; document.body.appendChild(chk); }
    chk.classList.remove("on"); void chk.offsetWidth; chk.classList.add("on"); try { navigator.vibrate && navigator.vibrate(12); } catch(e){}
    clearTimeout(chk._t); chk._t = setTimeout(() => chk.classList.remove("on"), 750); }
  window.mvCheck = check;
  function onStatus(el){
    if(el.classList.contains("err")){ const box = el.closest("form,.card,section") || el; box.classList.remove("mv-shake"); void box.offsetWidth; box.classList.add("mv-shake");
      try { navigator.vibrate && navigator.vibrate([20, 40, 20]); } catch(e){} }
    else if(/^Saved\b|^تم الحفظ|^حُفظ|^تم /.test(el.textContent.trim())) check();
  }

  /* ---- watch the page ---- */
  const mo = new MutationObserver(list => {
    for(const m of list){
      const t = m.target.nodeType === 1 ? m.target : m.target.parentElement; if(!t) continue;
      if(t.id === "viewHome" && m.type === "childList" && m.addedNodes.length){ stagger(t); rollBalance(); }
      if(t.id === "fList" || (t.closest && t.closest("#fList"))){ const b = document.getElementById("fList"); if(b){ dealFx(b); if(m.type === "childList" && t.id === "fList") stagger(b); } }
      const s = t.closest && t.closest(".status"); if(s && (m.type === "characterData" || m.type === "childList" || m.attributeName === "class") && s.textContent.trim()) onStatus(s);
    }
  });
  const start = () => mo.observe(document.body, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:["class"]});
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
