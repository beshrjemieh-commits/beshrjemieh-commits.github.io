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
        out.push(spare >= 0 ? L(`🔮 At your usual pace you reach payday with about ${fmt(spare)} SAR spare.`, `🔮 بنفس صرفك المعتاد بتوصل للراتب ومعك حوالي ${fmt(spare)} ريال زيادة.`)
                            : L(`🔮 At your usual pace you'd run short by about ${fmt(-spare)} SAR before payday. Slow down a little.`, `🔮 بنفس صرفك المعتاد بينقصك حوالي ${fmt(-spare)} ريال قبل الراتب. خفف شوي.`));
        out.push(L(`⏳ Your balance covers about ${Math.floor(b / avgDay)} days of normal spending.`, `⏳ رصيدك يكفي تقريباً ${Math.floor(b / avgDay)} يوم من صرفك العادي.`));
      }
      const inc = (g("income") || []).filter(x => x.date.slice(0,7) === mk).reduce((a,x) => a + x.amount, 0);
      if(inc || spentM) out.push(L(`↕️ This month: ${fmt(inc)} SAR in, ${fmt(spentM)} SAR out.`, `↕️ هذا الشهر: دخل ${fmt(inc)} ريال، وطلع ${fmt(spentM)} ريال.`));
      const wk = es.filter(e => (now - new Date(e.date + "T12:00")) / 864e5 < 7).sort((a,b) => b.amount - a.amount)[0];
      if(wk) out.push(L(`🏷️ Biggest cost this week: ${fmt(wk.amount)} SAR on ${cat(wk.cat)}${wk.note ? " (" + wk.note + ")" : ""}.`, `🏷️ أكبر مصروف هذا الأسبوع: ${fmt(wk.amount)} ريال على ${cat(wk.cat)}${wk.note ? " (" + wk.note + ")" : ""}.`));
    }
    if(tab === "budget"){
      const ITEMS = g("ITEMS") || [], state = g("state") || {}, ms = g("monthSums"), sums = ms ? ms() : {};
      const flex = ITEMS.filter(i => i.daily && state[i.k] && +state[i.k].plan > 0), plan = flex.reduce((a,i) => a + +state[i.k].plan, 0);
      const fs = flex.reduce((a,i) => a + (sums[i.k] || 0), 0);
      if(plan){ const pu = Math.round(fs / plan * 100), pt = Math.round(dayOfM / daysInM * 100);
        out.push(pu <= pt ? L(`🎯 ${pt}% of the month is gone and you've used ${pu}% of your budget. On track.`, `🎯 مضى ${pt}٪ من الشهر واستخدمت ${pu}٪ من ميزانيتك. ماشي صح.`)
                          : L(`🚦 ${pt}% of the month is gone but ${pu}% of your budget is used. Ease off for a few days.`, `🚦 مضى ${pt}٪ من الشهر واستخدمت ${pu}٪ من الميزانية. خفف كم يوم.`)); }
      const room = flex.map(i => ({i, left: state[i.k].plan - (sums[i.k] || 0)})).sort((a,b) => b.left - a.left)[0];
      if(room && room.left > 0) out.push(L(`🟢 Most room left: ${room.i.s}, ${fmt(room.left)} SAR.`, `🟢 أكثر بند فيه مجال: ${room.i.s}، باقي ${fmt(room.left)} ريال.`));
      const food = last30.filter(e => e.cat === "food"); if(food.length >= 2){ const avg = food.reduce((a,e) => a + e.amount, 0) / food.length;
        out.push(L(`🍔 One less meal out this week keeps about ${fmt(avg)} SAR in your pocket.`, `🍔 وجبة أقل برا هذا الأسبوع تخلي معك حوالي ${fmt(avg)} ريال.`)); }
      const we = [0,0], wd = [0,0]; last30.forEach(e => { const d = new Date(e.date + "T12:00").getDay(); if(d === 5 || d === 6){ we[0] += e.amount; } else { wd[0] += e.amount; } });
      if(we[0] && wd[0]){ const r = (we[0] / 8) / (wd[0] / 22); if(r > 1.2) out.push(L(`📆 Your weekends cost ${Math.round((r - 1) * 100)}% more per day than weekdays.`, `📆 يوم الويكند يكلفك ${Math.round((r - 1) * 100)}٪ أكثر من أيام الأسبوع.`)); }
    }
    if(tab === "plan"){
      const notes = {}; month.forEach(e => { const n = (e.note || "").trim(); if(n) notes[n] = (notes[n] || 0) + 1; });
      const top = Object.entries(notes).sort((a,b) => b[1] - a[1])[0];
      if(top && top[1] >= 2) out.push(L(`🔁 Your most frequent buy this month: ${top[0]} (${top[1]} times).`, `🔁 أكثر شي تشتريه هذا الشهر: ${top[0]} (${top[1]} مرات).`));
      const byDay = [0,0,0,0,0,0,0]; last30.forEach(e => { byDay[new Date(e.date + "T12:00").getDay()] += e.amount; });
      const mx = byDay.indexOf(Math.max(...byDay)); if(byDay[mx] > 0) out.push(L(`📅 ${DAYS_EN[mx]} is your biggest spending day lately.`, `📅 يوم ${DAYS_AR[mx]} هو أكثر يوم تصرف فيه مؤخراً.`));
      const small = month.filter(e => e.amount < 30); if(small.length >= 3) out.push(L(`🪙 ${small.length} small buys under 30 SAR added up to ${fmt(small.reduce((a,e) => a + e.amount, 0))} SAR this month.`, `🪙 ${small.length} مشتريات صغيرة تحت 30 ريال وصلت ${fmt(small.reduce((a,e) => a + e.amount, 0))} ريال هذا الشهر.`));
      const cof = month.filter(e => e.cat === "coffee"); if(cof.length) { const t = cof.reduce((a,e) => a + e.amount, 0); out.push(L(`☕ Coffee this month: ${fmt(t)} SAR. That's about ${fmt(t * 12)} SAR a year.`, `☕ القهوة هذا الشهر: ${fmt(t)} ريال. يعني حوالي ${fmt(t * 12)} ريال بالسنة.`)); }
      let streak = 0; for(let i = 0; i < 60; i++){ const d = new Date(now); d.setDate(d.getDate() - i); if(es.some(e => e.date === ymd(d))) streak++; else if(i) break; }
      if(streak >= 3) out.push(L(`🔥 You've logged costs ${streak} days in a row. Keep it going.`, `🔥 سجلت مصاريفك ${streak} أيام ورا بعض. استمر.`));
    }
    if(tab === "prices"){
      const groups = [...priceGroups().values()], ps = groups.flat();
      const wins = {}; groups.forEach(r => { if(new Set(r.map(p => p.store)).size < 2) return; const lo = r.slice().sort((a,b) => a.price - b.price)[0]; wins[lo.store] = (wins[lo.store] || 0) + 1; });
      const w = Object.entries(wins).sort((a,b) => b[1] - a[1])[0];
      if(w && w[1] >= 2) out.push(L(`🏆 ${w[0]} is cheapest for ${w[1]} of your items.`, `🏆 ${w[0]} الأرخص في ${w[1]} من أصنافك.`));
      const swing = groups.map(r => { const a = r.map(p => p.price); return {p: r[0], lo: Math.min(...a), hi: Math.max(...a)}; }).filter(x => x.hi > x.lo).sort((a,b) => (b.hi - b.lo) / b.hi - (a.hi - a.lo) / a.hi)[0];
      if(swing) out.push(L(`📉 ${swing.p.item} has ranged from ${money(swing.lo)} to ${money(swing.hi)} SAR. Buy it at the low end.`, `📉 سعر ${swing.p.item} تراوح بين ${money(swing.lo)} و ${money(swing.hi)} ريال. اشتريه بالأرخص.`));
      if(ps.length) out.push(L(`📒 Your price book has ${ps.length} prices from ${new Set(ps.map(p => p.store)).size} stores.`, `📒 دفتر أسعارك فيه ${ps.length} سعر من ${new Set(ps.map(p => p.store)).size} محلات.`));
    }
    if(tab === "forsa"){
      const live = (g("deals") || []).filter(d => d.status !== "hidden"), terms = ((g("hunt") || {}).terms || []);
      const today = live.filter(d => now - d.foundAt < 864e5);
      if(today.length) out.push(L(`🆕 ${today.length} new deal${today.length === 1 ? "" : "s"} in the last 24 hours.`, `🆕 ${today.length} عروض جديدة خلال آخر 24 ساعة.`));
      if(terms.length) out.push(L(`🔎 You're hunting for: ${terms.slice(0,3).join(", ")}. Add one more to widen the net.`, `🔎 تدوّر على: ${terms.slice(0,3).join("، ")}. أضف شي ثاني توسّع البحث.`));
      else out.push(L(`🔎 Tell the hunt what you want, like "PS5" or "sofa", and it watches for it.`, `🔎 قول للبحث وش تبي، مثل "بلايستيشن" أو "كنب"، ويراقبه لك.`));
      const best = live.filter(d => d.market > 0).sort((a,b) => b.pct - a.pct)[0];
      if(best) out.push(L(`💎 Deepest discount right now: ${best.title}, ${best.pct}% below market.`, `💎 أكبر خصم الحين: ${best.title}، أقل من السوق بـ ${best.pct}٪.`));
      out.push(L(`🤝 Tip: offer about 10% less first. Most sellers expect to bargain.`, `🤝 نصيحة: اعرض أقل بحوالي 10٪ أول. أغلب البياعين يتوقعون مفاصلة.`));
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
      return {big: (left < 0 ? neg(-perDay) : sar(perDay)) + L(" / day", " / يوم"), bad: left < 0,
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
  body.onhome .tabs,body.onhome .hintbar{display:none!important}
  #tabHome{flex:0 0 auto!important;width:44px;display:inline-flex;align-items:center;justify-content:center}
  #tabHome::before{content:"";width:18px;height:18px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.5 11 12 4l8.5 7'/%3E%3Cpath d='M5.5 9.5V20h13V9.5'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.5 11 12 4l8.5 7'/%3E%3Cpath d='M5.5 9.5V20h13V9.5'/%3E%3C/svg%3E") center/contain no-repeat}
  .hgreet{display:flex;justify-content:space-between;align-items:baseline;color:var(--muted);font-size:12.5px;padding:0 2px}
  /* Beshr's palette: navy balance card, white cards, amber only for deals, green/red only for money in/out */
  .hgreet{display:none!important}
  .hcard::before{display:none!important}
  .hcard .hh .go{display:none}
#viewHome{gap:8px!important}
.hcard{--hc:var(--navy);border:1px solid var(--card-line)!important;border-radius:18px!important;padding:10px 14px!important;background:var(--card)!important;color:var(--fg)!important;box-shadow:var(--shadow)!important}
.hcard .hh{color:var(--tabink)!important;font-weight:600!important}
.hcard .hh .big{color:var(--fg)!important}
.hcard .hh .big.bad{color:var(--loss)!important}
.hcard .hh .ic{border-radius:50%!important;width:26px!important;height:26px!important;background:var(--navy-soft)!important;color:var(--fg)!important}
.hcard .sub{color:var(--muted)!important}.hcard .sub b{color:var(--fg)!important}
.hcard .hint{background:var(--chip)!important;color:var(--ink2)!important;border-radius:999px!important;padding:4px 10px!important}
.hcard .hint>svg{color:var(--muted)!important}
.hcard[data-go=bal]{background:var(--navy)!important;border:none!important;padding:13px 15px!important}
.hcard[data-go=bal] .hh{flex-wrap:wrap;color:var(--navy-sub)!important;font-weight:500!important}
.hcard[data-go=bal] .hh .big{order:5;flex:1 0 100%!important;text-align:start!important;font-size:30px!important;color:#fff!important;margin-top:0;line-height:1.15}
.hcard[data-go=bal] .hh .big.bad{color:#FCA5A5!important}
.hcard[data-go=bal] .sub{color:var(--navy-sub)!important}
.hcard[data-go=bal] .hint{background:rgba(255,255,255,.1)!important;color:#E2E8F0!important}
.hcard[data-go=bal] .hint>svg{color:var(--navy-sub)!important}
.hcard[data-go=bal] .ic{background:rgba(255,255,255,.12)!important;color:#fff!important}
.hcard[data-go=plan] .hh .big{color:var(--loss)!important}
.hcard .gain{color:var(--gain)!important;font-weight:600}.hcard[data-go=bal] .gain{color:var(--gain-on-navy)!important}
.hcard .loss{color:var(--loss)!important;font-weight:600}
.hcard[data-go=forsa]{background:var(--deal-soft)!important;border-color:var(--deal-line)!important}
.hcard[data-go=forsa] .hh,.hcard[data-go=forsa] .hh .big{color:var(--deal-ink)!important}
.hcard[data-go=forsa] .sub{color:var(--deal-ink)!important;opacity:.85}.hcard[data-go=forsa] .sub b{color:var(--deal-ink)!important}
.hcard[data-go=forsa] .hint{background:color-mix(in srgb,var(--deal) 16%,transparent)!important;color:var(--deal-ink)!important}
.hcard[data-go=forsa] .hint>svg{color:var(--deal)!important}
.hcard[data-go=forsa] .ic{background:var(--deal)!important;color:#fff!important}
  .hcard .hint{display:flex!important;align-items:center;gap:7px}
  .hcard .hint>svg{flex:none;width:14px;height:14px}
  .hcard .hint>span{flex:1;min-width:0}`;

  const lastHint = {};

  /* ---------- swipe to go back (like iPhone apps): a sideways swipe returns to the previous screen ---------- */
  let cur = null, goingBack = false; const backStack = [];
  function goBack(){
    if(cur === "home" || !cur) return false;
    const to = backStack.pop() || "home";
    goingBack = true; try { window.showTab(to); } finally { goingBack = false; }
    const v = [...document.querySelectorAll(".view")].find(x => !x.hidden);
    if(v && v.animate) v.animate([{transform:`translateX(${AR ? 40 : -40}px)`, opacity:.4}, {transform:"none", opacity:1}], {duration:220, easing:"ease-out"});
    window.scrollTo({top:0});
    return true;
  }
  window.walletGoBack = goBack;
  function swipeInit(){
    let sx = 0, sy = 0, st = 0, ok = false;
    const skip = el => el.closest("input,textarea,select,[contenteditable],.tablebox,#setSheet,#tour,#swSetup,#authGate,.tabs,.chips,[data-noswipe]") ||
      [...(function*(e){ while(e && e !== document.body){ yield e; e = e.parentElement; } })(el)].some(e => e.scrollWidth > e.clientWidth + 4 && /(auto|scroll)/.test(getComputedStyle(e).overflowX));
    document.addEventListener("touchstart", e => { if(e.touches.length !== 1){ ok = false; return; } const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); ok = cur !== "home" && !skip(e.target); }, {passive:true});
    document.addEventListener("touchend", e => { if(!ok) return; ok = false; const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if(Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8 && Date.now() - st < 700) goBack(); }, {passive:true});
    document.addEventListener("touchcancel", () => { ok = false; }, {passive:true});
  }
  function render(){
    const v = document.getElementById("viewHome"); if(!v) return;
    const hr = new Date().getHours(), greet = hr < 12 ? L("Good morning","صباح الخير") : hr < 18 ? L("Good afternoon","مساء الخير") : L("Good evening","مساء الخير");
    v.innerHTML = `<div class="hgreet" data-noi18n><span>${greet}</span><span>${new Date().toLocaleDateString(AR ? "ar-SA-u-ca-gregory" : "en-GB", {weekday:"long", day:"numeric", month:"long"})}</span></div>` +
      CARDS.map((c, i) => { const b = bodyFor(c.tab), all = hintsFor(c.tab).filter(x => x !== lastHint[c.tab]), mine = creative(c.tab).filter(x => x !== lastHint[c.tab]);
        const h = pick(mine.length && (seed * 7 + i) % 1 < 0.75 ? mine : all, 11 + i); lastHint[c.tab] = h;
        return `<button type="button" class="hcard" data-go="${c.tab}" style="--hc:${c.c}">
          <span class="hh" data-noi18n><span class="ic">${svg(c.icon)}</span><span class="tt">${c.title}</span><span class="big${b.mid ? " mid" : ""}${b.small ? " small" : ""}${b.bad ? " bad" : ""}">${b.big}</span><span class="go">›</span></span>
          ${b.sub || b.subHtml ? `<span class="sub" ${b.subHtml ? "" : "data-noi18n"}>${b.subHtml || esc(b.sub)}</span>` : ""}
          ${h ? `<span class="hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg><span>${esc(h.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, ""))}</span></span>` : ""}</button>`; }).join("");
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
    window.showTab = function(name){ if(name === "home") seed = Math.random(); if(!goingBack && cur && cur !== name){ backStack.push(cur); if(backStack.length > 30) backStack.shift(); } if(name === "home") backStack.length = 0; cur = name; _show(name); const home = !document.getElementById("viewHome").hidden; document.body.classList.toggle("onhome", home); if(home) render(); };
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
