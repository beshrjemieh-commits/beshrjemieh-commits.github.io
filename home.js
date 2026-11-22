/* Smart Wallet: Home screen. Five wide cards, one per tab, each with the most useful number and a smart hint.
   The picks (hint, price comparison, deal) change every time the app is opened or comes back after a while. */
(function(){
  const AR = window.walletLang === "ar";
  const L = (en, ar) => AR ? ar : en;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const sar = n => `<bdi dir="ltr">\u20C1${fmt(n)}</bdi>`;
  const neg = n => `<bdi dir="ltr">−\u20C1${fmt(n)}</bdi>`;
  const g = name => { try { return eval(name); } catch(e) { return undefined; } };   // read the app's own state safely
  let seed = Math.random();
  const pick = (arr, salt) => arr.length ? arr[Math.floor(((seed * 9301 + (salt || 0) * 49297) % 1) * arr.length) % arr.length] : null;

  const CARDS = [
    {tab:"bal",    title:L("Balance","الرصيد"),          icon:"wallet",  c:"#0F2A4A"},
    {tab:"budget", title:L("Budget","الميزانية"),        icon:"pie",     c:"#2563EB"},
    {tab:"plan",   title:L("Expenses","المصاريف"),       icon:"receipt", c:"#DC2626"},
    {tab:"prices", title:L("Prices Log","سجل الأسعار"),  icon:"tag",     c:"#16A34A"},
    {tab:"forsa",  title:L("Forsa","فرصة"),              icon:"spark",   c:"#F59E0B"}
  ];
  const ICON = {
    wallet:'<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18v3"/><rect x="3" y="7.5" width="18" height="12" rx="2.5"/><circle cx="16.5" cy="13.5" r="1.2"/>',
    pie:'<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
    receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    spark:'<path d="M12 3c.8 3.8 5 5.3 5 10a5 5 0 0 1-10 0c0-2.6 1.5-3.8 2-6 1 1 1.6 2 2.6 2.4C12 7.4 11 5.2 12 3z"/>'
  };
  const PHN = {bal:"wallet", budget:"chart-pie-slice", plan:"receipt", prices:"tag", forsa:"fire"};
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

  /* ---------- extra, more personal hints computed from your own data ---------- */
  const DAYS_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], DAYS_AR = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  function creative(tab){
    const out = [], es = (g("entries") || []), BY = g("BY") || {}, ymd = g("ymd") || (d => d.toISOString().slice(0,10));
    const now = new Date(), mk = ymd(now).slice(0,7), month = es.filter(e => e.date.slice(0,7) === mk);
    const cat = k => (BY[k] || {}).s || k;
    const spentM = month.reduce((a,e) => a + e.amount, 0), dayOfM = now.getDate(), daysInM = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
    const last30 = es.filter(e => (now - new Date(e.date + "T12:00")) / 864e5 < 30), avgDay = last30.reduce((a,e) => a + e.amount, 0) / 30;
    if(tab === "bal"){
      const b = window.lastBalance, nsd = g("nextSalaryDate"), days = nsd ? Math.max(1, Math.ceil((nsd() - now) / 864e5)) : 30;
      if(b != null && avgDay > 0){
        const spare = b - avgDay * days;
        out.push(spare >= 0 ? L(`🔮 About ${fmt(spare)} SAR spare at payday`, `🔮 بيتبقى لك ${fmt(spare)} ريال يوم الراتب`)
                            : L(`🔮 ${fmt(-spare)} SAR short before payday`, `🔮 بينقصك ${fmt(-spare)} ريال قبل الراتب`));
        out.push(L(`⏳ Lasts about ${Math.floor(b / avgDay)} days at your pace`, `⏳ يكفيك تقريباً ${Math.floor(b / avgDay)} يوم`));
      }
      const inc = (g("income") || []).filter(x => x.date.slice(0,7) === mk).reduce((a,x) => a + x.amount, 0);
      if(inc || spentM) out.push(L(`↕️ Month: +${fmt(inc)} in, −${fmt(spentM)} out`, `↕️ الشهر: +${fmt(inc)} دخل، −${fmt(spentM)} صرف`));
      const wk = es.filter(e => (now - new Date(e.date + "T12:00")) / 864e5 < 7).sort((a,b) => b.amount - a.amount)[0];
      if(wk) out.push(L(`🏷️ Top cost this week: ${fmt(wk.amount)} SAR`, `🏷️ أكبر مصروف بالأسبوع: ${fmt(wk.amount)} ريال`));
    }
    if(tab === "budget"){
      const ITEMS = g("ITEMS") || [], state = g("state") || {}, ms = g("monthSums"), sums = ms ? ms() : {};
      const flex = ITEMS.filter(i => i.daily && state[i.k] && +state[i.k].plan > 0), plan = flex.reduce((a,i) => a + +state[i.k].plan, 0);
      const fs = flex.reduce((a,i) => a + (sums[i.k] || 0), 0);
      if(plan){ const pu = Math.round(fs / plan * 100), pt = Math.round(dayOfM / daysInM * 100);
        out.push(pu <= pt ? L(`🎯 On track: ${pu}% used, ${pt}% of month gone`, `🎯 ماشي صح: صرفت ${pu}٪ ومضى ${pt}٪`)
                          : L(`🚦 ${pu}% used, only ${pt}% of month gone`, `🚦 صرفت ${pu}٪ ومضى ${pt}٪ بس`)); }
      const room = flex.map(i => ({i, left: state[i.k].plan - (sums[i.k] || 0)})).sort((a,b) => b.left - a.left)[0];
      if(room && room.left > 0) out.push(L(`🟢 Most left: ${room.i.s}, ${fmt(room.left)} SAR`, `🟢 أكثر باقي: ${room.i.s}، ${fmt(room.left)} ريال`));
      const food = last30.filter(e => e.cat === "food"); if(food.length >= 2){ const avg = food.reduce((a,e) => a + e.amount, 0) / food.length;
        out.push(L(`🍔 One less meal out saves ${fmt(avg)} SAR`, `🍔 وجبة أقل برا توفر ${fmt(avg)} ريال`)); }
      const we = [0,0], wd = [0,0]; last30.forEach(e => { const d = new Date(e.date + "T12:00").getDay(); if(d === 5 || d === 6){ we[0] += e.amount; } else { wd[0] += e.amount; } });
      if(we[0] && wd[0]){ const r = (we[0] / 8) / (wd[0] / 22); if(r > 1.2) out.push(L(`📆 Weekends cost you ${Math.round((r - 1) * 100)}% more`, `📆 الويكند يكلفك ${Math.round((r - 1) * 100)}٪ أكثر`)); }
    }
    if(tab === "plan"){
      const notes = {}; month.forEach(e => { const n = (e.note || "").trim(); if(n) notes[n] = (notes[n] || 0) + 1; });
      const top = Object.entries(notes).sort((a,b) => b[1] - a[1])[0];
      if(top && top[1] >= 2) out.push(L(`🔁 Most bought: ${top[0]} (${top[1]}×)`, `🔁 الأكثر شراء: ${top[0]} (${top[1]}×)`));
      const byDay = [0,0,0,0,0,0,0]; last30.forEach(e => { byDay[new Date(e.date + "T12:00").getDay()] += e.amount; });
      const mx = byDay.indexOf(Math.max(...byDay)); if(byDay[mx] > 0) out.push(L(`📅 You spend most on ${DAYS_EN[mx]}s`, `📅 أكثر صرفك يوم ${DAYS_AR[mx]}`));
      const small = month.filter(e => e.amount < 30); if(small.length >= 3) out.push(L(`🪙 Small buys added up to ${fmt(small.reduce((a,e) => a + e.amount, 0))} SAR`, `🪙 المشتريات الصغيرة: ${fmt(small.reduce((a,e) => a + e.amount, 0))} ريال`));
      const cof = month.filter(e => e.cat === "coffee"); if(cof.length) { const t = cof.reduce((a,e) => a + e.amount, 0); out.push(L(`☕ Coffee: about ${fmt(t * 12)} SAR a year`, `☕ القهوة: حوالي ${fmt(t * 12)} ريال بالسنة`)); }
      let streak = 0; for(let i = 0; i < 60; i++){ const d = new Date(now); d.setDate(d.getDate() - i); if(es.some(e => e.date === ymd(d))) streak++; else if(i) break; }
      if(streak >= 3) out.push(L(`🔥 ${streak}-day logging streak`, `🔥 سجلت ${streak} أيام ورا بعض`));
    }
    if(tab === "prices"){
      const groups = [...priceGroups().values()], ps = groups.flat();
      const wins = {}; groups.forEach(r => { if(new Set(r.map(p => p.store)).size < 2) return; const lo = r.slice().sort((a,b) => a.price - b.price)[0]; wins[lo.store] = (wins[lo.store] || 0) + 1; });
      const w = Object.entries(wins).sort((a,b) => b[1] - a[1])[0];
      if(w && w[1] >= 2) out.push(L(`🏆 ${w[0]} is cheapest for ${w[1]} items`, `🏆 ${w[0]} الأرخص في ${w[1]} أصناف`));
      const swing = groups.map(r => { const a = r.map(p => p.price); return {p: r[0], lo: Math.min(...a), hi: Math.max(...a)}; }).filter(x => x.hi > x.lo).sort((a,b) => (b.hi - b.lo) / b.hi - (a.hi - a.lo) / a.hi)[0];
      if(swing) out.push(L(`📉 ${swing.p.item}: ${money(swing.lo)}–${money(swing.hi)} SAR`, `📉 ${swing.p.item}: ${money(swing.lo)}–${money(swing.hi)} ريال`));
      if(ps.length) out.push(L(`📒 ${ps.length} prices from ${new Set(ps.map(p => p.store)).size} stores`, `📒 ${ps.length} سعر من ${new Set(ps.map(p => p.store)).size} محلات`));
    }
    if(tab === "forsa"){
      const live = (g("deals") || []).filter(d => d.status !== "hidden"), terms = ((g("hunt") || {}).terms || []);
      const today = live.filter(d => now - d.foundAt < 864e5);
      if(today.length) out.push(L(`🆕 ${today.length} new deal${today.length === 1 ? "" : "s"} today`, `🆕 ${today.length} عروض جديدة اليوم`));
      if(terms.length) out.push(L(`🔎 Hunting: ${terms.slice(0,2).join(", ")}`, `🔎 تدوّر على: ${terms.slice(0,2).join("، ")}`));
      else out.push(L(`🔎 Add a search, like "PS5"`, `🔎 أضف بحث، مثل "بلايستيشن"`));
      const best = live.filter(d => d.market > 0).sort((a,b) => b.pct - a.pct)[0];
      if(best) out.push(L(`💎 Best: ${best.pct}% below market`, `💎 الأفضل: أقل من السوق بـ ${best.pct}٪`));
      out.push(L(`🤝 Offer 10% less first. Sellers bargain`, `🤝 اعرض أقل بـ10٪ أول، البياع يفاصل`));
    }
    return out;
  }
  function hintsFor(tab){
    let h = creative(tab);
    if(tab === "bal") h = h.concat(sectionHints(["Your money right now","Starting point","Add money in"]).concat(generalFor(["bal"])));
    if(tab === "budget") h = h.concat(sectionHints(["Monthly budget","Where your salary goes","Salary day","Debts to repay","Savings goals"]).concat(generalFor(["plan"]).filter(t => /budget|left this month/.test(t))));
    if(tab === "plan") h = h.concat(sectionHints(["Add a cost","This month"]).concat(generalFor(["plan"]).filter(t => /Today so far/.test(t))));
    if(tab === "prices"){
      try { h = h.concat((g("priceTimingHints")() || []).map(x => x.t)); } catch(e){}
      const hintFor = g("hintFor");
      if(hintFor) priceGroups().forEach((recs, k) => { if(recs.length < 2) return;
        recs = recs.slice().sort((a,b) => (b.date.localeCompare(a.date)) || (b.createdAt - a.createdAt));
        try { const t = hintFor(k, recs); if(t && !/^💡 Add this/.test(t)) h.push(t); } catch(e){} });
      h = h.concat(sectionHints(["Bills"]));
    }
    if(tab === "forsa") h = h.concat(sectionHints(["Forsa · deals below market"]));
    const seen = new Set(); h = h.filter(t => t && !seen.has(t) && seen.add(t));
    if(!h.filter(x => x.length <= 44).length) h = [{bal:L("💡 Check your bank app weekly","💡 راجع تطبيق البنك كل أسبوع"), budget:L("💡 Set a plan for each category","💡 حط خطة لكل بند"),
      plan:L("💡 Log small costs too","💡 سجل المصاريف الصغيرة بعد"), prices:L("💡 Save one item from two stores","💡 سجل نفس الصنف من محلين"), forsa:L("💡 Add something you want to buy","💡 أضف شي تبي تشتريه")}[tab]];
    return h;
  }

  /* ---------- the main number on each card ---------- */
  const daysLeftInMonth = () => { const d = new Date(), end = new Date(d.getFullYear(), d.getMonth()+1, 0); return Math.max(1, end.getDate() - d.getDate() + 1); };
  function bodyFor(tab){
    if(tab === "bal"){
      const b = window.lastBalance;
      if(b == null) return {big: L("Set your starting point","حدد نقطة البداية"), sub: L("Count your cash and bank once, then the app keeps track.","احسب الكاش والبنك مرة وحدة، والتطبيق يتابع بعدها."), small:true};
      const nsd = g("nextSalaryDate"), days = nsd ? Math.max(1, Math.ceil((nsd() - new Date()) / 864e5)) : 30;
      const mk = (g("ymd") || (d => d.toISOString().slice(0,10)))(new Date()).slice(0,7);
      const inM = (g("income") || []).filter(x => x.date.slice(0,7) === mk).reduce((a,x) => a + x.amount, 0), outM = (g("entries") || []).filter(x => x.date.slice(0,7) === mk).reduce((a,x) => a + x.amount, 0), net = inM - outM;
      const netTxt = net >= 0 ? `<span class="gain">▲ +${fmt(net)} ${L("this month","هذا الشهر")}</span>` : `<span class="loss">▼ −${fmt(-net)} ${L("this month","هذا الشهر")}</span>`;
      return {big: b < 0 ? neg(-b) : sar(b), subHtml: `<bdi>${netTxt}</bdi> · ` + L(`${fmt(b / days)} SAR/day for ${days} day${days===1?"":"s"}`, `${fmt(b / days)} ريال/يوم لمدة ${days} يوم`), bad: b < 0};
    }
    if(tab === "budget"){
      const ITEMS = g("ITEMS") || [], state = g("state") || {}, ms = g("monthSums"), sums = ms ? ms() : {};
      const flex = ITEMS.filter(i => i.daily && state[i.k]);
      const plan = flex.reduce((a,i) => a + (+state[i.k].plan || 0), 0), spent = flex.reduce((a,i) => a + (sums[i.k] || 0), 0), left = plan - spent;
      if(!plan) return {big: L("Plan your month","خطط شهرك"), sub: L("Set amounts in Monthly budget to see what's left each day.","حط مبالغ في الميزانية الشهرية عشان تشوف المتبقي كل يوم."), small:true};
      const perDay = left / daysLeftInMonth();
      const cats = flex.filter(i => +state[i.k].plan > 0).map(i => ({i, left: state[i.k].plan - (sums[i.k] || 0)}));
      const c = cats.slice().sort((a,b) => a.left / (state[a.i.k].plan || 1) - b.left / (state[b.i.k].plan || 1))[0];
      const catTxt = c ? `<span>${esc(c.i.s)}</span>: ${c.left < 0 ? L(`${fmt(-c.left)} SAR over`, `متجاوز ${fmt(-c.left)} ريال`) : L(`${fmt(c.left)} SAR left`, `باقي ${fmt(c.left)} ريال`)}` : "";
      return {big: (left < 0 ? neg(-perDay) : sar(perDay)) + `<span class="pd">${L(" / day", " / يوم")}</span>`, bad: left < 0,
        subHtml: (left < 0 ? `<span class="loss">▼ ` + L(`${fmt(-left)} SAR over this month`, `متجاوز ${fmt(-left)} ريال هذا الشهر`) + `</span>` : L(`${fmt(left)} SAR left this month`, `باقي ${fmt(left)} ريال هذا الشهر`)) + (catTxt ? " · " + catTxt : "")};
    }
    if(tab === "plan"){
      const es = (g("entries") || []).slice().sort((a,b) => (b.date.localeCompare(a.date)) || (b.createdAt - a.createdAt)), BY = g("BY") || {};
      if(!es.length) return {big: L("No costs yet","لا مصاريف بعد"), sub: L("Paste a bank message or add your first cost.","الصق رسالة البنك أو أضف أول مصروف."), small:true};
      const e = es[0], today = g("ymd") ? g("ymd")(new Date()) : "", y = new Date(); y.setDate(y.getDate()-1);
      const when = e.date === today ? L("today","اليوم") : (g("ymd") && e.date === g("ymd")(y)) ? L("yesterday","أمس") : e.date;
      const td = es.filter(x => x.date === today).reduce((a,x) => a + x.amount, 0);
      return {big: neg(e.amount), subHtml: `<span>${esc((BY[e.cat] || {}).s || e.cat)}</span>${e.note ? " · " + esc(e.note) : ""} · ${when} · ${L("Total today","مجموع اليوم")}: <b>${sar(td)}</b>`};
    }
    if(tab === "prices"){
      const groups = [...priceGroups().values()];
      const multi = groups.map(r => { const best = new Map(); r.forEach(p => { const s = p.store || "?"; if(!best.has(s) || p.price < best.get(s).price) best.set(s, p); }); return [...best.values()].sort((a,b) => a.price - b.price); }).filter(r => r.length >= 2);
      if(multi.length){ multi.sort((a,b) => (b[b.length-1].price - b[0].price) - (a[a.length-1].price - a[0].price)); const r = pick(multi.slice(0, 3), 5), lo = r[0], hi = r[r.length-1], save = hi.price - lo.price;
        return {big: `${esc(lo.item)}${lo.size ? " · " + esc(lo.size) : ""}`, mid:true,
          subHtml: L(`<b>${money(lo.price)}</b> at ${esc(lo.store)} vs ${money(hi.price)} at ${esc(hi.store)} · <span class="gain">▼ ${Math.round(save / hi.price * 100)}% (−${money(save)})</span>`,
                     `<b>${money(lo.price)}</b> في ${esc(lo.store)} مقابل ${money(hi.price)} في ${esc(hi.store)} · <span class="gain">▼ ${Math.round(save / hi.price * 100)}٪ (−${money(save)})</span>`)}; }
      const all = groups.flat(); if(!all.length) return {big: L("Start your price book","ابدأ دفتر الأسعار"), sub: L("Save what things cost and where.","سجّل أسعار الأشياء وأين."), small:true};
      const p = pick(all, 5);
      return {big: `${esc(p.item)}${p.size ? " · " + esc(p.size) : ""}`, mid:true, subHtml: L(`${money(p.price)} SAR at ${esc(p.store || "?")} on ${esc(p.date)}`, `${money(p.price)} ريال في ${esc(p.store || "?")} بتاريخ ${esc(p.date)}`)};
    }
    if(tab === "forsa"){
      const live = (g("deals") || []).filter(d => d.status !== "hidden"), terms = ((g("hunt") || {}).terms || []).map(t => String(t).toLowerCase());
      if(!live.length) return {big: L("No deals yet","لا عروض بعد"), sub: L("Add what you want and the hunt looks for it during the day.","أضف اللي تبيه والبحث يدوّر عليه خلال اليوم."), small:true};
      const gain = d => d.paid > 0 || d.market > 0 ? (+d.profit || 0) : -1;
      const real = live.filter(d => gain(d) > 0).sort((a,b) => gain(b) - gain(a));
      const mine = real.filter(d => terms.some(t => t && d.title.toLowerCase().includes(t)));
      const pool = (mine.length ? mine : real).slice(0, 3);
      if(!pool.length) return {big: L("Hunting for deals","جاري البحث عن فرص"), sub: L("Only the best finds will show here.","أفضل الفرص بس تطلع هنا."), small:true};
      const d = pick(pool, 7);
      let sub;
      if(d.paid > 0) sub = L(`${money(d.profit)} SAR cheaper than you paid · ${esc(d.source)}`, `أرخص بـ ${money(d.profit)} ريال مما دفعت · ${esc(d.source)}`);
      else if(d.market > 0) sub = L(`${fmt(d.profit)} SAR below market (${d.pct}%) · ${esc(d.source)}${d.city ? " · " + esc(d.city) : ""}`, `أقل من السوق بـ ${fmt(d.profit)} ريال (${d.pct}٪) · ${esc(d.source)}`);
      else sub = esc(d.offer || d.source) + (d.code ? " · " + L("code","كود") + " " + esc(d.code) : "");
      return {big: esc(d.title), mid:true, subHtml: (d.price > 0 ? `<b>${sar(d.price)}</b> · ` : "") + sub};
    }
    return {big:""};
  }

  /* ---------- screen ---------- */
  const css = `#viewHome{display:flex;flex-direction:column;gap:8px!important}
  #viewHome[hidden]{display:none!important}
  .hcard{position:relative;margin:0!important;display:flex;flex-direction:column;gap:2px;width:100%;text-align:start;border:1px solid var(--line);border-radius:14px;padding:8px 12px 9px;
    background:linear-gradient(135deg,color-mix(in srgb,var(--hc) 15%,var(--surface)),var(--surface) 70%);color:var(--fg);font:inherit;cursor:pointer;overflow:hidden;
    -webkit-tap-highlight-color:transparent;transition:transform .12s ease}
  .hcard:active{transform:scale(.985)}
  .hcard::before{content:"";position:absolute;inset:0 auto 0 0;width:4px;background:var(--hc)}
  [dir=rtl] .hcard::before{inset:0 0 0 auto}
  .hcard .hh{display:flex;align-items:center;gap:7px;color:var(--hc);font-weight:700;font-size:12.5px}
  .hcard .hh .ic{width:21px;height:21px;border-radius:6px;display:grid;place-items:center;background:color-mix(in srgb,var(--hc) 18%,transparent)}
  .hcard .hh .ic svg{width:14px;height:14px}
  .hcard .hh .tt{flex:0 0 auto}
  .hcard .hh .go{opacity:.7;font-size:17px;line-height:1}
  .hcard .hh .big{flex:1 1 auto;min-width:0;text-align:end;color:var(--fg)}
  .hcard .hh .big.bad{color:var(--bad)}
  [dir=rtl] .hcard .hh .go{transform:scaleX(-1)}
  .hcard .big{font-family:var(--mono,ui-monospace,monospace);font-size:20px;font-weight:700;letter-spacing:-.01em;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .hcard .big.mid,.hcard .big.small{font-family:inherit;font-size:15px}
  .hcard .big.bad{color:var(--bad)}
  .hcard .sub{color:var(--muted);font-size:12px;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hcard .sub br{display:none}
  .hcard .sub b{color:var(--fg)}
  .hcard .hint{display:block;margin-top:3px;padding:4px 8px;border-radius:8px;background:rgba(255,255,255,.045);font-size:11.5px;line-height:1.35;color:var(--fg)}
  .hcard .hint>span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  body.onhome .hintbar,
  body.framed .hintbar{display:none!important}
  #tabHome{flex:0 0 auto!important;width:48px;display:inline-flex;align-items:center;justify-content:center}
  .hgreet{display:flex;justify-content:space-between;align-items:baseline;color:var(--muted);font-size:12.5px;padding:0 2px}
  /* Beshr's palette: navy balance card, white cards, amber only for deals, green/red only for money in/out */
  .hgreet{display:none!important}
  .hcard::before{display:none!important}
  .hcard .hh .go{display:none}
#viewHome{gap:12px!important}
.hcard{--hc:var(--navy);border:1px solid var(--card-line)!important;border-radius:16px!important;padding:12px 16px!important;gap:4px!important;background:var(--card)!important;color:var(--fg)!important;box-shadow:var(--shadow)!important}
.hcard .hh{color:var(--tabink)!important;font-weight:600!important}
.hcard .hh .big{color:var(--fg)!important}
.hcard .hh .big.bad{color:var(--loss)!important}
.hcard .hh .ic{border-radius:50%!important;width:26px!important;height:26px!important;background:var(--navy-soft)!important;color:var(--fg)!important}
.hcard .sub{color:var(--muted)!important}.hcard .sub b{color:var(--fg)!important}
.hcard .hint{background:var(--chip)!important;color:var(--ink2)!important;border-radius:999px!important;padding:4px 12px!important}
.hcard .hint>svg{color:var(--muted)!important}
.hcard[data-go=bal]{background:var(--navy)!important;border:none!important;padding:16px!important}
.hcard[data-go=bal] .hh{flex-wrap:wrap;color:var(--navy-sub)!important;font-weight:500!important}
.hcard[data-go=bal] .hh .big{order:5;flex:1 0 100%!important;text-align:start!important;font-size:32px!important;font-weight:600!important;color:#fff!important;margin-top:0;line-height:1.15}
.hcard[data-go=bal] .hh .big.bad{color:#FCA5A5!important}
.hcard[data-go=bal] .sub{color:var(--navy-sub)!important}
.hcard[data-go=bal] .hint{background:rgba(255,255,255,.1)!important;color:#E2E8F0!important}
.hcard[data-go=bal] .hint>svg{color:var(--navy-sub)!important}
.hcard[data-go=bal] .ic{display:none!important}
.hcard[data-go=bal] .hh{font-size:13px!important}
.hcard .hh{font-size:16px!important;font-weight:500!important}
.hcard .hh .ic{width:32px!important;height:32px!important}.hcard .hh .ic svg{width:20px!important;height:20px!important}
.hcard .hh .big{font-size:20px!important;font-weight:600!important}
.hcard .hh{gap:8px!important}.hcard .hint{gap:4px!important}
.hcard .sub{font-size:14px!important}
.hcard .hint{font-size:12px!important;font-weight:500!important}.hcard .hint>svg{width:15px!important;height:15px!important}
.hcard[data-go=plan] .hh .big{color:var(--loss)!important}
.hcard .gain{color:var(--gain)!important;font-weight:600}.hcard[data-go=bal] .gain{color:var(--gain-on-navy)!important}
.hcard .loss{color:var(--loss)!important;font-weight:600}.hcard[data-go=bal] .loss{color:#FCA5A5!important}
.hcard[data-go=forsa]{background:var(--deal-soft)!important;border-color:var(--deal-line)!important}
.hcard[data-go=forsa] .hh,.hcard[data-go=forsa] .hh .big{color:var(--deal-ink)!important}
.hcard[data-go=forsa] .sub{color:var(--deal-ink)!important;opacity:.85}.hcard[data-go=forsa] .sub b{color:var(--deal-ink)!important}
.hcard[data-go=forsa] .hint{background:color-mix(in srgb,var(--deal) 16%,transparent)!important;color:var(--deal-ink)!important}
.hcard[data-go=forsa] .hint>svg{color:var(--deal)!important}
.hcard[data-go=forsa] .ic{background:var(--deal)!important;color:#fff!important}
  /* Balance + Budget side by side (Beshr 2026-11-22, from his video) */
  #viewHome{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:10px}
  #viewHome>*{grid-column:1 / -1}
  #viewHome>.hcard[data-go=bal]:has(+ .hcard[data-go=budget]),#viewHome>.hcard[data-go=bal]+.hcard[data-go=budget]{grid-column:span 1;justify-content:flex-start}
  #viewHome>.hcard[data-go=bal]:has(+ .hcard[data-go=budget]) .hint,#viewHome>.hcard[data-go=bal]+.hcard[data-go=budget] .hint{display:none!important}
  #viewHome>.hcard[data-go=bal]:has(+ .hcard[data-go=budget]) .sub,#viewHome>.hcard[data-go=bal]+.hcard[data-go=budget] .sub{white-space:normal!important;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;font-size:13px!important}
  /* Balance card keeps its month line (Beshr 2026-11-22: show the data as before) */
  #viewHome>.hcard[data-go=bal]:has(+ .hcard[data-go=budget]) .hh .big{font-size:clamp(22px,7.5vw,28px)!important}
  #viewHome>.hcard[data-go=bal]+.hcard[data-go=budget] .hh{flex-wrap:wrap}
  #viewHome>.hcard[data-go=bal]+.hcard[data-go=budget] .hh .big{order:5;flex:1 0 100%!important;text-align:start!important;font-size:clamp(18px,6vw,24px)!important}
  /* Home: violet band behind title, search, Balance + Budget; organic wave edge; white below (Beshr 2026-11-22) */
  #homeBand{display:none;position:absolute;left:0;right:0;top:0;height:var(--band,320px);z-index:-1;pointer-events:none;background:#FFFFFF}
  /* sine curve separates the two colours and drifts sideways; a faint inverted one at the top (Beshr 2026-11-22) */
  #homeBand .wv{position:absolute;left:0;right:0;overflow:hidden;pointer-events:none}
  #homeBand .wv svg{display:block;width:200%!important;max-width:none!important;height:100%!important;animation:wvMove 16s linear infinite;will-change:transform}
  #homeBand .wv.rev svg{animation-direction:reverse;animation-duration:20s}
  #homeBand .wv.top{top:0;height:calc(env(safe-area-inset-top,0px) + 90px)}
  #homeBand .wv.top{-webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 75%);mask-image:linear-gradient(180deg,transparent 0%,#000 75%)} /* very top stays white to meet the white status bar */
  @keyframes wvMove{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}
  html.wv-paused #homeBand .wv svg{animation-play-state:paused}
  @media (prefers-reduced-motion: reduce){#homeBand .wv svg{animation:none}}
  #homeBand .wv.bot{bottom:-55px;height:56px}
  /* sharper contrast between the white boxes and the light band (Beshr 2026-11-22) */
  body.onhome #gSearch,body.onhome #gAsk,
  /* sharper contrast between the white boxes and the light band (Beshr 2026-11-22) */
  body.framed #gSearch,body.framed #gAsk{border:1.5px solid #94A3B8!important;background:#FFFFFF!important;box-shadow:0 6px 14px -8px rgba(15,42,74,.45)!important}
  #viewHome>.hcard[data-go=budget]{border:1.5px solid #94A3B8!important;background:#FFFFFF!important}
  #viewHome>.hcard[data-go=bal],#viewHome>.hcard[data-go=budget]{box-shadow:0 14px 26px -12px rgba(15,42,74,.55),0 2px 4px rgba(15,42,74,.12)!important}
  body.onhome #homeBand,
  body.framed #homeBand{display:block}
  #viewHome>.hcard[data-go=budget]+*,#viewHome>.hcard[data-go=bal]:not(:has(+ .hcard[data-go=budget]))+*{margin-top:40px!important}
  body.onhome::before,
  body.framed::before{display:none!important}
  body.onhome,
  body.framed{background:linear-gradient(180deg,#16365E 0%,#0F2A4A 100%)!important}
  @media (prefers-color-scheme: dark){#homeBand{background:#000}#homeBand .bot path{fill:#000!important}#viewHome>.hcard[data-go=budget],body.onhome #gSearch,body.onhome #gAsk,body.framed #gSearch,body.framed #gAsk{background:var(--card)!important;border-color:var(--card-line,#3F5F99)!important}#homeBand .top path{fill:#FFFFFF!important}body.onhome,body.framed{background:linear-gradient(180deg,#0F2A4A 0%,#0B1F38 100%)!important}}
  /* Beshr 2026-11-22: smaller values, icon shadow, bolder titles */
  #viewHome .hcard:not([data-go=bal]) .hh .big{font-size:16px!important;font-weight:600!important}
  /* Balance opened from Home stays as a big framed card: page inside a rounded card, navy frame around (Beshr 2026-11-22) */
  /* Balance opened from Home: the page is a big card that starts at the Balance card's top edge; title + search stay above (Beshr 2026-11-22) */
  body.framed{overflow:hidden;height:100dvh}
  body.framed::before{display:none!important}
  body.framed #viewBal,#viewBal.ghost{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:28px;padding:12px;box-sizing:border-box;height:var(--vbH,70vh);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;box-shadow:0 20px 40px -20px rgba(15,42,74,.45)}
  body.framed #hintBar{display:none!important}
  /* the opened page keeps the Balance card's navy, so no colour changes while it grows (Beshr 2026-11-22) */
  body.framed #viewBal,#viewBal.ghost{background:#0F2A4A!important;border:none!important}
  body.framed #viewBal .tabHero .thL,#viewBal.ghost .tabHero .thL{color:#A9C1E0}
  body.framed #viewBal .tabHero .thN,#viewBal.ghost .tabHero .thN{color:#FFFFFF}
  body.framed #viewBal .tabHero .thN.bad,#viewBal.ghost .tabHero .thN.bad{color:#FCA5A5}
  body.framed #viewBal .tabHero .thH,#viewBal.ghost .tabHero .thH{background:rgba(255,255,255,.1);color:#E2E8F0}
  body.framed #viewBal .tabHero .thH svg,#viewBal.ghost .tabHero .thH svg{color:#A9C1E0}
  body.framed #viewBal .balhero,body.framed #viewBal .balhero .tag,body.framed #viewBal .balhero .hrow,#viewBal.ghost .balhero,#viewBal.ghost .balhero .tag,#viewBal.ghost .balhero .hrow{color:#A9C1E0!important}
  body.framed #viewBal .balhero .v,body.framed #viewBal #balNow,#viewBal.ghost .balhero .v,#viewBal.ghost #balNow{color:#FFFFFF!important}
  @media (prefers-color-scheme: dark){body.framed #viewBal,#viewBal.ghost{background:var(--surface);border-color:var(--line)}}
  /* card <-> page morph (View Transitions). Kept light: no page cross-fade, viewport-sized snapshot, waves paused, iOS-style curve */
  ::view-transition-group(balcard){animation-duration:.42s;animation-timing-function:cubic-bezier(.32,.72,0,1)}
  ::view-transition-old(balcard),::view-transition-new(balcard){height:100%;width:100%;object-fit:cover;object-position:top left;mix-blend-mode:normal}
  ::view-transition-old(balcard){animation:vtOut .16s linear both}
  ::view-transition-new(balcard){animation:vtIn .22s linear .06s both}
  @keyframes vtOut{to{opacity:0}} @keyframes vtIn{from{opacity:0}}
  ::view-transition-old(root),::view-transition-new(root){animation:none}
  html.vt #homeBand .wv svg{animation-play-state:paused}
  @media (prefers-reduced-motion: reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}
  /* tab hero: one big number + one tip */
  .tabHero{padding:8px 4px 14px;text-align:start}
  .tabHero .thL{font-size:14px;font-weight:500;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tabHero .thN{font-size:clamp(56px,17vw,76px);font-weight:600;line-height:1.05;letter-spacing:-1.5px;font-variant-numeric:tabular-nums;color:var(--fg);margin:4px 0 10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tabHero .thN.bad{color:var(--loss)}
  .tabHero .thL:has(.thI){display:flex;align-items:center;gap:10px;font-size:16px;font-weight:600;overflow:visible;position:relative;padding-inline-start:40px;min-height:30px}
  /* icon = a piece of the rectangle's own corner: outer corner follows the box, inner corner is round (Beshr 2026-11-22) */
  .tabHero .thL:has(.thI){padding-inline-start:44px}
  .tabHero .thL:has(.thI) .thI{position:absolute;top:-20px;inset-inline-start:-16px;width:52px;height:52px;border-radius:0;border-start-start-radius:28px;border-end-end-radius:26px;background:rgba(255,255,255,.12)}
  .tabHero .thL:has(.thI) .thI svg{width:24px;height:24px}
  body.framed #viewBal .tabHero .thL:has(.thI),#viewBal.ghost .tabHero .thL:has(.thI){color:#FFFFFF;font-weight:700} /* same title look as the card */
  /* Balance card icon sits in the top-left corner (Beshr 2026-11-22) */
  #viewHome .hcard[data-go=bal] .hh .tt{margin-inline-start:28px}
  .tabHero .thI{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;flex:none;background:rgba(255,255,255,.12)}
  .tabHero .thI svg{width:20px;height:20px}
  .tabHero .thN .thG{color:var(--gain)} .tabHero .thN .thD{color:var(--deal-ink,#92400E)} .tabHero .thA{font-size:.45em;vertical-align:.35em;margin-inline-end:.15em}
  .tabHero .thH{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;background:var(--navy-soft,#E6ECF4);color:var(--fg);font-size:14px;font-weight:500}
  .tabHero .thH svg{width:18px;height:18px;flex:none;color:var(--accent-blue,#2563EB)}
  /* Motion spec (Beshr 2026-11-22, MOTION_SPEC.md): the Balance card grows into a full-screen card, 12px inset, radius 22 */
  body.framed #viewBal{position:fixed!important;top:calc(env(safe-area-inset-top,0px) + 12px);left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);height:auto!important;margin:0!important;z-index:3;border-radius:22px!important}
  body.framed .wrap>header,body.framed #gsBox{visibility:hidden}
  #viewBal.ghost{border-radius:22px!important}
  .tabHero .thL:has(.thI) .thI{background:none!important;perspective:400px}
  .thI .thR{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(180deg);border-radius:inherit}
  .thI .thF,.thI .thB{position:absolute;inset:0;display:grid;place-items:center;border-radius:inherit;backface-visibility:hidden;-webkit-backface-visibility:hidden}
  .thI .thF{background:rgba(255,255,255,.18)}
  .thI .thB{background:rgba(255,255,255,.08);transform:rotateX(180deg)}
  #viewHome .hcard[data-go=bal] .hh .ic{background:rgba(255,255,255,.18)!important}
  body.framed #viewBal.growing{z-index:3;transform-origin:0 0;will-change:transform}
  #viewBal.ghost{display:block!important;border-radius:28px;padding:12px;box-sizing:border-box;overflow:hidden}
  /* slimmer Search + Ask (Beshr 2026-11-22); smaller text; zoom is locked by the viewport so no focus zoom */
  body.onhome #gSearch,body.onhome #gAsk, zoom is locked by the viewport so no focus zoom */
  body.framed #gSearch,body.framed #gAsk{height:34px!important;min-height:34px!important;border-radius:9px!important}
  body.onhome #gSearch,
  body.framed #gSearch{font-size:14px!important}body.onhome #gAsk,body.framed #gAsk{font-size:12px!important}
  /* Balance + Budget line up row by row: title, big number, sub text (Beshr 2026-11-22) */
  #viewHome>.hcard[data-go=bal]+.hcard[data-go=budget]{padding:14.5px 16px!important}
  #viewHome>.hcard[data-go=bal]+.hcard[data-go=budget] .hh .big .pd{font-size:16px;font-weight:500}
  #viewHome>.hcard[data-go=bal]+.hcard[data-go=budget] .hh .big{font-size:clamp(22px,7.5vw,28px)!important;line-height:1.15!important;margin-top:0!important}
  #viewHome .hcard:not([data-go=bal]) .hh .ic{box-shadow:0 4px 10px -3px rgba(15,42,74,.35),inset 0 1px 0 rgba(255,255,255,.9)!important}
  #viewHome .hcard[data-go=forsa] .hh .ic{box-shadow:0 4px 10px -3px rgba(180,83,9,.55),inset 0 1px 0 rgba(255,255,255,.5)!important}
  #viewHome .hcard:not([data-go=bal]) .hh .tt{font-weight:700!important;color:var(--fg)!important}
  #viewHome .hcard[data-go=forsa] .hh .tt{color:var(--deal-ink)!important}
  #viewHome .hcard[data-go=bal] .hh .ic{display:grid!important;color:#fff!important}
  #viewHome .hcard[data-go=bal] .hh .ic{position:absolute;top:-1px;inset-inline-start:-1px;margin:0;width:44px!important;height:44px!important;border-radius:0!important;border-start-start-radius:16px!important;border-end-end-radius:22px!important;background:rgba(255,255,255,.12)!important;box-shadow:none!important}
  #viewHome .hcard[data-go=bal] .hh .ic svg{width:22px!important;height:22px!important}
  #viewHome .hcard[data-go=bal] .hh .tt{font-size:16px!important;font-weight:700!important;color:#fff!important}
  .hcard .hint{display:flex!important;align-items:center;gap:7px}
  .hcard .hint>svg{flex:none;width:14px;height:14px}
  .hcard .hint>span{flex:1;min-width:0}
  /* no tab bar: swipe between screens; page dots */
  .tabs{display:none!important}
  body,body.onhome,body.framed{padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))!important}
  /* Home: no extra scroll when everything fits, so the title never slides under the clock (Beshr 2026-11-22) */
  html body.onhome{padding-bottom:0!important}
  body.onhome .wrap{box-sizing:border-box!important;padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))!important}
  html body .hintbar{bottom:max(12px,env(safe-area-inset-bottom,0px))!important}
  #pgDots{display:none!important}
  #pgDots-unused{position:fixed;left:50%;transform:translateX(-50%);bottom:max(8px,env(safe-area-inset-bottom,0px));z-index:40;display:flex;gap:0;padding:0 8px;border-radius:999px;background:color-mix(in srgb,var(--card) 85%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
  #pgDots button{width:24px;height:24px;border:none;background:none;padding:0;display:grid;place-items:center;cursor:pointer}
  #pgDots button::before{content:"";width:8px;height:8px;border-radius:4px;background:var(--line);transition:width .2s,background .2s}
  #pgDots button[aria-current]::before{width:20px;background:var(--navy)}
  @media (prefers-color-scheme: dark){#pgDots button[aria-current]::before{background:#93C5FD}}`;

  const lastHint = {}, shown = {};

  /* ---------- swipe to go back (like iPhone apps): a sideways swipe returns to the previous screen ---------- */
  let cur = null, goingBack = false; const backStack = [];
  function goBack(){
    if(cur === "home" || !cur) return false;
    const to = backStack.pop() || "home";
    goingBack = true; try { window.showTab(to); } finally { goingBack = false; }
    window.scrollTo({top:0});
    return true;
  }

  /* swipe left = next screen, swipe right = previous (mirrored in Arabic); dots at the bottom show where you are */
  const ORDER = ["home","bal","budget","plan","prices","forsa"];
  function swipeTo(dx){
    const i = Math.max(0, ORDER.indexOf(cur || "home")), step = dx < 0 ? -1 : 1, j = step < 0 ? (i ? 0 : -1) : i + step; // finger moving LEFT always goes Home, RIGHT goes to the next screen, in both languages (Beshr 2026-11-22)
    if(j < 0 || j >= ORDER.length) return;
    goingBack = true; try { window.showTab(ORDER[j]); } finally { goingBack = false; }
    window.scrollTo({top:0}); dots();
  }
  function dots(){
    let d = document.getElementById("pgDots");
    if(!d){ d = document.createElement("nav"); d.id = "pgDots"; d.setAttribute("aria-label", L("Screens","الشاشات")); document.body.appendChild(d);
      d.addEventListener("click", e => { const b = e.target.closest("button"); if(b) { window.showTab(b.dataset.t); dots(); } }); }
    const names = {home:L("Home","الرئيسية"), bal:L("Balance","الرصيد"), budget:L("Budget","الميزانية"), plan:L("Expenses","المصاريف"), prices:L("Prices Log","سجل الأسعار"), forsa:L("Forsa","فرصة")};
    d.innerHTML = ORDER.map(t => `<button type="button" data-t="${t}" aria-label="${names[t]}"${t === (cur || "home") ? ' aria-current="page"' : ""}></button>`).join("");
  }
  window.walletGoBack = goBack;
  function swipeInit(){
    let sx = 0, sy = 0, st = 0, ok = false;
    const skip = el => el.closest("input,textarea,select,[contenteditable],.tablebox,#setSheet,#tour,#swSetup,#authGate,.tabs,.chips,[data-noswipe]") ||
      [...(function*(e){ while(e && e !== document.body){ yield e; e = e.parentElement; } })(el)].some(e => e.scrollWidth > e.clientWidth + 4 && /(auto|scroll)/.test(getComputedStyle(e).overflowX));
    document.addEventListener("touchstart", e => { if(e.touches.length !== 1){ ok = false; return; } const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); ok = !skip(e.target); }, {passive:true});
    document.addEventListener("touchend", e => { if(!ok) return; ok = false; const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if(Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8 && Date.now() - st < 700) swipeTo(dx); }, {passive:true});
    document.addEventListener("touchcancel", () => { ok = false; }, {passive:true});
  }
  function mood(){ try { const ITEMS = g("ITEMS") || [], state = g("state") || {}, ms = g("monthSums"), sums = ms ? ms() : {}, now = new Date();
    const flex = ITEMS.filter(i => i.daily && state[i.k] && +state[i.k].plan > 0), plan = flex.reduce((a,i) => a + +state[i.k].plan, 0), used = flex.reduce((a,i) => a + (sums[i.k] || 0), 0);
    if(!plan) return ""; const pace = now.getDate() / new Date(now.getFullYear(), now.getMonth()+1, 0).getDate(); return used / plan <= pace ? "good" : "over"; } catch(e){ return ""; } }
  function render(){
    setTimeout(() => window.fxMood && window.fxMood(mood()), 0);
    const v = document.getElementById("viewHome"); if(!v) return;
    const hr = new Date().getHours(), greet = hr < 12 ? L("Good morning","صباح الخير") : hr < 18 ? L("Good afternoon","مساء الخير") : L("Good evening","مساء الخير");
    v.innerHTML = `<div class="hgreet" data-noi18n><span>${greet}</span><span>${new Date().toLocaleDateString(AR ? "ar-SA-u-ca-gregory" : "en-GB", {weekday:"long", day:"numeric", month:"long"})}</span></div>` +
      CARDS.map((c, i) => { const short = x => x && x.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, "").length <= 42;
        const b = bodyFor(c.tab), all = hintsFor(c.tab).filter(x => x !== lastHint[c.tab] && short(x)), mine = creative(c.tab).filter(x => x !== lastHint[c.tab] && short(x));
        // only our own short, bilingual hints on Home (no app offers like pizza, nothing cut off)
        const keep = shown[c.tab] && shown[c.tab].seed === seed && hintsFor(c.tab).includes(shown[c.tab].h) ? shown[c.tab].h : null;
        const h = keep || pick(mine.length ? mine : all.filter(x => /^💡/.test(x)).slice(-1), 11 + i); if(!keep){ lastHint[c.tab] = h; shown[c.tab] = {seed, h}; }
        return `<button type="button" class="hcard" data-go="${c.tab}" style="--hc:${c.c}">
          <span class="hh" data-noi18n><span class="ic">${window.PH ? PH(PHN[c.tab]) : svg(c.icon)}</span><span class="tt">${c.title}</span><span class="big${b.mid ? " mid" : ""}${b.small ? " small" : ""}${b.bad ? " bad" : ""}">${b.big}</span><span class="go">›</span></span>
          ${b.sub || b.subHtml ? `<span class="sub" ${b.subHtml ? "" : "data-noi18n"}>${b.subHtml || esc(b.sub)}</span>` : ""}
          ${h ? `<span class="hint">${window.PH ? PH("sparkle") : ""}<span>${esc(h.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, ""))}</span></span>` : ""}</button>`; }).join("");
    requestAnimationFrame(() => window._sizeBand && window._sizeBand());
  }
  /* ---------- one big number + one important tip at the top of each tab (Beshr 2026-11-22) ---------- */
  const VIEW = {bal:"viewBal", budget:"viewBudget", plan:"viewPlan", prices:"viewPrices", forsa:"viewForsa"};
  function heroFor(tab){
    const b = bodyFor(tab) || {};
    const clean = x => x ? x.replace(/^[\p{Extended_Pictographic}️‍\s]+/u, "") : "";
    let label = "", num = "", bad = false;
    if(tab === "bal"){ label = `<span class="thI"><span class="thR"><span class="thF">${window.PH ? PH(PHN.bal) : ""}</span><span class="thB">${window.PH ? PH(PHN.bal) : ""}</span></span></span><span class="thT">${CARDS[0].title}</span>`; num = b.big; bad = b.bad; } // same icon + title as the card, so they fly into place (Beshr 2026-11-22)
    if(tab === "budget"){ label = L("You can spend per day","تقدر تصرف باليوم"); num = String(b.big || "").replace(/<span class="pd">.*<\/span>/, ""); bad = b.bad; }
    if(tab === "plan"){
      const ymd = g("ymd") || (d => d.toISOString().slice(0,10)), t = ymd(new Date());
      const td = (g("entries") || []).filter(e => e.date === t).reduce((a, e) => a + e.amount, 0);
      label = L("Spent today","صرفت اليوم"); num = td ? neg(td) : sar(0); bad = td > 0;
    }
    if(tab === "prices"){
      let best = null;
      priceGroups().forEach(recs => { const byStore = new Map(); recs.forEach(p => { const k = p.store || "?"; if(!byStore.has(k) || p.price < byStore.get(k).price) byStore.set(k, p); });
        const r = [...byStore.values()]; if(r.length < 2) return; r.sort((a,b) => a.price - b.price);
        const pct = Math.round((1 - r[0].price / r[r.length-1].price) * 100); if(!best || pct > best.pct) best = {pct, item: r[0].item, store: r[0].store}; });
      if(best){ label = L(`Best saving · ${esc(best.item)} at ${esc(best.store || "?")}`, `أفضل توفير · ${esc(best.item)} في ${esc(best.store || "?")}`); num = `<span class="thG"><span class="thA">▼</span>${best.pct}%</span>`; }
      else { label = L("Prices saved","أسعار محفوظة"); num = String((g("prices") || []).length); }
    }
    if(tab === "forsa"){
      const live = (g("deals") || []).filter(d => d.status !== "hidden" && d.profit > 0).sort((a,b) => b.profit - a.profit);
      if(live.length){ label = L(`Best deal · ${esc(live[0].title)}`, `أفضل فرصة · ${esc(live[0].title)}`); num = `<span class="thD">+${sar(live[0].profit)}</span>`; }
      else { label = L("Deals found","فرص موجودة"); num = "0"; }
    }
    if(!num) return "";
    const hs = hintsFor(tab), h = (shown[tab] && hs.includes(shown[tab].h) && shown[tab].h) || hs.find(x => /^💡|^⚠|^💎|^🆕/.test(x)) || hs[0];
    return `<div class="tabHero" data-noi18n><div class="thL">${label}</div><div class="thN${bad ? " bad" : ""}">${num}</div>${h ? `<div class="thH">${window.PH ? PH("sparkle") : ""}<span>${esc(clean(h))}</span></div>` : ""}</div>`;
  }
  function renderHero(tab){
    const v = document.getElementById(VIEW[tab]); if(!v) return;
    const host = v.querySelector(":scope > .vbIn") || v; let el = host.querySelector(":scope > .tabHero"); const html = heroFor(tab);
    if(!html){ if(el) el.remove(); return; }
    const tmp = document.createElement("div"); tmp.innerHTML = html; const n = tmp.firstElementChild;
    if(el) el.replaceWith(n); else host.prepend(n);
  }
  window.walletHero = renderHero;
  let rt = 0; const soon = () => { clearTimeout(rt); rt = setTimeout(() => { if(!document.getElementById("viewHome").hidden) render(); }, 250); };

  function init(){
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    const band = document.createElement("div"); band.id = "homeBand"; band.setAttribute("aria-hidden", "true");
    /* one calm sine curve, still (Beshr 2026-11-22: "make it a curve or sin or cos function") */
    const P1 = "M0,0 L0,30.0 L4,31.0 L8,32.0 L12,33.0 L16,34.0 L20,34.9 L24,35.9 L28,36.8 L32,37.7 L36,38.6 L40,39.4 L44,40.2 L48,41.0 L52,41.7 L56,42.3 L60,42.9 L64,43.5 L68,44.0 L72,44.5 L76,44.9 L80,45.2 L84,45.5 L88,45.7 L92,45.9 L96,46.0 L100,46.0 L104,46.0 L108,45.9 L112,45.7 L116,45.5 L120,45.2 L124,44.9 L128,44.5 L132,44.0 L136,43.5 L140,42.9 L144,42.3 L148,41.7 L152,41.0 L156,40.2 L160,39.4 L164,38.6 L168,37.7 L172,36.8 L176,35.9 L180,34.9 L184,34.0 L188,33.0 L192,32.0 L196,31.0 L200,30.0 L204,29.0 L208,28.0 L212,27.0 L216,26.0 L220,25.1 L224,24.1 L228,23.2 L232,22.3 L236,21.4 L240,20.6 L244,19.8 L248,19.0 L252,18.3 L256,17.7 L260,17.1 L264,16.5 L268,16.0 L272,15.5 L276,15.1 L280,14.8 L284,14.5 L288,14.3 L292,14.1 L296,14.0 L300,14.0 L304,14.0 L308,14.1 L312,14.3 L316,14.5 L320,14.8 L324,15.1 L328,15.5 L332,16.0 L336,16.5 L340,17.1 L344,17.7 L348,18.3 L352,19.0 L356,19.8 L360,20.6 L364,21.4 L368,22.3 L372,23.2 L376,24.1 L380,25.1 L384,26.0 L388,27.0 L392,28.0 L396,29.0 L400,30.0 L404,31.0 L408,32.0 L412,33.0 L416,34.0 L420,34.9 L424,35.9 L428,36.8 L432,37.7 L436,38.6 L440,39.4 L444,40.2 L448,41.0 L452,41.7 L456,42.3 L460,42.9 L464,43.5 L468,44.0 L472,44.5 L476,44.9 L480,45.2 L484,45.5 L488,45.7 L492,45.9 L496,46.0 L500,46.0 L504,46.0 L508,45.9 L512,45.7 L516,45.5 L520,45.2 L524,44.9 L528,44.5 L532,44.0 L536,43.5 L540,42.9 L544,42.3 L548,41.7 L552,41.0 L556,40.2 L560,39.4 L564,38.6 L568,37.7 L572,36.8 L576,35.9 L580,34.9 L584,34.0 L588,33.0 L592,32.0 L596,31.0 L600,30.0 L604,29.0 L608,28.0 L612,27.0 L616,26.0 L620,25.1 L624,24.1 L628,23.2 L632,22.3 L636,21.4 L640,20.6 L644,19.8 L648,19.0 L652,18.3 L656,17.7 L660,17.1 L664,16.5 L668,16.0 L672,15.5 L676,15.1 L680,14.8 L684,14.5 L688,14.3 L692,14.1 L696,14.0 L700,14.0 L704,14.0 L708,14.1 L712,14.3 L716,14.5 L720,14.8 L724,15.1 L728,15.5 L732,16.0 L736,16.5 L740,17.1 L744,17.7 L748,18.3 L752,19.0 L756,19.8 L760,20.6 L764,21.4 L768,22.3 L772,23.2 L776,24.1 L780,25.1 L784,26.0 L788,27.0 L792,28.0 L796,29.0 L800,30.0 L800,0 Z", P2 = "M0,0 L0,30.0 L4,29.0 L8,28.0 L12,27.0 L16,26.0 L20,25.1 L24,24.1 L28,23.2 L32,22.3 L36,21.4 L40,20.6 L44,19.8 L48,19.0 L52,18.3 L56,17.7 L60,17.1 L64,16.5 L68,16.0 L72,15.5 L76,15.1 L80,14.8 L84,14.5 L88,14.3 L92,14.1 L96,14.0 L100,14.0 L104,14.0 L108,14.1 L112,14.3 L116,14.5 L120,14.8 L124,15.1 L128,15.5 L132,16.0 L136,16.5 L140,17.1 L144,17.7 L148,18.3 L152,19.0 L156,19.8 L160,20.6 L164,21.4 L168,22.3 L172,23.2 L176,24.1 L180,25.1 L184,26.0 L188,27.0 L192,28.0 L196,29.0 L200,30.0 L204,31.0 L208,32.0 L212,33.0 L216,34.0 L220,34.9 L224,35.9 L228,36.8 L232,37.7 L236,38.6 L240,39.4 L244,40.2 L248,41.0 L252,41.7 L256,42.3 L260,42.9 L264,43.5 L268,44.0 L272,44.5 L276,44.9 L280,45.2 L284,45.5 L288,45.7 L292,45.9 L296,46.0 L300,46.0 L304,46.0 L308,45.9 L312,45.7 L316,45.5 L320,45.2 L324,44.9 L328,44.5 L332,44.0 L336,43.5 L340,42.9 L344,42.3 L348,41.7 L352,41.0 L356,40.2 L360,39.4 L364,38.6 L368,37.7 L372,36.8 L376,35.9 L380,34.9 L384,34.0 L388,33.0 L392,32.0 L396,31.0 L400,30.0 L404,29.0 L408,28.0 L412,27.0 L416,26.0 L420,25.1 L424,24.1 L428,23.2 L432,22.3 L436,21.4 L440,20.6 L444,19.8 L448,19.0 L452,18.3 L456,17.7 L460,17.1 L464,16.5 L468,16.0 L472,15.5 L476,15.1 L480,14.8 L484,14.5 L488,14.3 L492,14.1 L496,14.0 L500,14.0 L504,14.0 L508,14.1 L512,14.3 L516,14.5 L520,14.8 L524,15.1 L528,15.5 L532,16.0 L536,16.5 L540,17.1 L544,17.7 L548,18.3 L552,19.0 L556,19.8 L560,20.6 L564,21.4 L568,22.3 L572,23.2 L576,24.1 L580,25.1 L584,26.0 L588,27.0 L592,28.0 L596,29.0 L600,30.0 L604,31.0 L608,32.0 L612,33.0 L616,34.0 L620,34.9 L624,35.9 L628,36.8 L632,37.7 L636,38.6 L640,39.4 L644,40.2 L648,41.0 L652,41.7 L656,42.3 L660,42.9 L664,43.5 L668,44.0 L672,44.5 L676,44.9 L680,45.2 L684,45.5 L688,45.7 L692,45.9 L696,46.0 L700,46.0 L704,46.0 L708,45.9 L712,45.7 L716,45.5 L720,45.2 L724,44.9 L728,44.5 L732,44.0 L736,43.5 L740,42.9 L744,42.3 L748,41.7 L752,41.0 L756,40.2 L760,39.4 L764,38.6 L768,37.7 L772,36.8 L776,35.9 L780,34.9 L784,34.0 L788,33.0 L792,32.0 L796,31.0 L800,30.0 L800,0 Z";
    const sine = (cls, sign, fill, op) => `<div class="wv ${cls}"><svg viewBox="0 0 800 60" preserveAspectRatio="none"><path d="${sign > 0 ? P1 : P2}" fill="${fill}" fill-opacity="${op}"/></svg></div>`;
    band.innerHTML = sine("top rev", -1, "#0F2A4A", .07) + sine("bot", 1, "#FFFFFF", 1);
    document.addEventListener("visibilitychange", () => document.documentElement.classList.toggle("wv-paused", document.hidden));
    document.body.appendChild(band);
    const sizeBand = () => { const v = document.getElementById("viewHome"); if(!v || v.hidden) return;
      const c = v.querySelector('.hcard[data-go=budget]') || v.querySelector('.hcard[data-go=bal]'); if(!c) return;
      const r = c.getBoundingClientRect(); band.style.setProperty("--band", Math.round(r.bottom + window.scrollY + 8) + "px"); };
    window.addEventListener("resize", sizeBand); window._sizeBand = sizeBand;
    const first = document.querySelector(".view"); if(!first) return;
    const v = document.createElement("div"); v.className = "view"; v.id = "viewHome"; v.setAttribute("role", "tabpanel"); v.hidden = true;
    first.parentNode.insertBefore(v, first);
    const grp = document.querySelector(".tabs .tabgrp");
    const hb = document.createElement("button"); hb.type = "button"; hb.setAttribute("role", "tab"); hb.id = "tabHome"; hb.setAttribute("aria-label", L("Home","الرئيسية")); hb.setAttribute("aria-selected", "false"); hb.textContent = L("Home","الرئيسية"); hb.setAttribute("data-noi18n","");
    if(grp) grp.insertBefore(hb, grp.firstChild);
    TABS.home = ["tabHome", "viewHome"];
    hb.addEventListener("click", () => showTab("home"));
    /* Balance card grows to fill the screen, then the Balance page shows (Beshr 2026-11-22). Short and GPU-only; skipped under Reduce Motion. */
    /* Balance card morphs into the Balance page (Beshr 2026-11-22: "why consider it a different page?").
       Uses the browser's own View Transition (iPhone iOS 18+): the real card grows into the framed page on the GPU.
       Older phones fall back to a simple grow layer. */
    const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wrapEl = () => document.querySelector(".wrap");
    const balView = () => document.getElementById("viewBal");
    const sizeBal = () => { const v = balView(); if(!v || !document.body.classList.contains("framed")) return; v.style.setProperty("--vbH", Math.max(240, innerHeight - v.getBoundingClientRect().top - 12) + "px"); };
    addEventListener("resize", sizeBal);
    const balCard = () => document.querySelector('#viewHome .hcard[data-go=bal]');
    window._vtBusy = false;
    /* Card <-> page with NO fades (Beshr 2026-11-22: "only the rectangle moves, colours must not change").
       The box is a window: it grows/shrinks with transform, and its content gets the opposite scale every frame,
       so the content never stretches or fades. Background is a still copy of Home. GPU transforms only. */
    const bez = (x1, y1, x2, y2) => t => { let a = 0, b = 1, u = t; for(let k = 0; k < 24; k++){ u = (a + b) / 2; const x = 3*(1-u)*(1-u)*u*x1 + 3*(1-u)*u*u*x2 + u*u*u; if(x < t) a = u; else b = u; } return 3*(1-u)*(1-u)*u*y1 + 3*(1-u)*u*u*y2 + u*u*u; };
    // spring, like iPhone (Beshr 2026-11-22: "growth and getting smaller shall be dynamic"): quick start, tiny overshoot, settles
    const SPRING = ((z, W) => { const wd = W * Math.sqrt(1 - z * z); return t => t >= 1 ? 1 : 1 - Math.exp(-z * W * t) * (Math.cos(wd * t) + (z * W / wd) * Math.sin(wd * t)); })(0.75, 10); // ~3% overshoot, settled by the end
    const EASE0 = SPRING, DUR0 = 560, STEPS = 48;
    // spec curves: grow 420ms, shrink 340ms, cubic-bezier(.2,.9,.3,1.05); icon flip 450ms cubic-bezier(.3,1.3,.5,1)
    const MK = {ease: bez(.2, .9, .3, 1.05), open: 420, close: 340, flipEase: "cubic-bezier(.3,1.3,.5,1)", flip: 450, curve: "cubic-bezier(.2,.9,.3,1.05)"};
    const inner = v => { let n = v.querySelector(":scope > .vbIn"); if(!n){ n = document.createElement("div"); n.className = "vbIn"; while(v.firstChild) n.appendChild(v.firstChild); v.appendChild(n); } return n; };
    // box sits at rect B (its real place); animate it so it looks like rect A at p=0 and B at p=1 (or the reverse)
    function morph(box, A, B, reverse, zoom, rA, rB, pairs, tm){
      const DUR = (tm && tm.dur) || DUR0, EASE = (tm && tm.ease) || EASE0;
      const kin = inner(box), kb = [], kc = [], ks = (pairs || []).map(() => []); const IB = kin.getBoundingClientRect();
      if(rB == null) rB = parseFloat(getComputedStyle(box).borderTopLeftRadius) || 28; if(rA == null) rA = rB;
      for(let n = 0; n <= STEPS; n++){
        let p = EASE(n / STEPS); if(reverse) p = 1 - EASE(n / STEPS);
        const w = A.width + (B.width - A.width) * p, h = A.height + (B.height - A.height) * p;
        const x = A.left + (B.left - A.left) * p, y = A.top + (B.top - A.top) * p;
        const sx = w / B.width, sy = h / B.height;
        const r = rA + (rB - rA) * p; // corners stay round and match the card (Beshr 2026-11-22: no sharp edges)
        kb.push({transform: `translate(${x - B.left}px,${y - B.top}px) scale(${sx},${sy})`, borderRadius: `${r / sx}px / ${r / sy}px`, offset: n / STEPS});
        const u = zoom ? sx : 1; // zoom: content shrinks evenly with the box instead of being cropped (Beshr 2026-11-22 "scale of reclosing is odd")
        kc.push({transform: `scale(${u / sx},${u / sy})`, offset: n / STEPS});
        (pairs || []).forEach((q, i) => { // where it would sit vs where it should sit at this moment
          const natX = x + (IB.left - B.left) * sx + (q.b.left - IB.left), natY = y + (IB.top - B.top) * sy + (q.b.top - IB.top); // content box is scaled back from its own corner
          const wantX = q.a.left + (q.b.left - q.a.left) * p, wantY = q.a.top + (q.b.top - q.a.top) * p, k = q.s + (1 - q.s) * p;
          ks[i].push({transform: `translate(${wantX - natX}px,${wantY - natY}px) scale(${k})`, offset: n / STEPS}); });
      }
      box.style.transformOrigin = "0 0"; kin.style.transformOrigin = "0 0"; box.style.willChange = kin.style.willChange = "transform";
      const o = {duration: DUR, easing: "linear", fill: "both"};
      const a = box.animate(kb, o); kin.animate(kc, o); (pairs || []).forEach((q, i) => { q.el.style.transformOrigin = "0 0"; q.el.animate(ks[i], o); });
      return a.finished.then(() => { box.getAnimations({subtree: true}).forEach(x => x.cancel()); box.style.willChange = kin.style.willChange = ""; });
    }
    // pairs: page piece <-> card piece (icon, title, number, tip line). Each flies straight to its twin, scaled evenly.
    const txt = e => { const r = document.createRange(); r.selectNodeContents(e); const x = r.getBoundingClientRect(); return x.width ? x : e.getBoundingClientRect(); };
    function cardSpots(card){ // measured while the card is on screen
      if(!card) return null; const c = x => card.querySelector(x), o = {}, fs = e => parseFloat(getComputedStyle(e).fontSize) || 16;
      [["icon", c(".ic"), 0], ["title", c(".tt"), 1], ["num", c(".big"), 1], ["tip", [c(".hint"), c(".sub")].find(e => e && e.getClientRects().length), 0]].forEach(([k, e, t]) => { if(e) o[k] = {r: t ? txt(e) : e.getBoundingClientRect(), fs: fs(e)}; });
      return o;
    }
    function pairsFor(box, cs){
      if(!cs) return []; const rtl = getComputedStyle(box).direction === "rtl", out = [];
      const fs = e => parseFloat(getComputedStyle(e).fontSize) || 16;
      const add = (el, src, mode) => { if(!el || !src) return; const b = el.getBoundingClientRect(), r = src.r; if(!b.width || !r.width) return;
        const t = mode === "tip" ? (el.querySelector("span") || el) : el, tb = mode === "icon" || mode === "tip" ? b : txt(t); // tip: the whole pill lines up with the card line, so it stays inside the card
        // icon: even scale by size; same words (title, number): by text width; tip: by font size
        const s = mode === "icon" ? r.width / b.width : mode === "same" ? r.width / tb.width : src.fs / fs(t); // tip: by font size; the card pill is the page pill at 12/14 size
        const ox = (rtl ? tb.right : tb.left) - b.left, oy = tb.top - b.top + tb.height / 2; // anchor: start of the words, middle of the line
        out.push({el, a: {left: (rtl ? r.right : r.left) - ox * s, top: r.top + r.height / 2 - oy * s}, b: {left: b.left, top: b.top}, s}); };
      const q = x => box.querySelector(".tabHero " + x);
      add(q(".thI"), cs.icon, "icon"); add(q(".thT"), cs.title, "same"); add(q(".thN"), cs.num, "same"); // anchors only: text never morphs into different text
      return out;
    }
    function stillHome(){ // a frozen copy of Home, exactly where it is (keeps ids so it looks identical; lives < 0.5 s)
      const wrap = wrapEl(), bs = getComputedStyle(document.body), snap = document.createElement("div");
      snap.style.cssText = `position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:${bs.backgroundColor};background-image:${bs.backgroundImage};`;
      const band = document.getElementById("homeBand"), wr = wrap.getBoundingClientRect();
      if(band){ const b2 = band.cloneNode(true); b2.style.cssText += `;display:block;position:absolute;left:0;right:0;top:${-scrollY}px;height:${band.offsetHeight}px;z-index:0`; const lv = band.querySelectorAll("svg"); b2.querySelectorAll("svg").forEach((x, i) => { const a = lv[i] && lv[i].getAnimations()[0]; if(a) x.style.animationDelay = `${-(a.currentTime % 1e9)}ms`; }); /* waves keep moving, in step (Beshr 2026-11-22: nothing behind freezes) */ snap.appendChild(b2); }
      const w2 = wrap.cloneNode(true); w2.style.cssText = `position:absolute;left:${wr.left}px;top:${wr.top}px;width:${wr.width}px;margin:0;z-index:1`;
      snap.appendChild(w2); document.body.appendChild(snap); return snap;
    }
    // roles (spec): siblings step aside, peek fades, details fade up one by one, icon flips
    const sibsIn = root => [...root.querySelectorAll(".wrap>header,#gsBox,#viewHome>.hgreet,#viewHome>.hcard:not([data-go=bal])")];
    const detailsIn = box => { const h = box.querySelector(".tabHero"), out = []; if(h){ const t = h.querySelector(".thH"); if(t) out.push(t); }
      const k = box.querySelector(":scope > .vbIn") || box; [...k.children].forEach(c => { if(c.classList.contains("tabHero")) return; const kids = c.tagName === "SECTION" ? [...c.children] : [c]; kids.forEach(x => out.push(x)); }); return out; };
    const flip = (box, open, dur) => { const r = box.querySelector(".thI .thR"); if(r) r.animate([{transform: `rotateX(${open ? 0 : 180}deg)`}, {transform: `rotateX(${open ? 180 : 0}deg)`}], {duration: dur, easing: MK.flipEase, fill: "both"}); };
    function expandOpen(card, go){
      if(window._vtBusy) return; // taps during the motion are ignored (no half states)
      if(reduced() || !document.body.animate){ showTab(go); document.body.classList.add("framed"); return; }
      window._vtBusy = true; try { navigator.vibrate && navigator.vibrate(10); } catch(e){}
      const A = card.getBoundingClientRect(), rA = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 18, spots = cardSpots(card), snap = stillHome();
      // siblings in the still copy: fade out + drop 16px
      sibsIn(snap).forEach(el => el.animate([{transform: "none"}, {transform: "translateY(16px)"}], {duration: 300, easing: MK.curve, fill: "both"}));
      sibsIn(snap).forEach(el => el.animate([{opacity: 1}, {opacity: 0}], {duration: 200, easing: "ease-out", fill: "both"}));
      const sc = snap.querySelector("#viewHome>.hcard[data-go=bal]"); if(sc) sc.style.visibility = "hidden"; snap.querySelectorAll(".wrap>header,#gsBox").forEach(e => e.style.visibility = "visible");
      // peek: the card's own lines fade away in place (150ms)
      const peeks = [...card.querySelectorAll(".sub,.hint")].filter(e => e.getClientRects().length).map(e => { const r = e.getBoundingClientRect(), c = e.cloneNode(true), cs = getComputedStyle(e);
        c.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;z-index:6;pointer-events:none;color:${cs.color};font:${cs.font};`;
        document.body.appendChild(c); c.animate([{opacity: 1}, {opacity: 0}], {duration: 150, easing: "ease-out", fill: "both"}).finished.then(() => c.remove()); return c; });
      showTab(go); document.body.classList.add("framed"); try { scrollTo(0, 0); } catch(e){}
      const page = balView(); page.scrollTop = 0; inner(page);
      page.classList.add("growing");
      // details: hidden, then fade up 10px one after another (200ms + 70ms each, 300ms long)
      detailsIn(page).forEach((el, i) => el.animate([{opacity: 0, transform: "translateY(10px)"}, {opacity: 1, transform: "none"}], {duration: 300, delay: 200 + 70 * Math.min(i, 8), easing: MK.curve, fill: "backwards"}));
      flip(page, true, MK.flip);
      morph(page, A, page.getBoundingClientRect(), false, false, rA, 22, pairsFor(page, spots), {dur: MK.open, ease: MK.ease})
        .finally(() => { page.classList.remove("growing"); snap.remove(); peeks.forEach(c => c.remove()); window._vtBusy = false; });
    }
    window._balShrink = function(name){ // same motion reversed, faster (340ms); details vanish at once; lands exactly on the card
      const page = balView(); if(!page || reduced() || !document.body.animate){ window._vtBusy = true; window.showTab(name); window._vtBusy = false; return; }
      window._vtBusy = true;
      page.scrollTop = 0; // spec: reset scroll to top first
      const B = page.getBoundingClientRect();
      const ghost = page.cloneNode(true); ghost.classList.add("ghost");
      ghost.style.cssText = `position:fixed;max-height:none;left:${B.left}px;top:${B.top}px;width:${B.width}px;height:${B.height}px;margin:0;z-index:5;pointer-events:none`;
      document.body.appendChild(ghost);
      detailsIn(ghost).forEach(el => el.style.visibility = "hidden");
      window.showTab(name); document.body.classList.remove("framed");
      Promise.resolve().then(() => { // measure after the riyal symbols settle
        const c = balCard(), A = c ? c.getBoundingClientRect() : {left: B.left, top: B.top, width: B.width, height: 120};
        const rA = c ? parseFloat(getComputedStyle(c).borderTopLeftRadius) || 18 : 18;
        // siblings come back: rise 16px + fade in; the card's own lines fade back at the end
        sibsIn(document).forEach(el => { el.animate([{transform: "translateY(16px)"}, {transform: "none"}], {duration: 300, easing: MK.curve, fill: "backwards"}); el.animate([{opacity: 0}, {opacity: 1}], {duration: 200, delay: 60, easing: "ease-out", fill: "backwards"}); });
        if(c) c.querySelectorAll(".sub,.hint").forEach(e => e.animate([{opacity: 0}, {opacity: 1}], {duration: 150, delay: MK.close, easing: "ease-out", fill: "backwards"}));
        flip(ghost, false, MK.close + 60);
        return morph(ghost, A, B, true, false, rA, 22, pairsFor(ghost, cardSpots(c)), {dur: MK.close, ease: MK.ease});
      }).finally(() => { ghost.remove(); window._vtBusy = false; });
    };
    // close: tap the open card (not a button, link, field or anything tappable), swipe down at the top, Back or Esc
    (function(){ const isTap = el => { for(let n = el; n && n.id !== "viewBal"; n = n.parentElement){ if(n.matches("button,a,input,select,textarea,label,summary,[contenteditable],[role=button]") || getComputedStyle(n).cursor === "pointer") return true; } return false; };
      const open = () => document.body.classList.contains("framed") && !window._vtBusy;
      document.addEventListener("click", e => { const v = balView(); if(!open() || !v || !v.contains(e.target) || isTap(e.target)) return; window.showTab("home"); });
      document.addEventListener("keydown", e => { if(e.key === "Escape" && open()) window.showTab("home"); });
      let y0 = null, x0 = 0; document.addEventListener("touchstart", e => { const v = balView(); y0 = open() && v && v.contains(e.target) && v.scrollTop <= 0 ? e.touches[0].clientY : null; x0 = e.touches[0].clientX; }, {passive: true});
      document.addEventListener("touchend", e => { if(y0 == null) return; const t = e.changedTouches[0], dy = t.clientY - y0, dx = Math.abs(t.clientX - x0); y0 = null; if(dy > 90 && dx < 60 && open()) window.showTab("home"); }, {passive: true});
      addEventListener("popstate", () => { if(open()) window.showTab("home"); });
    })();
    function expandLayer(card, go){
      if(matchMedia("(prefers-reduced-motion: reduce)").matches || !document.body.animate){ showTab(go); return; }
      const r = card.getBoundingClientRect(), W = innerWidth, H = innerHeight, cs = getComputedStyle(card);
      const rad = parseFloat(cs.borderTopLeftRadius) || 20;
      // transform + opacity only (runs on the GPU, stays smooth while the page builds underneath)
      const fx = document.createElement("div");
      const M = 12, FW = W - 2 * M, FH = H - 2 * M; // stops just short of the edges, leaving a frame around it (Beshr 2026-11-22)
      fx.style.cssText = `position:fixed;left:${M}px;top:${M}px;width:${FW}px;height:${FH}px;z-index:2147483000;pointer-events:none;background:${cs.backgroundColor};transform-origin:0 0;will-change:transform,opacity;border-radius:28px;box-shadow:0 20px 50px -20px rgba(15,42,74,.6);`; // fixed radius: animating it would leave the GPU path
      document.body.appendChild(fx);
      const sx = r.width / FW, sy = r.height / FH;
      const grow = fx.animate([
        {transform: `translate(${r.left - M}px,${r.top - M}px) scale(${sx},${sy})`},
        {transform: "translate(0,0) scale(1,1)"}
      ], {duration: 300, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards"});
      setTimeout(() => { showTab(go); document.body.classList.add("framed"); try { scrollTo(0, 0); } catch(e){} }, 40); // build the page while the layer grows
      grow.onfinish = () => requestAnimationFrame(() => {
        const fade = fx.animate([{opacity: 1}, {opacity: 0}], {duration: 200, easing: "ease-out", fill: "forwards"});
        fade.onfinish = () => fx.remove(); });
    }
    v.addEventListener("click", e => { const c = e.target.closest(".hcard"); if(!c) return; if(c.dataset.go === "bal") expandOpen(c, "bal"); else showTab(c.dataset.go); });
    // show/hide the tab bar and refresh the cards whenever the Home screen is shown
    const _show = window.showTab || showTab;
    window.showTab = function(name){ if(!window._vtBusy && name === "home" && cur === "bal" && document.body.classList.contains("framed") && !reduced() && window._balShrink){ window._balShrink(name); return; } if(name === "home" && !window._vtBusy) seed = Math.random(); /* same tip when the page shrinks back into the card */ if(!goingBack && cur && cur !== name){ backStack.push(cur); if(backStack.length > 30) backStack.shift(); } if(name === "home") backStack.length = 0; cur = name; if(name !== "bal") document.body.classList.remove("framed"); _show(name); if(VIEW[name]) { try { renderHero(name); } catch(e){} } try { dots(); } catch(e){} const home = !document.getElementById("viewHome").hidden; document.body.classList.toggle("onhome", home); if(home) render(); };
    try { showTab = window.showTab; } catch(e){}
    // the app always opens on Home (unless a #tab link was used)
    const h = location.hash.slice(1);
    window.showTab(TABS[h] && h !== "home" ? h : "home");
    // new picks each time the app comes back after being closed or in the background
    let hidAt = 0;
    document.addEventListener("visibilitychange", () => { if(document.hidden) hidAt = Date.now();
      else if(hidAt){ seed = Math.random(); if(Date.now() - hidAt > 10 * 60e3) window.showTab("home"); else soon(); } });
    window.addEventListener("pageshow", e => { if(e.persisted){ seed = Math.random(); window.showTab("home"); } });
    // keep numbers fresh as data arrives
    setTimeout(soon, 800); setTimeout(soon, 2500); setTimeout(soon, 6000);
    window.refreshHome = soon;
    ["renderBalance","renderMonth","renderDeals","renderDebts","buildHints"].forEach(n => { const f = g(n); if(typeof f !== "function") return;
      try { eval(n + " = function(){ const r = f.apply(this, arguments); soon(); return r; }"); } catch(e){} });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { init(); swipeInit(); }); else { init(); swipeInit(); }
})();
