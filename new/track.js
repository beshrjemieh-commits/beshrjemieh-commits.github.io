// Usage events (Business lead + Security, approved by Beshr 2026-11-25). Sends only screen/feature names, never amounts, item names or message text.
// Writes through the log_events RPC only; random install id (not the account); queue in memory; nothing sent while "Share usage" is off.
(function(){
 const K="w-usage",ID="w-install",ok=()=>{try{return localStorage.getItem(K)!=="off"}catch(e){return false}};
 let inst="";try{inst=localStorage.getItem(ID)||"";if(!inst){inst=(crypto.randomUUID&&crypto.randomUUID())||String(Date.now())+Math.random().toString(36).slice(2);localStorage.setItem(ID,inst)}}catch(e){}
 const clean=v=>String(v==null?"":v).toLowerCase().replace(/[^a-z0-9_]/g,"_").slice(0,32);
 let q=[],busy=false;
 async function flush(){if(busy||!q.length)return;if(!ok()){q=[];return}const sb=window._sb;if(!sb||!inst)return;busy=true;
  try{while(q.length){const p=q.splice(0,20);const ver=((document.querySelector('script[src*="app.js?v="]')||{}).src||"").split("v=")[1]||"";
   const {error}=await sb.rpc("log_events",{p,p_install:inst,p_ver:clean(ver),p_lang:(document.documentElement.lang=="ar"?"ar":"en")});if(error){q=[];break}}}catch(e){q=[]}busy=false}
 window.track=(name,screen,item)=>{if(!ok())return;if(q.length>=200)q.shift();const nz=v=>clean(v)||null;q.push({name:clean(name)||"event",screen:nz(screen),item:nz(item)})};
 window.trackOn=on=>{try{localStorage.setItem(K,on?"on":"off")}catch(e){}if(!on)q=[]};window.trackIsOn=ok;
 // Invite a friend (Business lead, approved by Beshr 2026-11-25): link carries only 8 chars of the random install id
 window.trackRef=()=>inst.replace(/-/g,"").slice(0,8);
 try{const u=new URL(location.href),r=clean(u.searchParams.get("ref")).slice(0,8);if(r){if(!localStorage.getItem("w-ref")&&r!==window.trackRef()){localStorage.setItem("w-ref",r);window.track("invited_by","onboard",r)}u.searchParams.delete("ref");history.replaceState(null,"",u.pathname+u.search+u.hash)}}catch(e){}
 setInterval(flush,30000);document.addEventListener("visibilitychange",()=>{if(document.hidden)flush()});
})();
