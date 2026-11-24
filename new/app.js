/* Simple wallet (test page at /simple). Reads the same signed-in data as the full app; the full app is not changed.
   Layers: home cards -> card grows into its page -> rows dig deeper on each tap (row -> parts -> full details). */
(function(){
let AR=false;try{AR=localStorage.getItem("w-lang")==="ar"}catch(e){}
document.documentElement.dir=AR?"rtl":"ltr";document.documentElement.lang=AR?"ar":"en";
const RS="⃁",tx=(e,a)=>AR?a:e,_nf=new Intl.NumberFormat("en-US"),fmt=n=>_nf.format(Math.round(n)),M=v=>`<bdi dir="ltr">${RS}${typeof v=="number"?fmt(v):v}</bdi>`;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const G="#64748B",LN="#E2E8F0",ink="#0F172A",GR="#16A34A",NAVY="#0F2A4A",BLUE="#2563EB",AMB="#F59E0B",ACC={w:NAVY,e:NAVY,s:GR,f:AMB},fl="";
const e3=x=>x<0?0:x>1?1:1-Math.pow(1-x,3),lerp=(a,b,p)=>a+(b-a)*p,cl=x=>x<0?0:x>1?1:x,ez=e3;
const pad=n=>String(n).padStart(2,"0"),ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const norm=s=>String(s||"").trim().replace(/\s+/g," "),keyOf=p=>(norm(p.item)+"|"+norm(p.size)).toLowerCase();
const K={
 line:(a,c,p,o={})=>{const w=o.w||172,h=o.h||46,mx=Math.max(...a),mn=Math.min(...a),n=Math.max(2,Math.ceil(a.length*p)),P=a.slice(0,n).map((v,i)=>[i*(w-6)/(a.length-1)+3,4+(h-8)*(1-(v-mn)/(mx-mn||1))]),d=P.map((q,i)=>(i?"L":"M")+q[0].toFixed(1)+","+q[1].toFixed(1)).join(""),L=P.at(-1);
  return `<svg width="${w}" height="${h}"${fl}>${o.area!==0?`<path d="${d}L${L[0]},${h}L3,${h}Z" fill="${c}" opacity=".12"/>`:""}<path d="${d}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>${o.mark!=null&&n>o.mark?`<circle cx="${P[o.mark][0]}" cy="${P[o.mark][1]}" r="3" fill="#fff" stroke="${G}" stroke-width="1.5"/>`:""}<circle cx="${L[0]}" cy="${L[1]}" r="4" fill="${c}" stroke="#fff" stroke-width="2"/></svg>`},
 bars:(a,c,p,o={})=>{const w=o.w||172,h=o.h||46,mx=Math.max(...a),gap=o.gap||5,bw=(w-gap*(a.length-1))/a.length;
  return `<svg width="${w}" height="${h+(o.lab?14:0)}"${fl}>${a.map((v,i)=>{const hh=Math.max(3,h*v/mx*p),hi=o.hi==null?i==a.length-1:o.hi.includes(i);return `<rect x="${i*(bw+gap)}" y="${h-hh}" width="${bw}" height="${hh}" rx="${Math.min(3,bw/2)}" fill="${hi?c:(o.mute||LN)}"/>`+(o.lab?`<text x="${i*(bw+gap)+bw/2}" y="${h+12}" font-size="10" fill="${G}" text-anchor="middle">${o.lab[i]}</text>`:"")}).join("")}</svg>`},
 ring:(v,c,p,lab)=>{const s=50,r=20,L=2*Math.PI*r;return `<div style="display:flex;align-items:center;gap:10px"><div style="text-align:end;font-size:12px;color:${G};line-height:1.3">${lab}</div><svg width="${s}" height="${s}"><circle cx="25" cy="25" r="${r}" fill="none" stroke="${c}" stroke-opacity=".18" stroke-width="7"/><circle cx="25" cy="25" r="${r}" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${L*v*p} ${L}" transform="rotate(-90 25 25)"/><text x="25" y="29" font-size="12" font-weight="600" text-anchor="middle" fill="${ink}">${Math.round(v*100*p)}%</text></svg></div>`},
 track:(v,c,p,l,r,o={})=>`<div style="width:172px"><div style="display:flex;justify-content:space-between;margin-bottom:6px;color:${G}"><span>${l}</span><span style="color:${o.rc||G};font-weight:${o.rc?600:400}">${r}</span></div><div style="height:8px;border-radius:4px;background:${c}26;position:relative;overflow:hidden"><i style="position:absolute;inset-block:0;inset-inline-start:0;width:${v*p*100}%;background:${c};border-radius:4px"></i></div></div>`,
 rows:(rs,p)=>`<div style="width:172px;display:grid;gap:3px">${rs.map(([n,v,c,f],i)=>`<div style="display:flex;align-items:center;gap:8px;opacity:${e3(p*3-i)}"><span style="flex:0 0 58px;white-space:nowrap;color:${i?G:ink}">${n}</span><span style="flex:1;height:6px;border-radius:3px;background:${LN};position:relative"><i style="position:absolute;inset-block:0;inset-inline-start:0;width:${f*100*p}%;background:${c};border-radius:3px"></i></span><b style="font-weight:600;color:${c==LN?G:ink};min-width:30px;text-align:end">${v}</b></div>`).join("")}</div>`,
 list:(rs,p)=>`<div style="width:172px;display:grid;gap:2px">${rs.map(([n,v,c],i)=>`<div style="display:flex;justify-content:space-between;opacity:${e3(p*3-i)};color:${ink}"><span>${n}</span><b style="font-weight:600;color:${c}">${v}</b></div>`).join("")}</div>`,
 gauge:(v,c,p,lab)=>{const r=34,L=Math.PI*r;return `<div style="display:flex;align-items:flex-end;gap:10px"><div style="font-size:12px;color:${G};text-align:end;line-height:1.3">${lab}</div><svg width="80" height="44"><path d="M6,40 A34,34 0 0 1 74,40" fill="none" stroke="${c}" stroke-opacity=".18" stroke-width="8" stroke-linecap="round"/><path d="M6,40 A34,34 0 0 1 74,40" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${L*v*p} ${L}"/></svg></div>`},
 dots:(n,f,c,p,lab)=>`<div style="width:172px"><div style="display:grid;grid-template-columns:repeat(15,1fr);gap:4px">${Array.from({length:n},(_,i)=>`<i style="aspect-ratio:1;border-radius:50%;background:${i<f*p?c:c+"2e"}"></i>`).join("")}</div><div style="display:flex;justify-content:space-between;margin-top:6px;color:${G}">${lab}</div></div>`,
 strike:(a,b,item,c,p)=>`<div style="text-align:end"><div style="font-size:12px;color:${G}">${item}</div><div style="display:flex;align-items:baseline;gap:8px;justify-content:flex-end;margin-top:2px"><span style="color:${G};font-size:15px;text-decoration:line-through;opacity:${e3(p*2)}">${M(a)}</span><span style="color:${G};opacity:${e3(p*2-.6)}">${AR?"←":"→"}</span><span style="color:${c};font-size:22px;font-weight:700;opacity:${e3(p*2-1)}">${M(b)}</span></div></div>`,
 donut:(seg,p,leg)=>{const r=19,L=2*Math.PI*r;let acc=0;return `<div style="display:flex;align-items:center;gap:10px"><div style="display:grid;gap:2px;font-size:12px">${leg.map(([n,c])=>`<span style="display:flex;align-items:center;gap:5px;color:${ink}"><i style="width:7px;height:7px;border-radius:50%;background:${c}"></i>${n}</span>`).join("")}</div><svg width="50" height="50">${seg.map(([v,c])=>{const s=`<circle cx="25" cy="25" r="${r}" fill="none" stroke="${c}" stroke-width="9" stroke-dasharray="${Math.max(0,L*v*p-2)} ${L}" stroke-dashoffset="${-L*acc*p}" transform="rotate(-90 25 25)"/>`;acc+=v;return s}).join("")}</svg></div>`},
 heat:(a,c,p)=>`<div style="width:172px"><div style="display:grid;grid-template-columns:repeat(12,1fr);gap:3px">${a.map((v,i)=>`<i style="aspect-ratio:1;border-radius:3px;background:${i<a.length*p?(v==2?ACC.e:v==1?GR+"cc":GR+"40"):LN}"></i>`).join("")}</div></div>`,
 twin:(rs,p)=>`<div style="width:172px;display:grid;gap:6px">${rs.map(([n,v,f,c])=>`<div style="display:flex;align-items:center;gap:8px"><span style="flex:0 0 40px;color:${G}">${n}</span><span style="flex:1;height:10px;border-radius:5px;background:transparent;position:relative"><i style="position:absolute;inset-block:0;inset-inline-start:0;width:${f*p*100}%;background:${c};border-radius:5px"></i></span><b style="font-weight:600;color:${ink};min-width:34px;text-align:end">${v}</b></div>`).join("")}</div>`,
};

// ---------- same categories as the full app ----------
const ITEMS=[["Must pay","rent","Rent"],["Must pay","iqama","Iqama"],["Must pay","car","Car payment"],["Must pay","util","Bills"],["Must pay","phone","Phone"],["Must pay","family","Family"],
 ["Living","food","Eating out"],["Living","coffee","Coffee"],["Living","grocery","Grocery"],["Living","market","Supermarket"],["Living","fuel","Fuel"],["Living","carcare","Car care"],
 ["Personal","smoke","Smoking"],["Personal","fun","Fun"],["Personal","shop","Shopping"],["Personal","flex","Other"],
 ["Saving","ef","Emergency fund"],["Saving","debt","Debt"],["Saving","goals","Goals"]].map(([g,k,s])=>({g,k,s}));
const AR_N={rent:"الإيجار",iqama:"الإقامة",car:"قسط السيارة",util:"الفواتير",phone:"الجوال",family:"العائلة",food:"مطاعم",coffee:"قهوة",grocery:"بقالة",market:"سوبرماركت",fuel:"بنزين",carcare:"صيانة السيارة",smoke:"تدخين",fun:"ترفيه",shop:"تسوق",flex:"أخرى",ef:"صندوق الطوارئ",debt:"الديون",goals:"الأهداف"};
const LOG_CATS=["coffee","food","grocery","market","smoke","fun","fuel","carcare","shop","flex","util","phone","family","car","rent","iqama","debt"];
let BY={},D={};const nm=k=>(BY[k]&&BY[k].custom)?BY[k].s:(AR?(AR_N[k]||(BY[k]||{}).s||k):((BY[k]||{}).s||k));
// clean long names (ads, receipts) into short product names
const clean=t=>{t=norm(String(t||"").replace(/[^\p{L}\p{N}\s.+\-]/gu," "));const L=t.toLowerCase();
 if(/ps\s?5|playstation\s*5|بلايستيشن\s*5|سوني\s*5/.test(L))return "PS5";const ip=L.match(/iphone\s*(\d+)(\s*pro)?(\s*max)?/);if(ip)return ("iPhone "+ip[1]+(ip[2]?" Pro":"")+(ip[3]?" Max":"")).trim();
 if(/airpods?/.test(L))return /pro/.test(L)?"AirPods Pro":"AirPods";const w=t.split(" ");let o="";for(const x of w){if((o+" "+x).trim().length>20)break;o=(o+" "+x).trim()}return o||t.slice(0,20)};
// ---------- item groups (same rule as the full app: the bill's store decides first, item words after) ----------
const PG=[["groc","Groceries","بقالة"],["cafe","Coffee shops","مقاهي"],["food","Restaurants","مطاعم"],["elec","Electronics","إلكترونيات"],["home","Household","المنزل"],["other","Other","أخرى"]];
const PST=[["groc",/panda|danube|tamimi|othaim|lulu|carrefour|nesto|\bfarm\b|bin ?dawood|manuel|spinneys|\bnana\b|hyper|super ?market|mini ?market|grocery|baqala|al ?raya|sadhan|ramez|aswaq|بنده|دانوب|التميمي|تميمي|العثيم|عثيم|لولو|كارفور|نستو|المزرعة|بن داود|مانويل|سبينيس|نانا|هايبر|سوبر ?ماركت|ماركت|بقالة|الراية|السدحان|رامز|أسواق|اسواق/i],
 ["cafe",/barn|starbucks|dunkin|tim horton|costa|half million|\bdose\b|brew ?92|overdose|kyan|caribou|arabica|coffee|cafe|café|بارنز|ستاربكس|دانكن|تيم هورتنز|كوستا|هاف مليون|كيان|كاريبو|قهوة|كافيه|مقهى/i],
 ["food",/mcdonald|kfc|albaik|al baik|kudu|herfy|burger king|hardee|pizza|domino|papa john|shawarma|subway|maestro|five guys|shake shack|texas chicken|popeyes|restaurant|grill|talabat|hungerstation|jahez|مطعم|ماكدونالدز|كنتاكي|البيك|كودو|هرفي|هارديز|بيتزا|دومينوز|شاورما|مايسترو|طلبات|هنقرستيشن|جاهز/i],
 ["elec",/extra|jarir|x-?cite|eros|virgin mega|apple store|electronics|إكسترا|اكسترا|جرير|إلكترونيات|الكترونيات/i],
 ["home",/ikea|home ?cent(re|er)|home ?box|pan ?emirates|abyat|ashley|midas|al ?mutlaq|ace hardware|saco|furniture|ايكيا|إيكيا|هوم سنتر|هوم بوكس|أبيات|ميداس|المطلق|ساكو|أثاث|مفروشات/i]];
const PW=[["cafe",/frapp|latte|cappuccino|espresso|americano|macchiato|mocha|flat white|cortado|cold brew|لاتيه|كابتشينو|اسبريسو|موكا/i],
 ["elec",/phone|charger|cable|headphone|earbud|airpods|laptop|tablet|ipad|\btv\b|monitor|speaker|power ?bank|kettle|blender|air ?fryer|vacuum|microwave|fridge|router|playstation|ps5|جوال|شاحن|سماعة|لابتوب|شاشة|تلفزيون|غلاية|خلاط|قلاية|مكنسة|ميكرويف|ثلاجة/i],
 ["home",/chair|\btables?\b|desk|sofa|couch|\bbed\b|mattress|wardrobe|cabinet|shelf|lamp|curtain|carpet|\brug\b|pillow|blanket|mirror|كرسي|طاولة|كنب|سرير|مرتبة|دولاب|خزانة|ستارة|سجاد|مخدة|بطانية|مرآة/i],
 ["groc",/milk|laban|yog|cheese|butter|egg|labneh|meat|chicken|fish|tuna|bread|toast|apple|banana|tomato|potato|onion|rice|pasta|flour|sugar|salt|oil|sauce|water|juice|soda|pepsi|tea|chip|chocolate|biscuit|nut|frozen|detergent|tide|tissue|shampoo|toothpaste|soap|diaper|pampers|wipes|mushroom|nutella|حليب|لبن|جبن|زبد|بيض|لحم|دجاج|سمك|خبز|طماطم|بطاطس|رز|أرز|سكر|ملح|زيت|ماء|مياه|عصير|شاي|شيبس|شوكولات|بسكويت|منظف|مناديل|شامبو|صابون|حفاض/i]];
const grpOf=(stores,item)=>{const n={};stores.forEach(s=>{s=norm(s);if(!s||/\((online|shared)\)/i.test(s))return;const t=(PST.find(x=>x[1].test(s))||["shop"])[0];n[t]=(n[t]||0)+1});
 const st=Object.keys(n).sort((a,b)=>n[b]-n[a])[0],w=(PW.find(x=>x[1].test(item))||["other"])[0];
 if(st&&st!="shop")return st;if(st=="shop")return w=="groc"||w=="cafe"||w=="elec"?w:"home";return w};
const grpName=k=>{const g=PG.find(x=>x[0]==k)||PG.at(-1);return tx(g[1],g[2])};
const byGroup=(list,fn)=>PG.map(([k])=>[k,list.filter(x=>x.grp==k)]).filter(([,a])=>a.length).map(([k,a])=>`<h5 class="gh">${grpName(k)} · ${a.length}</h5>`+a.map(fn).join("")).join("");
// ---------- data ----------
const SB_URL="https://rvqjjbgeossfygaglohe.supabase.co",SB_KEY="sb_publishable_DSFK-TyIwyuAzYjF0mWWNA_vOedk4zz";
const sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,lock:async(n,t,fn)=>fn()}});
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,10);
async function put(coll,id,data){const {error}=await sb.from("app_docs").upsert({coll,id,data,updated_at:new Date().toISOString()},{onConflict:"user_id,coll,id"});if(error)throw error}
async function load(){
 const C=["expenses","income","debts","goals","prices","products","deals","settings"];let rows=[],from=0;
 for(;;){const {data,error}=await sb.from("app_docs").select("coll,id,data").in("coll",C).range(from,from+999);if(error)throw error;rows=rows.concat(data);if(data.length<1000)break;from+=1000}
 const by={};C.forEach(c=>by[c]=[]);rows.forEach(r=>by[r.coll].push(Object.assign({id:r.id},r.data||{})));
 const set=Object.fromEntries(by.settings.map(x=>[x.id,x]));
 let shared=[],community=[];try{const r=await sb.rpc("shared_deals");if(Array.isArray(r.data))shared=r.data.map(x=>Object.assign({id:x.id,shared:true},x.data||{}))}catch(e){}
 try{const r=await sb.rpc("community_prices");if(Array.isArray(r.data))community=r.data}catch(e){}
 return {by,set,shared,community}}
