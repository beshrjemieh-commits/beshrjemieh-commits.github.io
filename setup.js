/* Smart Wallet: first-run setup.
   Shows once, right after a new account signs in for the first time: salary, payday, big bills, goals, then "Here is your month".
   The answers fill what the app already has: settings/profile (income, payday), settings/plan (monthly amounts),
   settings/cards (any bill the app has no card for) and the goals collection. Then the app reloads with everything in place.
   Existing accounts never see it (they already have a salary saved). Open it on purpose with ?setup in the address. */
(function () {
  if (!window.claude || !window.claude.use) return;
  const FORCE = /[?&]setup\b/.test(location.search);

  /* ---------- words ---------- */
  const W = {
    en: {
      lang: 'العربية', pvDone: 'Close tutorial', pvSkip: 'Close', pvNote: 'Practice run: nothing you enter here is saved.', sar: 'SAR', start: 'Start', next: 'Continue', open: 'Open my wallet', skip: 'Skip setup', saving: 'Setting up your wallet…', failed: 'Couldn\'t save. Check your connection and try again.',
      k1: 'Welcome', h1: 'Let\'s make your money make sense.', l1: 'Four quick questions. One minute.',
      q1: 'First, honestly: last month, could you say where all of your salary went?', a1: ['Yes, all of it', 'Some of it', 'Honestly, no'],
      k2: '1 of 4', h2: 'How much lands in your account each month?', l2: 'Your salary after deductions.', payday: 'It arrives on the',
      k3: '2 of 4', h3: 'Your biggest monthly bills', l3: 'Start with these, change the amounts, and add any other bill you pay every month.',
      addBill: '+ Add another bill', nameIt: 'Name it', remove: 'Remove', moveUp: 'Move up',
      bills: { rent: 'Rent', power: 'Electricity & water', phone: 'Phone & internet', cart: 'Groceries',
        inst: 'Installments (Tabby, Tamara…)', carloan: 'Car loan', school: 'School fees', maid: 'Domestic help', ins: 'Insurance', fuel: 'Fuel', subs: 'Subscriptions', custom: 'Something else' },
      k4: '3 of 4', h4: 'What are you saving for?', l4: 'Add each one, most important first. The app works out how much a month.',
      goals: { trip: 'A trip', phone: 'A new phone', car: 'A car', umrah: 'Umrah', emergency: 'A safety cushion', other: 'Something else' },
      addGoal: '+ Add a goal', target: 'How much', when: 'How long from now?', inM: (m, d) => `in ${m} months · ${d}`,
      k5: '4 of 4', h5: 'Here is your month.', cycle: (a, b, n) => `${a} to ${b} · ${n} days, payday to payday`,
      potBills: 'Bills', potGoals: 'Goals', potSpend: 'Yours to spend', perDay: d => `about ${d} a day`,
      readyBy: d => `ready by ${d}`, late: d => `ready by ${d}, a bit later than you hoped`, waits: 'starts once the goals above are done',
      kept: m => `${m} is kept for daily life, so some goals take a little longer.`,
      before: 'Before', now: 'Now', nowLine: s => `Every riyal of ${s} has a job`,
    },
    ar: {
      lang: 'English', pvDone: 'أغلق الشرح', pvSkip: 'إغلاق', pvNote: 'تجربة فقط: ما تدخله هنا لا يُحفظ.', sar: 'ريال', start: 'ابدأ', next: 'متابعة', open: 'افتح محفظتي', skip: 'تخطّ الإعداد', saving: 'جاري تجهيز محفظتك…', failed: 'ما قدرنا نحفظ. تأكد من الاتصال وحاول مرة ثانية.',
      k1: 'أهلاً', h1: 'خلّنا نخلي فلوسك واضحة.', l1: 'أربعة أسئلة سريعة. دقيقة وحدة.',
      q1: 'أول شيء، بصراحة: الشهر الماضي، تقدر تقول وين راح راتبك كله؟', a1: ['إيه، كله', 'بعضه', 'بصراحة، لا'],
      k2: '١ من ٤', h2: 'كم ينزل في حسابك كل شهر؟', l2: 'راتبك بعد الخصومات.', payday: 'ينزل يوم',
      k3: '٢ من ٤', h3: 'أكبر فواتيرك الشهرية', l3: 'ابدأ بهذي، عدّل المبالغ، وأضف أي فاتورة ثانية تدفعها كل شهر.',
      addBill: '+ أضف فاتورة ثانية', nameIt: 'سمّها', remove: 'حذف', moveUp: 'رفع',
      bills: { rent: 'الإيجار', power: 'الكهرباء والماء', phone: 'الجوال والإنترنت', cart: 'المقاضي',
        inst: 'أقساط (تابي، تمارا…)', carloan: 'قرض سيارة', school: 'رسوم مدرسية', maid: 'عمالة منزلية', ins: 'تأمين', fuel: 'بنزين', subs: 'اشتراكات', custom: 'شيء ثاني' },
      k4: '٣ من ٤', h4: 'وش توفّر له؟', l4: 'أضف كل هدف، الأهم أولاً. التطبيق يحسب كم شهرياً.',
      goals: { trip: 'سفرة', phone: 'جوال جديد', car: 'سيارة', umrah: 'عمرة', emergency: 'مبلغ للطوارئ', other: 'شيء ثاني' },
      addGoal: '+ أضف هدف', target: 'كم', when: 'بعد كم من الحين؟', inM: (m, d) => `بعد ${m} أشهر · ${d}`,
      k5: '٤ من ٤', h5: 'هذا شهرك.', cycle: (a, b, n) => `من ${a} إلى ${b} · ${n} يوم، من راتب لراتب`,
      potBills: 'الفواتير', potGoals: 'الأهداف', potSpend: 'لك تصرفه', perDay: d => `تقريباً ${d} يومياً`,
      readyBy: d => `جاهز في ${d}`, late: d => `جاهز في ${d}، أبطأ شوي من اللي تبيه`, waits: 'يبدأ لما تخلص الأهداف اللي فوقه',
      kept: m => `خلّينا ${m} للصرف اليومي، فبعض الأهداف تتأخر شوي.`,
      before: 'قبل', now: 'الحين', nowLine: s => `كل ريال من ${s} له مهمة`,
    },
  };
  const ICON = {
    rent: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
    power: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
    cart: '<path d="M3 4h2l2.4 11h10.2L20 7H6.3"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
    inst: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    carloan: '<path d="M5 16h14l-1.5-5.5A2 2 0 0 0 15.6 9H8.4a2 2 0 0 0-1.9 1.5z"/><circle cx="8" cy="17" r="1.5"/><circle cx="16" cy="17" r="1.5"/>',
    school: '<path d="M3 8l9-4 9 4-9 4z"/><path d="M7 10v5c3 2 7 2 10 0v-5"/>',
    maid: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5a3 3 0 0 1 0 6M18 20a5 5 0 0 0-3-4.6"/>',
    ins: '<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/>',
    fuel: '<path d="M5 20V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15M4 20h12M15 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3"/>',
    subs: '<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
    custom: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/>',
  };
  const svg = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k] || ICON.custom}</svg>`;
  // where each answer lands in the app's existing Budget cards; anything else becomes its own "Must pay" card
  const PLAN_KEY = { rent: 'rent', power: 'util', phone: 'phone', cart: 'market', inst: 'debt', carloan: 'car', fuel: 'fuel' };
  const BILL_DEFAULT = { inst: 500, carloan: 1800, school: 1200, maid: 1500, ins: 250, fuel: 400, subs: 100, custom: 0 };

  /* ---------- state ---------- */
  const startLang = window.walletLang === 'ar' ? 'ar' : 'en';
  let PREVIEW = false;
  const fresh = () => ({ lang: window.walletLang === 'ar' ? 'ar' : 'en', i: 0, knew: null, salary: '', payday: 27, addingBill: false, addingGoal: false, busy: false, err: '',
    bills: [{ id: 'rent', amt: 2500 }, { id: 'power', amt: 330 }, { id: 'phone', amt: 345 }, { id: 'cart', amt: 900 }],
    goals: [{ type: 'trip', name: '', target: 4600, months: 6 }] });
  const S = { lang: startLang, i: 0, knew: null, salary: '', payday: 27, addingBill: false, addingGoal: false, busy: false, err: '',
    bills: [{ id: 'rent', amt: 2500 }, { id: 'power', amt: 330 }, { id: 'phone', amt: 345 }, { id: 'cart', amt: 900 }],
    goals: [{ type: 'trip', name: '', target: 4600, months: 6 }] };
  const VIEWS = ['hello', 'salary', 'bills', 'goal', 'plan'];
  const t = k => W[S.lang][k] ?? W.en[k];
  const fmt = n => Math.round(+n || 0).toLocaleString('en-US');
  const money = n => `${fmt(n)} ${t('sar')}`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const loc = () => S.lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB';
  const month = m => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + m); return d.toLocaleDateString(loc(), { month: 'long', year: 'numeric' }); };
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const billName = b => b.id === 'custom' ? (b.name || W[S.lang].bills.custom) : W[S.lang].bills[b.id];
  const goalName = g => g.type === 'other' && g.name ? g.name : W[S.lang].goals[g.type];

  /* ---------- the money ---------- */
  // Goals are filled in order. If they don't all fit, 15% of salary stays for daily life and later goals take longer.
  // When a goal is reached its money moves on to the next one.
  function fit() {
    const sal = +S.salary || 0, bills = S.bills.reduce((a, b) => a + (+b.amt || 0), 0), keep = Math.max(0, Math.min(sal - bills, sal * 0.15));
    const wanted = S.goals.reduce((a, g) => a + (+g.target || 0) / g.months, 0);
    let room = Math.max(0, wanted <= sal - bills - keep ? wanted : sal - bills - keep);
    const goals = S.goals.map(g => { const need = (+g.target || 0) / g.months, give = Math.min(need, room); room -= give; return { ...g, need, give, ready: null, late: false }; });
    const goalsTotal = goals.reduce((a, g) => a + g.give, 0);
    const left = goals.map(g => +g.target || 0), doneAt = goals.map(() => null);
    for (let m = 1; m <= 240 && goalsTotal > 0 && left.some((v, k) => v > 0.5 && doneAt[k] === null); m++) {
      let r = goalsTotal;
      goals.forEach((g, k) => { if (doneAt[k] !== null || left[k] <= 0.5) return; const put = Math.min(g.need, r, left[k]); left[k] -= put; r -= put; if (left[k] <= 0.5) doneAt[k] = m; });
    }
    goals.forEach((g, k) => { g.ready = doneAt[k]; g.late = g.ready !== null && g.ready > g.months; });
    return { bills, goals, goalsTotal, spend: Math.max(0, sal - bills - goalsTotal), squeezed: goals.some(g => g.late), keep };
  }
  // the month runs from one payday to the day before the next; if payday was over a week ago, plan the salary that's coming
  function cycle() {
    const now = new Date(), p = S.payday, at = (y, m) => new Date(y, m, Math.min(p, new Date(y, m + 1, 0).getDate()));
    let start = at(now.getFullYear(), now.getMonth()); if (start > now) start = at(now.getFullYear(), now.getMonth() - 1);
    if (now - start > 7 * 864e5) start = at(start.getFullYear(), start.getMonth() + 1);
    const next = at(start.getFullYear(), start.getMonth() + 1), end = new Date(next - 864e5), days = Math.round((next - start) / 864e5);
    const f = d => d.toLocaleDateString(loc(), { day: 'numeric', month: 'short' });
    return { days, text: t('cycle')(f(start), f(end), days) };
  }

  /* ---------- screens ---------- */
  const V = {
    hello: () => `<span class="k">${t('k1')}</span><h1>${t('h1')}</h1><p class="lede">${t('l1')}</p>
      <p class="q1">${t('q1')}</p>
      <div class="opts">${t('a1').map((a, i) => `<button class="opt" data-knew="${i}" aria-pressed="${S.knew === i}">${a}</button>`).join('')}</div>
      <div class="grow"></div><button class="cta" data-go="next" ${S.knew === null ? 'disabled' : ''}>${t('start')}</button>
      ${PREVIEW ? `<p class="lede" style="text-align:center;max-width:none">${t('pvNote')}</p>` : ''}<button class="quiet" data-skip="1">${PREVIEW ? t('pvSkip') : t('skip')}</button>`,
    salary: () => `<span class="k">${t('k2')}</span><h1>${t('h2')}</h1><p class="lede">${t('l2')}</p>
      <label class="big"><input id="swSal" inputmode="numeric" value="${S.salary}" placeholder="0" aria-label="${t('h2')}"><span>${t('sar')}</span></label>
      <span class="lbl">${t('payday')}</span>
      <div class="pills">${[1, 10, 25, 26, 27, 28].map(d => `<button class="pill" data-payday="${d}" aria-pressed="${S.payday === d}">${d}</button>`).join('')}</div>
      <div class="grow"></div><button class="cta" data-go="next" ${+S.salary ? '' : 'disabled'}>${t('next')}</button>`,
    bills: () => `<span class="k">${t('k3')}</span><h1>${t('h3')}</h1><p class="lede">${t('l3')}</p>
      <div class="lines">${S.bills.map((b, i) => `<div class="line">${svg(b.id)}${b.id === 'custom'
        ? `<input type="text" class="name" data-billname="${i}" placeholder="${t('nameIt')}" value="${esc(b.name || '')}" maxlength="40" aria-label="${t('nameIt')}">`
        : `<label for="swB${i}">${billName(b)}</label>`}<span class="amt"><input id="swB${i}" data-bill="${i}" inputmode="numeric" value="${b.amt}" aria-label="${esc(billName(b))}"><small>${t('sar')}</small><button class="x" data-delbill="${i}" aria-label="${t('remove')} ${esc(billName(b))}">×</button></span></div>`).join('')}</div>
      ${S.addingBill ? `<div class="pills">${Object.keys(BILL_DEFAULT).filter(k => k === 'custom' || !S.bills.some(b => b.id === k)).map(k => `<button class="pill" data-pickbill="${k}">${W[S.lang].bills[k]}</button>`).join('')}</div>`
        : `<button class="add" data-addbill="1">${t('addBill')}</button>`}
      <div class="grow"></div><button class="cta" data-go="next">${t('next')}</button>`,
    goal: () => `<span class="k">${t('k4')}</span><h1>${t('h4')}</h1><p class="lede">${t('l4')}</p>
      ${S.goals.map((g, i) => `<div class="gcard">
        <div class="gtop">${g.type === 'other' ? `<input type="text" class="name" data-goalname="${i}" placeholder="${t('nameIt')}" value="${esc(g.name)}" maxlength="40" aria-label="${t('nameIt')}">` : `<b>${goalName(g)}</b>`}
          <span class="amt"><input data-gt="${i}" inputmode="numeric" value="${g.target || ''}" aria-label="${t('target')} ${esc(goalName(g))}"><small>${t('sar')}</small></span>
          ${i > 0 ? `<button class="x" data-up="${i}" aria-label="${t('moveUp')} ${esc(goalName(g))}" title="${t('moveUp')}">↑</button>` : ''}
          ${S.goals.length > 1 ? `<button class="x" data-delgoal="${i}" aria-label="${t('remove')} ${esc(goalName(g))}">×</button>` : ''}</div>
        <span class="lbl">${t('when')} <b>${t('inM')(g.months, month(g.months))}</b></span>
        <div class="pills">${[3, 6, 9, 12, 18, 24, 36].map(m => `<button class="pill" data-gm="${i}:${m}" aria-pressed="${g.months === m}">${m}</button>`).join('')}</div></div>`).join('')}
      ${S.addingGoal ? `<div class="pills">${Object.keys(W.en.goals).filter(k => k === 'other' || !S.goals.some(g => g.type === k)).map(k => `<button class="pill" data-pickgoal="${k}">${W[S.lang].goals[k]}</button>`).join('')}</div>`
        : S.goals.length < 6 ? `<button class="add" data-addgoal="1">${t('addGoal')}</button>` : ''}
      <div class="grow"></div><button class="cta" data-go="next" ${S.goals.some(g => +g.target) ? '' : 'disabled'}>${t('next')}</button>`,
    plan: () => {
      const sal = +S.salary || 1, F = fit(), G = F.goals.filter(g => +g.target), C = cycle(), shade = k => [1, .7, .5, .36, .26, .18][k] || .18;
      const when = g => !g.ready ? `<span class="sub warn">${t('waits')}</span>` : `<span class="sub ${g.late ? 'warn' : ''}">${g.late ? t('late')(month(g.ready)) : t('readyBy')(month(g.ready))}</span>`;
      const parts = [F.bills, ...G.map(g => g.give), F.spend].map(v => Math.max(0, v / sal * 100).toFixed(2)).join(',');
      return `<span class="k">${t('k5')}</span><h1>${t('h5')}</h1><p class="lede">${C.text}</p>
      <div class="split" data-parts="${parts}"><i style="background:var(--sw-bills)"></i>${G.map((g, k) => `<i style="background:var(--sw-goal);opacity:${shade(k)}"></i>`).join('')}<i style="background:var(--sw-spend)"></i></div>
      <div class="pots">
        <div class="pot"><span class="sw" style="background:var(--sw-bills)"></span><span>${t('potBills')}</span><span class="num" data-count="${F.bills}">0</span></div>
        ${G.length === 1
          ? `<div class="pot"><span class="sw" style="background:var(--sw-goal)"></span><span>${esc(goalName(G[0]))}</span><span class="num" data-count="${G[0].give}">0</span>${when(G[0])}</div>`
          : `<div class="pot"><span class="sw" style="background:var(--sw-goal)"></span><span>${t('potGoals')}</span><span class="num" data-count="${F.goalsTotal}">0</span>
            <div class="gsubs">${G.map((g, k) => `<div class="gsub"><span class="dot" style="opacity:${shade(k)}"></span><span>${esc(goalName(g))}</span><span class="num2">${g.give >= 1 ? money(g.give) : '—'}</span>${when(g)}</div>`).join('')}</div></div>`}
        <div class="pot"><span class="sw" style="background:var(--sw-spend)"></span><span>${t('potSpend')}</span><span class="num" data-count="${F.spend}">0</span><span class="sub">${t('perDay')(money(F.spend / C.days))}</span></div>
      </div>
      ${F.squeezed ? `<p class="note">${t('kept')(`<b>${money(F.keep)}</b>`)}</p>` : ''}
      <div class="contrast"><div class="was"><small>${t('before')}</small><span>“${t('a1')[S.knew ?? 2]}”</span></div><div><small class="mint">${t('now')}</small><span>${t('nowLine')(money(sal))}</span></div></div>
      ${S.err ? `<p class="note warn">${S.err}</p>` : ''}
      <div class="grow"></div><button class="cta" data-finish="1" ${S.busy ? 'disabled' : ''}>${S.busy ? t('saving') : PREVIEW ? t('pvDone') : t('open')}</button>`;
    },
  };

  /* ---------- drawing ---------- */
  let root;
  const CSS = `
  #swSetup{--sw-bg:#000000;--sw-raise:#1c1c1e;--sw-line:#38383a;--sw-fg:#ffffff;--sw-muted:#98989f;--sw-mint:#0a84ff;--sw-ink:#ffffff;--sw-warn:#ff9f0a;--sw-bills:#6e8b80;--sw-goal:#30d158;--sw-spend:#ff9f0a;
    position:fixed;inset:0;z-index:2147483000;background:var(--sw-bg);color:var(--sw-fg);overflow:auto;-webkit-overflow-scrolling:touch;
    font:15px/1.5 -apple-system,BlinkMacSystemFont,"SF Pro Text","SF Arabic","Segoe UI",sans-serif;
    padding:calc(14px + env(safe-area-inset-top,0px)) 16px calc(18px + env(safe-area-inset-bottom,0px))}
  #swSetup *{box-sizing:border-box}
  #swSetup button,#swSetup input{font:inherit;color:inherit}
  #swSetup button{cursor:pointer;-webkit-tap-highlight-color:transparent}
  #swSetup :focus-visible{outline:2px solid var(--sw-mint);outline-offset:2px}
  #swSetup .frame{max-width:440px;margin:0 auto;min-height:100%;display:flex;flex-direction:column}
  #swSetup .top{display:flex;align-items:center;gap:12px;height:30px}
  #swSetup .back{background:none;border:0;color:var(--sw-muted);font-size:20px;padding:2px 6px;visibility:hidden}
  #swSetup .back.on{visibility:visible}
  #swSetup .steps{flex:1;display:flex;gap:5px}
  #swSetup .steps i{flex:1;height:3px;border-radius:3px;background:var(--sw-line);transition:background .4s}
  #swSetup .steps i.on{background:var(--sw-mint)}
  #swSetup .lang{background:none;border:1px solid var(--sw-line);border-radius:99px;padding:2px 11px;font-size:12.5px;color:var(--sw-muted)}
  #swSetup .view{flex:1;display:flex;flex-direction:column;gap:18px;padding-top:24px;animation:swIn .42s cubic-bezier(.2,.8,.2,1) both}
  @keyframes swIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  #swSetup .k{font-size:13px;color:var(--sw-mint);font-weight:500}
  #swSetup h1{font:600 27px/1.22 inherit;font-weight:600;margin:0;text-wrap:balance}
  #swSetup .lede{color:var(--sw-muted);margin:0;max-width:36ch}
  #swSetup .q1{margin:8px 0 0;font-size:16px}
  #swSetup .grow{flex:1;min-height:8px}
  #swSetup .cta{width:100%;background:var(--sw-mint);color:var(--sw-ink);border:0;border-radius:16px;padding:16px;font-weight:600;font-size:16px;transition:transform .12s,opacity .2s}
  #swSetup .cta:active{transform:scale(.985)} #swSetup .cta:disabled{opacity:.35;cursor:default}
  #swSetup .quiet{background:none;border:0;color:var(--sw-muted);font-size:14px;padding:6px;margin-top:-8px}
  #swSetup .opts{display:flex;flex-direction:column;gap:8px}
  #swSetup .opt{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:start;background:none;border:1px solid var(--sw-line);border-radius:14px;padding:15px 16px;font-size:16px;transition:border-color .2s,background .2s}
  #swSetup .opt::after{content:"";width:18px;height:18px;border-radius:50%;border:1.5px solid var(--sw-line);flex:none}
  #swSetup .opt[aria-pressed=true]{border-color:var(--sw-mint);background:rgba(10,132,255,.14)}
  #swSetup .opt[aria-pressed=true]::after{background:var(--sw-mint);border-color:var(--sw-mint);box-shadow:inset 0 0 0 4px var(--sw-bg)}
  #swSetup .big{display:flex;align-items:baseline;gap:10px;border-bottom:2px solid var(--sw-line);padding:4px 2px 8px}
  #swSetup .big:focus-within{border-color:var(--sw-mint)}
  #swSetup .big input{flex:1;min-width:0;background:none;border:0;outline:none;font-size:44px;font-weight:600;font-variant-numeric:tabular-nums}
  #swSetup .big span{color:var(--sw-muted);font-size:16px}
  #swSetup .lbl{font-size:13px;color:var(--sw-muted)} #swSetup .lbl b{color:var(--sw-fg);font-weight:500}
  #swSetup .pills{display:flex;flex-wrap:wrap;gap:6px}
  #swSetup .pill{background:none;border:1px solid var(--sw-line);border-radius:99px;padding:6px 13px;font-size:14px;font-variant-numeric:tabular-nums}
  #swSetup .pill[aria-pressed=true]{background:var(--sw-fg);color:var(--sw-bg);border-color:var(--sw-fg)}
  #swSetup .lines{display:flex;flex-direction:column}
  #swSetup .line{display:grid;grid-template-columns:26px 1fr auto;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--sw-line)}
  #swSetup svg{width:22px;height:22px;stroke:var(--sw-muted);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
  #swSetup .amt{display:flex;align-items:baseline;gap:6px;justify-content:flex-end}
  #swSetup .amt input{width:80px;background:none;border:0;border-bottom:1px dashed var(--sw-line);text-align:end;font-size:17px;font-weight:500;font-variant-numeric:tabular-nums;padding:2px 0;outline:none}
  #swSetup input:focus{border-bottom-color:var(--sw-mint)}
  #swSetup .amt small{color:var(--sw-muted);font-size:12px}
  #swSetup input.name{width:100%;min-width:0;background:none;border:0;border-bottom:1px dashed var(--sw-line);outline:none;padding:2px 0;text-align:start}
  #swSetup .x{background:none;border:0;color:var(--sw-muted);font-size:18px;line-height:1;padding:2px 4px;opacity:.7}
  #swSetup .add{align-self:flex-start;background:none;border:1px dashed var(--sw-line);border-radius:99px;padding:7px 14px;font-size:14px;color:var(--sw-mint)}
  #swSetup .gcard{border:1px solid var(--sw-line);border-radius:16px;padding:13px 14px;display:flex;flex-direction:column;gap:9px}
  #swSetup .gtop{display:flex;align-items:baseline;gap:8px}
  #swSetup .gtop>b,#swSetup .gtop>input.name{flex:1;min-width:0;font-weight:500;font-size:16px}
  #swSetup .gcard .pill{padding:4px 11px;font-size:13.5px;min-width:38px}
  #swSetup .split{display:flex;height:54px;border-radius:14px;overflow:hidden;gap:3px}
  #swSetup .split i{display:block;height:100%;width:0;transition:width .9s cubic-bezier(.2,.8,.2,1)}
  #swSetup .pots{display:flex;flex-direction:column;gap:14px}
  #swSetup .pot{display:grid;grid-template-columns:10px 1fr auto;gap:2px 12px;align-items:baseline}
  #swSetup .pot .sw{width:10px;height:10px;border-radius:3px;align-self:center}
  #swSetup .num{font-size:22px;font-weight:600;font-variant-numeric:tabular-nums}
  #swSetup .sub{grid-column:2/-1;color:var(--sw-muted);font-size:13px} #swSetup .warn{color:var(--sw-warn)!important}
  #swSetup .gsubs{grid-column:2/-1;display:flex;flex-direction:column;gap:6px;margin-top:6px}
  #swSetup .gsub{display:grid;grid-template-columns:8px 1fr auto;gap:0 10px;align-items:baseline;font-size:14px}
  #swSetup .gsub .dot{width:8px;height:8px;border-radius:50%;background:var(--sw-goal);align-self:center}
  #swSetup .num2{font-variant-numeric:tabular-nums}
  #swSetup .note{font-size:13.5px;color:var(--sw-muted);margin:0} #swSetup .note b{color:var(--sw-fg);font-weight:500}
  #swSetup .contrast{border-top:1px solid var(--sw-line);padding-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
  #swSetup .contrast div{display:flex;flex-direction:column;gap:2px;min-width:0}
  #swSetup .contrast small{font-size:12px;color:var(--sw-muted)} #swSetup .contrast .mint{color:var(--sw-mint)}
  #swSetup .was span{color:var(--sw-muted);text-decoration:line-through}
  @media (prefers-reduced-motion:reduce){#swSetup *{animation:none!important;transition:none!important}}`;

  function render() {
    const v = VIEWS[S.i];
    root.dir = S.lang === 'ar' ? 'rtl' : 'ltr'; root.lang = S.lang;
    root.querySelector('.back').classList.toggle('on', S.i > 0 && !S.busy);
    root.querySelector('.back').textContent = S.lang === 'ar' ? '›' : '‹';
    root.querySelector('.lang').textContent = t('lang');
    const steps = root.querySelector('.steps'); steps.style.visibility = S.i === 0 ? 'hidden' : 'visible';
    [...steps.children].forEach((el, k) => el.classList.toggle('on', k < S.i));
    const view = root.querySelector('.view'); view.innerHTML = V[v]();
    view.style.animation = 'none'; void view.offsetWidth; view.style.animation = '';
    requestAnimationFrame(() => animateIn(view));
  }
  function animateIn(view) {
    const split = view.querySelector('.split');
    if (split) split.dataset.parts.split(',').forEach((w, k) => setTimeout(() => { if (split.children[k]) split.children[k].style.width = w + '%'; }, 120 + k * 140));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    view.querySelectorAll('[data-count]').forEach((el, k) => {
      const to = +el.dataset.count; if (reduce) { el.textContent = fmt(to); return; }
      const t0 = performance.now() + k * 120, dur = 900;
      const tick = now => { const p = Math.min(1, Math.max(0, (now - t0) / dur)); el.textContent = fmt(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
  }
  function focusLast(sel) { const all = root.querySelectorAll(sel), el = all[all.length - 1]; if (el) { el.focus(); if (el.select) el.select(); } }

  /* ---------- saving into the app ---------- */
  async function getDoc(db, path) { try { const d = await db.doc(path).get(); return d && d.exists ? (d.data() || {}) : null; } catch (e) { return null; } }
  async function finish(db) {
    if (PREVIEW) { close(); return; }
    S.busy = true; S.err = ''; render();
    try {
      const F = fit(), r = n => Math.round(+n || 0);
      // 1) salary and payday
      const profile = await getDoc(db, 'settings/profile') || {};
      // 2) monthly amounts into the existing Budget cards
      const plan = await getDoc(db, 'settings/plan'), items = (plan && plan.items) || {};
      const cards = await getDoc(db, 'settings/cards') || {}; cards.added = cards.added || []; cards.hidden = cards.hidden || []; cards.names = cards.names || {};
      const setPlan = (k, amt) => { const cur = items[k] || { now: 0, plan: 0 }; items[k] = { now: +cur.now || 0, plan: r(amt) }; };
      const sums = {};
      S.bills.forEach(b => { if (!(+b.amt > 0)) return; const k = PLAN_KEY[b.id];
        if (k) sums[k] = (sums[k] || 0) + (+b.amt);
        else { const name = (b.id === 'custom' ? (b.name || '').trim() : W[S.lang].bills[b.id]) || W[S.lang].bills.custom;
          const key = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
          cards.added.push({ k: key, n: name.slice(0, 40), s: name.slice(0, 40), g: 'Must pay', daily: false, plan: r(b.amt) }); setPlan(key, b.amt); } });
      Object.entries(sums).forEach(([k, v]) => { setPlan(k, v); cards.hidden = cards.hidden.filter(h => h !== k); });
      if (F.goalsTotal > 0) setPlan('goals', F.goalsTotal);
      await db.doc('settings/plan').set({ items });
      if (cards.added.length) await db.doc('settings/cards').set(cards);
      // 3) goals, in the order they were given
      const now = Date.now();
      for (const [i, g] of S.goals.entries()) { if (!(+g.target > 0)) continue;
        const by = new Date(); by.setDate(1); by.setMonth(by.getMonth() + g.months);
        await db.collection('goals').add({ name: String(goalName(g)).slice(0, 60), target: r(g.target), saved: 0, months: g.months, by: ymd(by), createdAt: now + i }); }
      // last, so a half-finished save shows the setup again next time
      await db.doc('settings/profile').set(Object.assign(profile, { income: r(S.salary), payday: S.payday, setup: { at: now, knew: S.knew } }));
      try { localStorage.setItem('w-money-plan-v1', JSON.stringify(items)); localStorage.setItem('w-cards', JSON.stringify(cards)); sessionStorage.setItem('w-cards-reload', '1'); } catch (e) {}
      if (S.lang !== startLang) { try { localStorage.setItem('w-lang', S.lang); } catch (e) {} }
      location.replace(location.pathname);
    } catch (e) { S.busy = false; S.err = t('failed'); render(); }
  }
  async function skip(db) {
    if (PREVIEW) { close(); return; }
    try { const profile = await getDoc(db, 'settings/profile') || {}; await db.doc('settings/profile').set(Object.assign(profile, { setup: { at: Date.now(), skipped: true } })); } catch (e) {}
    close();
  }
  function close() { PREVIEW = false; if (root) root.remove(); root = null; document.documentElement.style.overflow = ''; if (FORCE) history.replaceState(null, '', location.pathname); }

  function open(db) {
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    root = document.createElement('div'); root.id = 'swSetup'; root.setAttribute('data-noi18n', ''); root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
    root.innerHTML = `<div class="frame"><div class="top"><button class="back" aria-label="Back">‹</button><div class="steps" aria-hidden="true"><i></i><i></i><i></i><i></i></div><button class="lang"></button></div><section class="view" aria-live="polite"></section></div>`;
    document.body.appendChild(root); document.documentElement.style.overflow = 'hidden';
    root.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || S.busy) return; const d = b.dataset;
      if (b.classList.contains('lang')) { S.lang = S.lang === 'en' ? 'ar' : 'en'; render(); return; }
      if (b.classList.contains('back')) { S.i = Math.max(0, S.i - 1); render(); return; }
      if (d.go === 'next') { S.i = Math.min(VIEWS.length - 1, S.i + 1); S.addingBill = S.addingGoal = false; render(); root.scrollTop = 0; return; }
      if (d.skip) { skip(db); return; }
      if (d.finish) { finish(db); return; }
      if (d.knew !== undefined) { S.knew = +d.knew; render(); return; }
      if (d.payday) { S.payday = +d.payday; render(); return; }
      if (d.addbill) { S.addingBill = true; render(); return; }
      if (d.pickbill) { S.bills.push({ id: d.pickbill, amt: BILL_DEFAULT[d.pickbill], name: '' }); S.addingBill = false; render(); focusLast(d.pickbill === 'custom' ? '[data-billname]' : '[data-bill]'); return; }
      if (d.delbill !== undefined) { S.bills.splice(+d.delbill, 1); render(); return; }
      if (d.addgoal) { S.addingGoal = true; render(); return; }
      if (d.pickgoal) { const T = { trip: 4600, phone: 6300, car: 30000, umrah: 3500, emergency: Math.round(S.bills.reduce((a, b) => a + (+b.amt || 0), 0) * 3), other: 5000 };
        S.goals.push({ type: d.pickgoal, name: '', target: T[d.pickgoal], months: d.pickgoal === 'car' ? 24 : 6 }); S.addingGoal = false; render(); focusLast(d.pickgoal === 'other' ? '[data-goalname]' : '[data-gt]'); return; }
      if (d.delgoal !== undefined) { S.goals.splice(+d.delgoal, 1); render(); return; }
      if (d.up) { const i = +d.up; [S.goals[i - 1], S.goals[i]] = [S.goals[i], S.goals[i - 1]]; render(); return; }
      if (d.gm) { const [i, m] = d.gm.split(':').map(Number); S.goals[i].months = m; render(); return; }
    });
    root.addEventListener('input', e => {
      const el = e.target, d = el.dataset, v = +String(el.value).replace(/[^\d.]/g, '') || 0;
      const cta = root.querySelector('[data-go]');
      if (el.id === 'swSal') { S.salary = v || ''; if (cta) cta.disabled = !v; }
      else if (d.bill !== undefined) S.bills[+d.bill].amt = v;
      else if (d.billname !== undefined) S.bills[+d.billname].name = el.value;
      else if (d.goalname !== undefined) S.goals[+d.goalname].name = el.value;
      else if (d.gt !== undefined) { S.goals[+d.gt].target = v; if (cta) cta.disabled = !S.goals.some(g => +g.target); }
    });
    render();
  }

  /* Practice run from Settings: the same screens, but nothing is saved. */
  window.showSetupTour = async () => {
    if (root) return; let db = null; try { db = await window.claude.use('db'); } catch (e) {}
    PREVIEW = true; Object.assign(S, fresh());
    const go = () => open(db); if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
  };

  /* ---------- when to show: after sign-in, only for a new account ---------- */
  (async () => {
    let db; try { db = await window.claude.use('db'); } catch (e) { return; }   // waits until the person has signed in
    if (!db) return;
    const profile = await getDoc(db, 'settings/profile');
    if (!FORCE) {
      if (profile && (profile.setup || Number(profile.income) > 0)) return;   // already set up, or an account from before setup existed
      if (await getDoc(db, 'settings/plan')) return;
    }
    const go = () => open(db);
    if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
  })();
})();
