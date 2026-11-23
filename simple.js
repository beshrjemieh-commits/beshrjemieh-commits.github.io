/* Simple version (Beshr 2026-11-24: "everyone is telling me it's too complicated").
   A greeting at the top and only 4 tabs: Wallet, Expenses, Store, Forsa. Same account and data as before.
   The full version is kept at /backup3/. This file replaces home.js on the main page. */
(function(){
  const ar = window.walletLang === "ar";
  const L = (en, a) => ar ? a : en;
  const $ = id => document.getElementById(id);
  const ico = n => window.PH ? PH(n) : "";
  document.body.classList.add("simple");

  const css = `
  body.simple{background:#F8FAFC}
  body.simple .wrap{padding-top:max(12px,env(safe-area-inset-top));padding-left:16px!important;padding-right:16px!important;padding-bottom:calc(96px + env(safe-area-inset-bottom))!important}
  /* top: greeting + settings only */
  body.simple #wTitle,body.simple header>.sub,body.simple #expAll,body.simple #colAll,body.simple #editMode,body.simple #gsBox,body.simple #editBar,body.simple #hintBar{display:none!important}
  body.simple header{gap:0!important;margin:4px 0 12px}
  body.simple .toprow{align-items:flex-start!important}
  #sGreet{display:flex;flex-direction:column;gap:2px;min-width:0}
  #sGreet b{font-size:24px;font-weight:600;line-height:1.25;color:#0F172A;letter-spacing:-.01em}
  #sGreet span{font-size:13px;color:#64748B}
  html[dir=rtl] #sGreet b{line-height:1.6}
  body.simple #setBtn{width:44px;height:44px}
  /* 4 tabs only */
  body.simple #tabBudget{display:none!important}
  /* every section open, no section headers or long descriptions: the tab name says what it is */
  body.simple .view section>div:first-child{display:none!important}
  body.simple .view section.collapsed>*{display:revert}
  body.simple .view section{margin:0 0 16px!important;padding:0!important;border:0!important;box-shadow:none!important;background:none!important}
  body.simple .view .sub,body.simple .view p.tag,body.simple .ibtn,body.simple .desc{display:none!important}
  .sTitle{font-size:20px;font-weight:600;line-height:1.3;color:#0F2A4A;margin:0 0 12px!important;padding:0!important;border:0!important}
  html[dir=rtl] .sTitle{line-height:1.7}
  body.simple .view{gap:0!important;margin-top:0!important;padding-top:0!important}
  body.simple header{margin:4px 0 20px!important}
  body.simple #viewForsa .conf{display:none!important}
  body.simple #viewBal .balhero{margin-top:0!important}
  /* Wallet */
  body.simple #viewBal .balhero{background:#0F2A4A;color:#fff;border-radius:20px;padding:20px 16px;display:flex;flex-direction:column;align-items:center;gap:4px;box-shadow:0 8px 24px rgba(15,42,74,.18)}
  body.simple #viewBal .balhero .tag{color:rgba(255,255,255,.75)!important}
  body.simple #viewBal .balhero .v{color:#fff!important;font-size:32px!important}
  body.simple #viewBal #stToggle{margin-top:12px}
  body.simple #viewBal .balwide{display:none!important}
  /* Expenses: hide the bank-message paste row and the category breakdown */
  body.simple #viewPlan #cats{display:none!important}
  /* Store: search first, then My items */
  body.simple #viewPrices #billsSec,body.simple #viewPrices #priceSec:not(.sOpen),body.simple #viewPrices #othersSec,body.simple #viewPrices .ptiles,body.simple #viewPrices #pSearch,body.simple #viewPrices #pListLbl,body.simple #viewPrices #pListRes,body.simple #viewPrices #pCheaper{display:none!important}
  body.simple #viewPrices #shopBox{display:flex!important;flex-direction:column;gap:8px;margin-bottom:16px}
  body.simple #viewPrices #pAddItem{display:flex!important;align-items:center;justify-content:center;gap:8px;width:100%;min-height:44px;margin:0 0 16px}
  body.simple #viewPrices #pAddItem svg{width:20px;height:20px}
  body.simple #shopBox .shSearch{display:flex;align-items:center;gap:8px;min-height:48px;padding:0 12px;border-radius:14px;background:#fff;border:1px solid #E2E8F0;box-sizing:border-box}
  body.simple #shopBox .shSearch svg{width:20px;height:20px;color:#64748B;flex:none}
  body.simple #shopBox .shSearch input{flex:1;min-width:0;border:0!important;background:transparent!important;font-size:16px;font-family:inherit;color:#0F172A;outline:none;padding:0!important;margin:0!important;box-shadow:none!important;height:46px}
  body.simple #shopBox .shPhoto{display:flex!important;align-items:center;justify-content:center;gap:8px;min-height:48px;margin:0;cursor:pointer;color:#2563EB;font-weight:500}
  body.simple #shopBox .shPhoto svg,body.simple #shopBox .shAi svg{width:22px;height:22px}
  body.simple #shopBox .busy{opacity:.55;pointer-events:none}
  body.simple #shopBox .shTip{margin:-4px 0 0;text-align:center;font-size:12px;color:#64748B}
  body.simple #shopBox .shMsg{margin:8px 4px 0;font-size:14px;color:#64748B}
  body.simple #shopBox .shCount{margin:8px 4px 0;font-size:13px;font-weight:600;color:#0F2A4A}
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
  body.simple #shopRes{background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:4px 12px}
  body.simple #shopRes:empty{display:none}
  body.simple #pCats,body.simple #pSubCats{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin:8px 0 0;padding-bottom:2px}
  body.simple #pCats::-webkit-scrollbar,body.simple #pSubCats::-webkit-scrollbar{display:none}
  body.simple #pCats .chip,body.simple #pSubCats .chip{flex:none;min-height:36px;padding:0 12px;font-size:14px;white-space:nowrap}
  /* Forsa: no counters, no hunt word list */
  body.simple #viewForsa .ptiles,body.simple #viewForsa #fTerms{display:none!important}
  /* portrait only */
  #rotMsg{display:none}
  @media (orientation:landscape) and (max-height:500px){#rotMsg{display:flex;position:fixed;inset:0;z-index:2000;background:#F8FAFC;color:#0F2A4A;flex-direction:column;align-items:center;justify-content:center;gap:12px;font-size:16px;text-align:center;padding:24px}#rotMsg svg{width:48px;height:48px}}
  `;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* greeting */
  let name = "";
  function greet(){ const h = new Date().getHours();
    const g = h >= 4 && h < 12 ? L("Good morning","صباح الخير") : h >= 12 && h < 17 ? L("Good afternoon","مساء الخير") : L("Good evening","مساء الخير");
    const d = new Date().toLocaleDateString(ar ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB", {weekday:"long", day:"numeric", month:"long"});
    const el = $("sGreet"); if(!el) return;
    el.innerHTML = `<b></b><span></span>`; el.firstChild.textContent = name ? g + L(", ","، ") + name : g; el.lastChild.textContent = d; }
  const gr = document.createElement("div"); gr.id = "sGreet"; gr.setAttribute("data-noi18n", ""); $("wTitle").before(gr); greet();
  (window.claude && claude.use("db") || Promise.resolve(null)).then(db => db && db.doc("settings/profile").get()).then(p => {
    const x = p && p.exists ? (p.data() || {}) : {}; if(x.name){ name = String(x.name).trim().split(/\s+/)[0]; greet(); } }).catch(() => {});
  document.addEventListener("visibilitychange", () => { if(!document.hidden) greet(); });

  /* 4 tabs */
  const TABN = {tabBal:["Wallet","المحفظة"], tabPlan:["Expenses","المصاريف"], tabPrices:["Store","المتجر"], tabForsa:["Forsa","فرصة"]};
  const nav = document.querySelector("nav.tabs"); if(nav) nav.setAttribute("data-noi18n", "");
  Object.entries(TABN).forEach(([id, [en, a]]) => { const b = $(id); if(b){ b.textContent = L(en, a); b.removeAttribute("data-orig"); } });
  // Wallet first, then Expenses, Store, Forsa
  try { const grps = nav.querySelectorAll(".tabgrp"); grps[0].append($("tabBal")); grps[0].append($("tabPlan")); grps[2].prepend($("tabPrices")); } catch(e){}

  /* a plain title on each tab */
  [["viewBal","Your money","فلوسك"],["viewPlan","Expenses","المصاريف"],["viewPrices","Store","المتجر"],["viewForsa","Forsa","فرصة"]].forEach(([v, en, a]) => {
    const view = $(v); if(!view) return; const h = document.createElement("h2"); h.className = "sTitle"; h.setAttribute("data-noi18n", ""); h.textContent = L(en, a); view.prepend(h); });

  /* every section open (not saved to the account, so the full version keeps its own layout) */
  function openAll(){ document.querySelectorAll(".view section.collapsed").forEach(s => s.classList.remove("collapsed")); }
  openAll(); new MutationObserver(openAll).observe(document.querySelector(".wrap"), {subtree:true, attributes:true, attributeFilter:["class"]});

  /* Store: search by name or photo at the top; "+ Add item" shows the price form */
  try { const sb = $("shopBox"), sec = sb.closest("section"); const ai = $("pAddItem"); const view = $("viewPrices");
    view.insertBefore(sb, view.querySelector("section")); sb.hidden = false; if(window._shopPrep) window._shopPrep();
    ai.innerHTML = ico("plus-circle") + "<span>" + L("Add an item and its price","أضف صنف وسعره") + "</span>"; ai.setAttribute("data-noi18n", "");
    sb.after(ai);
    ai.addEventListener("click", () => { const ps = $("priceSec"); ps.classList.toggle("sOpen"); if(ps.classList.contains("sOpen")){ ai.after(ps); setTimeout(() => { const f = $("pStore"); if(f) f.focus(); }, 50); } });
  } catch(e){ console.error(e); }

  /* Expenses: the "Add a cost" form needs no section header */
  try { const lg = $("log"); lg.classList.remove("collapsed"); } catch(e){}

  /* Settings: nothing about layouts (simple version has none) */
  ["sEdit","sReset","sDesc"].forEach(id => { const e = $(id); const r = e && e.closest(".row"); if(r) r.style.display = "none"; });
  /* Settings: a way back to the full version (kept at /backup3/) */
  try { const t = $("sTour"); if(t){ t.style.display = "none"; const s2 = $("sSetupTour"); if(s2) s2.style.display = "none";
    const a = document.createElement("a"); a.className = "row"; a.href = "backup3/"; a.setAttribute("data-noi18n", ""); a.style.textDecoration = "none";
    a.innerHTML = "<span></span><span class=val></span>"; a.firstChild.textContent = L("Open the full version","افتح النسخة الكاملة"); t.before(a); } } catch(e){}

  /* portrait only */
  try { const rm = document.createElement("div"); rm.id = "rotMsg"; rm.setAttribute("role", "alert"); rm.setAttribute("data-noi18n", "");
    rm.innerHTML = ico("device-mobile") + "<span>" + L("Turn your phone upright to use the wallet","أعد الهاتف للوضع العمودي لاستخدام المحفظة") + "</span>"; document.body.appendChild(rm);
    screen.orientation && screen.orientation.lock && screen.orientation.lock("portrait").catch(() => {}); } catch(e){}

  /* opens on Wallet */
  const h = location.hash.slice(1);
  if(typeof showTab === "function") showTab(["plan","prices","forsa","bal"].includes(h) ? h : "bal");
})();
