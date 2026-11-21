/* Smart Wallet: picture tour of the app. Opened from Settings > Replay tutorial. Read-only: it never changes data. */
(function(){
  const S = {
    en: { close:"Close", back:"Back", next:"Next", done:"Done", of:(a,b)=>a+" of "+b, slides:[
      ["Balance","See how much money you have right now. Set your starting point once, then add money in when you get paid."],
      ["Budget","Plan your month: bills, where your salary goes, salary day, debts and savings goals. Spent and Left update by themselves."],
      ["Expenses","Log every cost here. Paste a bank message and the app fills it in. This month shows where your money went."],
      ["Prices Log","Upload receipts and save prices. The app shows which store is cheapest for what you buy."],
      ["Forsa","Deals below market price and app offers, checked during the day. Add anything you're looking for."]]},
    ar: { close:"إغلاق", back:"رجوع", next:"التالي", done:"تم", of:(a,b)=>a+" من "+b, slides:[
      ["الرصيد","شوف كم معك فلوس الحين. حدد نقطة البداية مرة وحدة، وبعدها أضف الفلوس الداخلة لما ينزل راتبك."],
      ["الميزانية","خطط شهرك: الفواتير، وين يروح راتبك، يوم الراتب، الديون وأهداف الادخار. المصروف والمتبقي يتحدثون لحالهم."],
      ["المصاريف","سجّل كل مصروف هنا. الصق رسالة البنك والتطبيق يعبّيها لك. هذا الشهر يوضح وين راحت فلوسك."],
      ["سجل الأسعار","ارفع الفواتير واحفظ الأسعار. التطبيق يوضح لك أي محل أرخص للي تشتريه."],
      ["فرصة","عروض أقل من سعر السوق وعروض التطبيقات، تنفحص خلال اليوم. أضف أي شي تدور عليه."]]}
  };
  const css = `#tour{position:fixed;inset:0;z-index:960;background:var(--bg,#121614);color:var(--fg,#e7ece8);display:flex;flex-direction:column;
    padding:calc(10px + env(safe-area-inset-top,0px)) 0 calc(14px + env(safe-area-inset-bottom,0px));opacity:0;transition:opacity .2s}
  #tour.on{opacity:1}
  #tour .tt{display:flex;align-items:center;justify-content:space-between;padding:0 16px 8px;font-size:14px;color:var(--muted,#9aa69f)}
  #tour .x{background:none;border:none;color:inherit;font-size:22px;width:44px;height:44px;cursor:pointer}
  #tour .track{flex:1;min-height:0;display:flex;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
  #tour .track::-webkit-scrollbar{display:none}
  #tour .sl{flex:0 0 100%;scroll-snap-align:center;display:flex;flex-direction:column;align-items:center;gap:14px;padding:0 20px;box-sizing:border-box;min-height:0}
  #tour .ph{flex:1;min-height:0;width:100%;max-width:330px;border-radius:22px;border:1px solid var(--line,#2c3531);overflow:hidden;background:#0d100f;box-shadow:0 12px 40px rgba(0,0,0,.45)}
  #tour .ph img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
  #tour h2{margin:0;font-size:22px;text-align:center}
  #tour p{margin:0;text-align:center;color:var(--muted,#9aa69f);font-size:15px;line-height:1.5;max-width:34ch;min-height:4.5em}
  #tour .dots{display:flex;gap:6px;justify-content:center;margin:12px 0}
  #tour .dots i{width:7px;height:7px;border-radius:4px;background:var(--line,#2c3531);transition:width .2s}
  #tour .dots i.on{width:20px;background:var(--accent,#5fc3a6)}
  #tour .nav{display:flex;gap:8px;padding:0 16px}
  #tour .nav button{flex:1;height:50px;border-radius:12px;font:inherit;font-size:16px;font-weight:600;cursor:pointer;border:1px solid var(--line,#2c3531);background:var(--surface,#1a201d);color:inherit}
  #tour .nav .go{flex:2;background:var(--accent,#5fc3a6);color:var(--accent-fg,#0f1a16);border:none}
  #tour .nav button[disabled]{visibility:hidden}`;
  let st = null;
  window.showTour = function(){
    if(document.getElementById("tour")) return;
    const L = window.walletLang === "ar" ? "ar" : "en", W = S[L], n = W.slides.length;
    if(!st){ st = document.createElement("style"); st.textContent = css; document.head.appendChild(st); }
    const t = document.createElement("div"); t.id = "tour"; t.dir = L === "ar" ? "rtl" : "ltr"; t.setAttribute("data-noi18n", "");
    t.setAttribute("role", "dialog"); t.setAttribute("aria-modal", "true"); t.setAttribute("aria-label", W.slides[0][0]);
    t.innerHTML = `<div class="tt"><span class="ct"></span><button class="x" type="button" aria-label="${W.close}">✕</button></div>
      <div class="track">${W.slides.map((s,i)=>`<div class="sl"><div class="ph"><img src="tour/${L}-${i+1}.jpg" alt="" ${i>1?'loading="lazy"':''}></div><h2>${s[0]}</h2><p>${s[1]}</p></div>`).join("")}</div>
      <div class="dots">${W.slides.map(()=>"<i></i>").join("")}</div>
      <div class="nav"><button type="button" class="bk">${W.back}</button><button type="button" class="go">${W.next}</button></div>`;
    document.body.appendChild(t); document.documentElement.style.overflow = "hidden";
    requestAnimationFrame(()=>t.classList.add("on"));
    const tr = t.querySelector(".track"), go = t.querySelector(".go"), bk = t.querySelector(".bk"); let cur = 0;
    const idx = () => Math.round(Math.abs(tr.scrollLeft) / tr.clientWidth);
    function paint(){ cur = Math.max(0, Math.min(n-1, idx()));
      t.querySelector(".ct").textContent = W.of(cur+1, n);
      t.querySelectorAll(".dots i").forEach((d,i)=>d.classList.toggle("on", i===cur));
      bk.disabled = cur===0; go.textContent = cur===n-1 ? W.done : W.next; }
    const to = i => tr.children[i].scrollIntoView({behavior:"smooth", block:"nearest", inline:"center"});
    function close(){ t.classList.remove("on"); document.documentElement.style.overflow = ""; setTimeout(()=>t.remove(), 200); }
    let raf = 0; tr.addEventListener("scroll", ()=>{ cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); }, {passive:true});
    go.onclick = () => cur===n-1 ? close() : to(cur+1);
    bk.onclick = () => to(cur-1);
    t.querySelector(".x").onclick = close;
    document.addEventListener("keydown", function k(e){ if(!document.getElementById("tour")) return document.removeEventListener("keydown", k);
      if(e.key==="Escape") close(); else if(e.key==="ArrowRight") (L==="ar"?bk:go).click(); else if(e.key==="ArrowLeft") (L==="ar"?go:bk).click(); });
    paint();
  };
})();
