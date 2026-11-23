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
      const r1 = `<span class="rw"><span class="rl">${left < 0 ? L("Over","متجاوز") : L("Left","باقي")}</span><b${left < 0 ? ' class="loss"' : ""}>${left < 0 ? "▼ " + sar(-left) : sar(left)}</b></span>`;
      const r2 = c ? `<span class="rw"><bdi class="rl">${esc(c.i.s)}</bdi><b${c.left < 0 ? ' class="loss"' : ""}>${c.left < 0 ? L(`${sar(-c.left)} over`, `متجاوز ${sar(-c.left)}`) : L(`${sar(c.left)} left`, `باقي ${sar(c.left)}`)}</b></span>` : "";
      return {big: (left < 0 ? neg(-perDay) : sar(perDay)) + `<span class="pd">${L(" / day", " / يوم")}</span>`, bad: left < 0, rows: r1 + r2,
        subHtml: (left < 0 ? `<span class="loss">▼ ` + L(`${fmt(-left)} SAR over this month`, `متجاوز ${fmt(-left)} ريال هذا الشهر`) + `</span>` : L(`${fmt(left)} SAR left this month`, `باقي ${fmt(left)} ريال هذا الشهر`)) + (catTxt ? " · " + catTxt : "")};
    }
    if(tab === "plan"){
      const es = (g("entries") || []).slice().sort((a,b) => (b.date.localeCompare(a.date)) || (b.createdAt - a.createdAt)), BY = g("BY") || {};
      if(!es.length) return {big: L("No costs yet","لا مصاريف بعد"), sub: L("Paste a bank message or add your first cost.","الصق رسالة البنك أو أضف أول مصروف."), small:true};
      const e = es[0], today = g("ymd") ? g("ymd")(new Date()) : "", y = new Date(); y.setDate(y.getDate()-1);
      const when = e.date === today ? L("today","اليوم") : (g("ymd") && e.date === g("ymd")(y)) ? L("yesterday","أمس") : e.date;
      const td = es.filter(x => x.date === today).reduce((a,x) => a + x.amount, 0);
      // same number as the Expenses page ("Spent today"), so it never changes while it moves (Beshr 2026-11-22)
      // Beshr's card rule: one fact per line, key number top-right, no "·" chains, no "…" cuts
      return {big: td ? neg(td) : sar(0), bad: td > 0, rows: `<span class="rw"><span class="rl">${L("Latest","آخر مصروف")}: <bdi>${esc(e.note || (BY[e.cat] || {}).s || e.cat)}</bdi> <i>${when}</i></span><b>${neg(e.amount)}</b></span>`};
    }
    if(tab === "prices"){
      const groups = [...priceGroups().values()];
      const multi = groups.map(r => { const best = new Map(); r.forEach(p => { const s = p.store || "?"; if(!best.has(s) || p.price < best.get(s).price) best.set(s, p); }); return [...best.values()].sort((a,b) => a.price - b.price); }).filter(r => r.length >= 2);
      if(multi.length){ multi.sort((a,b) => (b[b.length-1].price - b[0].price) - (a[a.length-1].price - a[0].price)); const r = pick(multi.slice(0, 3), 5), lo = r[0], hi = r[r.length-1], save = hi.price - lo.price;
        const sameName = (lo.store || "").replace(/\s*\(.*\)\s*$/, "").trim().toLowerCase() === (hi.store || "").replace(/\s*\(.*\)\s*$/, "").trim().toLowerCase();
        const lab = x => { const on = /\(online\)/i.test(x.store || ""); return sameName ? (on ? L("Online","أونلاين") : L("In store","في المحل")) : esc((x.store || "?").replace(/\s*\((?:online|shared)\)\s*$/i, "")) + (on ? " " + L("online","أونلاين") : ""); };
        return {big: `<span class="gain">▼ ${Math.round(save / hi.price * 100)}%</span>`,
          rows: `<span class="rw"><bdi class="rl strong">${esc(lo.item)}${lo.size ? " " + esc(lo.size) : ""}</bdi></span><span class="pbx"><span class="pb good"><i>${lab(lo)}</i><b><bdi dir="ltr">\u20C1${money(lo.price)}</bdi></b></span><span class="pb old"><i>${lab(hi)}</i><s><bdi dir="ltr">\u20C1${money(hi.price)}</bdi></s></span></span>`,
          subHtml: L(`<b>${money(lo.price)}</b> at ${esc(lo.store)} vs ${money(hi.price)} at ${esc(hi.store)} · <span class="gain">▼ ${Math.round(save / hi.price * 100)}% (−${money(save)})</span>`,
                     `<b>${money(lo.price)}</b> في ${esc(lo.store)} مقابل ${money(hi.price)} في ${esc(hi.store)} · <span class="gain">▼ ${Math.round(save / hi.price * 100)}٪ (−${money(save)})</span>`)}; }
      const all = groups.flat(); if(!all.length) return {big: L("Start your price book","ابدأ دفتر الأسعار"), sub: L("Save what things cost and where.","سجّل أسعار الأشياء وأين."), small:true};
      const p = pick(all, 5);
      return {big: `<bdi dir="ltr">\u20C1${money(p.price)}</bdi>`, rows: `<span class="rw"><bdi class="rl strong">${esc(p.item)}${p.size ? " " + esc(p.size) : ""}</bdi></span><span class="rw"><span class="rl">${esc(p.store || "?")}</span><i>${esc(p.date)}</i></span>`, subHtml: L(`${money(p.price)} SAR at ${esc(p.store || "?")} on ${esc(p.date)}`, `${money(p.price)} ريال في ${esc(p.store || "?")} بتاريخ ${esc(p.date)}`)};
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
      const where = `<span class="rr"><bdi>${esc(d.source)}</bdi>${d.city ? `<bdi>${esc(d.city)}</bdi>` : ""}</span>`;
      const line2 = d.paid > 0 ? `<span class="rl">${L(`You paid ${sar(d.paid)}`, `دفعت ${sar(d.paid)}`)} <b class="gain">▼ ${sar(d.profit)} ${L("less","أقل")}</b></span>`
        : d.market > 0 ? `<span class="rl">${L("Market","السوق")} ${sar(d.market)} <b class="gain">▼ ${sar(d.profit)} ${L("below","أقل")}</b></span>`
        : `<span class="rl">${esc(d.offer || "")}${d.code ? ` <b>${L("code","كود")} ${esc(d.code)}</b>` : ""}</span>`;
      return {big: d.price > 0 ? sar(d.price) : `<span class="gain">${L("Offer","عرض")}</span>`, rows: `<span class="rw"><bdi dir="auto" class="rl strong">${esc(d.title)}</bdi></span><span class="rw">${line2}${where}</span>`, subHtml: (d.price > 0 ? `<b>${sar(d.price)}</b> · ` : "") + sub};
    }
    return {big:""};
  }

  /* ---------- screen ---------- */
  const css = `#viewHome{display:flex;flex-direction:column;gap:8px!important}
  #viewHome[hidden]{display:none!important}
  .hcard{position:relative;margin:0!important;display:flex;flex-direction:column;gap:2px;width:100%;text-align:start;border:1px solid var(--line);border-radius:14px;padding:8px 12px 9px;
    background:linear-gradient(135deg,color-mix(in srgb,var(--hc) 15%,var(--surface)),var(--surface) 70%);color:var(--fg);font:inherit;cursor:pointer;overflow:hidden;
    -webkit-tap-highlight-color:transparent;transition:transform .12s ease}
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
  .hcard .sub.rows{display:flex;flex-direction:column;gap:4px;white-space:normal;overflow:visible;font-size:13px}
  .hcard .rows .rw{display:flex;align-items:baseline;justify-content:space-between;gap:10px;min-width:0}
  .hcard .rows .rl{min-width:0;overflow-wrap:anywhere;white-space:normal!important;overflow:visible!important;text-overflow:clip!important}
  .hcard .rows .rw{flex-wrap:wrap}
  .hcard .rows .rl.strong{color:var(--fg)!important;font-weight:600;font-size:15px}
  .hcard .rows i{font-style:normal;color:var(--muted);font-size:12px;white-space:nowrap}
  .hcard .rows .rw>b{white-space:nowrap;font-variant-numeric:tabular-nums}
  .hcard .rows .rr{display:flex;flex-direction:column;align-items:flex-end;text-align:end;font-size:12px;flex:none;max-width:45%}
  .hcard .rows .gain,.hcard .big .gain{color:var(--gain,#16A34A)!important}
  .hcard .rows .loss{color:var(--loss,#DC2626)!important}
  .hcard .rows .pbx{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:2px}
  .hcard .rows .pb{display:flex;flex-direction:column;gap:2px;padding:6px 10px;border-radius:10px;border:1px solid var(--line);background:var(--surface,#fff)}
  .hcard .rows .pb.good{border-color:color-mix(in srgb,var(--gain,#16A34A) 45%,transparent);background:color-mix(in srgb,var(--gain,#16A34A) 9%,var(--surface,#fff))}
  .hcard .rows .pb.good b{color:var(--gain,#16A34A)!important;font-size:16px}
  .hcard .rows .pb.old s{color:var(--muted);font-size:14px}
  .hcard .rows .pb i{font-size:11.5px}
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
  #viewHome>.hcard[data-go=bal]:has(+ .hcard[data-go=budget]),#viewHome>:is(.hcard[data-go=bal],.wm-card,.wm-ph)+.hcard[data-go=budget]{grid-column:span 1;justify-content:flex-start}
  #viewHome>.hcard[data-go=bal]:has(+ .hcard[data-go=budget]) .hint,#viewHome>:is(.hcard[data-go=bal],.wm-card,.wm-ph)+.hcard[data-go=budget] .hint{display:none!important}
  #viewHome>.hcard[data-go=bal]:has(+ .hcard[data-go=budget]) .sub,#viewHome>:is(.hcard[data-go=bal],.wm-card,.wm-ph)+.hcard[data-go=budget] .sub{white-space:normal!important;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;font-size:13px!important}
  /* Balance card keeps its month line (Beshr 2026-11-22: show the data as before) */
  #viewHome>.hcard[data-go=bal]:has(+ .hcard[data-go=budget]) .hh .big{font-size:clamp(22px,7.5vw,28px)!important}
  #viewHome>:is(.hcard[data-go=bal],.wm-card,.wm-ph)+.hcard[data-go=budget] .hh{flex-wrap:wrap}
  #viewHome>:is(.hcard[data-go=bal],.wm-card,.wm-ph)+.hcard[data-go=budget] .hh .big{order:5;flex:1 0 100%!important;text-align:start!important;font-size:clamp(18px,6vw,24px)!important}
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
  .tabHero .thList{margin-top:12px;border:1px solid var(--line);border-radius:12px;background:var(--surface,#fff);overflow:hidden}
  .tabHero .thList>div{display:flex;justify-content:space-between;gap:12px;padding:10px 12px;font-size:14px}
  .tabHero .thList>div+div{border-top:1px solid var(--line)}
  .tabHero .thList b{font-weight:500;font-variant-numeric:tabular-nums;white-space:nowrap}

  /* ===== Wallet card (Beshr's wallet-card-morph.html): same tokens, timings and behaviour ===== */
  #viewHome{--wm-navy:#0F2A4A;--wm-deep:#0B2240;--wm-soft:#1C3A5E;--wm-line:#24456B;--wm-stitch:#2E557F;--wm-ice:#E6F1FB;--wm-blue-200:#B5D4F4;--wm-blue-400:#85B7EB;--wm-amber:#FAC775;--wm-red-bg:#4A1B1B;--wm-red-text:#F7C1C1;--wm-red-bar:#F09595;--wm-red:#A32D2D;--wm-green-bar:#97C459;--wm-green-text:#C0DD97;--wm-green:#3B6D11;--wm-ease:cubic-bezier(.3,.6,.2,1);--wm-ease-flap:cubic-bezier(.3,1.3,.5,1);--wm-dur:.42s}
  #viewHome>.wm-card,#viewHome>.wm-ph,#viewHome>.wm-card+.hcard[data-go=budget],#viewHome>.wm-ph+.hcard[data-go=budget]{grid-column:span 1!important}
  .wm-card{position:relative;height:156px;background:var(--wm-navy);border-radius:18px;cursor:pointer;color:#fff;-webkit-tap-highlight-color:transparent;box-shadow:0 10px 24px -14px rgba(15,42,74,.55);
    transition:all var(--wm-dur) var(--wm-ease),transform .12s}
  .wm-card:active{transform:scale(.97)}
  .wm-card.open,.wm-card.wm-closing{cursor:auto;z-index:20}
  .wm-card.wm-closing{--wm-dur:.34s}
  .wm-in{position:absolute;inset:0;overflow:hidden;border-radius:inherit}
  .wm-card.open .wm-in{overflow-y:auto;overscroll-behavior:contain}
  .wm-card.open:active{transform:none}
  .wm-card p{margin:0}
  .wm-flap{position:absolute;inset-inline-start:0;top:0;width:36px;height:36px;z-index:3;transform-origin:top center;transform-style:preserve-3d;transform:perspective(400px) rotateX(0);transition:transform .45s var(--wm-ease-flap)}
  .wm-card.open .wm-flap{transform:perspective(400px) rotateX(180deg)}
  .wm-face{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;backface-visibility:hidden;-webkit-backface-visibility:hidden}
  .wm-face svg{width:18px;height:18px}
  .wm-front{background:var(--wm-ice);border-start-start-radius:18px;border-end-end-radius:12px;color:var(--wm-navy)}
  .wm-back{background:var(--wm-line);border-end-end-radius:12px;border-end-start-radius:18px;transform:rotateX(180deg);color:var(--wm-blue-400)}
  .wm-label{position:absolute;inset-inline-start:46px;top:11px;font-size:12px;color:var(--wm-blue-400);transition:all .4s}
  .wm-card.open .wm-label{inset-inline-start:16px;top:18px;font-size:13px}
  .wm-num{position:absolute;inset-inline-start:14px;top:44px;font-size:34px;font-weight:500;color:#fff;letter-spacing:-.5px;font-variant-numeric:tabular-nums;white-space:nowrap;transition:all var(--wm-dur) var(--wm-ease)}
  .wm-num.bad{color:var(--wm-red-text)}
  .wm-card.open .wm-num{top:36px;inset-inline-start:16px;font-size:50px}
  .wm-dec{font-size:0;color:var(--wm-blue-400);transition:font-size var(--wm-dur)}
  .wm-card.open .wm-dec{font-size:24px}
  .wm-pill{position:absolute;inset-inline-end:10px;top:9px;background:var(--wm-red-bg);color:var(--wm-red-text);font-size:11px;font-weight:500;padding:3px 8px;border-radius:999px;transition:all .4s;white-space:nowrap}
  .wm-pill.up{background:#1E3A14;color:var(--wm-green-text)}
  .wm-card.open .wm-pill{inset-inline-end:14px;top:18px;font-size:12px}
  .wm-mini{position:absolute;left:6px;right:6px;bottom:6px;height:40px;padding:0 10px;display:flex;align-items:center;gap:6px;background:var(--wm-deep);border:1px dashed var(--wm-stitch);border-radius:14px;font-size:12px;color:var(--wm-blue-200);transition:opacity .15s;overflow:hidden;white-space:nowrap}
  .wm-mini svg{width:15px;height:15px;flex:none;color:var(--wm-amber)}
  .wm-mini span{overflow:hidden;text-overflow:ellipsis}
  .wm-card.open .wm-mini{opacity:0;pointer-events:none}
  .wm-ex{opacity:0;transform:translateY(10px);pointer-events:none;transition:opacity .15s,transform .15s}
  .wm-card.open .wm-ex{opacity:1;transform:none;pointer-events:auto;transition:opacity .2s var(--d,.2s),transform .2s var(--d,.2s)}
  .wm-start{position:absolute;inset-inline-start:16px;inset-inline-end:16px;top:106px;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--wm-blue-400);cursor:pointer}
  .wm-start svg{width:14px;height:14px;flex:none}
  .wm-body{position:absolute;left:14px;right:14px;top:138px;padding-bottom:14px}
  .wm-chip{display:flex;align-items:center;gap:8px;background:var(--wm-soft);border-radius:12px;padding:10px 12px;font-size:13px;color:var(--wm-ice)}
  .wm-chip svg{width:18px;height:18px;flex:none;color:var(--wm-amber)}
  .wm-chip.warn{background:var(--wm-red-bg);color:var(--wm-red-text)}
  .wm-chip.warn svg{color:var(--wm-red-text)}
  .wm-flow-title{margin:14px 0 0!important;font-size:12px;color:var(--wm-blue-400)}
  .wm-fr{display:flex;align-items:center;gap:8px;margin-top:7px;font-size:11px}
  .wm-fr .k{width:40px;color:var(--wm-blue-400)}
  .wm-fr .t{flex:1;position:relative;height:8px}
  .wm-fr .v{width:70px;text-align:end;font-variant-numeric:tabular-nums}
  .wm-bar{position:absolute;top:0;height:8px;border-radius:4px}
  .wm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:16px}
  .wm-mc{background:#fff;border-radius:16px;padding:12px;color:#0F172A}
  .wm-mc .h{font-size:12px;font-weight:500;color:#5F5E5A}
  .wm-mc .n{margin-top:4px!important;font-size:22px;font-weight:500;font-variant-numeric:tabular-nums}
  .wm-mc .s{margin-top:8px!important;font-size:12px;color:#5F5E5A}
  .wm-btn{display:inline-block;margin-top:10px;border:.5px solid var(--wm-blue-200);color:#185FA5;font-size:12px;padding:5px 10px;border-radius:999px;background:none;cursor:pointer;min-height:0;height:auto}
  .wm-pocket{margin-top:16px;background:var(--wm-deep);border:1px dashed var(--wm-stitch);border-radius:14px;padding:10px 0 6px}
  .wm-pocket .h{margin:0 12px 8px!important;font-size:12px;color:var(--wm-blue-400)}
  .wm-rc{display:flex;justify-content:space-between;align-items:center;gap:8px;background:#fff;border-radius:6px;padding:9px 12px;margin:0 12px 6px;font-size:12px;color:#0F172A;font-family:ui-monospace,monospace}
  .wm-rc span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .wm-rc span:last-child{color:var(--wm-red);flex:none}
  .wm-all{display:block;margin:12px auto 0;background:none;border:none;color:var(--wm-blue-200);font-size:13px;cursor:pointer;min-height:44px}
  .wm-side-out{transition:opacity .3s ease;will-change:opacity}
  body.wm-open #viewHome>*:not(.wm-card):not(.wm-ph){opacity:0;pointer-events:none}
  body.wm-open{overflow:hidden}
  @media (prefers-reduced-motion: reduce){.wm-card,.wm-flap,.wm-label,.wm-num,.wm-dec,.wm-pill,.wm-mini,.wm-ex,.wm-card.open .wm-ex,.wm-side-out{transition:none!important}}
  /* Motion spec (Beshr 2026-11-22, MOTION_SPEC.md): the Balance card grows into a full-screen card, 12px inset, radius 22 */
  body.framed #viewBal{position:fixed!important;top:calc(env(safe-area-inset-top,0px) + 12px);left:16px;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);height:auto!important;margin:0!important;z-index:3;border-radius:22px!important}
  body.framed .wrap>header,body.framed #gsBox{visibility:hidden}
  .wrap>header.frz,#gsBox.frz{position:fixed!important;margin:0!important;z-index:27;box-sizing:border-box}
  .frzSp{flex:none;pointer-events:none}
  #topCap{position:fixed;left:0;right:0;top:0;z-index:26;pointer-events:none;background:#FFFFFF;overflow:hidden}
  #topCap .wv{position:absolute;left:0;right:0;top:0;overflow:hidden}
  #topCap .wv svg{display:block;width:200%!important;max-width:none!important;height:100%!important;animation:wvMove 20s linear infinite reverse}
  #topCap .wv.top{height:calc(env(safe-area-inset-top,0px) + 90px);-webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 75%);mask-image:linear-gradient(180deg,transparent 0%,#000 75%)}
  @media (prefers-color-scheme: dark){#topCap{background:#000}}
  #viewBal.ghost{border-radius:22px!important}
  .tabHero .thL:has(.thI) .thI{background:none!important;perspective:400px}
  .thI .thR{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(180deg);border-radius:inherit}
  .thI .thF,.thI .thB{position:absolute;inset:0;display:grid;place-items:center;border-radius:inherit;backface-visibility:hidden;-webkit-backface-visibility:hidden}
  .thI .thF{background:rgba(255,255,255,.18)}
  .thI .thB{background:rgba(255,255,255,.08);transform:rotateX(180deg)}
  #viewHome .hcard[data-go=bal] .hh .ic{background:rgba(255,255,255,.18)!important}
  body.framed #viewBal.growing{z-index:3;transform-origin:0 0;will-change:transform}
  /* every page opens as a card that grows from Home and shrinks back (Beshr 2026-11-22: "always a smooth transition, one single page") */
  body.framed .view.fv:not(#viewBal),.view.ghost:not(#viewBal){position:fixed!important;top:calc(env(safe-area-inset-top,0px) + 12px);left:16px;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);height:auto!important;margin:0!important;z-index:3;border-radius:22px!important;background:#F8FAFC;padding:12px;padding-top:26px;box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;box-shadow:0 20px 40px -20px rgba(15,42,74,.45)}
  .view.ghost:not(#viewBal){display:block!important;overflow:hidden}
  @media (prefers-color-scheme: dark){body.framed .view.fv:not(#viewBal),.view.ghost:not(#viewBal){background:var(--surface,#0B1220)}}
  body.framed .view.fv.growing{will-change:transform}
  #fvClose{display:none;position:fixed;top:calc(env(safe-area-inset-top,0px) + 12px);left:50%;transform:translateX(-50%);z-index:6;width:88px;height:24px;border:0;background:none;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
  #fvClose::before{content:"";display:block;width:40px;height:5px;margin:9px auto 0;border-radius:3px;background:rgba(100,116,139,.45)}
  body.framed:not(.fvbusy) #fvClose{display:block}
  /* smooth-transitions skill: pages are cards that grow from their spot under the title (layout animation, never scaled) */
  .view.fv{position:fixed!important;z-index:30;margin:0!important;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding:14px 12px 24px;border-radius:22px;background:var(--bg,#F8FAFC);box-shadow:0 20px 40px -20px rgba(15,42,74,.45)}
  .view.fv.pg-anim{overflow:hidden}
  html body header #expAll,html body header #colAll{display:none!important} /* Beshr 2026-11-22: remove open-all / close-all */
  /* plain, even background behind an open page (Beshr 2026-11-22: "Fix background") — starts at the red line, the header stays */
  #pgBack{display:none;position:fixed;left:0;right:0;top:var(--hLine,0px);bottom:0;z-index:29;background:#FFFFFF;pointer-events:none}
  @media (prefers-color-scheme: dark){#pgBack{background:#0F2A4A}}
  #viewHome>.pg-src,body.pgopen #viewHome>.pg-src{opacity:0;transform:none}
  #viewHome>.pg-land,body.pgopen #viewHome>.pg-land{opacity:1;transform:none;position:relative;z-index:30}
  #viewHome>.pg-land .hh>.ic,#viewHome>.pg-land .hh>.tt,#viewHome>.pg-land .hh>.big{visibility:hidden}
  #viewHome>.hcard,#viewHome>#wmCard{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:manipulation}
  #pgMenu{position:fixed;z-index:62;min-width:200px;background:var(--surface,#fff);color:var(--fg);border:1px solid var(--line);border-radius:14px;box-shadow:0 18px 40px -12px rgba(15,42,74,.45);overflow:hidden;transform-origin:50% 0}
  #pgMenu button{display:flex;align-items:center;gap:10px;width:100%;min-height:46px;padding:0 14px;border:0;background:none;color:inherit;font:inherit;font-size:15px;text-align:start}
  #pgMenu button+button{border-top:1px solid var(--line)}
  #pgMenu button.on{background:color-mix(in srgb,var(--accent-blue,#2563EB) 12%,transparent)}
  #pgMenu svg{width:20px;height:20px;color:var(--accent-blue,#2563EB)}
  /* status bar strip: nothing shows under the clock */
  body::after{content:"";position:fixed;left:0;right:0;top:0;height:env(safe-area-inset-top,0px);background:var(--bg,#F8FAFC);z-index:59;pointer-events:none}
  #qBar{transition:opacity .24s ease,transform .36s cubic-bezier(.3,.6,.2,1)}
  body.pgopen #viewHome>*,body.pgopen #qBar{pointer-events:none}
  body.pgopen{overflow:hidden}
  #pgClose{display:none;position:fixed;left:50%;transform:translateX(-50%);z-index:32;width:88px;height:22px;border:0;background:none;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
  #pgClose::before{content:"";display:block;width:40px;height:5px;margin:7px auto 0;border-radius:3px;background:rgba(100,116,139,.45)}
  body.pgopen.pgready #pgClose{display:block;top:var(--pgTop,60px)}
  .tabHero .thS{font-size:13px;color:var(--muted);margin-top:8px}
  #rows tr.gh{display:none!important}
  #rows tr.group{cursor:pointer;position:relative;-webkit-tap-highlight-color:transparent}
  #rows tr.group td::after{content:"";position:absolute;inset-inline-end:14px;top:50%;width:7px;height:7px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:translateY(-70%) rotate(45deg);transition:transform .3s cubic-bezier(.3,.6,.2,1)}
  #rows tr.group.gc td::after{transform:translateY(-40%) rotate(-45deg)}
  [dir=rtl] #rows tr.group.gc td::after{transform:translateY(-40%) rotate(135deg)}
  .view:not(#viewBal) .tabHero .thL{color:var(--fg);font-weight:700}
  .tabHero .thN .pd{font-size:.32em;font-weight:500;letter-spacing:0}
  body.onhome #gsBox.wm-side-out{transition:opacity .3s ease!important}
  section > div:first-child h2::after{transition:transform .32s cubic-bezier(.3,.6,.2,1)}
  #shScrim{position:fixed;left:0;right:0;bottom:0;top:var(--hLine,0px);background:#000;opacity:0;pointer-events:none;transition:opacity .38s cubic-bezier(.3,.6,.2,1);z-index:60}
  body.shopen #shScrim{opacity:.38;pointer-events:auto}
  #sheet{position:fixed;left:0;right:0;bottom:0;max-height:calc(100dvh - var(--hLine,12dvh));overflow-y:auto;overscroll-behavior:contain;background:var(--card,#fff);color:var(--fg);border-radius:22px 22px 0 0;z-index:61;transform:translateY(105%);visibility:hidden;transition:transform .38s cubic-bezier(.3,.6,.2,1),visibility 0s .38s;padding:6px 16px calc(18px + env(safe-area-inset-bottom,0px));box-sizing:border-box;box-shadow:0 -12px 30px -16px rgba(0,0,0,.4)}
  body.shopen #sheet{transform:none;visibility:visible;transition:transform .38s cubic-bezier(.3,.6,.2,1),visibility 0s}
  #sheet.closing{transition-duration:.34s,0s;transition-delay:0s,.34s}
  #sheet .shGrab{width:40px;height:5px;border-radius:3px;background:rgba(100,116,139,.45);margin:4px auto 8px}
  #sheet .shHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
  #sheet .shHead h3{margin:0;font-size:20px;font-weight:600}
  #sheet .shBody>.card{margin:0;box-shadow:none}
  body.shopen{overflow:hidden}
  html.homefit body.onhome .wrap{padding-bottom:0!important;height:100dvh;min-height:0!important;overflow:hidden}
  #viewBal.ghost{display:block!important;border-radius:28px;padding:12px;box-sizing:border-box;overflow:hidden}
  /* slimmer Search + Ask (Beshr 2026-11-22); smaller text; zoom is locked by the viewport so no focus zoom */
  body.onhome #gSearch,body.onhome #gAsk, zoom is locked by the viewport so no focus zoom */
  body.framed #gSearch,body.framed #gAsk{height:34px!important;min-height:34px!important;border-radius:9px!important}
  body.onhome #gSearch,
  body.framed #gSearch{font-size:14px!important}body.onhome #gAsk,body.framed #gAsk{font-size:12px!important}
  /* Balance + Budget line up row by row: title, big number, sub text (Beshr 2026-11-22) */
  #viewHome>:is(.hcard[data-go=bal],.wm-card,.wm-ph)+.hcard[data-go=budget]{padding:14.5px 16px!important}
  #viewHome>:is(.hcard[data-go=bal],.wm-card,.wm-ph)+.hcard[data-go=budget] .hh .big .pd{font-size:16px;font-weight:500}
  #viewHome>:is(.hcard[data-go=bal],.wm-card,.wm-ph)+.hcard[data-go=budget] .hh .big{font-size:clamp(22px,7.5vw,28px)!important;line-height:1.15!important;margin-top:0!important}
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
  body.onhome .wrap{box-sizing:border-box!important;padding-bottom:calc(92px + env(safe-area-inset-bottom,0px))!important}
  /* Quick action bar on Home (Beshr 2026-11-22): Add expense, Add bill (photo), New hunt */
  #qBar{position:fixed;left:16px;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);display:none;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;padding:6px;background:rgba(255,255,255,.97);border-radius:20px;box-shadow:0 14px 30px -12px rgba(0,0,0,.5),0 0 0 1px rgba(15,42,74,.06);z-index:15}
  body.onhome #qBar{display:grid} body.wm-open #qBar,body.framed #qBar{display:none!important}
  #qBar button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:56px;border:none;border-radius:14px;background:transparent;color:#0F172A;font:500 12px/1.2 inherit;font-family:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
  #qBar button:active{background:#EEF2F7;transform:scale(.97)}
  #qBar button{padding:0 2px!important}#qBar button span{white-space:nowrap;max-width:100%;overflow:hidden;font-size:11.5px;letter-spacing:-.1px}
  #qBar button svg{width:24px;height:24px;color:#2563EB}
  #qBar button[data-q=hunt] svg{color:#F59E0B}
  @media (prefers-color-scheme: dark){#qBar{background:var(--card,#1C2A44);box-shadow:0 14px 30px -12px rgba(0,0,0,.7)}#qBar button{color:#E2E8F0}#qBar button:active{background:rgba(255,255,255,.08)}}
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
  // Home never scrolls when everything fits above the quick bar (Beshr 2026-11-22: cards went up and down)
  function fitHome(){ const h = document.documentElement, v = document.getElementById("viewHome"), q = document.getElementById("qBar");
    if(!v || v.hidden || !q){ h.classList.remove("homefit"); return; }
    const kids = [...v.children].filter(e => e.getClientRects().length && !e.classList.contains("wm-ph")); if(!kids.length) return;
    const bottom = Math.max(...kids.map(e => e.getBoundingClientRect().bottom)) + scrollY, barTop = q.getBoundingClientRect().top; // the quick bar is fixed: its spot on the page doesn't scroll
    const fit = bottom <= barTop - 6; h.classList.toggle("homefit", fit); if(fit && scrollY) scrollTo(0, 0); }
  addEventListener("resize", () => requestAnimationFrame(fitHome));
  // Beshr 2026-11-22: nothing moves above the top of the Balance/Budget row (only the wallet icon tab may poke above it)
  /* Beshr 2026-11-23: open cards keep exactly Home's side margins (same left and right), measured from Home's own column, never from the zoom/rotation-dependent visual viewport */
  window._gut = () => { const v = document.getElementById("viewHome"), W = document.documentElement.clientWidth || innerWidth;
    if(v && v.getClientRects().length){ const r = v.getBoundingClientRect(), cs = getComputedStyle(v), l = r.left + parseFloat(cs.paddingLeft || 0), w = r.width - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
      if(w > 200 && Math.abs((W - (l + w)) - l) < 2) return {left: Math.round(l), width: Math.round(w)}; }
    return {left: 16, width: W - 32}; };
  window._hLine = () => { const c = document.querySelector("#viewHome>.wm-ph,#viewHome>.wm-card:not(.open):not(.wm-closing),#viewHome>.hcard"); const t = c ? c.getBoundingClientRect().top : 140; document.documentElement.style.setProperty("--hLine", t + "px"); return t; };
  function budgetPerDay(){ try { const ITEMS = g("ITEMS") || [], state = g("state") || {}, ms = g("monthSums"), sums = ms ? ms() : {}; const flex = ITEMS.filter(i => i.daily && state[i.k]);
    const plan = flex.reduce((a,i) => a + (+state[i.k].plan || 0), 0), spent = flex.reduce((a,i) => a + (sums[i.k] || 0), 0); return plan ? Math.max(0, (plan - spent) / daysLeftInMonth()) : 0; } catch(e){ return 0; } }
  function render(){
    if(window._wmOpen || window._pg || window._hx){ window._homeDirty = true; return; } // the wallet card or a page is open: rebuild later
    window._homeDirty = false;
    requestAnimationFrame(() => requestAnimationFrame(() => { fitHome(); window._freezeAgain && window._freezeAgain(); })); // the wallet card is open: leave Home as it is until it closes
    setTimeout(() => window.fxMood && window.fxMood(mood()), 0);
    const v = document.getElementById("viewHome"); if(!v) return;
    const hr = new Date().getHours(), greet = hr < 12 ? L("Good morning","صباح الخير") : hr < 18 ? L("Good afternoon","مساء الخير") : L("Good evening","مساء الخير");
    v.innerHTML = `<div class="hgreet" data-noi18n><span>${greet}</span><span>${new Date().toLocaleDateString(AR ? "ar-SA-u-ca-gregory" : "en-GB", {weekday:"long", day:"numeric", month:"long"})}</span></div>` +
      CARDS.map((c, i) => { const short = x => x && x.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, "").length <= 42;
        const b = bodyFor(c.tab), all = hintsFor(c.tab).filter(x => x !== lastHint[c.tab] && short(x)), mine = creative(c.tab).filter(x => x !== lastHint[c.tab] && short(x));
        // only our own short, bilingual hints on Home (no app offers like pizza, nothing cut off)
        const keep = shown[c.tab] && shown[c.tab].seed === seed && hintsFor(c.tab).includes(shown[c.tab].h) ? shown[c.tab].h : null;
        const h = keep || pick(mine.length ? mine : all.filter(x => /^💡/.test(x)).slice(-1), 11 + i); if(!keep){ lastHint[c.tab] = h; shown[c.tab] = {seed, h}; }
        if(c.tab === "bal" && window.lastBalance != null) return wmCard();
        return `<button type="button" class="hcard" data-go="${c.tab}" style="--hc:${c.c}">
          <span class="hh" data-noi18n><span class="ic">${window.PH ? PH(PHN[c.tab]) : svg(c.icon)}</span><span class="tt">${c.title}</span><span class="big${b.mid ? " mid" : ""}${b.small ? " small" : ""}${b.bad ? " bad" : ""}">${b.big}</span><span class="go">›</span></span>
          ${b.rows ? `<span class="sub rows" data-noi18n>${b.rows}</span>` : b.sub || b.subHtml ? `<span class="sub" ${b.subHtml ? "" : "data-noi18n"}>${b.subHtml || esc(b.sub)}</span>` : ""}
          ${h ? `<span class="hint">${window.PH ? PH("sparkle") : ""}<span>${esc(h.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, ""))}</span></span>` : ""}</button>`; }).join("");
    requestAnimationFrame(() => window._sizeBand && window._sizeBand());
  }
  /* ---------- Wallet card (Beshr's wallet-card-morph.html, 2026-11-22): the card itself grows; same timings + behaviour ---------- */
  function wmCard(){
    const b = window.lastBalance, st = g("balStart"), inc = g("income") || [], ent = g("entries") || [], BY = g("BY") || {};
    const after = x => { const f = g("afterStart"); return f ? f(x) : true; };
    const start = st ? st.cash + st.bank : 0, inn = inc.filter(after).reduce((a,x) => a + x.amount, 0), out = ent.filter(after).reduce((a,x) => a + x.amount, 0);
    const now = new Date(), mk = (g("ymd") || (d => d.toISOString().slice(0,10)))(now).slice(0,7);
    const inM = inc.filter(x => x.date.slice(0,7) === mk).reduce((a,x) => a + x.amount, 0), outM = ent.filter(x => x.date.slice(0,7) === mk).reduce((a,x) => a + x.amount, 0), net = inM - outM;
    const nsd = g("nextSalaryDate"), toPay = nsd ? Math.max(1, Math.ceil((nsd() - now) / 864e5)) : 30, perDay = b / toPay;
    const pace = outM / Math.max(1, now.getDate()), lasts = pace > 0 ? Math.max(0, Math.floor(b / pace)) : null;
    const cut = Date.now() - 864e5, t = x => x.createdAt || Date.parse(x.date + "T12:00:00"), r24 = x => t(x) >= cut;
    const in24 = inc.filter(r24).reduce((a,x) => a + x.amount, 0), o24 = ent.filter(r24).sort((a,b) => b.amount - a.amount), out24 = o24.reduce((a,x) => a + x.amount, 0);
    const last = ent.slice().sort((a,b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)[0];
    const two = n => (n < 0 ? "−" : "") + Math.abs(n).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const whole = Math.trunc(Math.abs(b)), dec = (Math.abs(b) % 1).toFixed(2).slice(1);
    const R = "⃁", cat = x => esc((BY[x.cat] || {}).s || x.cat || L("Other","أخرى"));
    const max = Math.max(1, start + inn, start), pct = v => Math.max(0, Math.min(100, v / max * 100)).toFixed(1);
    const day = st ? new Date(st.asOf + "T12:00:00").toLocaleDateString(AR ? "ar-SA-u-ca-gregory-nu-latn" : "en-US", {month: "short", day: "numeric"}) : "";
    const pill = net < 0 ? `<span class="wm-pill">▼ ${fmt(-net)}</span>` : `<span class="wm-pill up">▲ ${fmt(net)}</span>`;
    const mini = lasts != null ? L(`Lasts ~${lasts} days`, `يكفي ~${lasts} يوم`) : L(`${R}${fmt(perDay)}/day for ${toPay} days`, `${R}${fmt(perDay)}/يوم لمدة ${toPay} يوم`);
    const chip = lasts != null ? L(`Lasts about ${lasts} days at your pace`, `يكفيك تقريباً ${lasts} يوم بنفس صرفك`) : L(`${R}${fmt(perDay)}/day until payday`, `${R}${fmt(perDay)}/يوم حتى الراتب`);
    const bpd = budgetPerDay() || perDay; const warn = bpd > 0 && out24 > bpd * 1.5 ? `<div class="wm-chip warn wm-ex" style="--d:.36s;margin-top:12px">${window.PH ? PH("sparkle") : ""}<span>${L(`24h spend is ${Math.round(out24 / bpd)}× your ${fmt(bpd)}/day budget`, `صرف ٢٤ ساعة ${Math.round(out24 / bpd)}× ميزانيتك ${fmt(bpd)}/يوم`)}</span></div>` : "";
    const rows = o24.length ? [o24[0]].map(x => `<div class="wm-rc"><span>${cat(x)}${x.note ? " · " + esc(x.note) : ""}</span><span>−${two(x.amount)}</span></div>`).join("") +
      (o24.length > 1 ? `<div class="wm-rc"><span>${L(`Other · ${o24.length - 1} item${o24.length > 2 ? "s" : ""}`, `أخرى · ${o24.length - 1}`)}</span><span>−${two(out24 - o24[0].amount)}</span></div>` : "")
      : `<div class="wm-rc"><span>${L("Nothing out in the last 24h","ما صرفت شي آخر ٢٤ ساعة")}</span><span></span></div>`;
    const ic = window.PH ? PH(PHN.bal) : "";
    return `<div class="wm-card" id="wmCard" role="button" tabindex="0" aria-expanded="false" aria-label="${L("Open wallet","افتح المحفظة")}" data-noswipe data-noi18n>
      <div class="wm-flap"><div class="wm-face wm-front">${ic}</div><div class="wm-face wm-back">${ic}</div></div>
      <div class="wm-in">
      <p class="wm-label">${CARDS[0].title}</p>${pill}
      <p class="wm-num${b < 0 ? " bad" : ""}"><bdi dir="ltr">${b < 0 ? "−" : ""}${R}${whole.toLocaleString("en-US")}<span class="wm-dec">${dec}</span></bdi></p>
      <p class="wm-mini">${window.PH ? PH("sparkle") : ""}<span>${mini}</span></p>
      <div class="wm-start wm-ex" style="--d:.2s">${window.PH ? PH("flag") : ""}<span>${st ? L(`From ${two(start)} · ${day} · bank ${fmt(st.bank)} · cash ${fmt(st.cash)}`, `من ${two(start)} · ${day} · بنك ${fmt(st.bank)} · كاش ${fmt(st.cash)}`) : L("Set your starting point","حدد نقطة البداية")}</span>${window.PH ? PH("pencil-simple") : ""}</div>
      <div class="wm-body">
        <div class="wm-chip wm-ex" style="--d:.24s">${window.PH ? PH("sparkle") : ""}<span>${chip}</span></div>
        <div class="wm-ex" style="--d:.28s">
          <p class="wm-flow-title">${L("How you got here","كيف وصلت هنا")}</p>
          <div class="wm-fr"><span class="k">${L("Start","البداية")}</span><span class="t"><span class="wm-bar" style="inset-inline-start:0;width:${pct(start)}%;background:var(--wm-blue-400)"></span></span><span class="v" style="color:var(--wm-ice)">${two(start)}</span></div>
          <div class="wm-fr"><span class="k">${L("In","داخل")}</span><span class="t"><span class="wm-bar" style="inset-inline-start:${pct(start)}%;width:${pct(inn)}%;background:var(--wm-green-bar)"></span></span><span class="v" style="color:var(--wm-green-text)">+${two(inn)}</span></div>
          <div class="wm-fr"><span class="k">${L("Out","خارج")}</span><span class="t"><span class="wm-bar" style="inset-inline-start:${pct(Math.max(0, b))}%;width:${pct(out)}%;background:var(--wm-red-bar)"></span></span><span class="v" style="color:var(--wm-red-text)">−${two(out)}</span></div>
          <div class="wm-fr"><span class="k">${L("Now","الآن")}</span><span class="t"><span class="wm-bar" style="inset-inline-start:0;width:${pct(Math.max(0, b))}%;background:#fff"></span></span><span class="v" style="color:#fff;font-weight:500">${two(b)}</span></div>
        </div>
        <div class="wm-grid wm-ex" style="--d:.32s">
          <div class="wm-mc"><p class="h">${L("Money in · 24h","الداخل · ٢٤ ساعة")}</p><p class="n" style="color:var(--wm-green)">${two(in24)}</p><button class="wm-btn" type="button" data-wm="in">${L("+ Add money in","+ أضف مبلغ داخل")}</button></div>
          <div class="wm-mc"><p class="h">${L("Money out · 24h","الخارج · ٢٤ ساعة")}</p><p class="n" style="color:var(--wm-red)">${two(out24)}</p><p class="s">${last ? L(`Latest: ${two(last.amount)} · ${cat(last)}${last.note ? " · " + esc(last.note) : ""}`, `آخر مصروف: ${two(last.amount)} · ${cat(last)}${last.note ? " · " + esc(last.note) : ""}`) : ""}</p></div>
        </div>
        ${warn}
        <div class="wm-pocket wm-ex" style="--d:.4s"><p class="h">${L("Out of your pocket · 24h","طلع من جيبك · ٢٤ ساعة")}</p>${rows}</div>
      </div>
      </div>
    </div>`;
  }
  /* ---------- one big number + one important tip at the top of each tab (Beshr 2026-11-22) ---------- */
  const VIEW = {bal:"viewBal", budget:"viewBudget", plan:"viewPlan", prices:"viewPrices", forsa:"viewForsa"};
  function heroFor(tab){
    const b = bodyFor(tab) || {};
    const clean = x => x ? x.replace(/^[\p{Extended_Pictographic}️‍\s]+/u, "") : "";
    let label = "", num = "", bad = false, list = "";
    if(tab === "bal"){ label = `<span class="thI"><span class="thR"><span class="thF">${window.PH ? PH(PHN.bal) : ""}</span><span class="thB">${window.PH ? PH(PHN.bal) : ""}</span></span></span><span class="thT">${CARDS[0].title}</span>`; num = b.big; bad = b.bad; } // same icon + title as the card, so they fly into place (Beshr 2026-11-22)
    if(tab === "budget"){ label = L("You can spend per day","تقدر تصرف باليوم"); num = String(b.big || ""); bad = b.bad; } /* same words as the card: "/ day" stays (smooth-transitions: text never changes) */
    if(tab === "plan"){
      const ymd = g("ymd") || (d => d.toISOString().slice(0,10)), t = ymd(new Date());
      const td = (g("entries") || []).filter(e => e.date === t).reduce((a, e) => a + e.amount, 0);
      label = L("Spent today","صرفت اليوم"); num = td ? neg(td) : sar(0); bad = td > 0;
      const BY = g("BY") || {}, es = (g("entries") || []).filter(e => e.date === t).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
      list = es.length ? `<div class="thList">${es.slice(0, 12).map(e => `<div><span>${esc((BY[e.cat] || {}).s || e.cat || L("Other","أخرى"))}${e.note ? " · " + esc(e.note) : ""}</span><b>${neg(e.amount)}</b></div>`).join("")}${es.length > 12 ? `<div><span>${L(`+${es.length - 12} more`, `+${es.length - 12} أخرى`)}</span><b></b></div>` : ""}</div>`
        : ""; // Beshr 2026-11-23: nothing spent today = no "Spent today" block at all
      if(!es.length) label = "";
    }
    if(tab === "prices"){
      let best = null;
      priceGroups().forEach(recs => { const byStore = new Map(); recs.forEach(p => { const k = p.store || "?"; if(!byStore.has(k) || p.price < byStore.get(k).price) byStore.set(k, p); });
        const r = [...byStore.values()]; if(r.length < 2) return; r.sort((a,b) => a.price - b.price);
        const pct = Math.round((1 - r[0].price / r[r.length-1].price) * 100); if(!best || pct > best.pct) best = {pct, item: r[0].item, store: r[0].store}; });
      if(best){ label = L(`Cheapest ${esc(best.item)} at ${esc(best.store || "?")}`, `أرخص ${esc(best.item)} في ${esc(best.store || "?")}`); num = `<span class="thG"><span class="thA">▼</span>${best.pct}%</span>`; }
      else { label = L("Prices saved","أسعار محفوظة"); num = String((g("prices") || []).length); }
    }
    if(tab === "forsa"){
      const live = (g("deals") || []).filter(d => d.status !== "hidden" && d.profit > 0).sort((a,b) => b.profit - a.profit);
      if(live.length){ label = `<bdi dir="auto">${esc(live[0].title)}</bdi>`; num = `<span class="thD">+${sar(live[0].profit)}</span>`; }
      else { label = L("Deals found","فرص موجودة"); num = "0"; }
    }
    if(!num) return "";
    const hs = hintsFor(tab), h = (shown[tab] && hs.includes(shown[tab].h) && shown[tab].h) || hs.find(x => /^💡|^⚠|^💎|^🆕/.test(x)) || hs[0];
    const cardT = (CARDS.find(c => c.tab === tab) || {}).title || "", ic = window.PH ? PH(PHN[tab]) : "";
    const top = tab === "bal" ? `<div class="thL">${label}</div>` : `<div class="thL"><span class="thI"><span class="thR"><span class="thF">${ic}</span><span class="thB">${ic}</span></span></span><span class="thT">${cardT}</span></div>${label ? `<div class="thS">${label}</div>` : ""}`;
    return `<div class="tabHero" data-noi18n>${top}<div class="thN${bad ? " bad" : ""}">${num}</div>${h ? `<div class="thH">${window.PH ? PH("sparkle") : ""}<span>${esc(clean(h))}</span></div>` : ""}${list}</div>`;
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
    /* Beshr 2026-11-23 (red marks): every card header follows the Balance card: icon as a tab cut into the top corner, title beside it, same size.
       Budget's bottom line is an AI hint chip lined up with Balance's "Lasts" chip. */
    try { const rm = document.createElement("div"); rm.id = "rotMsg"; rm.setAttribute("role", "alert"); rm.innerHTML = (window.PH ? PH("device-mobile") : "") + "<span>" + L("Turn your phone upright to use the wallet","أعد الهاتف للوضع العمودي لاستخدام المحفظة") + "</span>"; document.body.appendChild(rm);
      screen.orientation && screen.orientation.lock && screen.orientation.lock("portrait").catch(() => {}); } catch(e){}
    try { const lg = document.getElementById("log"); const unc = () => { if(lg.classList.contains("collapsed")) lg.classList.remove("collapsed"); }; // its header is gone, so it always stays open
      new MutationObserver(unc).observe(lg, {attributes: true, attributeFilter: ["class"]}); unc(); } catch(e){}
    try { const pl = document.querySelector("#pListLbl>span"); if(pl && window.PH) pl.insertAdjacentHTML("beforebegin", PH("camera")); } catch(e){}
    try { const sl = document.querySelector("#shelfLabel>span"); if(sl && window.PH) sl.insertAdjacentHTML("beforebegin", PH("camera")); const ai = document.getElementById("pAddItem"); if(ai && window.PH){ ai.innerHTML = PH("plus-circle") + "<span>" + L("Add item","أضف صنف") + "</span>"; ai.setAttribute("data-noi18n", ""); } } catch(e){}
    const st2 = document.createElement("style"); st2.textContent = `
  #viewHome .hcard{padding-top:12px!important}
  #viewPrices #priceSec{display:none!important} /* Beshr 2026-11-23: no Price book section; '+ Add item' opens a sheet (photo of the price tag, or type it) */
  #viewPrices #pAddItem{display:none!important} #viewPrices #pAddItem{width:100%;min-height:44px;display:flex;align-items:center;justify-content:center;gap:8px}
  #viewPrices #pAddItem svg,#shelfLabel svg{width:20px;height:20px;flex:none}
  #shelfLabel{display:flex;align-items:center;justify-content:center;gap:8px}
  #shelfLabel.busy{opacity:.6;pointer-events:none}
  #shelfStatus:empty{display:none}
  /* My items: category chips, group headings, shopping-list check (Beshr 2026-11-23) */
  #pCats,#pSubCats,#oCats,#oSubCats{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin:8px 0 0;padding-bottom:2px}
  #pCats::-webkit-scrollbar,#pSubCats::-webkit-scrollbar,#oCats::-webkit-scrollbar,#oSubCats::-webkit-scrollbar{display:none}
  #pCats .chip,#pSubCats .chip,#oCats .chip,#oSubCats .chip{flex:none;min-height:36px;padding:0 12px;font-size:14px;white-space:nowrap}
  #pSubCats .chip,#oSubCats .chip{min-height:32px;font-size:13px}
  #pCats .chip .tag,#pSubCats .chip .tag,#oCats .chip .tag,#oSubCats .chip .tag{font-size:12px;opacity:.7}
  .pcathead{font-size:13px;font-weight:600;color:#0F2A4A;padding:12px 4px 4px;letter-spacing:.2px}
  .plistbtn{display:flex!important;align-items:center;justify-content:center;gap:8px;min-height:44px;margin-top:8px;cursor:pointer}
  .plistbtn svg{width:20px;height:20px}
  .plistbtn.busy{opacity:.6;pointer-events:none}
  #pListRes{margin-top:8px}
  #pOthersList .orow{display:flex;align-items:center;gap:8px;padding:10px 0;border-top:1px solid #E2E8F0}
  #pOthersList .orow:first-child{border-top:0}
  #pOthersList .on{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
  #pOthersList .on b{font-weight:600;font-size:16px}
  #pOthersList .on .tag{white-space:nowrap;font-weight:500}
  #pOthersList .on small{font-size:13px;color:#64748B}
  #pOthersList .op{display:flex;flex-direction:column;align-items:flex-end;gap:4px;font-variant-numeric:tabular-nums}
  #pOthersList .op .btn{min-height:36px;padding:0 12px}
  #othersSec:not(:has(#pOthers:not([hidden]))){display:none!important} #pOthers{margin-top:8px} /* Beshr 2026-11-23: other users' items in their own section, shown once there are some */
  #pList .pitem summary .tag{white-space:nowrap} /* size stays with the name */
  /* Expenses list: only today in full, the rest folded (Beshr 2026-11-23) */
  #entries .earlyhead{display:flex;align-items:center;gap:8px;padding:12px;cursor:pointer;min-height:44px;box-sizing:border-box;background:var(--surface,#F8FAFC)}
  #entries .earlyhead .el{flex:1;display:flex;flex-direction:column;min-width:0}
  #entries .earlyhead .el b{font-size:14px;font-weight:600;color:#0F172A}
  #entries .earlyhead .el small{font-size:12px;color:#64748B}
  #entries .earlyhead .num{font-weight:600;font-size:15px;color:#0F172A;font-variant-numeric:tabular-nums}
  #entries .earlyhead .chev{color:#64748B;transition:transform .2s ease;font-size:18px}
  #entries .earlier:not(.shut) .earlyhead .chev{transform:rotate(90deg)}
  #entries .earlier.shut .earlybody{display:none}
  #entries .earlybody .dayhead{padding:6px 12px;gap:10px}
  #entries .earlybody .dayhead .dd{flex-direction:row;gap:4px;align-items:baseline;min-width:52px}
  #entries .earlybody .dayhead .dd b{font-size:14px}
  #entries .earlybody .dayhead .dm{gap:3px}
  #entries .earlybody .dayhead .dl{font-size:12px}
  #entries .earlybody .dayhead .dl .num{font-size:13px}
  #entries .earlybody .dbar{height:3px}
  .plhead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
  .plhead .del{flex:none;min-height:36px}
  .plrow{display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px solid #E2E8F0}
  .plrow>span:nth-child(2){flex:1;min-width:0;display:flex;flex-direction:column}
  .plrow small{font-size:12px;color:#64748B}
  .plrow .pli{width:24px;height:24px;border-radius:12px;display:grid;place-items:center;font-size:13px;flex:none}
  .plrow.yes .pli{background:#DCFCE7;color:#16A34A}.plrow.no .pli{background:#FEE2E2;color:#DC2626}
  .plrow .plp{display:flex;flex-direction:column;align-items:flex-end;font-variant-numeric:tabular-nums}
  /* Shop sheet (Beshr 2026-11-23) */
  #shopBox{display:flex;flex-direction:column;gap:8px}
  #shopBox .shSearch{display:flex;align-items:center;gap:8px;min-height:48px;padding:0 12px;border-radius:14px;background:#F1F5F9;border:1px solid #E2E8F0;box-sizing:border-box}
  #shopBox .shSearch svg{width:20px;height:20px;color:#64748B;flex:none}
  #shopBox .shSearch input{flex:1;min-width:0;border:0!important;background:transparent!important;font:400 16px/1.3 inherit;font-family:inherit;color:#0F172A;outline:none;padding:0!important;margin:0!important;box-shadow:none!important;height:46px}
  #shopBox .shPhoto{display:flex!important;align-items:center;justify-content:center;gap:8px;min-height:48px;margin:0;cursor:pointer;color:#2563EB;font-weight:500}
  #shopBox .shPhoto svg,#shopBox .shAi svg{width:22px;height:22px}
  #shopBox .busy{opacity:.55;pointer-events:none}
  #shopBox .shTip{margin:-4px 0 0;text-align:center;font-size:12px;color:#64748B}
  #shopBox .shMsg{margin:8px 4px 0;font-size:14px;color:#64748B}
  #shopBox .shCount{margin:8px 4px 0;font-size:13px;font-weight:600;color:#0F2A4A}
  #shopBox .shAi{display:flex!important;align-items:center;justify-content:center;gap:8px;min-height:44px;margin-top:4px;color:#2563EB}
  #shopRes{display:flex;flex-direction:column}
  #shopBox .shRow{border-top:1px solid #E2E8F0}
  #shopBox .shRow:first-of-type{border-top:0}
  #shopBox .shRow>summary,#shopBox .shRow.none{display:flex;align-items:center;gap:12px;padding:10px 0;min-height:44px;list-style:none;cursor:pointer}
  #shopBox .shRow>summary::-webkit-details-marker{display:none}
  #shopBox .shImg{width:40px;height:40px;border-radius:10px;flex:none;object-fit:cover;background:#F1F5F9;display:grid;place-items:center;color:#0F2A4A}
  #shopBox .shImg svg{width:20px;height:20px}
  #shopBox .shRow.none .shImg{color:#64748B}
  #shopBox .shN{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
  #shopBox .shN b{font-size:16px;font-weight:500;color:#0F172A}
  #shopBox .shN small,#shopBox .shP small{font-size:13px;color:#64748B}
  #shopBox .shP{display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex:none;max-width:42%;text-align:end;font-variant-numeric:tabular-nums}
  #shopBox .shP b{font-size:16px;font-weight:600;color:#0F172A}
  #shopBox .shStores{margin:0 0 10px 52px;display:flex;flex-direction:column;gap:2px}
  [dir=rtl] #shopBox .shStores{margin:0 52px 10px 0}
  #shopBox .shStores>div{display:flex;justify-content:space-between;gap:8px;font-size:14px;padding:6px 10px;border-radius:8px;color:#334155}
  #shopBox .shStores>div.low{background:#F1F5F9;font-weight:500;color:#0F172A}
  #shopBox .shStores em{font-style:normal;font-size:12px;color:#0F2A4A;font-weight:600;margin-inline-start:4px}
  #shopBox .shTotal{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #E2E8F0;padding:12px 0 0;margin-top:4px;font-size:16px}
  #shopBox .shTotal b{font-weight:600;font-variant-numeric:tabular-nums}
  #viewPrices #billsSec{display:none!important} /* Beshr 2026-11-23: Add bill lives in the quick action bar */
  #viewPlan #log>div:first-child,#viewPlan #log>#addForm,#viewPlan #log>#month{display:none!important} /* Beshr 2026-11-23: 'Add a cost' lives in the quick action bar (Add expense); the month details and entries stay */
  /* Beshr 2026-11-23: portrait only. iPhone can't lock a home-screen web app, so a sideways phone gets a calm "turn it upright" screen instead of a broken layout */
  #rotMsg{display:none}
  @media (orientation: landscape) and (max-height: 540px){#rotMsg{display:flex;position:fixed;inset:0;z-index:99999;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;background:#0F2A4A;color:#E6F1FB;font-size:17px;font-weight:500;text-align:center}#rotMsg svg{width:40px;height:40px;color:#B5D4F4}}
  /* in-place opening (accordion) for Expenses, Prices log, Forsa */
  #viewHome>.hcard{transition:border-radius .16s ease,box-shadow .16s ease}
  #viewHome>.hcard.hx-on{border-end-start-radius:0!important;border-end-end-radius:0!important;border-bottom-color:transparent!important;box-shadow:none!important;position:relative;z-index:2;margin-bottom:-12px!important} /* the grid gap under the card is taken back, so the opening box starts right at its bottom edge */
  #viewHome>.hx{grid-column:1 / -1;position:relative;z-index:1;margin-top:-1px!important;overflow:hidden;box-sizing:border-box;padding:4px 12px 16px;--hxpb:16px;background:var(--hxbg,#fff);border:1px solid var(--hxbd,#E2E8F0);border-top:0;border-end-start-radius:16px;border-end-end-radius:16px;box-shadow:0 12px 28px -14px rgba(15,42,74,.28)}
  #viewHome>.hx>.view.hx-view{display:flex;position:static!important;margin:0!important;padding:0!important;background:none!important;box-shadow:none!important;border-radius:0!important}
  #viewHome>.hx .tabHero{padding-top:0;padding-bottom:0!important}
  #viewHome>.hx>.view.hx-view{gap:12px!important}
  #viewHome>.hx .tabHero>.thL,#viewHome>.hx .tabHero>.thN{display:none!important}
  #viewHome>.hcard.hx-min>.sub,#viewHome>.hcard.hx-min>.hint{display:none!important}
  #viewHome>.hcard.hx-anim{overflow:hidden!important}
  #viewHome .hcard .hh{padding-inline-start:36px;margin-top:-6px;min-height:24px}
  #viewHome>.hcard:not([data-go=budget]):not([data-go=bal]) .sub.rows>.rw{padding-inline-start:36px!important;box-sizing:border-box} /* Beshr 2026-11-23: text lines start under the title, not under the icon */
  #viewHome .hcard .hh .ic{position:absolute!important;top:-1px!important;inset-inline-start:-1px!important;margin:0!important;width:38px!important;height:38px!important;border-radius:0!important;border-start-start-radius:16px!important;border-end-end-radius:12px!important;box-shadow:none!important;background:#E8EEF6!important;color:#0F2A4A!important}
  #viewHome .hcard .hh .ic svg{width:18px!important;height:18px!important}
  #viewHome .hcard[data-go=forsa] .hh .ic{background:#FCD98A!important;color:#92400E!important}
  #viewHome .hcard .hh .tt{font-size:16px!important;font-weight:600!important;line-height:1.25!important}
  .wm-label{font-size:16px!important;font-weight:500!important;top:8px!important;inset-inline-start:46px!important}
  .wm-card.open .wm-label{font-size:16px!important}
  #viewHome>:is(.wm-card,.wm-ph,.hcard[data-go=bal])+.hcard[data-go=budget]{padding-bottom:52px!important}
  #viewHome>:is(.wm-card,.wm-ph,.hcard[data-go=bal])+.hcard[data-go=budget] .sub.rows .rw:nth-child(n+2){display:none!important}
  #viewHome>:is(.wm-card,.wm-ph,.hcard[data-go=bal])+.hcard[data-go=budget] .hint{display:flex!important;align-items:center;position:absolute;left:6px;right:6px;bottom:6px;min-height:40px;margin:0!important;padding:4px 10px!important;box-sizing:border-box;border-radius:14px!important;border:1px dashed #CBD5E1;background:#F1F5F9!important;color:#334155!important;font-size:11.5px!important;line-height:1.3!important;overflow:hidden;white-space:normal}
  #viewHome>:is(.wm-card,.wm-ph,.hcard[data-go=bal])+.hcard[data-go=budget] .hint>span{white-space:normal!important;overflow:visible!important;text-overflow:clip!important}
  #viewHome>:is(.wm-card,.wm-ph,.hcard[data-go=bal])+.hcard[data-go=budget] .hh .big{margin-inline-start:-36px!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important}
  #viewHome>:is(.wm-card,.wm-ph,.hcard[data-go=bal])+.hcard[data-go=budget] .hint>svg{flex:none;color:#F59E0B}`;
    document.head.appendChild(st2);
    const band = document.createElement("div"); band.id = "homeBand"; band.setAttribute("aria-hidden", "true");
    /* one calm sine curve, still (Beshr 2026-11-22: "make it a curve or sin or cos function") */
    const P1 = "M0,0 L0,30.0 L4,31.0 L8,32.0 L12,33.0 L16,34.0 L20,34.9 L24,35.9 L28,36.8 L32,37.7 L36,38.6 L40,39.4 L44,40.2 L48,41.0 L52,41.7 L56,42.3 L60,42.9 L64,43.5 L68,44.0 L72,44.5 L76,44.9 L80,45.2 L84,45.5 L88,45.7 L92,45.9 L96,46.0 L100,46.0 L104,46.0 L108,45.9 L112,45.7 L116,45.5 L120,45.2 L124,44.9 L128,44.5 L132,44.0 L136,43.5 L140,42.9 L144,42.3 L148,41.7 L152,41.0 L156,40.2 L160,39.4 L164,38.6 L168,37.7 L172,36.8 L176,35.9 L180,34.9 L184,34.0 L188,33.0 L192,32.0 L196,31.0 L200,30.0 L204,29.0 L208,28.0 L212,27.0 L216,26.0 L220,25.1 L224,24.1 L228,23.2 L232,22.3 L236,21.4 L240,20.6 L244,19.8 L248,19.0 L252,18.3 L256,17.7 L260,17.1 L264,16.5 L268,16.0 L272,15.5 L276,15.1 L280,14.8 L284,14.5 L288,14.3 L292,14.1 L296,14.0 L300,14.0 L304,14.0 L308,14.1 L312,14.3 L316,14.5 L320,14.8 L324,15.1 L328,15.5 L332,16.0 L336,16.5 L340,17.1 L344,17.7 L348,18.3 L352,19.0 L356,19.8 L360,20.6 L364,21.4 L368,22.3 L372,23.2 L376,24.1 L380,25.1 L384,26.0 L388,27.0 L392,28.0 L396,29.0 L400,30.0 L404,31.0 L408,32.0 L412,33.0 L416,34.0 L420,34.9 L424,35.9 L428,36.8 L432,37.7 L436,38.6 L440,39.4 L444,40.2 L448,41.0 L452,41.7 L456,42.3 L460,42.9 L464,43.5 L468,44.0 L472,44.5 L476,44.9 L480,45.2 L484,45.5 L488,45.7 L492,45.9 L496,46.0 L500,46.0 L504,46.0 L508,45.9 L512,45.7 L516,45.5 L520,45.2 L524,44.9 L528,44.5 L532,44.0 L536,43.5 L540,42.9 L544,42.3 L548,41.7 L552,41.0 L556,40.2 L560,39.4 L564,38.6 L568,37.7 L572,36.8 L576,35.9 L580,34.9 L584,34.0 L588,33.0 L592,32.0 L596,31.0 L600,30.0 L604,29.0 L608,28.0 L612,27.0 L616,26.0 L620,25.1 L624,24.1 L628,23.2 L632,22.3 L636,21.4 L640,20.6 L644,19.8 L648,19.0 L652,18.3 L656,17.7 L660,17.1 L664,16.5 L668,16.0 L672,15.5 L676,15.1 L680,14.8 L684,14.5 L688,14.3 L692,14.1 L696,14.0 L700,14.0 L704,14.0 L708,14.1 L712,14.3 L716,14.5 L720,14.8 L724,15.1 L728,15.5 L732,16.0 L736,16.5 L740,17.1 L744,17.7 L748,18.3 L752,19.0 L756,19.8 L760,20.6 L764,21.4 L768,22.3 L772,23.2 L776,24.1 L780,25.1 L784,26.0 L788,27.0 L792,28.0 L796,29.0 L800,30.0 L800,0 Z", P2 = "M0,0 L0,30.0 L4,29.0 L8,28.0 L12,27.0 L16,26.0 L20,25.1 L24,24.1 L28,23.2 L32,22.3 L36,21.4 L40,20.6 L44,19.8 L48,19.0 L52,18.3 L56,17.7 L60,17.1 L64,16.5 L68,16.0 L72,15.5 L76,15.1 L80,14.8 L84,14.5 L88,14.3 L92,14.1 L96,14.0 L100,14.0 L104,14.0 L108,14.1 L112,14.3 L116,14.5 L120,14.8 L124,15.1 L128,15.5 L132,16.0 L136,16.5 L140,17.1 L144,17.7 L148,18.3 L152,19.0 L156,19.8 L160,20.6 L164,21.4 L168,22.3 L172,23.2 L176,24.1 L180,25.1 L184,26.0 L188,27.0 L192,28.0 L196,29.0 L200,30.0 L204,31.0 L208,32.0 L212,33.0 L216,34.0 L220,34.9 L224,35.9 L228,36.8 L232,37.7 L236,38.6 L240,39.4 L244,40.2 L248,41.0 L252,41.7 L256,42.3 L260,42.9 L264,43.5 L268,44.0 L272,44.5 L276,44.9 L280,45.2 L284,45.5 L288,45.7 L292,45.9 L296,46.0 L300,46.0 L304,46.0 L308,45.9 L312,45.7 L316,45.5 L320,45.2 L324,44.9 L328,44.5 L332,44.0 L336,43.5 L340,42.9 L344,42.3 L348,41.7 L352,41.0 L356,40.2 L360,39.4 L364,38.6 L368,37.7 L372,36.8 L376,35.9 L380,34.9 L384,34.0 L388,33.0 L392,32.0 L396,31.0 L400,30.0 L404,29.0 L408,28.0 L412,27.0 L416,26.0 L420,25.1 L424,24.1 L428,23.2 L432,22.3 L436,21.4 L440,20.6 L444,19.8 L448,19.0 L452,18.3 L456,17.7 L460,17.1 L464,16.5 L468,16.0 L472,15.5 L476,15.1 L480,14.8 L484,14.5 L488,14.3 L492,14.1 L496,14.0 L500,14.0 L504,14.0 L508,14.1 L512,14.3 L516,14.5 L520,14.8 L524,15.1 L528,15.5 L532,16.0 L536,16.5 L540,17.1 L544,17.7 L548,18.3 L552,19.0 L556,19.8 L560,20.6 L564,21.4 L568,22.3 L572,23.2 L576,24.1 L580,25.1 L584,26.0 L588,27.0 L592,28.0 L596,29.0 L600,30.0 L604,31.0 L608,32.0 L612,33.0 L616,34.0 L620,34.9 L624,35.9 L628,36.8 L632,37.7 L636,38.6 L640,39.4 L644,40.2 L648,41.0 L652,41.7 L656,42.3 L660,42.9 L664,43.5 L668,44.0 L672,44.5 L676,44.9 L680,45.2 L684,45.5 L688,45.7 L692,45.9 L696,46.0 L700,46.0 L704,46.0 L708,45.9 L712,45.7 L716,45.5 L720,45.2 L724,44.9 L728,44.5 L732,44.0 L736,43.5 L740,42.9 L744,42.3 L748,41.7 L752,41.0 L756,40.2 L760,39.4 L764,38.6 L768,37.7 L772,36.8 L776,35.9 L780,34.9 L784,34.0 L788,33.0 L792,32.0 L796,31.0 L800,30.0 L800,0 Z";
    const sine = (cls, sign, fill, op) => `<div class="wv ${cls}"><svg viewBox="0 0 800 60" preserveAspectRatio="none"><path d="${sign > 0 ? P1 : P2}" fill="${fill}" fill-opacity="${op}"/></svg></div>`;
    band.innerHTML = sine("top rev", -1, "#0F2A4A", .07) + sine("bot", 1, "#FFFFFF", 1);
    document.addEventListener("visibilitychange", () => document.documentElement.classList.toggle("wv-paused", document.hidden));
    document.body.appendChild(band);
    /* Beshr 2026-11-23 (red marks): the title row and search bar are frozen — they never scroll, move or fade, whatever opens.
       They sit fixed on a cap that matches the white band; Home scrolls underneath. Spacers keep the layout the same. */
    (function freezeTop(){ return; // Beshr 2026-11-23: "Don't freeze the top" (undone; kept here switched off)
      const hd = document.querySelector(".wrap>header"), gs = document.getElementById("gsBox"); if(!hd || !gs) return;
      const cap = document.createElement("div"); cap.id = "topCap"; cap.setAttribute("aria-hidden", "true");
      const tw = band.querySelector(".wv.top"); if(tw) cap.appendChild(tw.cloneNode(true));
      document.body.appendChild(cap);
      const sp = el => { const d = document.createElement("div"); d.className = "frzSp"; el.before(d); return d; };
      const s1 = sp(hd), s2 = sp(gs);
      const place = () => { [[hd, s1], [gs, s2]].forEach(([el, d]) => { el.classList.remove("frz"); el.style.top = el.style.left = el.style.width = ""; d.style.display = "none"; }); // measure the real layout, without the spacers
        const y = scrollY, r1 = hd.getBoundingClientRect(), r2 = gs.getBoundingClientRect(), cs1 = getComputedStyle(hd), cs2 = getComputedStyle(gs);
        const put = (el, d, r, cs) => { d.style.display = ""; d.style.height = r.height + "px"; d.style.marginTop = cs.marginTop; d.style.marginBottom = cs.marginBottom;
          el.style.top = (r.top + y) + "px"; el.style.left = r.left + "px"; el.style.width = r.width + "px"; el.classList.add("frz"); };
        if(!r1.height && !r2.height) return; // not laid out yet: stay in the flow
        put(hd, s1, r1, cs1); put(gs, s2, r2, cs2);
        cap.style.height = Math.round(r2.bottom + y + 8) + "px"; };
      place(); window._freezeTop = place;
      let t = 0; const again = () => { cancelAnimationFrame(t); t = requestAnimationFrame(() => { if(!document.body.classList.contains("pgopen") && !window._wmOpen && !window._pgBusy){ const y = scrollY; place(); if(scrollY !== y) scrollTo(0, y); } }); };
      addEventListener("resize", again); addEventListener("orientationchange", again);
      try { new ResizeObserver(again).observe(hd); new ResizeObserver(again).observe(gs); } catch(e){}
      document.fonts && document.fonts.ready.then(again);
      window._freezeAgain = again; [0, 300, 1000, 2500].forEach(ms => setTimeout(again, ms)); // re-measure once Home has its final layout
    })();
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
    const viewOf = t => document.getElementById(VIEW[t]);
    const balView = () => document.querySelector(".view.fv") || document.getElementById("viewBal");
    const setFv = t => { document.querySelectorAll(".view.fv").forEach(e => e.classList.remove("fv")); const v = viewOf(t); if(v) v.classList.add("fv"); return v; };
    const homeCard = t => t === "bal" ? (document.getElementById("wmCard") || document.querySelector('#viewHome .hcard[data-go=bal]')) : document.querySelector(`#viewHome .hcard[data-go=${t}]`);
    window._openFramed = t => { window._vtBusy = true; try { setFv(t); showTab(t); document.body.classList.add("framed"); scrollTo(0, 0); } finally { window._vtBusy = false; } };
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
    const MK = {ease: bez(.3, .6, .2, 1), open: 420, close: 340, flipEase: "cubic-bezier(.3,1.3,.5,1)", flip: 450, curve: "cubic-bezier(.3,.6,.2,1)"}; /* smooth-transitions skill: no 60fps frame over ~11% */
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
    const sibsIn = (root, go) => [...root.querySelectorAll(`.wrap>header,#gsBox,#viewHome>*:not([data-go=${go || "bal"}]):not(#wmCard):not(.wm-ph)${go && go !== "bal" ? ",#viewHome>#wmCard" : ""}`)];
    const detailsIn = box => { const h = box.querySelector(".tabHero"), out = []; if(h){ const t = h.querySelector(".thH"); if(t) out.push(t); }
      const k = box.querySelector(":scope > .vbIn") || box; [...k.children].forEach(c => { if(c.classList.contains("tabHero")) return; const kids = c.tagName === "SECTION" ? [...c.children] : [c]; kids.forEach(x => out.push(x)); }); return out; };
    const flip = (box, open, dur) => { const r = box.querySelector(".thI .thR"); if(r) r.animate([{transform: `rotateX(${open ? 0 : 180}deg)`}, {transform: `rotateX(${open ? 180 : 0}deg)`}], {duration: dur, easing: MK.flipEase, fill: "both"}); };
    function expandOpen(card, go){
      if(window._vtBusy) return; // taps during the motion are ignored (no half states)
      if(reduced() || !document.body.animate){ window._openFramed(go); return; }
      window._vtBusy = true; try { navigator.vibrate && navigator.vibrate(10); } catch(e){}
      const A = card.getBoundingClientRect(), rA = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 18, spots = cardSpots(card), snap = stillHome();
      // siblings in the still copy: fade out + drop 16px
      sibsIn(snap, go).forEach(el => el.animate([{transform: "none"}, {transform: "translateY(16px)"}], {duration: 300, easing: MK.curve, fill: "both"}));
      sibsIn(snap, go).forEach(el => el.animate([{opacity: 1}, {opacity: 0}], {duration: 200, easing: "ease-out", fill: "both"}));
      const sc = go === "bal" ? snap.querySelector("#viewHome>#wmCard,#viewHome>.hcard[data-go=bal]") : snap.querySelector(`#viewHome>.hcard[data-go=${go}]`); if(sc && card.closest("#viewHome")) sc.style.visibility = "hidden"; snap.querySelectorAll(".wrap>header,#gsBox").forEach(e => e.style.visibility = "visible");
      // peek: the card's own lines fade away in place (150ms)
      const peeks = [...card.querySelectorAll(".sub,.hint")].filter(e => e.getClientRects().length).map(e => { const r = e.getBoundingClientRect(), c = e.cloneNode(true), cs = getComputedStyle(e);
        c.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;z-index:6;pointer-events:none;color:${cs.color};font:${cs.font};`;
        document.body.appendChild(c); c.animate([{opacity: 1}, {opacity: 0}], {duration: 150, easing: "ease-out", fill: "both"}).finished.then(() => c.remove()); return c; });
      setFv(go); showTab(go); document.body.classList.add("framed", "fvbusy"); try { scrollTo(0, 0); } catch(e){}
      const page = viewOf(go); page.scrollTop = 0; inner(page);
      page.classList.add("growing");
      // details: hidden, then fade up 10px one after another (200ms + 70ms each, 300ms long)
      detailsIn(page).forEach((el, i) => el.animate([{opacity: 0, transform: "translateY(10px)"}, {opacity: 1, transform: "none"}], {duration: 300, delay: 200 + 70 * Math.min(i, 8), easing: MK.curve, fill: "backwards"}));
      flip(page, true, MK.flip);
      morph(page, A, page.getBoundingClientRect(), false, false, rA, 22, pairsFor(page, spots), {dur: MK.open, ease: MK.ease})
        .finally(() => { page.classList.remove("growing"); document.body.classList.remove("fvbusy"); snap.remove(); peeks.forEach(c => c.remove()); window._vtBusy = false; });
    }
    window._balShrink = function(name){ // same motion reversed, faster (340ms); details vanish at once; lands exactly on the card
      const from = cur, page = viewOf(from) || balView(); if(!page || reduced() || !document.body.animate){ window._vtBusy = true; window.showTab(name); window._vtBusy = false; return; }
      window._vtBusy = true;
      page.scrollTop = 0; // spec: reset scroll to top first
      const B = page.getBoundingClientRect();
      const ghost = page.cloneNode(true); ghost.classList.add("ghost");
      ghost.style.cssText = `position:fixed;max-height:none;left:${B.left}px;top:${B.top}px;width:${B.width}px;height:${B.height}px;margin:0;z-index:5;pointer-events:none`;
      document.body.appendChild(ghost);
      detailsIn(ghost).forEach(el => el.style.visibility = "hidden");
      window.showTab(name); document.body.classList.remove("framed"); page.classList.remove("fv");
      Promise.resolve().then(() => { // measure after the riyal symbols settle
        const c = homeCard(from), A = c ? c.getBoundingClientRect() : {left: B.left, top: B.top, width: B.width, height: 120};
        const rA = c ? parseFloat(getComputedStyle(c).borderTopLeftRadius) || 18 : 18;
        // siblings come back: rise 16px + fade in; the card's own lines fade back at the end
        sibsIn(document, from).forEach(el => { el.animate([{transform: "translateY(16px)"}, {transform: "none"}], {duration: 300, easing: MK.curve, fill: "backwards"}); el.animate([{opacity: 0}, {opacity: 1}], {duration: 200, delay: 60, easing: "ease-out", fill: "backwards"}); });
        if(c) c.querySelectorAll(".sub,.hint").forEach(e => e.animate([{opacity: 0}, {opacity: 1}], {duration: 150, delay: MK.close, easing: "ease-out", fill: "backwards"}));
        flip(ghost, false, MK.close + 60);
        return morph(ghost, A, B, true, false, rA, 22, pairsFor(ghost, cardSpots(c)), {dur: MK.close, ease: MK.ease});
      }).finally(() => { ghost.remove(); window._vtBusy = false; });
    };


    /* Quick action bar (Beshr 2026-11-22) */
    (function(){
      const q = document.createElement("nav"); q.id = "qBar"; q.setAttribute("aria-label", L("Quick actions","إجراءات سريعة")); q.setAttribute("data-noi18n", ""); q.setAttribute("data-noswipe", "");
      const ic = n => window.PH ? PH(n) : "";
      q.innerHTML = `<button type="button" data-q="exp">${ic("plus-circle")}<span>${L("Add expense","أضف مصروف")}</span></button>` +
        `<button type="button" data-q="bill">${ic("camera")}<span>${L("Add bill / item","فاتورة / صنف")}</span></button>` +
        `<button type="button" data-q="shop">${ic("shopping-cart")}<span>${L("Shop","تسوّق")}</span></button>` +
        `<button type="button" data-q="hunt">${ic("magnifying-glass")}<span>${L("New hunt","بحث جديد")}</span></button>`;
      document.body.appendChild(q);
      const to = (tab, el, b) => { window._fromEl = b || null; window.showTab(tab); window._fromEl = null; const e = document.getElementById(el); const sec = e && e.closest("section"); if(sec && sec.classList.contains("collapsed")){ const h = sec.querySelector(":scope > div:first-child h2"); if(h) h.click(); } if(e){ const v = e.closest(".view"), go = () => { if(window._vtBusy) return setTimeout(go, 60); if(v){ const vr = v.getBoundingClientRect(), er = e.getBoundingClientRect(); v.scrollTo({top: Math.max(0, v.scrollTop + er.top - vr.top - vr.height / 3), behavior: "smooth"}); } }; setTimeout(go, 60); } return e; }; // scroll once the page has finished growing
      q.addEventListener("click", e => { const b = e.target.closest("button"); if(!b) return; const k = b.dataset.q;
        if(k === "exp") window._sheet("exp");
        if(k === "bill"){ window._sheet("bill"); } // the sheet opens first; the photo picker opens only when you tap Upload bill (Beshr 2026-11-22)
        if(k === "hunt") window._sheet("hunt");
        if(k === "shop"){ window._shopPrep && window._shopPrep(); window._sheet("shop"); } // Beshr 2026-11-23: search My items by name or photo
      });
    })();
    /* Wallet card behaviour (wallet-card-morph.html): tap grows the card itself from its spot; tap again (not on a tile/button) closes */
    (function(){
      const INNER = ".wm-mc, .wm-rc, .wm-start, button";
      let ph = null, busy = false;
      const dur = () => reduced() ? 0 : 420, durC = () => reduced() ? 0 : 340;
      const set = (el, r) => { el.style.top = r.top + "px"; el.style.left = r.left + "px"; el.style.width = r.width + "px"; el.style.height = r.height + "px"; };
      const sides = () => [...document.querySelectorAll("#viewHome>*:not(.wm-card):not(.wm-ph)")]; /* title + search stay put */
      const target = () => { const top = Math.max(48, window._hLine() + 36) /* the flipped icon tab sits on the red line; nothing goes above it */, bot = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sab")) || 0;
        return {top, left: window._gut().left, width: window._gut().width, height: Math.max(300, innerHeight - top - 12 - bot)}; };
      function open(card){
        if(busy || window._wmOpen) return; busy = true; window._wmOpen = true;
        card.getAnimations().forEach(a => a.cancel()); card.style.transform = ""; // drop the 0.97 press first so we measure the real card
        const r = card.getBoundingClientRect();
        ph = document.createElement("div"); ph.className = "wm-ph"; const cs0 = getComputedStyle(card), hh = cs0.boxSizing === "border-box" ? parseFloat(cs0.height) : card.offsetHeight; // layout size (ignores the press scale), sub-pixel exact
        ph.style.height = hh + "px"; ph.style.minHeight = hh + "px"; card.after(ph);
        sides().forEach(e => e.classList.add("wm-side-out"));
        card.style.position = "fixed"; card.style.margin = "0"; set(card, r); card.getBoundingClientRect();
        card.classList.add("open"); document.body.classList.add("wm-open"); set(card, target());
        card.setAttribute("aria-expanded", "true"); card.setAttribute("aria-label", L("Close wallet","أغلق المحفظة"));
        try { navigator.vibrate && navigator.vibrate(10); } catch(e){}
        setTimeout(() => { busy = false; }, dur());
      }
      function reset(card){ ["position","margin","top","left","width","height"].forEach(p => card.style[p] = ""); card.classList.remove("open", "wm-closing"); if(ph){ ph.remove(); ph = null; }
        sides().forEach(e => e.classList.remove("wm-side-out")); card.setAttribute("aria-expanded", "false"); card.setAttribute("aria-label", L("Open wallet","افتح المحفظة")); window._wmOpen = false; busy = false; }
      function close(card, then){
        if(!window._wmOpen || busy) return; busy = true; const sc = card.querySelector(".wm-in"); if(sc) sc.scrollTop = 0;
        card.classList.add("wm-closing"); card.classList.remove("open"); document.body.classList.remove("wm-open"); set(card, ph.getBoundingClientRect());
        try { navigator.vibrate && navigator.vibrate(10); } catch(e){}
        setTimeout(() => { reset(card); if(window._homeDirty) render(); then && then(); }, durC() + 30); // same card, same size: no rebuild unless data changed
      }
      window._wmReset = () => { const c = document.getElementById("wmCard"); document.body.classList.remove("wm-open"); if(c) reset(c); else { window._wmOpen = false; busy = false; } };
      const go = (fn) => { window._wmReset(); render(); window._openFramed ? window._openFramed("bal") : window.showTab("bal"); setTimeout(fn, 60); };
      document.addEventListener("click", e => {
        const card = e.target.closest("#wmCard"); if(!card) return;
        if(card.classList.contains("open")){
          const k = e.target.closest(INNER);
          if(k){ const w = k.dataset && k.dataset.wm;
            if(w === "in" && window._sheet) window._sheet("in");
            else if(k.classList.contains("wm-start") && window._sheet) window._sheet("start");
            return; }
          close(card); return; }
        open(card);
      });
      document.addEventListener("keydown", e => { const c = document.getElementById("wmCard"); if(!c) return;
        if(e.key === "Escape" && window._wmOpen) close(c);
        if((e.key === "Enter" || e.key === " ") && e.target === c){ e.preventDefault(); window._wmOpen ? close(c) : open(c); } });
      let y0 = null; document.addEventListener("touchstart", e => { const c = e.target.closest && e.target.closest("#wmCard.open"), sc = c && c.querySelector(".wm-in"); y0 = c && (!sc || sc.scrollTop <= 0) ? e.touches[0].clientY : null; }, {passive: true});
      document.addEventListener("touchend", e => { if(y0 == null) return; const dy = e.changedTouches[0].clientY - y0; y0 = null; const c = document.getElementById("wmCard"); if(dy > 90 && c) close(c); }, {passive: true});
      addEventListener("resize", () => { const c = document.getElementById("wmCard"); if(c && window._wmOpen && !busy) set(c, target()); });
    })();
    // close: tap the open card (not a button, link, field or anything tappable), swipe down at the top, Back or Esc
    (function(){ const isTap = el => { for(let n = el; n && !n.classList.contains("fv"); n = n.parentElement){ if(n.matches("button,a,input,select,textarea,label,summary,[contenteditable],[role=button]") || getComputedStyle(n).cursor === "pointer") return true; } return false; };
      const open = () => document.body.classList.contains("framed") && !window._vtBusy;
      document.addEventListener("click", e => { const v = balView(); if(!open() || !v || v.id !== "viewBal" || !v.contains(e.target) || isTap(e.target)) return; window.showTab("home"); });
      const fc = document.createElement("button"); fc.type = "button"; fc.id = "fvClose"; fc.setAttribute("aria-label", L("Back to Home","رجوع للرئيسية")); fc.addEventListener("click", () => { if(open()) window.showTab("home"); }); document.body.appendChild(fc);
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
    v.addEventListener("click", e => { const c = e.target.closest(".hcard"); if(!c || !v.contains(c) || c.closest(".hx")) return; if(window._hx && window._hx === c.dataset.go){ window._hxClose(); return; } window.showTab(c.dataset.go); });
    // show/hide the tab bar and refresh the cards whenever the Home screen is shown
    const _show = window.showTab || showTab;
    /* ===== Smooth transitions (Beshr's smooth-transitions skill, 2026-11-22): nothing cuts, everything moves ===== */
    const EZ = "cubic-bezier(.3,.6,.2,1)";
    let pg = null; window._pg = null; window._pgBusy = false;
    const setR = (el, r) => { el.style.top = r.top + "px"; el.style.left = r.left + "px"; el.style.width = r.width + "px"; el.style.height = r.height + "px"; };
    /* Beshr 2026-11-23: the full-width cards (Budget, Expenses, Prices log, Forsa) open by dropping DOWN from where they are:
       the page's top stays on the card's top (moved up only as much as needed to leave a useful height). Cards above stay in view. */
    const pgTarget = src => { const hl = Math.max(48, window._hLine()), sab = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sab")) || 0;
      let top = hl; if(src && src.dataset && src.dataset.go && src.dataset.go !== "bal" && src.closest("#viewHome")){ const minH = Math.max(320, (innerHeight - hl - sab) * .62), ct = src.getBoundingClientRect().top;
        top = Math.round(Math.max(hl, Math.min(ct, innerHeight - sab - 12 - minH))); }
      document.documentElement.style.setProperty("--pgTop", top + "px");
      return {top, left: window._gut().left, width: window._gut().width, height: Math.max(300, innerHeight - top - 12 - sab)}; };
    const pgSides = () => [...document.querySelectorAll("#viewHome>*,#qBar")];
    const solid = c => c && !/rgba\(.*,\s*0\)$|transparent/.test(c);
    const bigOf = el => el && el.querySelector(".big");
    const ANCH = [[".thI", ".ic"], [".thT", ".tt"], [".thN", ".big"]];
    function pgShow(name){ // the page's content shows while Home stays underneath
      if(!goingBack && cur && cur !== name){ backStack.push(cur); if(backStack.length > 30) backStack.shift(); }
      cur = name; _show(name); try { renderHero(name); } catch(e){}
      document.getElementById("viewHome").hidden = false; document.body.classList.add("onhome");
    }
    /* Pattern B (Beshr 2026-11-22): the page stays still and full size; a clip window grows from the card to the page and
       shrinks back the exact same way (no layout each frame, so no dropped frames). Only the anchors (icon, title, number) travel. */
    /* ===== One motion engine for every page (Beshr 2026-11-22, Pattern B + G) =====
       Every frame is computed from ONE value (e: 0 = the card, 1 = the open page) plus the finger's drag.
       It runs on requestAnimationFrame from the first frame after the tap, so frame 0 is always the card at rest
       (no jump), the background fades with e (never in one frame), a drag scrubs the same values, and on release
       a spring carries on from exactly where the finger left it, with its speed, and lands on the card's slot measured then. */
    const clipOf = (r, T, rad) => `inset(${r.top - T.top}px ${T.left + T.width - (r.left + r.width)}px ${T.top + T.height - (r.top + r.height)}px ${r.left - T.left}px round ${rad}px)`;
    const fsOf = el => parseFloat(getComputedStyle(el).fontSize) || 16;
    const lerp = (a, b, t) => a + (b - a) * t, clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const lerpR = (a, b, t) => ({left: lerp(a.left, b.left, t), top: lerp(a.top, b.top, t), width: lerp(a.width, b.width, t), height: lerp(a.height, b.height, t)});
    const rgb = c => { const m = /rgba?\(([^)]+)\)/.exec(c || ""); if(!m) return [255, 255, 255, 1]; const p = m[1].split(",").map(parseFloat); return [p[0], p[1], p[2], p[3] == null ? 1 : p[3]]; };
    const mix = (a, b, t) => `rgba(${a.map((x, i) => i < 3 ? Math.round(lerp(x, b[i], t)) : +lerp(x, b[i], t).toFixed(3)).join(",")})`;
    const pageOnly = v => { const k = v.querySelector(":scope > .vbIn") || v, h = k.querySelector(":scope > .tabHero");
      return [...k.children].filter(c => c !== h && c.getClientRects().length).concat(h ? [...h.querySelectorAll(":scope > .thS,:scope > .thH,:scope > .thList")] : []); };
    // the page never lets Home scroll behind it (no body re-layout, so Home never shifts and the title never goes under the clock)
    const lockBody = () => {};
    document.addEventListener("touchmove", e => { const b = document.body.classList; if(!b.contains("pgopen") && !b.contains("shopen")) return;
      if(!e.target.closest || !e.target.closest(".view.fv,#sheet,#pgMenu")) { if(e.cancelable) e.preventDefault(); } }, {passive: false});
    const scrim = () => { let d = document.getElementById("pgBack"); if(!d){ d = document.createElement("div"); d.id = "pgBack"; d.setAttribute("aria-hidden", "true"); document.body.appendChild(d); } return d; };
    const notCard = e => !e.classList.contains("pg-src") && !e.classList.contains("pg-land");
    const homeAt = k => { const d = scrim(); d.style.display = k >= 1 ? "none" : "block"; d.style.opacity = (1 - k).toFixed(3);
      pgSides().filter(e => notCard(e) && !(pg && pg.keep && pg.keep.has(e))).forEach(e => { e.style.opacity = k >= 1 ? "" : k.toFixed(3); e.style.transform = ""; }); }; // fade only: nothing below a card ever moves
    // M = the live motion: geometry measured once per gesture, then apply(state) each frame
    let M = null, raf = 0;
    function measure(card, closing){
      const v = viewOf(pg.go); v.style.transform = ""; const T = v.getBoundingClientRect(), B = card ? card.getBoundingClientRect() : {left: T.left + T.width / 2 - 40, top: T.top + 40, width: 80, height: 80};
      const cs = card ? getComputedStyle(card) : null, rB = cs ? parseFloat(cs.borderTopLeftRadius) || 18 : 18;
      const cardBg = rgb(cs && solid(cs.backgroundColor) ? cs.backgroundColor : pg.bg), pageBg = rgb(getComputedStyle(v).backgroundColor);
      const an = []; ANCH.forEach(([ps, csel]) => { const pe = v.querySelector(".tabHero " + ps), ce = card && card.querySelector(csel); if(!pe || !ce || !ce.getClientRects().length) return;
        pe.style.transform = ""; const pr = pe.getBoundingClientRect(); let cr = ce.getBoundingClientRect();
        if(ps === ".thN"){ try { const rg = document.createRange(); rg.selectNodeContents(ce); const tr = rg.getBoundingClientRect(); if(tr.width) cr = tr; } catch(e){} } // land on the number's TEXT (it is right-aligned in the card), not its box
        if(getComputedStyle(pe).display === "inline") pe.style.display = "inline-block";
        pe.style.transformOrigin = "0 0"; pe.style.willChange = "transform";
        an.push({isN: ps === ".thN", el: pe, pl: {x: pr.left - T.left, y: pr.top - T.top}, card: {x: cr.left, y: cr.top}, cs: ps === ".thI" ? cr.height / (pr.height || 1) : fsOf(ce) / fsOf(pe)}); });
      return {v, T, B, rB, cardBg, pageBg, an, po: pageOnly(v), card, closing};
    }
    // s = {W (window rect on screen), X, Y, sc (page transform), a (0 = anchors on the card, 1 = in the page), from (anchor start screen pos/scale when closing), bg, po (page-only opacity), k (Home visible)}
    function apply(s){ if(!M) return; const {v, T} = M;
      v.style.transformOrigin = "0 0"; v.style.transform = (s.X || s.Y || s.sc !== 1) ? `translate(${s.X.toFixed(2)}px,${s.Y.toFixed(2)}px) scale(${s.sc.toFixed(4)})` : "";
      const loc = {left: (s.W.left - T.left - s.X) / s.sc + T.left, top: (s.W.top - T.top - s.Y) / s.sc + T.top, width: s.W.width / s.sc, height: s.W.height / s.sc};
      v.style.clipPath = clipOf(loc, T, (s.r || 22) / s.sc); v.style.backgroundColor = s.bg;
      M.an.forEach((a, i) => { const f = s.from ? s.from[i] : {x: T.left + s.X + s.sc * a.pl.x, y: T.top + s.Y + s.sc * a.pl.y, s: s.sc}; // no "from" = the anchor rides with the page
        // the number shrinks to the card's size early in a close (and grows late in an open), and moves to its side early, so it never runs over the title (Beshr 2026-11-23)
        const aN = a.isN ? s.a * s.a : s.a, x = lerp(a.card.x, f.x, aN), y = lerp(a.card.y, f.y, s.a), sz = lerp(a.cs, f.s, aN); // number: to its side and size first, then up
        const tx = (x - T.left - s.X) / s.sc - a.pl.x, ty = (y - T.top - s.Y) / s.sc - a.pl.y, ts = sz / s.sc;
        a.el.style.transform = Math.abs(tx) + Math.abs(ty) < .05 && Math.abs(ts - 1) < .001 ? "" : `translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) scale(${ts.toFixed(4)})`; });
      M.po.forEach(el => { el.style.opacity = s.po >= 1 ? "" : s.po.toFixed(3); });
      homeAt(s.k);
    }
    const restState = () => ({W: M.T, X: 0, Y: 0, sc: 1, r: 22, a: 1, bg: "", po: 1, k: 0});
    // critically damped spring: x(t) from x0 with velocity v0 (units/s) to 1
    function spring(x0, v0, w, step, done, end){ cancelAnimationFrame(raf); let t0 = 0; const c1 = x0 - 1, c2 = v0 + w * c1;
      const tick = now => { if(!t0) t0 = now; const t = (now - t0) / 1000, ex = Math.exp(-w * t), x = 1 + (c1 + c2 * t) * ex;
        if(end && x >= end){ step(1); done(); return; } // landed: finish now, no frozen tail
        if(t > 0.12 && Math.abs(1 - x) < .0015 && Math.abs((c2 - w * (c1 + c2 * t)) * ex) < .05){ step(1); done(); return; }
        step(x); raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick); }
    const W_OPEN = 13, W_CLOSE = 20;
    function pgOpen(src, go){
      const v = viewOf(go); if(!v || window._pgBusy) return;
      const fromHome = !!src.closest("#viewHome"), cs = getComputedStyle(src);
      const bg = solid(cs.backgroundColor) ? cs.backgroundColor : getComputedStyle(document.documentElement).getPropertyValue("--card").trim() || "#fff";
      pg = {go, src: fromHome ? src : homeCard(go), bg, rA: parseFloat(cs.borderTopLeftRadius) || 18}; window._pg = go;
      src.getAnimations().forEach(a => a.cancel()); // the press (0.97) hands over to the grow
      if(reduced()){ pgShow(go); v.classList.add("fv"); setR(v, pgTarget()); document.body.classList.add("pgopen", "pgready"); homeAt(0); return; }
      window._pgBusy = true; try { navigator.vibrate && navigator.vibrate(10); } catch(e){}
      const T = pgTarget(pg.src);
      // cards fully above the page stay in view (no fade), the backdrop starts under them
      pg.keep = new Set(T.top > Math.max(48, window._hLine()) + 4 ? pgSides().filter(e => e.id !== "qBar" && e.getClientRects().length && e.getBoundingClientRect().bottom <= T.top - 2) : []);
      scrim().style.top = pg.keep.size ? (T.top - 6) + "px" : "";
      pgShow(go); v.classList.add("fv", "pg-anim"); setR(v, T); v.scrollTop = 0;
      M = measure(pg.src, false); const {B, rB, cardBg, pageBg} = M;
      // the card's own extra lines fade away in place
      // the card's own lines fade away in place: a see-through copy of the card (same layout, same styles) without its moving parts
      const peeks = fromHome ? (() => { const r = src.getBoundingClientRect(), c = src.cloneNode(true); c.classList.remove("pg-src", "pg-land"); c.classList.add("pg-peek"); c.removeAttribute("id"); c.setAttribute("aria-hidden", "true");
        c.style.cssText = `position:fixed!important;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0!important;z-index:31!important;pointer-events:none!important;background:transparent!important;border-color:transparent!important;box-shadow:none!important;transform:none!important;opacity:1`;
        c.querySelectorAll(".hh>.ic,.hh>.tt,.hh>.big,.hh>.go").forEach(e => e.style.visibility = "hidden");
        src.parentNode.appendChild(c); return [c]; })() : [];
      if(pg.src) pg.src.classList.add("pg-src");
      document.body.classList.add("pgopen");
      const at = e => ({W: lerpR(B, M.T, e), X: 0, Y: 0, sc: 1, r: lerp(rB, 22, e), a: e, bg: mix(cardBg, pageBg, clamp01(e * 1.6)), po: clamp01((e - .5) / .4), k: 1 - clamp01(e * 1.15)});
      apply(at(0)); peeks.forEach(c => c.style.opacity = "1");
      M.state = at(0); M.mode = "opening";
      spring(0, 0, W_OPEN, e => { M.state = at(e); M.e = e; apply(M.state); const o = clamp01(1 - e * 5); peeks.forEach(c => c.style.opacity = o.toFixed(3)); },
        () => { peeks.forEach(c => c.remove()); if(!M) return; apply(restState()); v.style.clipPath = ""; v.style.backgroundColor = ""; v.classList.remove("pg-anim"); M.mode = "open"; M.state = restState(); document.body.classList.add("pgready"); window._pgBusy = false; });
    }
    function pgDone(){ const p = pg; if(!p) return; const v = viewOf(p.go); cancelAnimationFrame(raf);
      const an = M ? M.an : []; M = null;
      pg = null; window._pg = null; window._pgBusy = false;
      document.body.classList.remove("pgopen", "pgready");
      if(v){ v.classList.remove("fv", "pg-anim", "pg-closing"); ["top","left","width","height","background","backgroundColor","borderRadius","transform","transformOrigin","transition","opacity","clipPath"].forEach(k => v.style[k] = ""); v.getAnimations({subtree: true}).forEach(a => a.cancel());
        [...v.querySelectorAll("*")].forEach(e => { if(e.style.transform) e.style.transform = ""; if(e.style.opacity) e.style.opacity = ""; }); }
      an.forEach(a => { a.el.style.willChange = ""; });
      // swap to the real Home in the same frame: the landing card shows its own icon/title/number exactly where the page's were
      window._pgQuiet = true; try { window.showTab("home"); } finally { window._pgQuiet = false; }
      const d = document.getElementById("pgBack"); if(d){ d.style.display = "none"; d.style.opacity = ""; d.style.top = ""; }
      pgSides().forEach(e => { e.classList.remove("wm-side-out"); e.style.opacity = ""; e.style.transform = ""; e.getAnimations().forEach(a => a.cancel()); });
      document.querySelectorAll("#viewHome .pg-src,#viewHome .pg-land").forEach(e => { e.classList.remove("pg-src", "pg-land"); });
    }
    function pgClose(from){ // from = {vel} when a drag let go: the close carries on from the finger, with its speed
      if(!pg || !M) { if(pg) pgDone(); return; } if(window._pgBusy && !from && M.mode !== "opening") return;
      const p = pg, v = viewOf(p.go); if(reduced() || !v){ pgDone(); return; }
      cancelAnimationFrame(raf); window._pgBusy = true; document.body.classList.remove("pgready");
      const S0 = M.state || restState();
      // where each anchor is on screen right now (rest, mid-open, or under the finger)
      const from0 = M.an.map(a => { const r = a.el.getBoundingClientRect(); return {x: r.left, y: r.top, s: (a.el.style.transform.match(/scale\(([\d.]+)\)/) ? +RegExp.$1 : 1) * S0.sc}; });
      // scroll goes to the top invisibly (content shifted by the same amount)
      const kk = v.querySelector(":scope > .vbIn") || v, s = v.scrollTop;
      if(s > 0){ v.scrollTop = 0; [...kk.children].forEach(c => { if(!c.classList.contains("tabHero")) c.style.transform = `translateY(${-s}px)`; }); }
      // Home is rebuilt now (same picks), and the card's slot is measured NOW, so it lands exactly on it
      window._pg = null; if(window._homeDirty){ window._homeDirty = false; try { render(); } finally { window._pg = p.go; } } else window._pg = p.go; // no rebuild (and no freeze) unless data changed
      if(p.keep && p.keep.size){ const tt = v.getBoundingClientRect().top; p.keep = new Set(pgSides().filter(e => e.id !== "qBar" && e.getClientRects().length && e.getBoundingClientRect().bottom <= tt - 2)); } // Home may have been rebuilt: keep the new copies of the cards above
      const card = homeCard(p.go); if(card){ card.classList.add("pg-land"); card.getAnimations().forEach(a => a.cancel()); }
      const keep = M.state; const G = measure(card, true); G.state = keep; M = G; M.mode = "closing";
      const {B, rB, cardBg, pageBg} = M; const bg0 = rgb(S0.bg || `rgb(${pageBg.slice(0, 3).join(",")})`), clear = [cardBg[0], cardBg[1], cardBg[2], 0];
      const po0 = S0.po == null ? 1 : S0.po;
      const at = e => { const q = clamp01(e / .97); return {W: lerpR(S0.W, B, q), X: lerp(S0.X, 0, q), Y: lerp(S0.Y, 0, q), sc: lerp(S0.sc, 1, q), r: lerp(S0.r || 22, rB, q), a: 1 - q, from: from0,
        bg: q < .85 ? mix(bg0, cardBg, q / .85) : mix(cardBg, clear, (q - .85) / .15), po: po0 * clamp01(1 - q / .4), k: lerp(S0.k || 0, 1, clamp01(q * 1.1))}; };
      // the release speed (pt/s) as progress per second along the path to the card
      const dist = Math.max(80, Math.hypot(B.top - S0.W.top, B.left - S0.W.left) + Math.abs(B.height - S0.W.height) * .5), v0 = from && from.vel > 0 ? Math.min(8, from.vel / dist) : 0;
      apply(at(0)); M.state = at(0);
      if(card) card.querySelectorAll(".sub,.hint").forEach(e => e.style.opacity = "0");
      spring(0, v0, W_CLOSE, e => { const st = at(e); M.state = st; apply(st); if(card){ const o = clamp01((e - .65) / .32).toFixed(3); card.querySelectorAll(".sub,.hint").forEach(x => x.style.opacity = o); } },
        () => { if(card) card.querySelectorAll(".sub,.hint").forEach(x => x.style.opacity = ""); pgDone(); }, .97);
    }
    function pgSwap(name){ // pages next to each other slide sideways (300ms)
      const v = viewOf(name), old = viewOf(pg.go); if(!v || window._pgBusy) return;
      const dir = ORDER.indexOf(name) > ORDER.indexOf(pg.go) ? 1 : -1, rtl = getComputedStyle(document.body).direction === "rtl";
      if(pg.src) pg.src.classList.remove("pg-src");
      const s2 = homeCard(name), cs = s2 ? getComputedStyle(s2) : null;
      pg = {go: name, src: s2, bg: cs && solid(cs.backgroundColor) ? cs.backgroundColor : pg.bg, rA: cs ? parseFloat(cs.borderTopLeftRadius) || 18 : 18, fs0: bigOf(s2) ? parseFloat(getComputedStyle(bigOf(s2)).fontSize) : 0}; window._pg = name;
      if(s2) s2.classList.add("pg-src");
      goingBack = true; try { pgShow(name); } finally { goingBack = false; }
      if(old){ old.classList.remove("fv", "pg-anim"); ["top","left","width","height","background","borderRadius"].forEach(k => old.style[k] = ""); }
      v.classList.add("fv"); setR(v, M ? {top: M.T.top, left: M.T.left, width: M.T.width, height: M.T.height} : pgTarget()); v.scrollTop = 0; // same frame as the page it replaces
      if(M){ M.v.style.clipPath = ""; M.v.style.transform = ""; } M = measure(s2, false); M.an.forEach(x => x.el.style.transform = ""); M.mode = "open"; M.state = restState();
      if(reduced()) return; window._pgBusy = true;
      const dx = (rtl ? -1 : 1) * dir * Math.min(120, innerWidth * .3);
      v.animate([{transform: `translateX(${dx}px)`, opacity: 0}, {transform: "none", opacity: 1}], {duration: 300, easing: EZ}).finished.then(() => { window._pgBusy = false; }, () => { window._pgBusy = false; });
    }
    // close: handle at the top, swipe down at the top (the page follows the finger), Back, Esc
    (function(){
      const fc = document.createElement("button"); fc.type = "button"; fc.id = "pgClose"; fc.setAttribute("aria-label", L("Back to Home","رجوع للرئيسية"));
      fc.addEventListener("click", () => pgClose()); document.body.appendChild(fc);
      /* Pattern G drag: the WHOLE page follows the finger 1:1 and shrinks toward its own card (0.9 at 250pt), Home shows through.
         Updates are batched to one per frame. Let go past 120pt or flick faster than 800pt/s = the close carries on from there; otherwise it springs back. */
      let y0 = null, x0 = 0, dy = 0, drag = false, hist = [], base = null, pend = 0;
      const dragState = d => { const T = M.T, B = M.B, k = clamp01(d / 250), sc = 1 - .1 * k, ty = d >= 0 ? d : -60 * (1 - 1 / (1 + -d / 180));
        const X = T.width * (1 - sc) / 2 + ((B.left + B.width / 2) - (T.left + T.width / 2)) * .22 * k, Y = ty;
        const W = {left: T.left + X + sc * (base.W.left - T.left), top: T.top + Y + sc * (base.W.top - T.top), width: base.W.width * sc, height: base.W.height * sc};
        return {W, X, Y, sc, r: 22 + 12 * k, a: base.a, bg: base.bg, po: base.po, k: Math.max(base.k, k * .85)}; };
      document.addEventListener("touchstart", e => { y0 = null; drag = false; if(!pg || !M || e.touches.length > 1) return; const vv = M.v;
        if(!vv.contains(e.target) || e.target.closest("input,textarea,select") || !(M.mode === "open" || M.mode === "opening")) return;
        if(vv.scrollTop > 0) return; y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; dy = 0; hist = [[performance.now(), y0]]; }, {passive: true});
      document.addEventListener("touchmove", e => { if(y0 == null || !M) return; const y = e.touches[0].clientY; dy = y - y0;
        if(!drag){ if(Math.abs(e.touches[0].clientX - x0) > Math.abs(dy) && Math.abs(dy) < 10) return;
          if(dy > 8 && M.v.scrollTop <= 0){ drag = true; y0 += 8; dy -= 8; cancelAnimationFrame(raf); base = M.state || restState(); M.mode = "drag"; window._pgBusy = true; document.body.classList.remove("pgready"); M.v.style.willChange = "transform"; }
          else { if(dy < -8) y0 = null; return; } }
        if(e.cancelable) e.preventDefault(); hist.push([performance.now(), y]); if(hist.length > 5) hist.shift();
        if(!pend) pend = requestAnimationFrame(() => { pend = 0; if(!M || M.mode !== "drag") return; M.state = dragState(dy); apply(M.state); }); }, {passive: false});
      const end = () => { if(y0 == null || !drag || !M){ y0 = null; return; } y0 = null; drag = false; cancelAnimationFrame(pend); pend = 0;
        M.state = dragState(dy); apply(M.state); M.v.style.willChange = "";
        const a = hist[0], b = hist[hist.length - 1], vel = b && a && b[0] > a[0] ? (b[1] - a[1]) / (b[0] - a[0]) * 1000 : 0;
        if(dy > 120 || vel > 800){ window._pgBusy = false; M.mode = "open"; pgClose({vel: Math.max(0, vel)}); return; }
        const D = M.state, R = restState(), v = M.v; M.mode = "settling";
        spring(0, Math.max(0, -vel) / 300, 16, q => { const st = {W: lerpR(D.W, R.W, q), X: lerp(D.X, 0, q), Y: lerp(D.Y, 0, q), sc: lerp(D.sc, 1, q), r: lerp(D.r, 22, q), a: lerp(D.a, 1, q), bg: q >= 1 ? "" : D.bg, po: lerp(D.po, 1, q), k: lerp(D.k, 0, q)}; M.state = st; apply(st); },
          () => { apply(restState()); v.style.clipPath = ""; v.style.backgroundColor = ""; v.classList.remove("pg-anim"); M.mode = "open"; M.state = restState(); document.body.classList.add("pgready"); window._pgBusy = false; }); };
      document.addEventListener("touchend", end, {passive: true}); document.addEventListener("touchcancel", end, {passive: true});
      document.addEventListener("keydown", e => { if(e.key === "Escape" && pg && !document.body.classList.contains("shopen")) pgClose(); });
      addEventListener("popstate", () => { if(pg) pgClose(); });
      addEventListener("resize", () => { if(pg && !window._pgBusy) setR(viewOf(pg.go), pgTarget(pg.src)); });
    })();

    /* Pattern G on every Home card: touch-down only presses (0.97, 100ms); open on touch-up inside; move >10pt or leave = cancel.
       Hold ~0.45s: light haptic, the card lifts (1.03) and quick actions appear; release on one runs it, anywhere else closes. */
    (function(){
      const home = document.getElementById("viewHome"); if(!home) return;
      let card = null, x0 = 0, y0 = 0, timer = 0, menu = null, lp = false, press = null, hot = null;
      const springBack = el => { if(!el) return; const cur = getComputedStyle(el).transform; el.getAnimations().filter(a => a.id === "press").forEach(a => a.cancel());
        const a = el.animate([{transform: cur === "none" ? "scale(1)" : cur}, {transform: "scale(1)"}], {duration: 260, easing: "cubic-bezier(.3,1.4,.5,1)"}); a.id = "press"; };
      const ACTS = {
        bal: [["arrow-down-left", L("Add money in","أضف دخل"), () => window._sheet && window._sheet("in")], ["flag", L("Starting point","نقطة البداية"), () => window._sheet && window._sheet("start")]],
        budget: [["chart-pie-slice", L("Open budget","افتح الميزانية"), () => window.showTab("budget")], ["plus-circle", L("Add expense","أضف مصروف"), () => window._sheet && window._sheet("exp")]],
        plan: [["plus-circle", L("Add expense","أضف مصروف"), () => window._sheet && window._sheet("exp")], ["camera", L("Add bill / item","فاتورة / صنف"), () => window._sheet && window._sheet("bill")]],
        prices: [["camera", L("Add bill / item","فاتورة / صنف"), () => window._sheet && window._sheet("bill")], ["tag", L("Open Prices log","افتح سجل الأسعار"), () => window.showTab("prices")]],
        forsa: [["magnifying-glass", L("New hunt","بحث جديد"), () => window._sheet && window._sheet("hunt")], ["fire", L("Open Forsa","افتح فرصة"), () => window.showTab("forsa")]]
      };
      const keyOf = c => c.id === "wmCard" ? "bal" : c.dataset.go;
      const closeMenu = () => { if(menu){ const m = menu; menu = null; m.animate([{opacity: 1, transform: "scale(1)"}, {opacity: 0, transform: "scale(.96)"}], {duration: 140, easing: "ease-out"}).finished.then(() => m.remove(), () => m.remove()); } hot = null; };
      const openMenu = c => { const list = ACTS[keyOf(c)] || []; if(!list.length) return; menu = document.createElement("div"); menu.id = "pgMenu"; menu.setAttribute("role", "menu");
        menu.innerHTML = list.map((x, i) => `<button type="button" role="menuitem" data-i="${i}">${window.PH ? PH(x[0]) : ""}<span>${x[1]}</span></button>`).join(""); document.body.appendChild(menu);
        const r = c.getBoundingClientRect(), mh = menu.offsetHeight, mw = Math.max(200, Math.min(260, r.width)); menu.style.width = mw + "px";
        const below = r.bottom + 8 + mh < innerHeight - 90; menu.style.top = (below ? r.bottom + 8 : Math.max(8, r.top - 8 - mh)) + "px";
        const rtl = getComputedStyle(document.body).direction === "rtl"; menu.style.left = Math.max(12, Math.min(innerWidth - mw - 12, rtl ? r.right - mw : r.left)) + "px"; menu.style.transformOrigin = below ? "50% 0" : "50% 100%";
        menu._run = i => { const f = list[i] && list[i][2]; if(f) setTimeout(f, 0); };
        menu.animate([{opacity: 0, transform: "scale(.92)"}, {opacity: 1, transform: "scale(1)"}], {duration: 200, easing: EZ}); };
      home.addEventListener("pointerdown", e => { if(e.button > 0 || window._pgBusy || window._wmOpen) return; const c = e.target.closest("#viewHome>.hcard,#viewHome>#wmCard"); if(!c) return;
        card = c; x0 = e.clientX; y0 = e.clientY; lp = false; clearTimeout(timer);
        press = c.animate([{transform: "scale(1)"}, {transform: "scale(.97)"}], {duration: 100, easing: "ease-out", fill: "forwards"}); press.id = "press";
        timer = setTimeout(() => { if(!card) return; lp = true; try { navigator.vibrate && navigator.vibrate(12); } catch(x){}
          const l = card.animate([{transform: "scale(.97)", boxShadow: "none"}, {transform: "scale(1.03)", boxShadow: "0 18px 36px -14px rgba(15,42,74,.5)"}], {duration: 220, easing: "cubic-bezier(.3,1.3,.5,1)", fill: "forwards"}); l.id = "press"; openMenu(card); }, 450); });
      document.addEventListener("pointermove", e => { if(!card) return; const d = Math.hypot(e.clientX - x0, e.clientY - y0);
        if(lp){ if(!menu) return; const b = document.elementFromPoint(e.clientX, e.clientY), btn = b && b.closest("#pgMenu button"); if(btn !== hot){ if(hot) hot.classList.remove("on"); hot = btn; if(hot){ hot.classList.add("on"); try { navigator.vibrate && navigator.vibrate(5); } catch(x){} } } return; }
        if(d > 10){ clearTimeout(timer); springBack(card); card = null; } }, {passive: true});
      const up = e => { clearTimeout(timer); if(!card) return; const c = card; card = null;
        if(lp){ const b = e && e.type === "pointerup" ? document.elementFromPoint(e.clientX, e.clientY) : null, btn = b && b.closest("#pgMenu button"); const m = menu; if(btn && m) m._run(+btn.dataset.i); closeMenu(); springBack(c); return; }
        springBack(c); };
      document.addEventListener("touchmove", e => { if(lp && card) e.preventDefault(); }, {passive: false}); // while the menu is up, the finger slides over it instead of scrolling
      document.addEventListener("pointerup", up); document.addEventListener("pointercancel", e => { if(lp && menu) return; up(e); });
      document.addEventListener("touchend", e => { if(lp && card && menu){ const t = e.changedTouches[0]; up({type: "pointerup", clientX: t.clientX, clientY: t.clientY}); } }, true);
      // after a long press, the click that follows must not open the card; a tap on the menu (mouse) still works
      document.addEventListener("click", e => { if(lp && e.target.closest("#viewHome")){ e.stopPropagation(); e.preventDefault(); lp = false; } const btn = e.target.closest("#pgMenu button"); if(btn && menu){ menu._run(+btn.dataset.i); closeMenu(); } }, true);
      home.addEventListener("contextmenu", e => { if(e.target.closest(".hcard,#wmCard")) e.preventDefault(); });
    })();

    /* Monthly budget groups (Must pay, Living, Personal, Saving) start minimized; tap a group to open it (Beshr 2026-11-22) */
    (function(){
      const open = new Set();
      const apply = () => { const tb = document.getElementById("rows"); if(!tb) return; let g = null;
        [...tb.children].forEach(tr => { if(tr.classList.contains("group")){ g = tr.textContent.trim(); tr.classList.toggle("gc", !open.has(g)); tr.setAttribute("role", "button"); tr.setAttribute("aria-expanded", String(open.has(g))); }
          else if(tr.classList.contains("total")) g = null; else if(g != null) tr.classList.toggle("gh", !open.has(g)); }); };
      const go = () => { const tb = document.getElementById("rows"); if(!tb) return setTimeout(go, 300); new MutationObserver(apply).observe(tb, {childList: true}); apply();
        tb.addEventListener("click", e => { const tr = e.target.closest("tr.group"); if(!tr) return; const g = tr.textContent.trim(); open.has(g) ? open.delete(g) : open.add(g); apply();
          if(open.has(g) && !reduced()){ let n = tr.nextElementSibling, i = 0; while(n && n.classList.contains("gh") === false && !n.classList.contains("group") && !n.classList.contains("total")){ n.animate([{opacity: 0, transform: "translateY(-6px)"}, {opacity: 1, transform: "none"}], {duration: 260, delay: 30 * i++, easing: EZ, fill: "backwards"}); n = n.nextElementSibling; } } }); };
      go();
    })();
    /* Sections drop down in place, one open at a time (320ms); rows below slide to make room */
    (function(){
      let inner = false;
      document.addEventListener("click", e => {
        if(inner) return; const h = e.target.closest("section > div:first-child h2"); if(!h) return;
        const host = h.closest(".view.fv, #sheet"); if(!host || reduced()) return;
        const sec = h.closest("section"), opening = sec.classList.contains("collapsed");
        const secs = [...host.querySelectorAll("section")], before = new Map(secs.map(s => [s, s.getBoundingClientRect()]));
        setTimeout(() => {
          if(opening && host.classList.contains("fv")){ inner = true; try { secs.forEach(s => { if(s !== sec && !s.contains(sec) && !sec.contains(s) && !s.classList.contains("collapsed")){ const hh = s.querySelector(":scope > div:first-child h2"); if(hh) hh.click(); } }); } finally { inner = false; } }
          secs.forEach(s => { const a = before.get(s), b = s.getBoundingClientRect(); if(!a) return;
            if(Math.abs(a.height - b.height) > 1){ s.style.overflow = "hidden"; s.style.flexShrink = "0"; s.animate([{height: a.height + "px", transform: `translateY(${a.top - b.top}px)`}, {height: b.height + "px", transform: "none"}], {duration: 320, easing: EZ}).finished.then(() => { s.style.overflow = ""; s.style.flexShrink = ""; }, () => {});
              if(!s.classList.contains("collapsed")) [...s.children].slice(1).forEach(c => c.animate([{opacity: 0}, {opacity: 0, offset: .4}, {opacity: 1}], {duration: 320, easing: "ease-out"})); }
            else if(Math.abs(a.top - b.top) > 1) s.animate([{transform: `translateY(${a.top - b.top}px)`}, {transform: "none"}], {duration: 320, easing: EZ}); });
        }, 0);
      }, true);
    })();

    /* Actions slide up as sheets over Home (380ms in, 340ms out); after saving, the card it belongs to pulses */
    (function(){
      const scrim = document.createElement("div"); scrim.id = "shScrim";
      const sh = document.createElement("div"); sh.id = "sheet"; sh.setAttribute("role", "dialog"); sh.setAttribute("aria-modal", "true"); sh.setAttribute("data-noswipe", "");
      sh.innerHTML = `<div class="shGrab"></div><div class="shHead"><h3 id="shTitle"></h3><button type="button" class="btn" id="shDone">${L("Done","تم")}</button></div><div class="shBody"></div>`;
      document.body.append(scrim, sh);
      const body = sh.querySelector(".shBody"); let moved = [], cur2 = null, busy = false;
      const pulse = tab => { const c = homeCard(tab); if(!c || reduced()) return; c.animate([{transform: "scale(1)", boxShadow: "0 0 0 0 rgba(37,99,235,0)"}, {transform: "scale(1.03)", boxShadow: "0 0 0 6px rgba(37,99,235,.22)", offset: .31}, {transform: "scale(1)", boxShadow: "0 0 0 0 rgba(37,99,235,0)"}], {duration: 580, easing: EZ}); };
      function close(after){
        if(!cur2 || busy) return; busy = true; const k = cur2;
        sh.classList.add("closing"); document.body.classList.remove("shopen"); if(sh._sl){ sh._sl = false; lockBody(false); } sh.style.transform = ""; try { document.activeElement && document.activeElement.blur(); } catch(e){}
        setTimeout(() => { moved.forEach(m => { m.mark.replaceWith(m.el); m.el.hidden = m.hidden; }); moved = []; sh.classList.remove("closing"); cur2 = null; busy = false; if(after) after(k); }, reduced() ? 0 : 350);
      }
      const ACT = {
        exp:   {t: L("Add a cost","أضف مصروف"), els: ["addForm"], focus: "fAmount", tab: "plan", saved: () => !document.getElementById("fAmount").value},
        hunt:  {t: L("New hunt","بحث جديد"), els: [() => { const f = document.getElementById("fSearch"); return f && f.parentElement; }, "fLinks", "fMsg", "fTerms"], focus: "fSearch", tab: "forsa"},
        item:  {t: L("Add item","أضف صنف"), els: ["shelfCard", "priceForm"], tab: "prices", saved: () => !document.getElementById("pItem").value},
        shop:  {t: L("Shop","تسوّق"), els: ["shopBox"], tab: "prices"},
        bill:  {t: L("Add bill / item","أضف فاتورة / صنف"), els: [() => { const f = document.getElementById("billFile"); return f && f.closest(".card"); }, "shelfCard", "priceForm"], tab: "prices", saved: () => !document.getElementById("pItem").value}, // Beshr 2026-11-23: one place for bills and single items // Beshr: keep only Upload bill in the sheet
        in:    {t: L("Money in","مبلغ داخل"), els: ["inBox"], focus: "inAmt", tab: "bal", saved: () => !document.getElementById("inAmt").value},
        start: {t: L("Starting point","نقطة البداية"), els: ["stBox"], focus: "stCash", tab: "bal"}
      };
      window._sheet = function(k){
        const a = ACT[k]; if(!a || busy) return; if(cur2) close();
        cur2 = k; window._hLine(); sh.querySelector("#shTitle").textContent = a.t;
        a.els.map(x => typeof x === "function" ? x() : document.getElementById(x)).filter(Boolean).forEach(el => { const mark = document.createComment("sheet"); moved.push({el, mark, hidden: el.hidden}); el.replaceWith(mark); body.appendChild(el); el.hidden = false; if(el.id === "stBox" || el.id === "inBox") el.style.display = "flex"; });
        sh.scrollTop = 0; document.body.classList.add("shopen"); if(!pg && document.body.style.position !== "fixed"){ lockBody(true); sh._sl = true; } // Home can't slide under the clock behind a sheet
        if(!reduced()) [...body.querySelectorAll(".field, .row, .pastebox, .upl, .tablebox, #fTerms, #fMsg, p")].slice(0, 12).forEach((el, i) => el.animate([{opacity: 0, transform: "translateY(10px)"}, {opacity: 1, transform: "none"}], {duration: 300, delay: 120 + 40 * i, easing: EZ, fill: "backwards"}));
        const f = a.focus && document.getElementById(a.focus); if(f && (k === "exp" || k === "hunt")) f.value = ""; // no auto-focus: the keyboard opens only when you tap a box (Beshr 2026-11-22)
      };
      // saved -> sheet slides down, the card it belongs to pulses
      document.addEventListener("submit", e => { if(!cur2 || !sh.contains(e.target)) return; const a = ACT[cur2];
        setTimeout(() => { if(!a.saved || a.saved()) close(k => { if(k === "in" || k === "start"){ const w = document.getElementById("wmCard"); if(window._wmOpen && w) w.querySelector(".wm-label").click(); setTimeout(() => pulse("bal"), 400); } else pulse(a.tab); }); }, 450); }, true);
      document.addEventListener("click", e => { if(cur2 === "hunt" && e.target.closest("#fWant") && sh.contains(e.target)) setTimeout(() => close(() => pulse("forsa")), 450);
        if(cur2 === "start" && e.target.closest("#stSave")) setTimeout(() => close(() => { const w = document.getElementById("wmCard"); if(window._wmOpen && w) w.querySelector(".wm-label").click(); setTimeout(() => pulse("bal"), 400); }), 600); });
      sh.querySelector("#shDone").addEventListener("click", () => close(k => { if(k === "bill") pulse("prices"); }));
      scrim.addEventListener("click", () => close());
      document.addEventListener("keydown", e => { if(e.key === "Escape" && cur2) close(); });
      let y0 = null, dy = 0;
      sh.addEventListener("touchstart", e => { y0 = sh.scrollTop <= 0 && !e.target.closest("input,textarea,select") ? e.touches[0].clientY : null; dy = 0; }, {passive: true});
      sh.addEventListener("touchmove", e => { if(y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sh.style.transition = "none"; sh.style.transform = `translateY(${dy}px)`; }, {passive: true});
      sh.addEventListener("touchend", () => { if(y0 == null) return; y0 = null; sh.style.transition = ""; if(dy > 90) close(); else sh.style.transform = ""; }, {passive: true});
      window._sheetPulse = pulse;
      // keyboard open: the sheet sits right above it, and the box you tapped scrolls into view
      const vv = window.visualViewport; if(vv){ const fit = () => { const kb = Math.max(0, innerHeight - vv.height - vv.offsetTop);
        sh.style.bottom = kb > 40 ? kb + "px" : ""; sh.style.maxHeight = kb > 40 ? (vv.height - 8) + "px" : "";
        const el = document.activeElement; if(kb > 40 && el && sh.contains(el)) setTimeout(() => { try { el.scrollIntoView({block: "center", behavior: "smooth"}); } catch(e){} }, 60); };
        vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit); sh.addEventListener("focusin", () => setTimeout(fit, 250)); }
    })();

    /* Beshr 2026-11-23: Expenses, Prices log and Forsa open IN PLACE, like an accordion: the white card grows downward from
       where it is and the cards below simply move down to make room (no morph, no overlay). Closing folds it back the same way. */
    const HX = {plan: 1, prices: 1, forsa: 1}, HX_EZ = "cubic-bezier(.3,.6,.2,1)"; let hx = null; window._hx = null;
    // Beshr 2026-11-23: nothing scrolls while a card opens or closes (no auto-scroll, and finger scrolling waits until it's done)
    let hxLockN = 0; const hxStop = e => { if(hxLockN > 0 && e.cancelable) e.preventDefault(); };
    document.addEventListener("touchmove", hxStop, {passive: false}); document.addEventListener("wheel", hxStop, {passive: false});
    const hxLock = ms => { hxLockN++; setTimeout(() => { hxLockN = Math.max(0, hxLockN - 1); }, ms + 40); };
    const hxMs = h => reduced() ? 0 : Math.round(Math.min(460, Math.max(280, 240 + h * .25)));
    // the card's own summary lines (Beshr 2026-11-23: they dissolve as it opens, so the open card shows the full content instead)
    const hxParts = card => [...card.querySelectorAll(":scope>.sub,:scope>.hint")];
    const hxH = el => { const cs = getComputedStyle(el); return cs.boxSizing === "border-box" ? parseFloat(cs.height) : el.getBoundingClientRect().height; };
    function hxClose(cb, instant){
      if(!hx){ cb && cb(); return; } const h = hx; hx = null; window._hx = null;
      const fin = () => { h.v.hidden = true; h.v.classList.remove("hx-view"); h.par.insertBefore(h.v, h.next && h.next.parentNode === h.par ? h.next : null);
        h.box.remove(); if(h.yt != null) window.scrollTo(0, h.yt); h.card.getAnimations().forEach(a => a.cancel()); (h.gs || []).forEach(g => g.remove()); (h.parts || []).forEach(p => p.style.opacity = ""); h.v.getAnimations().forEach(a => a.cancel()); h.v.querySelectorAll("*").forEach(e => e.getAnimations().forEach(a => a.cancel()));
        h.card.classList.remove("hx-on", "hx-min", "hx-anim"); h.card.setAttribute("aria-expanded", "false");
        if(window._homeDirty && !window._hx && !window._pg && !window._wmOpen) render(); else fitHome(); cb && cb(); };
      h.box.getAnimations().forEach(a => a.cancel()); const from = h.box.getBoundingClientRect().height, ms = hxMs(from) * .85;
      if(instant || !ms || !h.box.animate){ fin(); return; }
      hxLock(ms);
      Object.assign(h.box.style, {height: "0px", paddingTop: "0px", paddingBottom: "0px", borderBottomWidth: "0px"});
      const a = h.box.animate([{height: from + "px", paddingTop: "4px", paddingBottom: "16px", borderBottomWidth: "1px"}, {height: "0px", paddingTop: "0px", paddingBottom: "0px", borderBottomWidth: "0px"}], {duration: ms, easing: HX_EZ});
      a.onfinish = fin; a.oncancel = fin;
      // reverse: the full view fades, each fact travels back up into the card's summary as the card unfolds
      h.card.getAnimations().forEach(x => x.cancel()); hxClear(); const c1 = hxH(h.card); h.card.classList.remove("hx-min"); const c0 = hxH(h.card);
      const gs = hxFly(h.card, h.v, 0, true, ms);
      h.gs = gs; const parts = hxParts(h.card); parts.forEach(p => p.style.opacity = "0"); h.parts = parts;
      h.card.classList.add("hx-anim"); h.card.animate([{height: c1 + "px"}, {height: c0 + "px"}], {duration: ms, easing: HX_EZ});
      h.v.animate([{opacity: 1}, {opacity: 1, offset: .05}, {opacity: 0, offset: .4}, {opacity: 0}], {duration: ms, easing: "linear", fill: "forwards"});
      // the page scrolls back to where Home was, in step with the fold (the exact reverse of the opening)
      const ys = window.scrollY, yt = Math.min(ys, h.y0); if(ys - yt > 2){ h.yt = yt;
        const step = () => { if(!h.box.isConnected) return; const p = 1 - Math.min(1, h.box.getBoundingClientRect().height / (from || 1)); window.scrollTo(0, ys + (yt - ys) * p); if(!hx) requestAnimationFrame(step); }; step(); }
      try { navigator.vibrate && navigator.vibrate(8); } catch(e){}
    }
    /* Beshr 2026-11-23: the summary lines don't just vanish: each one partly dissolves while it travels to where the same fact
       sits in the opened view (found by its text), and lands there as the full view fades in. Close runs it backwards. */
    const hxPieces = card => hxParts(card).flatMap(p => p.classList.contains("rows") ? [...p.children].filter(k => k.getClientRects().length) : [p]).filter(p => p.getClientRects().length);
    const hxKeyEl = p => p.classList.contains("hint") ? (p.querySelector(":scope>span") || p) : (p.querySelector("bdi") || p.querySelector("b") || p);
    const hxNorm = t => (t || "").replace(/\s+/g, " ").trim();
    function hxTarget(v, p){
      if(p.classList.contains("hint")){ const t = v.querySelector(".tabHero>.thH"); return t && t.getClientRects().length ? (t.querySelector("span:not(:empty)") || t) : null; }
      const key = hxNorm(hxKeyEl(p).textContent); if(key.length < 2) return null; let best = null, bl = 1e9;
      v.querySelectorAll("*").forEach(e => { if(e.children.length > 4 || !e.getClientRects().length) return; const t = hxNorm(e.textContent); if(!t.includes(key) || t.length >= bl) return; const r = e.getBoundingClientRect(); if(r.height < 8 || r.height > 140) return; best = e; bl = t.length; });
      return best; }
    // a see-through copy of the card that shows only one summary line (same selectors, so the same look)
    function hxGhost(card, p){ const r = card.getBoundingClientRect(), c = card.cloneNode(true), idx = [];
      for(let e = p; e && e !== card; e = e.parentElement) idx.unshift([...e.parentElement.children].indexOf(e));
      c.classList.remove("hx-on", "hx-min", "hx-anim", "pg-src", "pg-land"); c.classList.add("pg-peek", "hx-ghost"); c.removeAttribute("id"); c.setAttribute("aria-hidden", "true");
      c.style.cssText = `position:absolute!important;left:0;top:0;width:${r.width}px;height:${hxH(card)}px;margin:0!important;z-index:3!important;pointer-events:none!important;visibility:hidden;transform:none;will-change:transform,opacity`;
      let q = c; idx.forEach(n => { q = q && q.children[n]; }); if(q) q.style.visibility = "visible";
      document.getElementById("viewHome").appendChild(c);
      // Beshr 2026-11-23 (video): ghosts sit in PAGE coordinates (not screen), so the page scrolling back during the fold can't make them land a few points off and snap
      const g0 = c.getBoundingClientRect(); c.style.left = (r.left - g0.left) + "px"; c.style.top = (r.top - g0.top) + "px"; return c; }
    function hxFly(card, v, scrollBy, reverse, ms){ // reverse = close
      const rtl = getComputedStyle(document.body).direction === "rtl", out = [];
      // Beshr 2026-11-23 (video): lines never cross each other's path or slide in sideways. If the opened view has the facts in a
      // different order than the card, each line just dissolves in place with a short drift instead of travelling.
      const L = hxPieces(card).map(p => { const t = hxTarget(v, p), k = hxKeyEl(p); return {p, t, k, kr: k.getBoundingClientRect(), tr: t && t.getBoundingClientRect()}; });
      const ordered = L.every((x, i) => !i || !x.tr || !L[i-1].tr || x.tr.top > L[i-1].tr.top + 4);
      L.forEach(({p, t, k, kr, tr}) => { const g = hxGhost(card, p);
        let dx = 0, dy = reverse ? 14 : 18; if(t && ordered){ dx = rtl ? tr.right - kr.right : tr.left - kr.left; if(Math.abs(dx) > 48) dx = 0; dy = tr.top - kr.top; } else t = null;
        const far = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`;
        const fr = reverse ? [{transform: far, opacity: 0}, {transform: far, opacity: 0, offset: .38}, {opacity: .65, offset: .7}, {transform: "none", opacity: 1}] // close: the lines appear only once the full view has mostly gone, so no text is drawn over other text
                           : [{transform: "none", opacity: 1}, {opacity: .45, offset: .2}, {transform: far, opacity: 0, offset: .4}, {transform: far, opacity: 0}]; // open: the summary is gone before the full view comes in (no doubled text)
        fr.forEach(k => k.easing = HX_EZ); g.animate(fr, {duration: ms, easing: "linear", fill: "forwards"}); // timing per step, so the fade offsets mean real time (they used to come in early)
        if(t && !reverse) t.animate([{opacity: 0}, {opacity: 0, offset: .35}, {opacity: 1}], {duration: ms, easing: "linear"});
        if(t && reverse) t.animate([{opacity: 1}, {opacity: 0, offset: .25}, {opacity: 0}], {duration: ms, easing: "linear", fill: "forwards"});
        out.push(g); });
      return out; }
    const hxClear = () => document.querySelectorAll("#viewHome>.hx-ghost").forEach(e => e.remove());
    function hxOpen(card, go){
      const v = viewOf(go); if(!v || !card) return;
      if(hx){ if(hx.go === go) return; hxClose(); }
      const box = document.createElement("div"); box.className = "hx"; box.dataset.noswipe = ""; box.dataset.for = go; box.style.setProperty("--hxbg", getComputedStyle(card).backgroundColor); box.style.setProperty("--hxbd", getComputedStyle(card).borderTopColor);
      hx = {go, card, v, box, par: v.parentNode, next: v.nextSibling, y0: window.scrollY}; window._hx = go;
      card.getAnimations().forEach(a => a.cancel()); hxClear(); const c0 = hxH(card), cr = card.getBoundingClientRect();
      if(go === "plan" && window._resetMonth) window._resetMonth(); // always lands on this month, today first
      card.after(box); v.classList.add("hx-view"); box.appendChild(v); v.hidden = false; try { renderHero(go); } catch(e){}
      document.documentElement.classList.remove("homefit");
      card.classList.add("hx-on", "hx-min"); const c1 = hxH(card); card.setAttribute("aria-expanded", "true");
      const H = box.getBoundingClientRect().height, ms = hxMs(H);
      // a card low on the screen: the page scrolls along with the opening, just enough to show what opened (the card's top stops at the search bar line)
      const qb = document.getElementById("qBar"), lim = (qb && qb.getClientRects().length ? qb.getBoundingClientRect().top : innerHeight) - 8;
      const dy = 0; // Beshr 2026-11-23: the page no longer scrolls by itself while a card opens; you scroll when it's open
      if(ms && card.animate){
        // targets are measured now, in the final layout; then the card goes back to its summary for the first frame
        card.classList.remove("hx-min"); const gs = hxFly(card, v, dy, false, ms); card.classList.add("hx-anim");
        const parts = hxParts(card); parts.forEach(p => p.style.opacity = "0"); // the ghosts carry the lines from here
        card.animate([{height: c0 + "px"}, {height: c1 + "px"}], {duration: ms, easing: HX_EZ}).onfinish = () => { gs.forEach(g => g.remove()); parts.forEach(p => p.style.opacity = ""); if(!hx || hx.card !== card) return; card.classList.add("hx-min"); card.classList.remove("hx-anim"); };
        v.animate([{opacity: 0}, {opacity: 0, offset: .3}, {opacity: 1, offset: .75}, {opacity: 1}], {duration: ms, easing: "linear"}); }
      try { navigator.vibrate && navigator.vibrate(10); } catch(e){}
      if(ms) hxLock(ms);
      if(ms && box.animate) box.animate([{height: "0px", paddingTop: "0px", paddingBottom: "0px", borderBottomWidth: "0px"}, {height: H + "px", paddingTop: "4px", paddingBottom: "16px", borderBottomWidth: "1px"}], {duration: ms, easing: HX_EZ}).onfinish = () => { fitHome();
        // only a card hidden behind the quick action bar (Forsa on a small phone): once it's open, glide up just enough to show it
        if(!hx || hx.box !== box) return; const br = box.getBoundingClientRect(), seen = lim - br.top; if(seen < 140){ const by = Math.min(card.getBoundingClientRect().top - Math.max(48, window._hLine()), 140 - seen + 60); if(by > 4){ hxLock(420); window.scrollTo({top: window.scrollY + by, behavior: "smooth"}); } } };
      if(dy > 2){ const y0 = window.scrollY; // in step with the box: the page moves by the same share the box has grown
        const step = () => { if(!hx || hx.box !== box) return; const p = Math.min(1, box.getBoundingClientRect().height / (H || 1)); window.scrollTo(0, y0 + dy * p); if(p < 1) requestAnimationFrame(step); };
        if(ms) requestAnimationFrame(step); else window.scrollTo(0, y0 + dy); }
    }
    window._hxClose = hxClose;
    document.addEventListener("keydown", e => { if(e.key === "Escape" && hx && !window._pg && !document.body.classList.contains("shopen")) hxClose(); });
    window.showTab = function(name){
      if(window._pgBusy) return; // one moving thing at a time
      if(hx && !pg && !window._wmOpen){ if(name === "home"){ hxClose(); return; } if(name === hx.go) return; if(HX[name] && cur === "home"){ hxOpen(homeCard(name), name); return; } if(!VIEW[name]) hxClose(null, true); }
      if(name === "bal" && window._wmOpen) name = "budget";
      if(window._wmOpen && window._wmReset){ window._wmReset(); render(); }
      if(pg){ if(name === "home"){ pgClose(); return; } if(VIEW[name]){ if(name !== pg.go) pgSwap(name); return; } const p = pg; pg = null; window._pg = null; const v = viewOf(p.go); if(v){ v.classList.remove("fv", "pg-anim", "pg-closing"); ["top","left","width","height","background","borderRadius","transform"].forEach(k => v.style[k] = ""); } cancelAnimationFrame(raf); M = null; homeAt(1); pgSides().forEach(e => e.classList.remove("wm-side-out")); document.body.classList.remove("pgopen", "pgready"); document.querySelectorAll("#viewHome .pg-src").forEach(e => e.classList.remove("pg-src")); }
      if(VIEW[name] && cur === "home" && !window._vtBusy){
        if(name === "bal" && !window._fromEl){ const w = document.getElementById("wmCard"); if(w){ w.click(); return; } }
        if(HX[name] && homeCard(name)){ window._fromEl = null; hxOpen(homeCard(name), name); return; }
        const src = window._fromEl || homeCard(name); window._fromEl = null; if(src){ pgOpen(src, name); return; } }
      if(!goingBack && cur && cur !== name){ backStack.push(cur); if(backStack.length > 30) backStack.shift(); } if(name === "home") backStack.length = 0; cur = name;
      document.body.classList.remove("framed"); document.querySelectorAll(".view.fv").forEach(e => e.classList.remove("fv"));
      _show(name); if(VIEW[name]) { try { renderHero(name); } catch(e){} } try { dots(); } catch(e){} const home = !document.getElementById("viewHome").hidden; document.body.classList.toggle("onhome", home); if(home) render(); };
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
