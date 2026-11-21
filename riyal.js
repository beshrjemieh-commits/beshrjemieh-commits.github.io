/* Saudi Riyal symbol (U+20C1, SAMA 2025) instead of "SAR"/"ريال" next to amounts, in English and Arabic.
   The symbol comes from the open-source "saudi_riyal" font (OFL, fonts/riyal-LICENSE.txt) for phones whose fonts don't have it yet. */
(function(){
  const R = "⃁";
  const NUM = "[−-]?\\d[\\d,]*(?:\\.\\d+)?";
  const after = new RegExp("(" + NUM + ")[ \\u00A0]*(?:SAR|ريال|ر\\.س)(?![A-Za-z\\u0600-\\u06FF])", "g");
  const before = new RegExp("(?:SAR|ريال)[ \\u00A0]+(" + NUM + ")", "g");
  const label = /\((?:SAR|ريال)\)/g;
  const fix = s => s.replace(after, (m, n) => n.replace(/^([−-]?)/, "$1" + R)).replace(before, (m, n) => n.replace(/^([−-]?)/, "$1" + R)).replace(label, "(" + R + ")");
  function doText(n){ const p = n.parentElement; if(!p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName) || p.isContentEditable) return;
    const v = n.nodeValue; if(!/SAR|ريال|ر\.س/.test(v)) return; const r = fix(v); if(r !== v) n.nodeValue = r; }
  function doEl(el){ for(const a of ["placeholder","aria-label","title"]){ const v = el.getAttribute && el.getAttribute(a); if(v && /SAR|ريال/.test(v)){ const r = fix(v); if(r !== v) el.setAttribute(a, r); } } }
  function walk(root){ if(root.nodeType === 3){ doText(root); return; } if(root.nodeType !== 1) return; doEl(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT); let n; while((n = w.nextNode())){ if(n.nodeType === 3) doText(n); else doEl(n); } }
  // run after the Arabic translation has changed a node (it fires first), so both languages end with the symbol
  const mo = new MutationObserver(list => { for(const m of list){ if(m.type === "characterData") doText(m.target); else if(m.type === "attributes") doEl(m.target); else m.addedNodes.forEach(walk); } });
  const start = () => { walk(document.body); mo.observe(document.body, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:["placeholder","aria-label","title"]}); };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.RIYAL = R;
})();
