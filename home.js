/* Smart Wallet: Home screen. Five wide cards, one per tab, each with the most useful number and a smart hint.
   The picks (hint, price comparison, deal) change every time the app is opened or comes back after a while. */
(function(){
  const AR = window.walletLang === "ar";
  const L = (en, ar) => AR ? ar : en;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const sar = n => `<bdi dir="ltr">${fmt(n)}</bdi> ` + L("SAR", "ريال");
  const neg = n => `<bdi dir="ltr">−${fmt(n)}</bdi> ` + L("SAR", "ريال");
  const g = name => { try { return eval(name); } catch(e) { return undefined; } };   // read the app's own state safely
  let seed = Math.random();
  const pick = (arr, salt) => arr.length ? arr[Math.floor(((seed * 9301 + (salt || 0) * 49297) % 1) * arr.length) % arr.length] : null;

  const CARDS = [
    {tab:"bal",    title:L("Balance","الرصيد"),          icon:"wallet",  c:"#5fc3a6"},
    {tab:"budget", title:L("Budget","الميزانية"),        icon:"pie",     c:"#b18cff"},
    {tab:"plan",   title:L("Expenses","المصاريف"),       icon:"receipt", c:"#6aa9ff"},
    {tab:"prices", title:L("Prices Log","سجل الأسعار"),  icon:"tag",     c:"#f0b35a"},
    {tab:"forsa",  title:L("Forsa","فرصة"),              icon:"spark",   c:"#f07b6a"}
  ];
  const ICON = {
    wallet:'<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18v3"/><rect x="3" y="7.5" width="18" height="12" rx="2.5"/><circle cx="16.5" cy="13.5" r="1.2"/>',
    pie:'<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
    receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    spark:'<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/>'
  };
  const svg = k => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

  /* ---------- hints for each card ---------- */
  function sectionHints(names){
    const SH = g("SECTION_HINTS") || {}, out = [];
    names.forEach(n => { const f = SH[n]; if(f) try { f().forEach(h => h && h.t && out.push(h.t)); } catch(e){} });
    return out;
  }
  function generalFor(tabs){ try { return (g("generalHints")() || []).filter(h => tabs.includes(h.tab)).map(h => h.t); } catch(e){ return []; } }
  function priceGroups(){
    const prices = (g("prices") || []).filter(p => p.price > 0), keyOf = g("keyOf"), m = new Map();
    if(!keyOf) return m;
    prices.forEach(p => { const k = keyOf(p); if(!m.has(k)) m.set(k, []); m.get(k).push(p); });
    return m;
  }
  function hintsFor(tab){
    let h = [];
    if(tab === "bal") h = sectionHints(["Your money right now","Starting point","Add money in"]).concat(generalFor(["bal"]));
    if(tab === "budget") h = sectionHints(["Monthly budget","Where your salary goes","Salary day","Debts to repay","Savings goals"]).concat(generalFor(["plan"]).filter(t => /budget|left this month/.test(t)));
    if(tab === "plan") h = sectionHints(["Add a cost","This month"]).concat(generalFor(["plan"]).filter(t => /Today so far/.test(t)));
    if(tab === "prices"){
      try { h = (g("priceTimingHints")() || []).map(x => x.t); } catch(e){}
      const hintFor = g("hintFor");
      if(hintFor) priceGroups().forEach((recs, k) => { if(recs.length < 2) return;
        recs = recs.slice().sort((a,b) => (b.date.localeCompare(a.date)) || (b.createdAt - a.createdAt));
        try { const t = hintFor(k, recs); if(t && !/^💡 Add this/.test(t)) h.push(t); } catch(e){} });
      h = h.concat(sectionHints(["Bills"]));
    }
    if(tab === "forsa") h = sectionHints(["Forsa · deals below market"]);
    const seen = new Set(); h = h.filter(t => t && !seen.has(t) && seen.add(t));
    if(!h.length) h = [{bal:"💡 Check your bank app once a week and update your starting point.", budget:"💡 Set a plan for each category so the app can tell you what's left.",
      plan:"💡 Log small costs too. They add up fastest.", prices:"💡 Save the same item from two stores to see which is cheaper.", forsa:"💡 Add something you want to buy and the hunt will look for deals."}[tab]];
    return h;
  }

  /* ---------- the main number on each card ---------- */
  const daysLeftInMonth = () => { const d = new Date(), end = new Date(d.getFullYear(), d.getMonth()+1, 0); return Math.max(1, end.getDate() - d.getDate() + 1); };
  function bodyFor(tab){
    if(tab === "bal"){
      const b = window.lastBalance;
      if(b == null) return {big: L("Set your starting point","حدد نقطة البداية"), sub: L("Count your cash and bank once, then the app keeps track.","احسب الكاش والبنك مرة وحدة، والتطبيق يتابع بعدها."), small:true};
      const nsd = g("nextSalaryDate"), days = nsd ? Math.max(1, Math.ceil((nsd() - new Date()) / 864e5)) : 30;
      return {big: b < 0 ? neg(-b) : sar(b), sub: L(`About ${fmt(b / days)} SAR a day for ${days} day${days===1?"":"s"} until payday`, `حوالي ${fmt(b / days)} ريال باليوم لمدة ${days} يوم حتى الراتب`), bad: b < 0};
    }
    if(tab === "budget"){
      const ITEMS = g("ITEMS") || [], state = g("state") || {}, ms = g("monthSums"), sums = ms ? ms() : {};
      const flex = ITEMS.filter(i => i.daily && state[i.k]);
      const plan = flex.reduce((a,i) => a + (+state[i.k].plan || 0), 0), spent = flex.reduce((a,i) => a + (sums[i.k] || 0), 0), left = plan - spent;
      if(!plan) return {big: L("Plan your month","خطط شهرك"), sub: L("Set amounts in Monthly budget to see what's left each day.","حط مبالغ في الميزانية الشهرية عشان تشوف المتبقي كل يوم."), small:true};
      const perDay = left / daysLeftInMonth();
      const cats = flex.filter(i => +state[i.k].plan > 0).map(i => ({i, left: state[i.k].plan - (sums[i.k] || 0)}));
      const c = pick(cats, 3);
      const catTxt = c ? `<span>${esc(c.i.s)}</span>: ${c.left < 0 ? L(`${fmt(-c.left)} SAR over`, `متجاوز ${fmt(-c.left)} ريال`) : L(`${fmt(c.left)} SAR left`, `باقي ${fmt(c.left)} ريال`)}` : "";
      return {big: (left < 0 ? neg(-perDay) : sar(perDay)) + L(" / day", " / يوم"), bad: left < 0,
        subHtml: (left < 0 ? L(`${fmt(-left)} SAR over this month`, `متجاوز ${fmt(-left)} ريال هذا الشهر`) : L(`${fmt(left)} SAR left this month`, `باقي ${fmt(left)} ريال هذا الشهر`)) + (catTxt ? " · " + catTxt : "")};
    }
    if(tab === "plan"){
      const es = (g("entries") || []).slice().sort((a,b) => (b.date.localeCompare(a.date)) || (b.createdAt - a.createdAt)), BY = g("BY") || {};
      if(!es.length) return {big: L("No costs yet","لا مصاريف بعد"), sub: L("Paste a bank message or add your first cost.","الصق رسالة البنك أو أضف أول مصروف."), small:true};
      const e = es[0], today = g("ymd") ? g("ymd")(new Date()) : "", y = new Date(); y.setDate(y.getDate()-1);
      const when = e.date === today ? L("today","اليوم") : (g("ymd") && e.date === g("ymd")(y)) ? L("yesterday","أمس") : e.date;
      const td = es.filter(x => x.date === today).reduce((a,x) => a + x.amount, 0);
      return {big: neg(e.amount), subHtml: `<span>${esc((BY[e.cat] || {}).s || e.cat)}</span>${e.note ? " · " + esc(e.note) : ""} · ${when}<br>${L("Total today","مجموع اليوم")}: <b>${sar(td)}</b>`};
    }
    if(tab === "prices"){
      const groups = [...priceGroups().values()];
      const multi = groups.map(r => { const best = new Map(); r.forEach(p => { const s = p.store || "?"; if(!best.has(s) || p.price < best.get(s).price) best.set(s, p); }); return [...best.values()].sort((a,b) => a.price - b.price); }).filter(r => r.length >= 2);
      if(multi.length){ const r = pick(multi, 5), lo = r[0], hi = r[r.length-1], save = hi.price - lo.price;
        return {big: `${esc(lo.item)}${lo.size ? " · " + esc(lo.size) : ""}`, mid:true,
          subHtml: L(`<b>${money(lo.price)}</b> at ${esc(lo.store)} vs ${money(hi.price)} at ${esc(hi.store)} · save ${money(save)} SAR (${Math.round(save / hi.price * 100)}%)`,
                     `<b>${money(lo.price)}</b> في ${esc(lo.store)} مقابل ${money(hi.price)} في ${esc(hi.store)} · توفّر ${money(save)} ريال (${Math.round(save / hi.price * 100)}٪)`)}; }
      const all = groups.flat(); if(!all.length) return {big: L("Start your price book","ابدأ دفتر الأسعار"), sub: L("Save what things cost and where.","سجّل أسعار الأشياء وأين."), small:true};
      const p = pick(all, 5);
      return {big: `${esc(p.item)}${p.size ? " · " + esc(p.size) : ""}`, mid:true, subHtml: L(`${money(p.price)} SAR at ${esc(p.store || "?")} on ${esc(p.date)}`, `${money(p.price)} ريال في ${esc(p.store || "?")} بتاريخ ${esc(p.date)}`)};
    }
    if(tab === "forsa"){
      const live = (g("deals") || []).filter(d => d.status !== "hidden"), terms = ((g("hunt") || {}).terms || []).map(t => String(t).toLowerCase());
      if(!live.length) return {big: L("No deals yet","لا عروض بعد"), sub: L("Add what you want and the hunt looks for it during the day.","أضف اللي تبيه والبحث يدوّر عليه خلال اليوم."), small:true};
      const mine = live.filter(d => terms.some(t => t && d.title.toLowerCase().includes(t)));
      const d = pick(mine.length && seed < 0.65 ? mine : live, 7);
      let sub;
      if(d.paid > 0) sub = L(`${money(d.profit)} SAR cheaper than you paid · ${esc(d.source)}`, `أرخص بـ ${money(d.profit)} ريال مما دفعت · ${esc(d.source)}`);
      else if(d.market > 0) sub = L(`${fmt(d.profit)} SAR below market (${d.pct}%) · ${esc(d.source)}${d.city ? " · " + esc(d.city) : ""}`, `أقل من السوق بـ ${fmt(d.profit)} ريال (${d.pct}٪) · ${esc(d.source)}`);
      else sub = esc(d.offer || d.source) + (d.code ? " · " + L("code","كود") + " " + esc(d.code) : "");
      return {big: esc(d.title), mid:true, subHtml: (d.price > 0 ? `<b>${sar(d.price)}</b> · ` : "") + sub};
    }
    return {big:""};
  }

  /* ---------- screen ---------- */
  const css = `#viewHome{display:flex;flex-direction:column;gap:9px}
  #viewHome[hidden]{display:none!important}
  .hcard{position:relative;display:flex;flex-direction:column;gap:3px;width:100%;text-align:start;border:1px solid var(--line);border-radius:16px;padding:11px 14px 11px;
    background:linear-gradient(135deg,color-mix(in srgb,var(--hc) 15%,var(--surface)),var(--surface) 70%);color:var(--fg);font:inherit;cursor:pointer;overflow:hidden;
    -webkit-tap-highlight-color:transparent;transition:transform .12s ease}
  .hcard:active{transform:scale(.985)}
  .hcard::before{content:"";position:absolute;inset:0 auto 0 0;width:4px;background:var(--hc)}
  [dir=rtl] .hcard::before{inset:0 0 0 auto}
  .hcard .hh{display:flex;align-items:center;gap:8px;color:var(--hc);font-weight:700;font-size:13.5px}
  .hcard .hh .ic{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:color-mix(in srgb,var(--hc) 18%,transparent)}
  .hcard .hh .ic svg{width:17px;height:17px}
  .hcard .hh .go{margin-inline-start:auto;opacity:.7;font-size:18px;line-height:1}
  [dir=rtl] .hcard .hh .go{transform:scaleX(-1)}
  .hcard .big{font-family:var(--mono,ui-monospace,monospace);font-size:24px;font-weight:700;letter-spacing:-.01em;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .hcard .big.mid,.hcard .big.small{font-family:inherit;font-size:17.5px}
  .hcard .big.bad{color:var(--bad)}
  .hcard .sub{color:var(--muted);font-size:13px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .hcard .sub b{color:var(--fg)}
  .hcard .hint{display:block;margin-top:3px;padding:6px 9px;border-radius:10px;background:rgba(255,255,255,.045);font-size:12.5px;line-height:1.4;color:var(--fg)}
  .hcard .hint>span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  body.onhome .tabs,body.onhome .hintbar{display:none!important}
  #tabHome{flex:0 0 auto!important;width:44px;display:inline-flex;align-items:center;justify-content:center}
  #tabHome::before{content:"";width:18px;height:18px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.5 11 12 4l8.5 7'/%3E%3Cpath d='M5.5 9.5V20h13V9.5'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.5 11 12 4l8.5 7'/%3E%3Cpath d='M5.5 9.5V20h13V9.5'/%3E%3C/svg%3E") center/contain no-repeat}
  .hgreet{display:flex;justify-content:space-between;align-items:baseline;color:var(--muted);font-size:12.5px;padding:0 2px}`;

  function render(){
    const v = document.getElementById("viewHome"); if(!v) return;
    const hr = new Date().getHours(), greet = hr < 12 ? L("Good morning","صباح الخير") : hr < 18 ? L("Good afternoon","مساء الخير") : L("Good evening","مساء الخير");
    v.innerHTML = `<div class="hgreet" data-noi18n><span>${greet}</span><span>${new Date().toLocaleDateString(AR ? "ar-SA-u-ca-gregory" : "en-GB", {weekday:"long", day:"numeric", month:"long"})}</span></div>` +
      CARDS.map((c, i) => { const b = bodyFor(c.tab), hs = hintsFor(c.tab), h = pick(hs, 11 + i);
        return `<button type="button" class="hcard" data-go="${c.tab}" style="--hc:${c.c}">
          <span class="hh" data-noi18n><span class="ic">${svg(c.icon)}</span><span>${c.title}</span><span class="go">›</span></span>
          <span class="big${b.mid ? " mid" : ""}${b.small ? " small" : ""}${b.bad ? " bad" : ""}" data-noi18n>${b.big}</span>
          ${b.sub || b.subHtml ? `<span class="sub" ${b.subHtml ? "" : "data-noi18n"}>${b.subHtml || esc(b.sub)}</span>` : ""}
          ${h ? `<span class="hint"><span>${esc(h)}</span></span>` : ""}</button>`; }).join("");
  }
  let rt = 0; const soon = () => { clearTimeout(rt); rt = setTimeout(() => { if(!document.getElementById("viewHome").hidden) render(); }, 250); };

  function init(){
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    const first = document.querySelector(".view"); if(!first) return;
    const v = document.createElement("div"); v.className = "view"; v.id = "viewHome"; v.setAttribute("role", "tabpanel"); v.hidden = true;
    first.parentNode.insertBefore(v, first);
    const grp = document.querySelector(".tabs .tabgrp");
    const hb = document.createElement("button"); hb.type = "button"; hb.setAttribute("role", "tab"); hb.id = "tabHome"; hb.setAttribute("aria-label", L("Home","الرئيسية")); hb.setAttribute("aria-selected", "false");
    if(grp) grp.insertBefore(hb, grp.firstChild);
    TABS.home = ["tabHome", "viewHome"];
    hb.addEventListener("click", () => showTab("home"));
    v.addEventListener("click", e => { const c = e.target.closest(".hcard"); if(c) showTab(c.dataset.go); });
    // show/hide the tab bar and refresh the cards whenever the Home screen is shown
    const _show = window.showTab || showTab;
    window.showTab = function(name){ _show(name); const home = !document.getElementById("viewHome").hidden; document.body.classList.toggle("onhome", home); if(home) render(); };
    try { showTab = window.showTab; } catch(e){}
    // the app always opens on Home (unless a #tab link was used)
    const h = location.hash.slice(1);
    window.showTab(TABS[h] && h !== "home" ? h : "home");
    // new picks each time the app comes back after being closed or in the background
    let hidAt = 0;
    document.addEventListener("visibilitychange", () => { if(document.hidden) hidAt = Date.now();
      else if(hidAt && Date.now() - hidAt > 30e3){ seed = Math.random(); if(Date.now() - hidAt > 10 * 60e3) window.showTab("home"); else soon(); } });
    window.addEventListener("pageshow", e => { if(e.persisted){ seed = Math.random(); window.showTab("home"); } });
    // keep numbers fresh as data arrives
    setTimeout(soon, 800); setTimeout(soon, 2500); setTimeout(soon, 6000);
    window.refreshHome = soon;
    ["renderBalance","renderMonth","renderDeals","renderDebts","buildHints"].forEach(n => { const f = g(n); if(typeof f !== "function") return;
      try { eval(n + " = function(){ const r = f.apply(this, arguments); soon(); return r; }"); } catch(e){} });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
