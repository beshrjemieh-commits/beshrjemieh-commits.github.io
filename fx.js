/* Calm motion (Beshr's rules): slow 15–30 s loops, low contrast, text always readable, GPU-only (transform/opacity),
   still under "Reduce Motion", paused when the app is hidden.
   - Aurora: soft navy / blue / teal blobs blending behind the balance card, mood-reactive (brighter when under budget, dimmer and cooler when over).
   - Parallax: the aurora shifts a few pixels when the phone tilts.
   - Sky: soft clouds drifting across a pale sky (navy sky in dark mode) so text stays readable on sign-in and setup screens. */
(function(){
  const css = `
.fx-aurora{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;border-radius:inherit;transform:translate3d(var(--px,0px),var(--py,0px),0);transition:transform .6s ease-out}
.fx-aurora i{position:absolute;width:75%;aspect-ratio:1;border-radius:50%;filter:blur(28px);opacity:.55;will-change:transform}
.fx-aurora i:nth-child(1){left:-20%;top:-45%;background:#1E4B80;animation:fxA 26s ease-in-out infinite alternate}
.fx-aurora i:nth-child(2){right:-25%;top:-10%;background:#2C5DB8;opacity:.35;animation:fxB 22s ease-in-out infinite alternate}
.fx-aurora i:nth-child(3){left:20%;bottom:-60%;background:#1C7C86;opacity:.3;animation:fxC 30s ease-in-out infinite alternate}
.fx-aurora i:nth-child(4){right:10%;bottom:-50%;background:#16325A;opacity:.6;animation:fxA 18s ease-in-out infinite alternate-reverse}
@keyframes fxA{to{transform:translate3d(18%,14%,0) scale(1.15)}}
@keyframes fxB{to{transform:translate3d(-22%,12%,0) scale(.9)}}
@keyframes fxC{to{transform:translate3d(-12%,-16%,0) scale(1.1)}}
.hcard[data-go=bal]>*:not(.fx-aurora){position:relative;z-index:1}
/* mood: under budget = a little brighter and warmer blue-teal; over budget = dimmer and cooler */
.mood-good .fx-aurora i:nth-child(3){opacity:.42}.mood-good .fx-aurora i:nth-child(2){opacity:.42}
.mood-over .fx-aurora i{opacity:.22!important;filter:blur(32px) saturate(.5)}
.mood-over .fx-aurora i:nth-child(3){background:#334155}
/* sky with drifting clouds (sign-in and setup) */
.fx-sky{position:absolute;left:0;right:0;top:0;height:42vh;z-index:0;pointer-events:none;overflow:hidden;background:linear-gradient(180deg,var(--navy-soft,#E6ECF4) 0%,rgba(230,236,244,0) 100%)}
@media (prefers-color-scheme: dark){.fx-sky{background:linear-gradient(180deg,#0F2A4A 0%,rgba(15,42,74,0) 100%)}.fx-sky b{background:rgba(255,255,255,.08)!important}}
.fx-sky b{position:absolute;height:44px;border-radius:999px;background:rgba(255,255,255,.9);filter:blur(12px);will-change:transform;animation:fxCloud linear infinite}
.fx-sky b:nth-child(1){top:12%;width:160px;animation-duration:28s;animation-delay:-4s}
.fx-sky b:nth-child(2){top:30%;width:220px;animation-duration:24s;animation-delay:-14s;opacity:.8}
.fx-sky b:nth-child(3){top:50%;width:130px;animation-duration:30s;animation-delay:-20s;opacity:.6}
@keyframes fxCloud{from{transform:translate3d(-260px,0,0)}to{transform:translate3d(110vw,0,0)}}
#authGate>*:not(.fx-sky),#swSetup>*:not(.fx-sky){position:relative;z-index:1}
html.fx-paused .fx-aurora i,html.fx-paused .fx-sky b{animation-play-state:paused}
@media (prefers-reduced-motion: reduce){.fx-aurora i,.fx-sky b{animation:none!important}.fx-aurora{transform:none!important}}`;
  const st = document.createElement("style"); st.id = "fxCss"; st.textContent = css; (document.head || document.documentElement).appendChild(st);

  // pause every loop while the app is not on screen (battery)
  document.addEventListener("visibilitychange", () => document.documentElement.classList.toggle("fx-paused", document.hidden));

  const aurora = () => { const d = document.createElement("span"); d.className = "fx-aurora"; d.setAttribute("aria-hidden", "true"); d.innerHTML = "<i></i><i></i><i></i><i></i>"; return d; };
  const sky = () => { const d = document.createElement("div"); d.className = "fx-sky"; d.setAttribute("aria-hidden", "true"); d.innerHTML = "<b></b><b></b><b></b>"; return d; };
  function decorate(){
    document.querySelectorAll('.hcard[data-go=bal]').forEach(c => { if(!c.querySelector(".fx-aurora")) c.prepend(aurora()); });
    ["authGate","swSetup"].forEach(id => { const g = document.getElementById(id); if(g && !g.querySelector(":scope > .fx-sky")) g.prepend(sky()); });
  }
  new MutationObserver(decorate).observe(document.documentElement, {childList:true, subtree:true});
  if(document.readyState !== "loading") decorate(); else document.addEventListener("DOMContentLoaded", decorate);

  // mood of the balance card, set by home.js: window.fxMood("good" | "over" | "")
  window.fxMood = m => { document.querySelectorAll('.hcard[data-go=bal]').forEach(c => { c.classList.toggle("mood-good", m === "good"); c.classList.toggle("mood-over", m === "over"); }); };

  // tilt parallax: a few pixels only; iPhone asks for motion access once, on a tap (fails silently if refused)
  if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let on = false, raf = 0, px = 0, py = 0;
  const onTilt = e => { if(e.gamma == null) return; px = Math.max(-6, Math.min(6, e.gamma / 5)); py = Math.max(-6, Math.min(6, (e.beta - 45) / 6));
    if(!raf) raf = requestAnimationFrame(() => { raf = 0; document.documentElement.style.setProperty("--px", px.toFixed(1) + "px"); document.documentElement.style.setProperty("--py", py.toFixed(1) + "px"); }); };
  const start = () => { if(on) return; on = true; window.addEventListener("deviceorientation", onTilt, {passive:true}); };
  const D = window.DeviceOrientationEvent;
  if(D && typeof D.requestPermission === "function"){
    let asked = false; try { asked = localStorage.getItem("w-tilt") === "no"; } catch(e){}
    if(!asked) document.addEventListener("touchend", function ask(){ document.removeEventListener("touchend", ask);
      D.requestPermission().then(r => { if(r === "granted") start(); else try { localStorage.setItem("w-tilt", "no"); } catch(e){} }).catch(() => {}); }, {once:true});
  } else if(D) start();
})();