function model(R){
 const {by,set}=R,prof=set.profile||{},cards=set.cards||{},plan=(set.plan||{}).items||{};
 const items=ITEMS.map(i=>Object.assign({},i));(cards.added||[]).forEach(a=>{if(a&&a.k&&!items.some(i=>i.k==a.k))items.push({g:a.g||"Personal",k:a.k,s:String(a.s||a.n||"New"),custom:true})});
 Object.entries(cards.names||{}).forEach(([k,v])=>{const it=items.find(i=>i.k==k);if(it&&v&&v.s){it.s=String(v.s);it.custom=true}});
 const hidden=new Set(cards.hidden||[]);BY=Object.fromEntries(items.map(i=>[i.k,i]));
 const now=new Date(),today=ymd(now),mon=today.slice(0,7),payday=+prof.payday>=1&&+prof.payday<=31?+prof.payday:10,income=+prof.income||0;
 let next=new Date(now.getFullYear(),now.getMonth(),payday);if(next<=new Date(now.getFullYear(),now.getMonth(),now.getDate()))next=new Date(now.getFullYear(),now.getMonth()+1,payday);
 const prev=new Date(next.getFullYear(),next.getMonth()-1,payday),cycle=Math.round((next-prev)/864e5),toPay=Math.ceil((next-new Date(now.getFullYear(),now.getMonth(),now.getDate()))/864e5);
 const ex=by.expenses.map(x=>({id:x.id,date:String(x.date||""),amount:+x.amount||0,cat:String(x.cat||"flex"),note:String(x.note||""),createdAt:+x.createdAt||0})).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt);
 const inc=by.income.map(x=>({amount:+x.amount||0,date:String(x.date||""),type:String(x.type||""),note:String(x.note||""),createdAt:+x.createdAt||0}));
 const bs=set.balance,start=bs?{cash:+bs.cash||0,bank:+bs.bank||0,asOf:String(bs.asOf||"0000-00-00"),at:+bs.at||0}:null,after=x=>!start||x.date>start.asOf||(x.date==start.asOf&&x.createdAt>start.at);
 const balance=start?start.cash+start.bank+inc.filter(after).reduce((a,x)=>a+x.amount,0)-ex.filter(after).reduce((a,x)=>a+x.amount,0):null;
 const monthEx=ex.filter(x=>x.date.startsWith(mon)),spent={};monthEx.forEach(x=>spent[x.cat]=(spent[x.cat]||0)+x.amount);
 const todayEx=ex.filter(x=>x.date==today),todaySum=todayEx.reduce((a,x)=>a+x.amount,0);
 const days7=[...Array(7)].map((_,i)=>{const d=new Date(now);d.setDate(d.getDate()-6+i);const k=ymd(d);return ex.filter(x=>x.date==k).reduce((a,x)=>a+x.amount,0)});
 const last30=[...Array(30)].map((_,i)=>{const d=new Date(now);d.setDate(d.getDate()-30+i);return ymd(d)}),usual=ex.filter(x=>x.date>=last30[0]&&x.date<today&&LOG_CATS.slice(0,10).includes(x.cat)).reduce((a,x)=>a+x.amount,0)/30;
 const todayDaily=todayEx.filter(x=>LOG_CATS.slice(0,10).includes(x.cat)).reduce((a,x)=>a+x.amount,0);
 const planOf=k=>+((plan[k]||{}).plan)||0,vis=items.filter(i=>!hidden.has(i.k));
 // prices
 const prices=by.prices.map(p=>({item:norm(p.item),size:norm(p.size),store:norm(p.store).replace(/\s*\((shared|online)\)/i,m=>m),price:+p.price||0,date:String(p.date||""),createdAt:+p.createdAt||0})).filter(p=>p.item&&p.price>0);
 const groups=new Map();prices.forEach(p=>{const k=keyOf(p);if(!groups.has(k))groups.set(k,{k,item:p.item,size:p.size,recs:[]});groups.get(k).recs.push(p)});
 const photos={};by.products.forEach(x=>{if(x.key&&x.url)photos[String(x.key)]=String(x.url)});
 const G2=[...groups.values()].map(g=>{g.recs.sort((a,b)=>(b.date||"").localeCompare(a.date||"")||b.createdAt-a.createdAt);const st=new Map();g.recs.forEach(r=>{if(!st.has(r.store))st.set(r.store,r)});g.stores=[...st.values()].sort((a,b)=>a.price-b.price);g.best=g.stores[0];g.last=g.recs[0];g.photo=photos[g.k]||"";g.grp=grpOf(g.recs.map(x=>x.store),g.item);
  const hist=g.recs.filter(r=>r.store==g.last.store).slice(0,8).reverse();g.hist=hist.map(r=>r.price);g.drop=hist.length>1&&hist.at(-1).price<hist.at(-2).price?{from:hist.at(-2).price,to:hist.at(-1).price}:null;return g}).sort((a,b)=>(b.last.date||"").localeCompare(a.last.date||""));
 const shopKeys=((set.shopping||{}).keys||[]).map(String),list=shopKeys.map(k=>G2.find(g=>g.k==k)).filter(Boolean);
 // deals
 const own=by.deals,seen=new Set(own.map(d=>d.id)),deals=own.concat(R.shared.filter(d=>!seen.has(d.id))).map(v=>({id:v.id,title:String(v.title||"Listing"),name:clean(v.title),source:String(v.source||""),url:/^https:\/\//.test(v.url||"")?v.url:"",price:+v.price||0,market:+v.market||0,pct:Math.round(+v.pct||0),city:String(v.city||""),offer:String(v.offer||""),code:String(v.code||""),ends:String(v.ends||""),status:String(v.status||""),foundAt:+v.foundAt||0,category:String(v.category||""),image:/^https:\/\//.test(v.image||"")?v.image:""})).filter(d=>d.status!="hidden"&&d.status!="dismissed").sort((a,b)=>(b.pct-a.pct)||(b.foundAt-a.foundAt));
 const hunt=set.hunt||{};
 const debts=by.debts.map(d=>({name:String(d.name||"Debt"),total:+d.total||0,paid:+d.paid||0})),goals=by.goals.map(g=>({name:String(g.name||"Goal"),target:+g.target||0,saved:+g.saved||0}));
 const mineK=new Set(G2.map(g=>(g.item+"|"+g.size).toLowerCase())),ob=new Map();
 (R.community||[]).forEach(c=>{const it=norm(c.item),sz=norm(c.size),st=norm(c.store),pr=+c.price||0;if(!it||!(pr>0)||/\((shared|online)\)/i.test(st))return;const k=(it+"|"+sz).toLowerCase();if(mineK.has(k))return;const o=ob.get(k);if(!o||pr<o.price)ob.set(k,{k,item:it,size:sz,store:st,price:pr,people:+c.people||1,date:String(c.last_date||"")})});
 const others=[...ob.values()].map(o=>Object.assign(o,{grp:grpOf([o.store],o.item)})).sort((a,b)=>a.item.localeCompare(b.item));
 return {others,prof,name:String(prof.name||"").split(" ")[0],income,payday,toPay,cycle,next,balance,start,ex,inc,monthEx,spent,todayEx,todaySum,todayDaily,usual,days7,items:vis,planOf,G2,list,shopKeys,deals,hunt,debts,goals,today,mon,community:R.community}}
// ---------- page pieces ----------
const sec=(h,b)=>`<div class="sec"><h4>${h}</h4>${b}</div>`;
const tiles=a=>`<div class="tiles">${a.map(([l,v,c])=>`<div class="tile"><small>${l}</small><b style="${c?"color:"+c:""}">${v}</b></div>`).join("")}</div>`;
const rows=(a)=>a.map(([n,v,c])=>`<div class="r"><span>${n}</span><b style="${c?"color:"+c:""}">${v}</b></div>`).join("");
const dig=(head,l2,l3)=>`<div class="bg dg" data-lv="0"><div class="r dh">${head}<span class="chev">›</span></div><div class="lv l2"><div class="pad">${l2}${l3?`<div class="more">${tx("Tap for more","اضغط للمزيد")}</div>`:""}</div></div><div class="lv l3"><div>${l3||""}</div></div></div>`;
const r2=a=>a.map(([n,v,p,c])=>`<div class="r2"><span>${n}</span>${p!=null?`<span class="bar"><i style="width:${Math.min(1,p)*100}%;${c?"background:"+c:""}"></i></span>`:"<span></span>"}<b>${v}</b></div>`).join("");
const r3=a=>a.map(([n,v])=>`<div class="r3"><b>${n}</b><span>${v}</span></div>`).join("");
const hd=(n,v,c,img)=>`${img!=null?(img?`<img class="pimg" src="${esc(img)}" alt="" loading="lazy">`:`<span class="pimg">${PH("shopping-cart")}</span>`):""}<span class="nm">${n}</span><b style="${c?"color:"+c:""}">${v}</b>`;
const when=d=>{const t=ymd(new Date()),y=new Date();y.setDate(y.getDate()-1);return d==t?tx("Today","اليوم"):d==ymd(y)?tx("Yesterday","أمس"):d.slice(5).replace("-","/")};
function build(m){
 const groupSum=(ks)=>ks.reduce((a,k)=>a+m.planOf(k),0),spentOf=ks=>ks.reduce((a,k)=>a+(m.spent[k]||0),0);
 const GR4=[[tx("Must pay","الالتزامات"),m.items.filter(i=>i.g=="Must pay").map(i=>i.k)],[tx("Living","المعيشة"),m.items.filter(i=>i.g=="Living"||i.g=="Personal").map(i=>i.k)],[tx("Saving","الادخار"),m.items.filter(i=>i.g=="Saving"&&i.k!="debt").map(i=>i.k)],[tx("Debt","الديون"),["debt"]]];
 const catEntries=k=>m.monthEx.filter(x=>x.cat==k);
 const budget=GR4.map(([n,ks],gi)=>{const pl=groupSum(ks),sp=spentOf(ks);
  let l2=r2(ks.filter(k=>m.planOf(k)>0||(m.spent[k]||0)>0).map(k=>[nm(k),M(m.planOf(k)),m.planOf(k)?(m.spent[k]||0)/m.planOf(k):null]));
  let l3=ks.map(k=>{const es=catEntries(k);return es.length?[nm(k),es.slice(0,4).map(x=>`${when(x.date)} · ${M(x.amount)}${x.note?" · "+esc(x.note):""}`).join("<br>")+(es.length>4?`<br>${tx("and","و")} ${es.length-4} ${tx("more","غيرها")}`:"")]:null}).filter(Boolean);
  if(gi==2&&m.goals.length){l2+=r2(m.goals.map(g=>[esc(g.name),M(g.saved),g.target?g.saved/g.target:null]));l3=l3.concat(m.goals.map(g=>[esc(g.name),tx(`${M(g.saved)} of ${M(g.target)}`,`${M(g.saved)} من ${M(g.target)}`)]))}
  if(gi==3&&m.debts.length){l2+=r2(m.debts.map(d=>[esc(d.name),M(Math.max(0,d.total-d.paid)),d.total?d.paid/d.total:null,GR]));const T=m.debts.reduce((a,d)=>a+d.total,0),P=m.debts.reduce((a,d)=>a+d.paid,0);l3=l3.concat([[tx("Total debt","مجموع الديون"),M(T)],[tx("Paid so far","سددت لين الحين"),M(P)],[tx("Left","الباقي"),M(T-P)]])}
  const st=m.income?Math.round(pl/m.income*100)+tx("% of salary","٪ من الراتب"):"";
  return `<div class="bg dg" data-lv="0"><div class="r" style="flex-wrap:wrap;row-gap:6px"><span style="flex:1;font-weight:600">${n}</span><b>${M(pl)}</b><span class="chev">›</span><span style="flex-basis:100%;display:flex;align-items:center;gap:8px"><span class="bar" style="flex:1;width:auto"><i style="width:${pl?Math.min(1,sp/pl)*100:0}%"></i></span><small style="color:${G};font-size:12px;min-width:90px;text-align:end">${tx("spent","صرفت")} ${M(sp)}</small></span></div><div class="lv l2"><div class="pad">${l2||`<div class="empty">${tx("No plan set","ما فيه خطة")}</div>`}${l3.length?`<div class="more">${tx("Tap for more","اضغط للمزيد")}</div>`:""}</div></div><div class="lv l3"><div>${l3.length?r3(l3):""}</div></div></div>`+(st?"":"")}).join("");
 const monIn=m.inc.filter(x=>x.date.startsWith(m.mon)).reduce((a,x)=>a+x.amount,0),monOut=m.monthEx.reduce((a,x)=>a+x.amount,0),planned=m.items.reduce((a,i)=>a+m.planOf(i.k),0);
 const W=[tiles([[tx("Salary in","الراتب بعد"),tx(`${m.toPay} days`,`${m.toPay} يوم`)],[tx("Left to plan","باقي بدون خطة"),M(Math.max(0,m.income-planned))]]),
  sec(tx("Monthly budget","الميزانية الشهرية"),budget),
  sec(tx("Money in and out","الداخل والطالع"),`<div class="tiles"><div class="tile" style="background:${GR}14"><small>${tx("Money in","الداخل")}</small><b style="color:${GR}"><bdi dir="ltr">+${RS}${fmt(monIn)}</bdi></b><small>${tx("this month","هالشهر")}</small></div><div class="tile"><small>${tx("Money out","الطالع")}</small><b>${M(monOut)}</b><small>${tx("this month","هالشهر")}</small></div></div>`)];
 // expenses page
 const daily=m.items.filter(i=>i.g=="Living"||i.g=="Personal").map(i=>i.k),dPlan=groupSum(daily),dSpent=spentOf(daily),dom=new Date().getDate();
 const cats=Object.entries(m.spent).sort((a,b)=>b[1]-a[1]),totM=monOut||1;
 const E=[sec(tx("Today","اليوم"),m.todayEx.length?rows(m.todayEx.map(x=>[`${nm(x.cat)}${x.note?` <small class="ds">${esc(x.note)}</small>`:""}`,M(x.amount)])):`<div class="empty">${tx("Nothing yet today","ما فيه شي اليوم")}</div>`),
  sec(tx("Add a cost","أضف مصروف"),`<div class="xadd"><textarea class="sms" rows="1" placeholder="${tx("📋 Paste a bank message","📋 الصق رسالة البنك")}"></textarea><div style="display:flex;gap:8px;margin-top:8px"><input class="xa" inputmode="decimal" placeholder="${tx("Amount","المبلغ")}"><button class="xb">${tx("Add cost","أضف")}</button></div><input class="xa xn" style="margin-top:8px" placeholder="${tx("Note (optional)","ملاحظة (اختياري)")}"><div class="xc">${LOG_CATS.filter(k=>BY[k]).slice(0,10).map((k,i)=>`<button data-k="${k}" class="${i?"":"sel"}">${nm(k)}</button>`).join("")}</div></div>`),
  sec(tx("This month","هالشهر"),tiles([[tx("Spent","صرفت"),M(monOut)],[tx("Per day","باليوم"),M(monOut/dom)],[tx("Left","باقي"),M(Math.max(0,dPlan-dSpent)),GR]])),
  sec(tx("Categories","الفئات"),cats.length?cats.map(([k,v])=>{const es=catEntries(k);return dig(hd(nm(k),M(v)),r2([[tx("Share of month","من الشهر"),Math.round(v/totM*100)+"%",v/totM,ACC.e]])+r2(es.slice(0,5).map(x=>[`${when(x.date)}${x.note?" · "+esc(x.note):""}`,M(x.amount),null])),r3([[tx("Pattern","النمط"),tx(`${es.length} costs, about ${M(v/es.length)} each.`,`${es.length} مصروف، تقريباً ${M(v/es.length)} للواحد.`)]].concat(m.planOf(k)?[[tx("Plan","الخطة"),tx(`${M(v)} of ${M(m.planOf(k))}`,`${M(v)} من ${M(m.planOf(k))}`)]]:[])))}).join(""):`<div class="empty">${tx("No costs this month yet","ما فيه مصاريف هالشهر")}</div>`),
  sec(tx("Entries","السجل"),rows(m.ex.slice(0,15).map(x=>[`${when(x.date)} · ${nm(x.cat)}${x.note?` <small class="ds">${esc(x.note)}</small>`:""}`,M(x.amount)])))];
 // store page
 const itemDig=g=>{const comm=(m.community||[]).filter(c=>String(c.item||"").toLowerCase()==g.item.toLowerCase()&&+c.price>0).sort((a,b)=>a.price-b.price)[0],inList=m.shopKeys.includes(g.k);
  return dig(hd(`<span>${esc(g.item)}</span><small class="ds">${esc([g.size,g.best.store].filter(Boolean).join(" · "))}</small>`,M(g.best.price.toFixed(g.best.price%1?2:0)),GR,g.photo),
   r2(g.stores.slice(0,5).map((r,i)=>[esc(r.store),M(r.price.toFixed(r.price%1?2:0)),g.best.price/r.price,i?LN:GR]))+(g.last&&g.last.store!=g.best.store?r2([[tx("You paid last time","دفعت آخر مرة"),M(g.last.price.toFixed(g.last.price%1?2:0)),null]]):""),
   (g.hist.length>2?`<div class="r3"><b>${tx("Price over time","السعر مع الوقت")}</b>${K.line(g.hist,ACC.s,1,{w:300,h:44,area:0,mark:0})}</div>`:"")+r3([[tx("Saved prices","أسعار محفوظة"),tx(`${g.recs.length} prices at ${g.stores.length} stores`,`${g.recs.length} سعر في ${g.stores.length} متجر`)]].concat(comm?[[tx("Other shoppers","متسوقين ثانيين"),tx(`${M(comm.price)} at ${esc(comm.store)}`,`${M(comm.price)} في ${esc(comm.store)}`)]]:[]))+`<div class="r3"><button class="tbtn" data-list="${esc(g.k)}">${inList?tx("Remove from shopping list","شيله من قائمة التسوق"):tx("Add to shopping list","أضفه لقائمة التسوق")}</button></div>`)};
 const storeTot=new Map();m.list.forEach(g=>g.stores.forEach(r=>{const s=storeTot.get(r.store)||{n:0,sum:0};s.n++;s.sum+=r.price;storeTot.set(r.store,s)}));
 const listBest=[...storeTot.entries()].sort((a,b)=>b[1].n-a[1].n||a[1].sum-b[1].sum);
 const cheapCount=new Map();m.G2.forEach(g=>{if(g.best)cheapCount.set(g.best.store,(cheapCount.get(g.best.store)||0)+1)});
 const S=[sec(tx("Shopping list","قائمة التسوق")+` · ${m.list.length}`,m.list.length?m.list.map(itemDig).join("")+(listBest.length?r3([[tx("Best store for your list","أفضل متجر لقائمتك"),tx(`${esc(listBest[0][0])} has ${listBest[0][1].n} of ${m.list.length} items for ${M(listBest[0][1].sum)}`,`${esc(listBest[0][0])} عنده ${listBest[0][1].n} من ${m.list.length} أغراض بـ ${M(listBest[0][1].sum)}`)]]).replace('class="r3"','class="r3" style="background:#F2F2F7;border-radius:12px;margin-top:8px"'):""):`<div class="empty">${tx("Your list is empty. Open an item below and tap Add to shopping list.","قائمتك فاضية. افتح غرض تحت واضغط أضفه للقائمة.")}</div>`),
  sec(tx("My items","أغراضي")+` · ${m.G2.length}`,byGroup(m.G2.slice(0,60),itemDig)||`<div class="empty">${tx("No prices yet","ما فيه أسعار")}</div>`),
  // Beshr 2026-11-24: keep the main idea: what other shoppers bought that you haven't, in its own list, same groups (no names shown)
  sec(tx("Other shoppers' items","أغراض المتسوقين الثانيين")+` · ${m.others.length}`,m.others.length?byGroup(m.others.slice(0,60),o=>dig(hd(`<span>${esc(o.item)}</span><small class="ds">${esc([o.size,o.store].filter(Boolean).join(" · "))}</small>`,M(o.price.toFixed(o.price%1?2:0)),GR,""),
   r2([[tx("Bought by","اشتراه"),o.people==1?tx("1 person","شخص واحد"):tx(`${o.people} people`,`${o.people} أشخاص`),null]])+`<div style="padding:0 12px 10px"><button class="tbtn" style="background:#F2F2F7" data-oadd="${esc(o.k)}">${tx("+ Add to My items","+ أضفه لأغراضي")}</button></div>`,"")):`<div class="empty">${tx("Nothing from other shoppers yet. Items they add show here.","ما فيه شي من المتسوقين الثانيين للحين. اللي يضيفونه يطلع هنا.")}</div>`),
  sec(tx("Stores","المتاجر"),[...cheapCount.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6).map(([s,n])=>dig(hd(esc(s),tx(`${n} cheapest`,`${n} الأرخص`)),r2(m.G2.filter(g=>g.best&&g.best.store==s).slice(0,6).map(g=>[esc(g.item),M(g.best.price.toFixed(g.best.price%1?2:0)),null])),"")).join(""))];
 // forsa page
 const F=[(m.hunt.terms||[]).length?sec(tx("You're hunting","تدور على"),`<div class="hchips">${m.hunt.terms.slice(0,12).map(t=>`<span>${esc(clean(t))}</span>`).join("")}</div>`):"",
  sec(tx("Deals for you","صفقات لك")+` · ${m.deals.length}`,m.deals.slice(0,30).map(d=>dig(hd(`<span>${esc(d.name)}</span><small class="ds">${esc([d.source,d.city].filter(Boolean).join(" · "))}</small>`,d.price?M(d.price):"",AMB,d.image),
   r2([d.market?[tx("Usual price","السعر المعتاد"),`<s style="color:${G}">${M(d.market)}</s>`,null]:null,d.pct?[tx("Below market","أقل من السوق"),d.pct+"%",d.pct/100,AMB]:null,d.offer?[esc(d.offer),"",null]:null].filter(Boolean)),
   r3([[tx("Full title","العنوان كامل"),esc(d.title)]].concat(d.code?[[tx("Code","الكود"),esc(d.code)]]:[]).concat(d.ends?[[tx("Ends","ينتهي"),esc(d.ends)]]:[]))+(d.url?`<div class="r3"><a class="lnk" href="${esc(d.url)}" target="_blank" rel="noopener">${tx("Open listing","افتح الإعلان")} ›</a></div>`:""))).join("")||`<div class="empty">${tx("No deals yet","ما فيه صفقات")}</div>`)];
 return {w:W,e:E,s:S,f:F}}
// ---------- home cards ----------
function cards(m){
 const bal=m.balance;
 const w={t:tx("Wallet","المحفظة"),ic:"wallet",v:bal==null?"—":M(bal),line:tx(`Salary in ${m.toPay} days`,`الراتب بعد ${m.toPay} يوم`),chart:(p,o)=>K.dots(30,Math.round((m.cycle-m.toPay)/m.cycle*30),"#FFFFFF",p,`<span style="color:#ffffffa0">${tx("last salary","آخر راتب")}</span><span style="color:#ffffffa0">${tx("next","الجاي")}</span>`),hero:"dots"};
 const diff=Math.round(m.usual-m.todayDaily);
 const e={t:tx("Expenses","المصاريف"),ic:"receipt",v:M(m.todaySum),line:m.usual>0&&diff>0?tx(`${RS}${fmt(diff)} under usual`,`أقل بـ ${RS}${fmt(diff)}`):tx("Today","اليوم"),chart:(p,o)=>K.bars(m.days7.map(v=>v||0.0001),ACC.e,p,o),hero:"bars"};
 const drop=m.G2.find(g=>g.drop),top=m.G2[0];
 const s={t:tx("Store","المتجر"),ic:"shopping-cart",v:drop?esc(drop.best.store):top?esc(top.best.store):"—",line:drop?tx("Price dropped","السعر نزل"):tx(`${m.G2.length} items`,`${m.G2.length} غرض`),
  chart:(p)=>drop?K.strike(drop.drop.from.toFixed(drop.drop.from%1?2:0),drop.drop.to.toFixed(drop.drop.to%1?2:0),esc(drop.item).slice(0,22),ACC.s,p):top?K.strike(top.last.price.toFixed(top.last.price%1?2:0),top.best.price.toFixed(top.best.price%1?2:0),esc(top.item).slice(0,22),ACC.s,p):""};
 const d=m.deals[0];
 const f={t:tx("Forsa","فرصة"),ic:"fire",v:d?esc(d.name):"—",line:d&&d.pct?tx(`${d.pct}% below market`,`أقل ${d.pct}٪`):tx(`${m.deals.length} deals`,`${m.deals.length} صفقة`),chart:p=>d&&d.market?K.strike(fmt(d.market),fmt(d.price),esc(d.source||""),AMB,p):""};
 const livingLeft=m.items.filter(i=>i.g=="Living"||i.g=="Personal").reduce((a,i)=>a+m.planOf(i.k)-(m.spent[i.k]||0),0),newDeals=m.deals.filter(x=>x.foundAt>Date.now()-864e5).length;
 const H={w:livingLeft>0?tx(`${RS}${fmt(livingLeft)} left for living`,`باقي ${RS}${fmt(livingLeft)} للمعيشة`):"",e:m.todayEx.length?m.todayEx.length==1?tx("1 cost today","مصروف واحد اليوم"):tx(`${m.todayEx.length} costs today`,`${m.todayEx.length} مصاريف اليوم`):tx("Nothing spent today","ما صرفت شي اليوم"),s:m.list.length?tx(`${m.list.length} items in your list`,`${m.list.length} أغراض بقائمتك`):tx("Start a shopping list","ابدأ قائمة تسوق"),f:newDeals?tx(`${newDeals} new deals today`,`${newDeals} صفقة جديدة اليوم`):""};
 return {w,e,s,f,H}}
// ---------- UI ----------
let OK="",TL={tap:1e9,open:.42,close:1e9,cd:.34},T0=performance.now();const now=()=>(performance.now()-T0)/1000;
function start(m){
 const C=cards(m),P=build(m),app=document.getElementById("app");const order=["w","e","s","f"],y0=144;
 let vis=0;try{vis=(+localStorage.getItem("s-visit")||0)+1;localStorage.setItem("s-visit",vis)}catch(e){}
 const pool=order.filter(k=>C.H[k]),HK=pool.length?pool[vis%pool.length]:"";
 const HH=order.map(k=>k==HK?142:112),TOPS=order.map((k,i)=>y0+HH.slice(0,i).reduce((a,b)=>a+b+8,0)),APPH=window.APPH||770;
 const hr=new Date().getHours(),greet=hr<12?tx("Good morning","صباح الخير"):hr<18?tx("Good afternoon","مساء الخير"):tx("Good evening","مساء الخير");
 const dstr=new Date().toLocaleDateString(AR?"ar-SA-u-nu-latn-ca-gregory":"en-GB",{weekday:"long",day:"numeric",month:"long"});
 const bandH=TOPS[0]+HH[0]-34,wave=`<svg viewBox="0 0 786 40" preserveAspectRatio="none"><path d="M0,20 C98,0 295,0 393,20 C491,40 688,40 786,20 L786,40 L0,40Z" fill="#16365E"/></svg>`;
 app.innerHTML=`<div id="band" style="height:${bandH}px"><div class="wv">${wave}</div></div><div class="hd"><div class="d">${dstr}</div><h1>${greet}${m.name?tx(", ","، ")+esc(m.name):""}</h1></div><div class="tg"><button id="old" onclick="location.href='../'">${tx("Old app","التطبيق القديم")}</button><button id="lang">${AR?"English":"عربي"}</button></div><div class="srch">${PH("magnifying-glass")}<span>${tx("Search or ask","ابحث أو اسأل")}</span><b class="askb">${PH("sparkle")} ${tx("Ask","اسأل")}</b></div>`
  +order.map((k,i)=>{const c=C[k];return `<div class="card c-${k}" data-k="${k}" style="--acc:${ACC[k]};top:${TOPS[i]}px;height:${HH[i]}px;overflow:hidden"><span class="ctab">${PH(c.ic)}</span><div class="k">${c.t}<span class="tm">${c.line}</span></div><div class="big" style="margin-top:14px;max-width:170px;overflow:hidden;text-overflow:ellipsis">${c.v}</div><div class="vz2"></div><div class="pg">${P[k].join("")}</div></div>`}).join("")
  +`<div class="abar" style="background:none;box-shadow:none;height:84px">${[["plus-circle",tx("Add expense","أضف مصروف"),BLUE],["camera",tx("Add bill","أضف فاتورة"),BLUE],["fire",tx("New hunt","صيد جديد"),BLUE]].map(([i,l,c])=>`<div class="ab" role="button" tabindex="0" style="gap:6px"><span style="width:52px;height:52px;border-radius:26px;background:#fff;display:grid;place-items:center;color:${c};line-height:0;box-shadow:0 8px 20px -8px rgba(0,0,0,.45)">${PH(i)}</span>${l}</div>`).join("")}</div>`
  +(HK?`<div id="chip" style="position:absolute;left:0;right:0;margin:auto;width:max-content;max-width:330px;top:${TOPS[order.indexOf(HK)]+HH[order.indexOf(HK)]-14}px;z-index:15;background:${HK=="f"?"#FEF3C7":"#EEF2F7"};color:${HK=="f"?"#92400E":NAVY};font-size:13px;font-weight:600;padding:6px 12px;border-radius:14px;white-space:nowrap">${PH("sparkle")} ${C.H[HK]}</div>`:"")
  +`<div id="scrim"></div><div id="sheet" role="dialog"></div>`;
 document.getElementById("lang").onclick=()=>{try{localStorage.setItem("w-lang",AR?"en":"ar")}catch(e){}location.reload()};
 const cardEls=[...document.querySelectorAll(".card")];
 function render(){const t=now(),op=t<TL.tap?0:t<TL.close?ez((t-TL.tap)/TL.open):1-ez((t-TL.close)/TL.cd),closing=t>=TL.close,since=t-TL.tap;
  cardEls.forEach((c,i)=>{const k=c.dataset.k,f=k==OK,ht=TOPS[i],h0=HH[i],PT=86,PB=APPH-20,vz=c.querySelector(".vz2"),pg=c.querySelector(".pg");
   if(f){c.style.top=lerp(ht,PT,op)+"px";c.style.height=lerp(h0,PB-PT,op)+"px";c.style.zIndex=20;c.style.borderRadius=lerp(14,22,op)+"px";c.style.boxShadow=op>0?`0 20px 40px -20px rgba(0,0,0,${.25*op})`:"none"}
   else{c.style.opacity=closing&&OK?1-cl(op/0.12):1-cl(op/0.45)}
   c.style.overflowY=f&&op>=1&&!closing?"auto":"hidden";
   const isB=C[k].hero=="bars",isD=C[k].hero=="dots",W=f?lerp(172,isB?329:isD?172*1.85:172*1.35,op):172,H=f&&isB?lerp(46,120,op):46,X=AR?16:f?lerp(173,16,op):173,Y=f?lerp(48,98,op):48;
   Object.assign(vz.style,{left:X+"px",top:Y+"px",width:W+"px",height:(H+4)+"px",alignItems:f&&op>0&&!isB?"flex-start":"flex-end"});
   const p=ez(t/0.7);vz.innerHTML=isB?C[k].chart(p,{w:W,h:H,gap:lerp(5,10,f?op:0)}):`<div style="zoom:${f?lerp(1,isD?1.85:1.35,op):1}">${C[k].chart(p)}</div>`;
   pg.style.top=lerp(h0,isB?232:isD?200:186,f?op:0)+"px";
   pg.style.opacity=f&&!closing?ez(cl((since-0.12)/0.25)):0;pg.querySelectorAll(":scope>*").forEach((e,n)=>{const q=f&&!closing?cl((since-0.2-0.07*n)/0.3):0;e.style.opacity=ez(q);e.style.transform=`translateY(${(1-ez(q))*10}px)`})});
  const fade=1-cl(op/0.45);document.querySelector(".srch").style.opacity=fade;document.querySelector(".abar").style.opacity=fade;document.querySelector(".hd").style.opacity=1;
  const ch=document.getElementById("chip");if(ch){const hc=document.querySelector(`.card[data-k="${HK}"]`),A=HK=="f"?AMB:BLUE,u=t-0.5,v=Math.max(0,u-0.4),g=ez(u/0.4)*(0.7+0.3*Math.cos(2*Math.PI*v/1.2)*Math.exp(-v/1.2)),al=n=>Math.round(Math.min(255,Math.max(0,n*g))).toString(16).padStart(2,"0");
   ch.style.opacity=(u<0?0:1)*fade;ch.style.boxShadow=`0 0 0 1px ${A}88,0 0 ${16*g}px ${A}${al(170)}`;if(op==0)hc.style.boxShadow=`0 0 0 ${1.5*g}px ${A}${al(200)},0 10px ${30*g}px -6px ${A}${al(150)}`;else if(HK!=OK)hc.style.boxShadow="none"}
  if(t>TL.close+TL.cd){OK="";TL.tap=TL.close=1e9;cardEls.forEach(c=>{c.style.zIndex="";c.style.boxShadow="none";c.scrollTop=0})}
  requestAnimationFrame(render)}
 requestAnimationFrame(render);
 cardEls.forEach(c=>c.addEventListener("click",ev=>{const t=now();
  const row=ev.target.closest(".bg");if(row&&OK){const lv=(+row.dataset.lv+1)%(row.querySelector(".l3>div").innerHTML.trim()?3:2);row.dataset.lv=lv;return}
  if(ev.target.closest(".xadd,.tbtn,a"))return;
  if(!OK){OK=c.dataset.k;TL.tap=t;TL.close=1e9;c.scrollTop=0;return}
  if(OK==c.dataset.k&&t>TL.tap+TL.open&&TL.close>1e8){const go=()=>{TL.close=now()};if(c.scrollTop>4){c.scrollTo({top:0,behavior:"smooth"});setTimeout(go,280)}else go()}}));
 // ---- writes ----
 const toast=msg=>{app.insertAdjacentHTML("beforeend",`<div class="toast">${msg}</div>`);const el=app.querySelector(".toast:last-child");setTimeout(()=>el.remove(),1900)};
 const addCost=async(amount,cat,note)=>{const d=ymd(new Date());await put("expenses",newId(),{date:d,amount:Math.round(amount*100)/100,cat,note:String(note||"").slice(0,120),createdAt:Date.now()})};
 const reload=()=>setTimeout(()=>location.reload(),900);
 { const c=document.querySelector('.card[data-k="e"]'),x=c.querySelector(".xadd");
   x.querySelectorAll(".xc button").forEach(b=>b.onclick=()=>{x.querySelectorAll(".xc button").forEach(y=>y.classList.remove("sel"));b.classList.add("sel")});
   const sm=x.querySelector(".sms"),a=x.querySelector(".xa");sm.addEventListener("input",()=>{const mm=sm.value.replace(/,/g,"").match(/(\d+(?:\.\d+)?)\s*(?:SAR|ر\.س|ريال)?/i);if(mm)a.value=mm[1]});
   x.querySelector(".xb").onclick=async()=>{const v=+a.value;if(!(v>0))return;try{await addCost(v,x.querySelector(".xc .sel").dataset.k,x.querySelector(".xn").value||sm.value.slice(0,60));toast(tx("Added","انضاف"));reload()}catch(e){toast(tx("Couldn't save","ما انحفظ"))}}; }
 document.querySelectorAll(".tbtn[data-oadd]").forEach(b=>b.onclick=async()=>{const o=m.others.find(x=>x.k==b.dataset.oadd);if(!o)return;b.disabled=true;try{await put("prices",newId(),{item:o.item.slice(0,80),price:Math.round(o.price*100)/100,store:(o.store||"Store not set").slice(0,50)+" (shared)",size:o.size.slice(0,40),date:o.date||ymd(new Date()),createdAt:Date.now()});toast(tx("Added to My items","انضاف لأغراضك"));reload()}catch(e){b.disabled=false;toast(tx("Couldn't save","ما انحفظ"))}});
 document.querySelectorAll(".tbtn[data-list]").forEach(b=>b.onclick=async()=>{const k=b.dataset.list,keys=m.shopKeys.includes(k)?m.shopKeys.filter(x=>x!=k):m.shopKeys.concat(k);try{await put("settings","shopping",{keys});toast(tx("List updated","انحدثت القائمة"));reload()}catch(e){toast(tx("Couldn't save","ما انحفظ"))}});
 const sh=document.getElementById("sheet"),sc=document.getElementById("scrim"),close=()=>{sh.classList.remove("on");sc.classList.remove("on")};sc.onclick=close;
 const show=(a,html,init)=>{sh.style.setProperty("--a",a);sh.innerHTML=`<div class="grab"></div>`+html;sh.classList.add("on");sc.classList.add("on");init()};
 const ACT=[()=>show(ACC.e,`<h3><span style="color:${ACC.e};line-height:0">${PH("plus-circle")}</span>${tx("Add expense","أضف مصروف")}</h3><div class="amt"><span>${RS}</span><input id="amt" inputmode="decimal" placeholder="0"></div><div class="chips">${LOG_CATS.filter(k=>BY[k]).slice(0,10).map((k,i)=>`<button data-k="${k}" class="${i?"":"sel"}">${nm(k)}</button>`).join("")}</div><input class="txt" id="nt" placeholder="${tx("Note (optional)","ملاحظة (اختياري)")}"><button class="go" id="sv" disabled>${tx("Save","حفظ")}</button>`,()=>{
   const a=document.getElementById("amt"),b=document.getElementById("sv");setTimeout(()=>a.focus(),350);a.oninput=()=>{b.disabled=!(+a.value>0)};
   sh.querySelectorAll(".chips button").forEach(x=>x.onclick=()=>{sh.querySelectorAll(".chips button").forEach(y=>y.classList.remove("sel"));x.classList.add("sel")});
   b.onclick=async()=>{b.disabled=true;try{await addCost(+a.value,sh.querySelector(".chips .sel").dataset.k,document.getElementById("nt").value);close();toast(tx("Saved","انحفظ"));reload()}catch(e){b.disabled=false;toast(tx("Couldn't save","ما انحفظ"))}}}),
  ()=>{toast(tx("Opening your full app to read the bill","أفتح التطبيق الكامل لقراءة الفاتورة"));setTimeout(()=>location.href="../",700)},
  ()=>show(AMB,`<h3><span style="color:#B45309;line-height:0">${PH("fire")}</span>${tx("New hunt","صيد جديد")}</h3><input class="txt" id="hq" placeholder="${tx("What are you looking for?","وش تدور؟")}"><div class="chips">${(m.hunt.terms||[]).slice(0,6).map(t=>`<span class="opt">${esc(clean(t))}</span>`).join("")}</div><button class="go" id="hs">${tx("Start hunting","ابدأ الصيد")}</button>`,()=>{
   const q=document.getElementById("hq"),b=document.getElementById("hs");setTimeout(()=>q.focus(),350);
   b.onclick=async()=>{const v=norm(q.value);if(!v)return;b.disabled=true;const h=Object.assign({},m.hunt);h.terms=(h.terms||[]).filter(x=>x.toLowerCase()!=v.toLowerCase()).concat(v);h.requestedAt=Date.now();try{await put("settings","hunt",h);close();toast(tx("Hunt saved. Results come at the next check.","انحفظ. النتائج بالفحص الجاي."));reload()}catch(e){b.disabled=false;toast(tx("Couldn't save","ما انحفظ"))}}})];
 document.querySelectorAll(".abar .ab").forEach((b,i)=>b.onclick=()=>{if(!OK)ACT[i]()});
 // ---- search (your own data) ----
 document.querySelector(".srch").onclick=()=>{if(OK)return;show(ACC.w,`<h3><span style="color:${ACC.w};line-height:0">${PH("magnifying-glass")}</span>${tx("Search","بحث")}</h3><input class="txt" id="sq" placeholder="${tx("Milk, coffee, PS5…","حليب، قهوة، PS5…")}"><div class="res3" id="sres" style="max-height:52vh;overflow:auto"></div>`,()=>{
  const q=document.getElementById("sq"),out=document.getElementById("sres");setTimeout(()=>q.focus(),350);
  q.oninput=()=>{const v=q.value.trim().toLowerCase();if(v.length<2){out.innerHTML="";return}
   const it=m.G2.filter(g=>g.item.toLowerCase().includes(v)).slice(0,6),ex=m.ex.filter(x=>x.note.toLowerCase().includes(v)||nm(x.cat).toLowerCase().includes(v)).slice(0,6),dl=m.deals.filter(d=>d.title.toLowerCase().includes(v)).slice(0,6);
   out.innerHTML=(it.length?`<h5>${tx("Items","الأغراض")}</h5>`+rows(it.map(g=>[`${esc(g.item)} <small class="ds">${esc(g.best.store)}</small>`,M(g.best.price.toFixed(g.best.price%1?2:0)),GR])):"")+(ex.length?`<h5>${tx("Costs","المصاريف")}</h5>`+rows(ex.map(x=>[`${when(x.date)} · ${nm(x.cat)}${x.note?` <small class="ds">${esc(x.note)}</small>`:""}`,M(x.amount)])):"")+(dl.length?`<h5>${tx("Deals","الصفقات")}</h5>`+rows(dl.map(d=>[esc(d.name),d.price?M(d.price):"",AMB])):"")||`<div class="empty">${tx("Nothing found","ما لقيت شي")}</div>`}})};
}
// ---------- boot ----------
(function fit(){const w=document.documentElement.clientWidth,h=document.documentElement.clientHeight||innerHeight,s=Math.min(w/393,h/770,1.25),a=document.getElementById("app");window.APPH=Math.max(770,h/s);a.style.height=window.APPH+"px";a.style.transform=`translateX(-50%) scale(${s})`})();
const gate=(html)=>{document.getElementById("app").insertAdjacentHTML("beforeend",`<div id="gate"><div>${html}</div></div>`)};
(async()=>{try{const {data}=await sb.auth.getSession();if(!data||!data.session){gate(`${tx("Sign in on your wallet app first, then come back here.","سجّل دخولك في تطبيق المحفظة أول، بعدين ارجع هنا.")}<br><a href="../">${tx("Open the wallet app","افتح تطبيق المحفظة")}</a>`);return}
 gate(`<span class="think" style="justify-content:center"><i></i>${tx("Loading your data","أحمّل بياناتك")}</span>`);
 const R=await load();const m=model(R);document.getElementById("gate").remove();start(m)}
 catch(e){gate(`${tx("Couldn't load your data. Check your connection and reload.","ما قدرت أحمّل بياناتك. تأكد من الاتصال وحدّث الصفحة.")}<br><small style="color:${G}">${esc(e&&e.message||e)}</small>`)}})();
})();
