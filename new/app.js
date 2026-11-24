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
const DCOL=["#0F2A4A","#2F5583","#5B82B0","#8FB0D3","#BFD2E6","#F59E0B","#CBD5E1"];
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
 strike:(a,b,item,c,p)=>String(a)==String(b)?`<div style="text-align:end"><div style="font-size:12px;color:${G}">${item}</div><div style="margin-top:2px;color:${c};font-size:22px;font-weight:700;opacity:${e3(p*2-1)}">${M(b)}</div></div>`:`<div style="text-align:end"><div style="font-size:12px;color:${G}">${item}</div><div style="display:flex;align-items:baseline;gap:8px;justify-content:flex-end;margin-top:2px"><span style="color:${G};font-size:15px;text-decoration:line-through;opacity:${e3(p*2)}">${M(a)}</span><span style="color:${G};opacity:${e3(p*2-.6)}">${AR?"←":"→"}</span><span style="color:${c};font-size:22px;font-weight:700;opacity:${e3(p*2-1)}">${M(b)}</span></div></div>`,
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
 const own=by.deals,seen=new Set(own.map(d=>d.id)),deals=own.concat(R.shared.filter(d=>!seen.has(d.id))).map(v=>({raw:v,id:v.id,title:String(v.title||"Listing"),name:clean(v.title),source:String(v.source||""),url:/^https:\/\//.test(v.url||"")?v.url:"",price:+v.price||0,market:+v.market||0,pct:Math.round(+v.pct||0),city:String(v.city||""),offer:String(v.offer||""),code:String(v.code||""),ends:String(v.ends||""),status:String(v.status||""),foundAt:+v.foundAt||0,category:String(v.category||""),image:/^https:\/\//.test(v.image||"")?v.image:""})).filter(d=>d.status!="hidden"&&d.status!="dismissed").sort((a,b)=>(b.pct-a.pct)||(b.foundAt-a.foundAt));
 const hunt=set.hunt||{};
 const debts=by.debts.map(d=>({name:String(d.name||"Debt"),total:+d.total||0,paid:+d.paid||0})),goals=by.goals.map(g=>({name:String(g.name||"Goal"),target:+g.target||0,saved:+g.saved||0}));
 const mineK=new Set(G2.map(g=>(g.item+"|"+g.size).toLowerCase())),ob=new Map();
 (R.community||[]).forEach(c=>{const it=norm(c.item),sz=norm(c.size),st=norm(c.store),pr=+c.price||0;if(!it||!(pr>0)||/\((shared|online)\)/i.test(st))return;const k=(it+"|"+sz).toLowerCase();if(mineK.has(k))return;const o=ob.get(k);if(!o||pr<o.price)ob.set(k,{k,item:it,size:sz,store:st,price:pr,people:+c.people||1,date:String(c.last_date||"")})});
 const others=[...ob.values()].map(o=>Object.assign(o,{grp:grpOf([o.store],o.item)})).sort((a,b)=>a.item.localeCompare(b.item));
 return {planRaw:plan,photos,others,prof,name:String(prof.name||"").split(" ")[0],income,payday,toPay,cycle,next,balance,start,ex,inc,monthEx,spent,todayEx,todaySum,todayDaily,usual,days7,items:vis,planOf,G2,list,shopKeys,deals,hunt,debts,goals,today,mon,community:R.community}}
// ---------- page pieces ----------
const sec=(h,b)=>`<div class="sec"><h4>${h}</h4>${b}</div>`;
const tiles=a=>`<div class="tiles">${a.map(([l,v,c])=>`<div class="tile"><small>${l}</small><b style="${c?"color:"+c:""}">${v}</b></div>`).join("")}</div>`;
const rows=(a)=>a.map(([n,v,c])=>`<div class="r"><span>${n}</span><b style="${c?"color:"+c:""}">${v}</b></div>`).join("");
const dig=(head,l2,l3)=>`<div class="bg dg" data-lv="0"><div class="r dh">${head}<span class="chev">›</span></div><div class="lv l2"><div class="pad">${l2}${l3?`<div class="more">${tx("Tap for more","اضغط للمزيد")}</div>`:""}</div></div><div class="lv l3"><div>${l3||""}</div></div></div>`;
const r2=a=>a.map(([n,v,p,c])=>`<div class="r2"><span>${n}</span>${p!=null?`<span class="bar"><i style="width:${Math.min(1,p)*100}%;${c?"background:"+c:""}"></i></span>`:"<span></span>"}<b>${v}</b></div>`).join("");
const r3=a=>a.map(([n,v])=>`<div class="r3"><b>${n}</b><span>${v}</span></div>`).join("");
const hd=(n,v,c,img)=>`${img!=null?(img?`<img class="pimg" src="${esc(img)}" alt="" loading="lazy">`:`<span class="pimg">${PH("shopping-cart")}</span>`):""}<span class="nm">${n}</span><b style="${c?"color:"+c:""}">${v}</b>`;
const when=d=>{const t=ymd(new Date()),y=new Date();y.setDate(y.getDate()-1);return d==t?tx("Today","اليوم"):d==ymd(y)?tx("Yesterday","أمس"):d.slice(5).replace("-","/")};
// Bill reading: the "ai" Edge Function (Claude) reads a photo or PDF of a receipt
async function fileBlock(f){if(f.type=="application/pdf"){const b=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result));r.onerror=no;r.readAsDataURL(f)});return {type:"document",source:{type:"base64",media_type:"application/pdf",data:b.slice(b.indexOf(",")+1)}}}
 const im=await new Promise((ok,no)=>{const u=URL.createObjectURL(f),i=new Image();i.onload=()=>{URL.revokeObjectURL(u);ok(i)};i.onerror=()=>{URL.revokeObjectURL(u);no({code:"image_rejected"})};i.src=u});
 const k=Math.min(1,Math.sqrt(1.6e6/(im.naturalWidth*im.naturalHeight))),c=document.createElement("canvas");c.width=Math.max(1,Math.round(im.naturalWidth*k));c.height=Math.max(1,Math.round(im.naturalHeight*k));c.getContext("2d").drawImage(im,0,0,c.width,c.height);const u=c.toDataURL("image/jpeg",.88);
 return {type:"image",source:{type:"base64",media_type:"image/jpeg",data:u.slice(u.indexOf(",")+1)}}}
async function readBill(f){const {data:{session}}=await sb.auth.getSession();if(!session)throw {code:"session_expired"};
 const prompt=`This is a supermarket or shop receipt from Saudi Arabia (text may be Arabic, English or both). Read it and return ONLY JSON in this shape:
{"store": "shop name in English if possible", "date": "YYYY-MM-DD or empty", "total": number or null, "items": [{"item": "product name, English if possible, keep the brand", "size": "pack size like 2 L, 500 g, 12 pcs, or empty", "price": number}]}
Rules: price is the price of ONE unit in SAR (if the line shows quantity 3 and 15.00, price is 5.00). Leave out discounts, VAT lines, bags, totals and payment lines. If you cannot read a value, skip that item.`;
 const res=await fetch(SB_URL+"/functions/v1/ai",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+session.access_token,apikey:SB_KEY},body:JSON.stringify({messages:[{role:"user",content:[await fileBlock(f),{type:"text",text:prompt}]}],tier:"default",json:true})});
 const j=await res.json().catch(()=>({}));if(!res.ok||j.error)throw {code:(j.error&&j.error.code)||"upstream_error"};
 const t=(j.content||[]).filter(b=>b.type=="text").map(b=>b.text).join("").replace(/^[^{]*/,"").replace(/[^}]*$/,"");const o=JSON.parse(t||"{}");
 return {store:norm(o.store).slice(0,60),date:/^\d{4}-\d{2}-\d{2}$/.test(o.date||"")?o.date:ymd(new Date()),total:parseFloat(o.total)||0,items:(Array.isArray(o.items)?o.items:[]).map(x=>({item:norm(x.item).slice(0,80),size:norm(x.size).slice(0,40),price:Math.round((parseFloat(x.price)||0)*100)/100})).filter(x=>x.item&&x.price>0)}}
// Forsa "Added": grouped by category, then by product (e.g. Electronics → PS5 · 3), price range and the differences side by side (Beshr 2026-11-24)
const DCAT={cars:["Cars","سيارات"],electronics:["Electronics","إلكترونيات"],phones:["Phones","جوالات"],appliances:["Appliances","أجهزة منزلية"],food:["Food offers","عروض الأكل"],clothes:["Clothes","ملابس"],home:["Home","المنزل"],travel:["Travel","سفر"]};
const dCat=d=>{const c=String(d.category||"").toLowerCase();if(DCAT[c])return c;if(/iphone|samsung|galaxy|pixel|جوال|ايفون/i.test(d.title))return "phones";if(/ps5|ps4|playstation|xbox|switch|laptop|macbook|ipad|tv|airpods|camera|بلايستيشن|لابتوب/i.test(d.title))return "electronics";if(/camry|corolla|accord|sonata|elantra|tahoe|land cruiser|كامري|كورولا|سوناتا|النترا|لاندكروزر/i.test(d.title))return "cars";return c||"other"};
const dFam=d=>norm(String(d.name||d.title).replace(/\b(19|20)\d{2}\b|\d+\s?(gb|tb|g)\b|\b(new|used|like new|slim|disc|digital|pro|max|plus)\b/gi," ")).split(" ").slice(0,2).join(" ")||d.name;
const dTags=d=>{const t=d.title,o=[];const y=t.match(/\b(19|20)\d{2}\b/);if(y)o.push(y[0]);const g=t.match(/\d+\s?(GB|TB)\b/i);if(g)o.push(g[0].toUpperCase().replace(/\s/,""));
 if(/like new|كالجديد|شبه جديد/i.test(t))o.push(tx("Like new","كالجديد"));else if(/\bnew\b|جديد/i.test(t))o.push(tx("New","جديد"));else if(/used|مستعمل/i.test(t))o.push(tx("Used","مستعمل"));
 if(/slim/i.test(t))o.push("Slim");if(/digital/i.test(t))o.push("Digital");if(/disc|ديسك/i.test(t))o.push("Disc");if(d.city)o.push(esc(d.city));return o.slice(0,4)};
function addedHTML(list){if(!list.length)return "";const cats={};list.forEach(d=>{const c=dCat(d);(cats[c]=cats[c]||[]).push(d)});
 return Object.entries(cats).sort((a,b)=>b[1].length-a[1].length).map(([c,ds])=>{const fams={};ds.forEach(d=>{const f=dFam(d).toLowerCase();(fams[f]=fams[f]||[]).push(d)});
  return `<div class="acat"><h5>${DCAT[c]?tx(DCAT[c][0],DCAT[c][1]):esc(c.charAt(0).toUpperCase()+c.slice(1))} <span>${ds.length} ${tx("added","مضافة")}</span></h5>`+Object.values(fams).map(g=>{
   if(g.length==1)return dealRow(g[0],1);
   const ps=g.map(d=>d.price).filter(Boolean),lo=Math.min(...ps),hi=Math.max(...ps),best=g.slice().sort((a,b)=>(b.pct-a.pct)||(a.price-b.price))[0];
   return `<div class="afam"><div class="afh"><b>${esc(dFam(g[0]))}</b><span>${g.length}</span><em>${M(lo)} – ${M(hi)}</em></div>`+g.sort((a,b)=>a.price-b.price).map(d=>`<a class="arow${d==best?" best":""}" href="${esc(dLink(d))}" target="_blank" rel="noopener">${d.image?`<img src="${esc(d.image)}" alt="" referrerpolicy="no-referrer">`:`<i class="aph">${PH("fire")}</i>`}<span class="ari"><b>${M(d.price)}${d.pct?` <small>▼${d.pct}%</small>`:""}</b><span class="atags">${dTags(d).map(t=>`<i>${t}</i>`).join("")}${d==best?`<i class="bt">${tx("Best value","أفضل قيمة")}</i>`:""}</span></span><span class="ago">${tx("Open","افتح")}</span></a>`).join("")+
    (hi>lo?`<div class="arng"><i style="inset-inline-start:0;width:100%"></i>${g.map(d=>`<u style="inset-inline-start:${(d.price-lo)/(hi-lo)*100}%"></u>`).join("")}</div><div class="arl"><span>${M(lo)}</span><span>${tx(`${M(hi-lo)} difference`,`فرق ${M(hi-lo)}`)}</span><span>${M(hi)}</span></div>`:"")+`</div>`}).join("")+`</div>`}).join("")}
// Expenses ring for one month (mon = "YYYY-MM"); left = "left for living" (this month only)
const monName=mon=>{const [y,mm]=mon.split("-").map(Number);return new Date(y,mm-1,15).toLocaleDateString(AR?"ar-SA-u-nu-latn-ca-gregory":"en-GB",{month:"long",year:new Date().getFullYear()==y?undefined:"numeric"})};
const prevMon=mon=>{const [y,mm]=mon.split("-").map(Number),d=new Date(y,mm-2,15);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")};
function monCats(m,mon){const sp={};m.ex.filter(x=>x.date.startsWith(mon)).forEach(x=>sp[x.cat]=(sp[x.cat]||0)+x.amount);return Object.entries(sp).sort((a,b)=>b[1]-a[1])}
function ringFor(m,mon,left){const cur=mon==m.mon,cats=monCats(m,mon),tot=cats.reduce((a,x)=>a+x[1],0),[y,mm]=mon.split("-").map(Number),days=cur?new Date().getDate():new Date(y,mm,0).getDate(),
  first=m.ex.reduce((a,x)=>x.date<a?x.date:a,m.mon+"-99").slice(0,7),pm=prevMon(mon),hasPrev=pm>=first;
 const nav=`<div class="mnav"><button data-mnav="${pm}" ${hasPrev?"":"disabled"} aria-label="${tx("Earlier month","الشهر اللي قبل")}">${PH("caret-left")}<span>${hasPrev?monName(pm):""}</span></button><h4>${cur?tx("This month","هالشهر"):monName(mon)}</h4>${cur?`<span class="mnsp"></span>`:`<button data-mnav="${(()=>{const [a,b]=mon.split("-").map(Number),d=new Date(a,b,15);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")})()}" class="mnext"><span>${tx("Next","التالي")}</span>${PH("caret-right")}</button>`}</div>`;
 if(!tot)return nav+`<div class="empty">${tx("No costs this month","ما فيه مصاريف هالشهر")}</div>`;
 const top=cats.slice(0,6),rest=cats.slice(6),seg=top.map(([k,v])=>({k,n:nm(k),v})).concat(rest.length?[{k:"_other",n:tx("Other","أخرى"),v:rest.reduce((a,x)=>a+x[1],0)}]:[]),R=78,L=2*Math.PI*R;let acc=0;
 const arcs=seg.map((x,i)=>{const len=x.v/tot*L,g=seg.length>1?Math.min(3,len/3):0,o=`<circle data-cat="${x.k}" data-mon="${mon}" r="${R}" cx="100" cy="100" fill="none" stroke="${DCOL[i]}" stroke-width="28" stroke-dasharray="${Math.max(.5,len-g)} ${L}" stroke-dashoffset="${-acc}" style="--l:${L}"/>`;acc+=len;return o}).join("");
 return nav+`<div class="dnut"><svg viewBox="0 0 200 200" width="210" height="210" style="transform:rotate(-90deg)">${arcs}</svg><div class="dctr"><small>${tx("Spent","صرفت")}</small><b>${M(tot)}</b><small>${tx(`${M(tot/days)} a day`,`${M(tot/days)} باليوم`)}</small></div></div>
  <div class="dleg">${seg.map((x,i)=>`<button data-cat="${x.k}" data-mon="${mon}"><i style="background:${DCOL[i]}"></i><span>${x.n}</span><b>${M(x.v)}</b><small>${Math.round(x.v/tot*100)}%</small></button>`).join("")}</div>
  ${cur&&left!=null?`<div class="dleft">${tx("Left for living this month","باقي للمعيشة هالشهر")} <b style="color:${GR}">${M(left)}</b></div>`:""}`}
// Forsa: deal link (listing, or a web search for it), tabs by hunt word, one row per deal
const dLink=d=>d.url||"https://www.google.com/search?q="+encodeURIComponent(d.title);
function fTabs(m){const und=m.deals.filter(d=>d.status!="saved"),T=[{n:tx("All","الكل"),list:und}];
 (m.hunt.terms||[]).slice(0,12).forEach(t=>{const w=norm(t).toLowerCase().split(" ").filter(x=>x.length>1);if(!w.length)return;const l=und.filter(d=>{const h=(d.title+" "+d.category).toLowerCase();return w.every(x=>h.includes(x))});if(l.length)T.push({n:esc(clean(t)),list:l})});return T}
const dealRow=(d,kept)=>`<div class="drow" data-did="${esc(d.id)}">`+dig(hd(`<span>${esc(d.name)}</span><small class="ds">${d.price?M(d.price):""}${d.market?` <s>${M(d.market)}</s>`:""}${d.pct?` · ▼${d.pct}%`:""}</small>`,`<a class="fopen" href="${esc(dLink(d))}" target="_blank" rel="noopener">${tx("Open","افتح")}</a>`,"",d.image),
 r2([d.market?[tx("Usual price","السعر المعتاد"),`<s style="color:${G}">${M(d.market)}</s>`,null]:null,d.pct?[tx("Below market","أقل من السوق"),d.pct+"%",d.pct/100,AMB]:null,d.offer?[esc(d.offer),"",null]:null,[tx("Where","وين"),esc([d.source,d.city].filter(Boolean).join(" · ")),null]].filter(Boolean)),
 r3([[tx("Full title","العنوان كامل"),esc(d.title)]].concat(d.code?[[tx("Code","الكود"),esc(d.code)]]:[]).concat(d.ends?[[tx("Ends","ينتهي"),esc(d.ends)]]:[])))+`</div>`;
// Supermarket-style subcategories (same word lists as the full app; Claude's answers saved on this phone are reused)
const SUBC=[["dairy","Dairy & eggs","ألبان وبيض",/milk|laban|yog|cheese|butter|cream|egg|labneh|ghee|kiri|حليب|لبن|زبادي|روب|جبن|زبد|قشط|بيض|لبنة|سمن/i],
 ["meat","Meat & fish","لحوم وأسماك",/meat|beef|lamb|mutton|chicken|poultry|fish|tuna|shrimp|salmon|sausage|burger|mince|kebab|لحم|غنم|بقر|دجاج|فراخ|سمك|تونة|روبيان|جمبري|سلمون|نقانق|برجر|مفروم/i],
 ["bakery","Bakery","مخبوزات",/bread|bun|toast|samoon|croissant|tortilla|pita|khubz|cake|muffin|خبز|صامولي|توست|كرواسون|تورتيلا|كيك|مافن|عيش/i],
 ["produce","Fruit & veg","خضار وفواكه",/apple|banana|orange|tomato|potato|onion|cucumber|lettuce|carrot|lemon|grape|mango|\bdates?\b|berry|melon|pepper|garlic|veg|fruit|herb|parsley|mint|peas|تفاح|موز|برتقال|طماطم|بطاطس|بصل|خيار|خس|جزر|ليمون|عنب|مانجو|تمر|بطيخ|فلفل|ثوم|خضار|فواكه|بقدونس|نعناع|بازلاء/i],
 ["frozen","Frozen","مجمّدات",/frozen|nugget|fries|مجمد|ناجتس/i],
 ["care","Personal care","العناية الشخصية",/shampoo|conditioner|toothpaste|toothbrush|colgate|deodorant|soap|lotion|razor|shave|perfume|sanitizer|cotton|شامبو|بلسم|معجون|فرشاة|مزيل|صابون|لوشن|شفرة|حلاقة|عطر|معقم|قطن/i],
 ["pantry","Rice & pantry","رز ومؤونة",/rice|pasta|spaghetti|macaroni|noodle|flour|sugar|salt|oil|spice|sauce|ketchup|mayo|bean|lentil|chickpea|\bcan\b|canned|honey|jam|cereal|oat|corn|vinegar|paste|hazelnut|nutella|رز|أرز|مكرونة|معكرونة|شعيرية|طحين|دقيق|سكر|ملح|زيت|بهار|صلصة|كاتشب|مايونيز|فول|عدس|حمص|علب|عسل|مربى|شوفان/i],
 ["drinks","Drinks","مشروبات",/water|juice|soda|cola|pepsi|7up|sprite|coffee|tea|nescafe|drink|energy|ماء|مياه|عصير|غازي|بيبسي|كولا|قهوة|شاي|نسكافيه|مشروب/i],
 ["snacks","Snacks & sweets","سناكات وحلويات",/chip|crisp|chocolate|biscuit|cookie|candy|sweet|wafer|\bnuts?\b|popcorn|ice cream|snack|شيبس|شوكولات|بسكويت|حلاو|حلوى|مكسرات|فشار|آيس|ايسكريم|سناك/i],
 ["clean","Cleaning & laundry","تنظيف وغسيل",/detergent|tide|ariel|persil|clorox|bleach|dish|fairy|cleaner|tissue|napkin|kleenex|foil|wrap|trash|garbage|\bbags?\b|sponge|softener|downy|منظف|تايد|آريال|كلوركس|مبيض|صحون|مناديل|كلينكس|قصدير|أكياس|اسفنج|منعم|داوني/i],
 ["baby","Baby","الأطفال",/diaper|pampers|huggies|formula|wipes|baby|حفاض|بامبرز|حليب أطفال|مناديل مبللة|أطفال|رضع/i]];
const SUB_ORDER=["produce","dairy","bakery","meat","frozen","pantry","snacks","drinks","clean","care","baby","gmisc"];
let AICAT={};try{AICAT=JSON.parse(localStorage.getItem("w-pcat")||"{}")||{}}catch(e){}
const subOf=n=>{const ai=AICAT[String(n).toLowerCase()];if(ai&&SUBC.some(c=>c[0]==ai))return ai;if(/baby|diaper|pampers|huggies|حفاض|أطفال/i.test(n))return "baby";for(const c of SUBC)if(c[3].test(n))return c[0];return "gmisc"};
function subsOf(gk,list){if(gk!="groc")return list.length?[{k:"all",n:grpName(gk),list}]:[];const by={};list.forEach(x=>{const k=subOf(x.item);(by[k]=by[k]||[]).push(x)});
 return SUB_ORDER.filter(k=>by[k]).map(k=>{const c=SUBC.find(z=>z[0]==k);return {k,n:c?tx(c[1],c[2]):tx("Other groceries","بقالة أخرى"),list:by[k]}})}
// Store categories: my items and other shoppers' items per group, each with lowest and highest known price
const p2=v=>v.toFixed(v%1?2:0),GIC={groc:"basket",cafe:"coffee",food:"fork-knife",elec:"device-mobile",home:"couch",other:"package"};
function catsOf(m){if(m._cats)return m._cats;const cb=new Map();(m.community||[]).forEach(c=>{const k=norm(c.item).toLowerCase(),pr=+c.price;if(!k||!(pr>0))return;if(!cb.has(k))cb.set(k,[]);cb.get(k).push({store:norm(c.store).replace(/\s*\((shared|online)\)/i,""),price:pr})});
 const rg=(item,own)=>{const seen=new Set(),a=own.concat(cb.get(item.toLowerCase())||[]).filter(x=>x.price>0).sort((x,y)=>x.price-y.price).filter(x=>{const k=x.store.toLowerCase()+"|"+x.price;if(seen.has(k))return false;seen.add(k);return true});return {lo:a[0],hi:a.at(-1),all:a}};
 const mine=m.G2.map(g=>Object.assign({t:"m",k:g.k,item:g.item,size:g.size,photo:g.photo,grp:g.grp,g},rg(g.item,g.stores.map(r=>({store:r.store.replace(/\s*\((shared|online)\)/i,""),price:r.price}))))),
  oth=m.others.map(o=>Object.assign({t:"o",k:o.k,item:o.item,size:o.size,photo:(m.photos||{})[o.k]||"",grp:o.grp,o},rg(o.item,[{store:o.store,price:o.price}])));
 return m._cats=PG.map(([k])=>({k,mine:mine.filter(x=>x.grp==k),oth:oth.filter(x=>x.grp==k)})).filter(c=>c.mine.length+c.oth.length)}
function build(m){
 const groupSum=(ks)=>ks.reduce((a,k)=>a+m.planOf(k),0),spentOf=ks=>ks.reduce((a,k)=>a+(m.spent[k]||0),0);
 const GR4=[[tx("Must pay","الالتزامات"),m.items.filter(i=>i.g=="Must pay").map(i=>i.k)],[tx("Living","المعيشة"),m.items.filter(i=>i.g=="Living"||i.g=="Personal").map(i=>i.k)],[tx("Saving","الادخار"),m.items.filter(i=>i.g=="Saving"&&i.k!="debt").map(i=>i.k)],[tx("Debt","الديون"),["debt"]]];
 const catEntries=k=>m.monthEx.filter(x=>x.cat==k);
 const budget=GR4.map(([n,ks],gi)=>{const pl=groupSum(ks),sp=spentOf(ks);
  let l2=r2(ks.filter(k=>gi==0||m.planOf(k)>0||(m.spent[k]||0)>0).map(k=>[`<span class="pen">${nm(k)}<button class="pedit" data-pe="${k}" aria-label="${tx("Edit","تعديل")}">${PH("pencil-simple")}</button></span>`,M(m.planOf(k)),m.planOf(k)?(m.spent[k]||0)/m.planOf(k):null]));
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
  // Beshr 2026-11-24: one chart instead of rows: ring of this month's categories, centre = total spent (same number as the parts); tap a slice or name for the details
  // Beshr 2026-11-24: ring for this month, arrows step back to earlier months by name
  `<div class="sec ringsec">${ringFor(m,m.mon,dPlan?Math.max(0,dPlan-dSpent):null)}</div>`,
  // Beshr 2026-11-24: entries as a chart: last 14 days, one stacked bar per day (category colours as in the ring); tap a day for its costs
  sec(tx("Last 14 days","آخر 14 يوم"),(()=>{const days=[...Array(14)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);return ymd(d)}),rank=k=>{const i=cats.findIndex(x=>x[0]==k);return i<0||i>5?6:i};
   const per=days.map(d=>{const es=m.ex.filter(x=>x.date==d);return {d,es,t:es.reduce((a,x)=>a+x.amount,0)}}),mx=Math.max(1,...per.map(x=>x.t)),tot=per.reduce((a,x)=>a+x.t,0),big=per.slice().sort((a,b)=>b.t-a.t)[0];
   if(!tot)return `<div class="empty">${tx("No costs in the last 14 days","ما فيه مصاريف آخر 14 يوم")}</div>`;
   return `<div class="ebars" dir="ltr">${per.map((x,i)=>{const by={};x.es.forEach(e=>{const r=rank(e.cat);by[r]=(by[r]||0)+e.amount});return `<button class="eb${i==13?" today":""}" data-day="${x.d}" ${x.t?"":"disabled"}><span class="ebs" style="height:${Math.max(x.t?6:2,x.t/mx*110)}px">${Object.keys(by).sort((p,q)=>p-q).map(r=>`<i style="flex:${by[r]};background:${DCOL[r]}"></i>`).join("")}</span><small>${i%2==1||i==13?+x.d.slice(8):""}</small></button>`}).join("")}</div>
    <div class="eleg"><span>${tx("14 days","14 يوم")} <b>${M(tot)}</b></span><span>${tx("Biggest","الأعلى")} <b>${M(big.t)}</b> · ${when(big.d)}</span></div>`})())];
 // store page
 const itemDig=g=>{const comm=(m.community||[]).filter(c=>String(c.item||"").toLowerCase()==g.item.toLowerCase()&&+c.price>0).sort((a,b)=>a.price-b.price)[0],inList=m.shopKeys.includes(g.k);
  return dig(hd(`<span>${esc(g.item)}</span><small class="ds">${esc([g.size,g.best.store].filter(Boolean).join(" · "))}</small>`,M(g.best.price.toFixed(g.best.price%1?2:0)),GR,g.photo),
   r2(g.stores.slice(0,5).map((r,i)=>[esc(r.store),M(r.price.toFixed(r.price%1?2:0)),g.best.price/r.price,i?LN:GR]))+(g.last&&g.last.store!=g.best.store?r2([[tx("You paid last time","دفعت آخر مرة"),M(g.last.price.toFixed(g.last.price%1?2:0)),null]]):""),
   (g.hist.length>2?`<div class="r3"><b>${tx("Price over time","السعر مع الوقت")}</b>${K.line(g.hist,ACC.s,1,{w:300,h:44,area:0,mark:0})}</div>`:"")+r3([[tx("Saved prices","أسعار محفوظة"),tx(`${g.recs.length} prices at ${g.stores.length} stores`,`${g.recs.length} سعر في ${g.stores.length} متجر`)]].concat(comm?[[tx("Other shoppers","متسوقين ثانيين"),tx(`${M(comm.price)} at ${esc(comm.store)}`,`${M(comm.price)} في ${esc(comm.store)}`)]]:[]))+`<div class="r3"><button class="tbtn" data-list="${esc(g.k)}">${inList?tx("Remove from shopping list","شيله من قائمة التسوق"):tx("Add to shopping list","أضفه لقائمة التسوق")}</button></div>`)};
 const storeTot=new Map();m.list.forEach(g=>g.stores.forEach(r=>{const s=storeTot.get(r.store)||{n:0,sum:0};s.n++;s.sum+=r.price;storeTot.set(r.store,s)}));
 const listBest=[...storeTot.entries()].sort((a,b)=>b[1].n-a[1].n||a[1].sum-b[1].sum);
 const cheapCount=new Map();m.G2.forEach(g=>{if(g.best)cheapCount.set(g.best.store,(cheapCount.get(g.best.store)||0)+1)});
 const CATS=catsOf(m);
 const GAPS=CATS.flatMap(c=>c.mine).filter(x=>x.hi&&x.hi.price>x.lo.price),GAP=GAPS.reduce((a,x)=>a+x.hi.price-x.lo.price,0),TOPG=GAPS.slice().sort((a,b)=>(b.hi.price-b.lo.price)-(a.hi.price-a.lo.price))[0];
 // Beshr 2026-11-24: the price gap is the hook: what choosing the cheapest store saves him
 const S=[GAP>0?`<div class="gaph"><small>${tx("Your price gap","فرق الأسعار عندك")}</small><b>${M(p2(GAP))}</b><span>${tx(`saved if you buy your ${GAPS.length} items at their cheapest store, not the dearest`,`توفّره لو اشتريت ${GAPS.length} من أغراضك من أرخص متجر بدل الأغلى`)}</span>${TOPG?`<em>${tx(`Biggest gap: ${esc(TOPG.item)}, ${M(p2(TOPG.lo.price))} at ${esc(TOPG.lo.store)} vs ${M(p2(TOPG.hi.price))}`,`أكبر فرق: ${esc(TOPG.item)}، ${M(p2(TOPG.lo.price))} في ${esc(TOPG.lo.store)} مقابل ${M(p2(TOPG.hi.price))}`)}</em>`:""}</div>`:"",sec(tx("Shopping list","قائمة التسوق")+` · ${m.list.length}`,m.list.length?m.list.map(itemDig).join("")+(listBest.length?r3([[tx("Best store for your list","أفضل متجر لقائمتك"),tx(`${esc(listBest[0][0])} has ${listBest[0][1].n} of ${m.list.length} items for ${M(listBest[0][1].sum)}`,`${esc(listBest[0][0])} عنده ${listBest[0][1].n} من ${m.list.length} أغراض بـ ${M(listBest[0][1].sum)}`)]]).replace('class="r3"','class="r3" style="background:#F2F2F7;border-radius:12px;margin-top:8px"'):""):`<div class="empty">${tx("Your list is empty. Open a category and tap + on an item.","قائمتك فاضية. افتح قسم واضغط + على أي غرض.")}</div>`),
  // Beshr 2026-11-24 (grocery-app style): categories first; tapping one opens a full window with item tiles, lowest vs highest price
  sec(tx("Categories","الأقسام"),CATS.length?`<div class="ctiles">${CATS.map(c=>`<button class="ctile" data-cat="${c.k}"><span class="ci">${PH(GIC[c.k])}</span><b>${grpName(c.k)}</b><small>${tx(`${c.mine.length+c.oth.length} items`,`${c.mine.length+c.oth.length} غرض`)}</small></button>`).join("")}</div>`:`<div class="empty">${tx("No prices yet","ما فيه أسعار")}</div>`),
  // Beshr 2026-11-24: stores folded into one row; tap shows every store he has prices from
  (()=>{const all=[...new Set(m.G2.flatMap(g=>g.stores.map(r=>r.store)))].sort((x,y)=>(cheapCount.get(y)||0)-(cheapCount.get(x)||0)||x.localeCompare(y));return all.length?`<div class="sec">`+dig(hd(`<span>${tx("Stores registered","المتاجر المسجّلة")}</span>`,String(all.length),""),r2(all.map(st=>[esc(st),cheapCount.get(st)?tx(`${cheapCount.get(st)} cheapest`,`${cheapCount.get(st)} الأرخص`):"",null])),"")+`</div>`:""})()];
 // forsa page
 // forsa page (Beshr 2026-11-24): a calm list first, sorted by his hunt words; a button opens the swipe (Tinder) mode for that tab; kept deals have an Open button
 const FT=fTabs(m),keptL=m.deals.filter(d=>d.status=="saved");
 const F=[sec(tx("Your hunts","بحوثك"),`<div class="ftabs">${FT.map((t,i)=>`<button data-ft="${i}" class="${i?"":"on"}">${t.n} <span>${t.list.length}</span></button>`).join("")}<button class="fnew">${PH("plus-circle")}${tx("New hunt","بحث جديد")}</button></div><button class="fgo">${PH("fire")}<span class="fgot"></span></button>`),
  sec(tx("Added","المضافة")+` · <span class="keptn">${keptL.length}</span>`,`<div class="kept">${addedHTML(keptL)}</div>${keptL.length?"":`<div class="empty kempty">${tx("Deals you swipe right show here, each with an Open button.","الصفقات اللي تسحبها يمين تطلع هنا، ومعها زر افتح.")}</div>`}`)];
 return {w:W,e:E,s:S,f:F}}
// ---------- home cards ----------
function cards(m){
 const bal=m.balance;
 const w={t:tx("Wallet","المحفظة"),ic:"wallet",v:bal==null?"—":M(bal),line:tx(`Salary in ${m.toPay} days`,`الراتب بعد ${m.toPay} يوم`),chart:(p,o)=>K.dots(30,Math.round((m.cycle-m.toPay)/m.cycle*30),"#FFFFFF",p,`<span style="color:#ffffffa0">${tx("last salary","آخر راتب")}</span><span style="color:#ffffffa0">${tx("next","الجاي")}</span>`),hero:"dots"};
 const diff=Math.round(m.usual-m.todayDaily);
 const e={t:tx("Expenses","المصاريف"),ic:"receipt",v:M(m.todaySum),line:m.usual>0&&diff>0?tx(`${RS}${fmt(diff)} under usual`,`أقل بـ ${RS}${fmt(diff)}`):tx("Today","اليوم"),chart:(p,o)=>K.bars(m.days7.map(v=>v||0.0001),ACC.e,p,o),hero:"bars"};
 const drop=m.G2.find(g=>g.drop),top=m.G2.filter(g=>g.last&&g.best&&g.last.price-g.best.price>=.5).sort((a,b)=>(b.last.price-b.best.price)-(a.last.price-a.best.price))[0]||m.G2[0];
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
 const C=cards(m),P=build(m),app=document.getElementById("app");const order=(()=>{try{const o=JSON.parse(localStorage.getItem("s-order")||"null");if(Array.isArray(o)&&o.length==4&&["w","e","s","f"].every(k=>o.includes(k)))return o}catch(e){}return ["w","e","s","f"]})(),y0=144;
 let vis=0;try{vis=(+localStorage.getItem("s-visit")||0)+1;localStorage.setItem("s-visit",vis)}catch(e){}
 const pool=order.filter(k=>C.H[k]),HK=pool.length?pool[vis%pool.length]:"";
 const HH=order.map(k=>k==HK?142:112),TOPS=order.map((k,i)=>y0+HH.slice(0,i).reduce((a,b)=>a+b+8,0)),APPH=window.APPH||770;
 const hr=new Date().getHours(),greet=hr<12?tx("Good morning","صباح الخير"):hr<18?tx("Good afternoon","مساء الخير"):tx("Good evening","مساء الخير");
 const dstr=new Date().toLocaleDateString(AR?"ar-SA-u-nu-latn-ca-gregory":"en-GB",{weekday:"long",day:"numeric",month:"long"});
 const bandH=TOPS[0]+HH[0]-34,wave=`<svg viewBox="0 0 786 40" preserveAspectRatio="none"><path d="M0,20 C98,0 295,0 393,20 C491,40 688,40 786,20 L786,40 L0,40Z" fill="#16365E"/></svg>`;
 app.innerHTML=`<div id="band" style="height:${bandH}px"><div class="wv">${wave}</div></div><div class="hd"><div class="d">${dstr}</div><h1>${greet}${m.name?tx(", ","، ")+esc(m.name):""}</h1></div><div class="tg"><button id="gear" aria-label="${tx("Settings","الإعدادات")}">${PH("gear-six")}</button></div><div class="srch">${PH("magnifying-glass")}<span>${tx("Search or ask","ابحث أو اسأل")}</span><b class="askb">${PH("sparkle")} ${tx("Ask","اسأل")}</b></div>`
  +order.map((k,i)=>{const c=C[k];return `<div class="card c-${k}" data-k="${k}" style="--acc:${ACC[k]};top:${TOPS[i]}px;height:${HH[i]}px;overflow:hidden"><span class="ctab">${PH(c.ic)}</span><div class="k">${c.t}<span class="tm">${c.line}</span></div><div class="big" style="margin-top:14px;max-width:170px;overflow:hidden;text-overflow:ellipsis">${c.v}</div><div class="vz2"></div><div class="pg">${P[k].join("")}</div></div>`}).join("")
  +`<div class="abar" style="background:none;box-shadow:none;height:84px">${[["plus-circle",tx("Add expense","أضف مصروف"),BLUE],["camera",tx("Add bill","أضف فاتورة"),BLUE],["fire",tx("New hunt","صيد جديد"),BLUE]].map(([i,l,c])=>`<div class="ab" role="button" tabindex="0" style="gap:6px"><span style="width:52px;height:52px;border-radius:26px;background:#fff;display:grid;place-items:center;color:${c};line-height:0;box-shadow:0 8px 20px -8px rgba(0,0,0,.45)">${PH(i)}</span>${l}</div>`).join("")}</div>`
  +(HK?`<div id="chip" style="position:absolute;left:0;right:0;margin:auto;width:max-content;max-width:330px;top:${TOPS[order.indexOf(HK)]+HH[order.indexOf(HK)]-14}px;z-index:15;background:${HK=="f"?"#FEF3C7":"#EEF2F7"};color:${HK=="f"?"#92400E":NAVY};font-size:13px;font-weight:600;padding:6px 12px;border-radius:14px;white-space:nowrap">${PH("sparkle")} ${C.H[HK]}</div>`:"")
  +`<div id="scrim"></div><div id="sheet" role="dialog"></div>`;
 
 const cardEls=[...document.querySelectorAll(".card")];
 function render(){const t=now(),op=t<TL.tap?0:t<TL.close?ez((t-TL.tap)/TL.open):1-ez((t-TL.close)/TL.cd),closing=t>=TL.close,since=t-TL.tap;
  cardEls.forEach((c,i)=>{const k=c.dataset.k,f=k==OK,ht=TOPS[i],h0=HH[i],FP=k=="f"||k=="s",PT=FP?0:86,PB=FP?APPH:APPH-20,vz=c.querySelector(".vz2"),pg=c.querySelector(".pg");
   if(f){c.style.top=lerp(ht,PT,op)+"px";c.style.height=lerp(h0,PB-PT,op)+"px";c.style.zIndex=20;c.style.borderRadius=lerp(14,FP?0:22,op)+"px";if(FP){const sc=document.getElementById("app").getBoundingClientRect().width/393||1,off=Math.max(0,(document.documentElement.clientWidth/sc-393)/2);c.style.left=c.style.right=lerp(16,-off,op)+"px"};c.style.boxShadow=op>0?`0 20px 40px -20px rgba(0,0,0,${.25*op})`:"none"}
   else{c.style.opacity=closing&&OK?1-cl(op/0.12):1-cl(op/0.45)}
   c.style.overflowY=f&&op>=1&&!closing?"auto":"hidden";
   {const fo=f&&FP?1-cl(op/0.4):1;c.querySelector(".big").style.opacity=fo;c.querySelector(".tm").style.opacity=fo;vz.style.opacity=fo}
   const isB=C[k].hero=="bars",isD=C[k].hero=="dots",W=f?lerp(172,isB?329:isD?172*1.85:172*1.35,op):172,H=f&&isB?lerp(46,120,op):46,X=AR?16:f?lerp(173,16,op):173,Y=f?lerp(48,98,op):48;
   Object.assign(vz.style,{left:X+"px",top:Y+"px",width:W+"px",height:(H+4)+"px",alignItems:f&&op>0&&!isB?"flex-start":"flex-end"});
   const p=ez(t/0.7);vz.innerHTML=isB?C[k].chart(p,{w:W,h:H,gap:lerp(5,10,f?op:0)}):`<div style="zoom:${f?lerp(1,isD?1.85:1.35,op):1}">${C[k].chart(p)}</div>`;
   pg.style.top=lerp(h0,FP?44:isB?232:isD?200:186,f?op:0)+"px";
   pg.style.opacity=f&&!closing?ez(cl((since-0.12)/0.25)):0;pg.querySelectorAll(":scope>*").forEach((e,n)=>{const q=f&&!closing?cl((since-0.2-0.07*n)/0.3):0;e.style.opacity=ez(q);e.style.transform=`translateY(${(1-ez(q))*10}px)`})});
  const fade=1-cl(op/0.45);document.querySelector(".srch").style.opacity=fade;document.querySelector(".abar").style.opacity=fade;document.querySelector(".hd").style.opacity=1;
  const ch=document.getElementById("chip");if(ch){const hc=document.querySelector(`.card[data-k="${HK}"]`),A=HK=="f"?AMB:BLUE,u=t-0.5,v=Math.max(0,u-0.4),g=ez(u/0.4)*(0.7+0.3*Math.cos(2*Math.PI*v/1.2)*Math.exp(-v/1.2)),al=n=>Math.round(Math.min(255,Math.max(0,n*g))).toString(16).padStart(2,"0");
   ch.style.opacity=(u<0?0:1)*fade;ch.style.boxShadow=`0 0 0 1px ${A}88,0 0 ${16*g}px ${A}${al(170)}`;if(op==0)hc.style.boxShadow=`0 0 0 ${1.5*g}px ${A}${al(200)},0 10px ${30*g}px -6px ${A}${al(150)}`;else if(HK!=OK)hc.style.boxShadow="none"}
  if(t>TL.close+TL.cd){OK="";TL.tap=TL.close=1e9;cardEls.forEach(c=>{c.style.zIndex="";c.style.boxShadow="none";c.scrollTop=0})}
  requestAnimationFrame(render)}
 requestAnimationFrame(render);
 cardEls.forEach(c=>c.addEventListener("click",ev=>{const t=now();
  const row=ev.target.closest(".bg");if(row&&OK){const lv=(+row.dataset.lv+1)%(row.querySelector(".l3>div").innerHTML.trim()?3:2);row.dataset.lv=lv;return}
  if(ev.target.closest(".xadd,.tbtn,a,.swp,.ftabs,.fgo,.dnut,.dleg,.ebars,.mnav"))return;
  if(!OK){OK=c.dataset.k;TL.tap=t;TL.close=1e9;c.scrollTop=0;return}
  if(OK==c.dataset.k&&t>TL.tap+TL.open&&TL.close>1e8){const go=()=>{TL.close=now()};if(c.scrollTop>4){c.scrollTo({top:0,behavior:"smooth"});setTimeout(go,280)}else go()}}));
 // ---- Forsa: list + swipe mode ----
 try{document.documentElement.style.setProperty("--fire",PHurl("fire"))}catch(e){}
 { const fc=document.querySelector('.card[data-k="f"]'),FT=fTabs(m);let ti=0,q=[];
  app.insertAdjacentHTML("beforeend",`<div id="fw" aria-hidden="true"><div class="cwh"><button class="cwb" aria-label="${tx("Back","رجوع")}">${PH("caret-left")}</button><b class="cwt"></b><span class="cwn"></span></div><div class="swp"><div class="deck"></div><div class="swb" dir="ltr"><button class="sx" aria-label="${tx("Skip","تخطَّ")}">${PH("x")}</button><button class="sk" aria-label="${tx("Add","أضف")}">${PH("heart")}</button></div><p class="swh">${tx("Swipe right to add, left to skip","اسحب يمين للإضافة، يسار للتخطي")}</p></div></div>`);
  const fw=document.getElementById("fw"),deck=fw.querySelector(".deck"),kept=fc.querySelector(".kept"),kn=fc.querySelector(".keptn"),go=fc.querySelector(".fgo");
  const left=()=>{fw.querySelector(".cwn").textContent=tx(`${q.length} left`,`باقي ${q.length}`)};
  const tab=i=>{ti=i;const ids=new Set(FT[i].list.filter(d=>d.status!="saved"&&d.status!="hidden").map(d=>d.id));fc.querySelectorAll(".ftabs [data-ft]").forEach(b=>b.classList.toggle("on",+b.dataset.ft==i));
   go.querySelector(".fgot").textContent=ids.size?(ids.size==1?tx("Swipe 1 deal","اسحب صفقة واحدة"):tx(`Swipe ${ids.size} deals`,`اسحب ${ids.size} صفقات`)):tx("All caught up","خلصت الصفقات");go.disabled=!ids.size};
  fc.querySelector(".ftabs").addEventListener("click",ev=>{const b=ev.target.closest("[data-ft]");if(b){ev.stopPropagation();tab(+b.dataset.ft)}});
  fc.querySelector(".fnew").onclick=ev=>{ev.stopPropagation();ACT[2]()};
  const face=d=>{const r=d.raw||{},comps=+r.comps||0,save=d.market>d.price?d.market-d.price:0,paid=+r.paid||0,
    hint=paid&&d.price<paid?tx(`You paid ${RS}${fmt(paid)}${r.paidStore?" at "+esc(r.paidStore):""}. This is ${RS}${fmt(paid-d.price)} less.`,`دفعت ${RS}${fmt(paid)}${r.paidStore?" في "+esc(r.paidStore):""}. هذا أقل بـ ${RS}${fmt(paid-d.price)}.`)
     :d.pct>=25?tx(`Rare price: ${d.pct}% under the usual${comps?`, checked against ${comps} similar ads`:""}.`,`سعر نادر: أقل ${d.pct}٪ من المعتاد${comps?`، مقارنة بـ ${comps} إعلان مشابه`:""}.`)
     :d.pct>0?tx(`Good price${comps?` next to ${comps} similar ads`:""}. Check the condition before you buy.`,`سعر حلو${comps?` مقارنة بـ ${comps} إعلان مشابه`:""}. تأكد من الحالة قبل الشراء.`)
     :d.offer?esc(d.offer):tx("New find from your hunt.","لقطة جديدة من بحثك.");
   const pic=d.image?`<div class="dkim" style="--bg:url('${esc(d.image)}')"><img src="${esc(d.image)}" alt="" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add('noimg');this.remove()"></div>`:`<div class="dkim noimg"></div>`;
   return `<div class="dk">${pic}<div class="dkb"><div class="dkr"><b class="dkn">${esc(d.name)}</b>${d.pct?`<span class="dkpc">▼ ${d.pct}%</span>`:""}</div><small class="dks">${esc([d.source,d.city].filter(Boolean).join(" · "))}</small>
    <div class="dkp">${d.price?M(d.price):""}${d.market?` <s>${M(d.market)}</s>`:""}</div>${d.market&&d.price?`<div class="dkbar"><i style="width:${Math.max(8,Math.min(100,d.price/d.market*100))}%"></i></div><div class="dkl"><span>${tx("Price","السعر")}</span>${save?`<b>${tx("Save","توفّر")} ${M(save)}</b>`:""}<span>${tx("Market","السوق")}</span></div>`:""}
    <p class="dkh">${PH("sparkle")}<span>${hint}</span></p></div><i class="stamp keep">${tx("ADD","أضف")}</i><i class="stamp drop">${tx("SKIP","تخطَّ")}</i></div>`};
  const draw=()=>{deck.innerHTML=q.length?q.slice(0,3).map(face).reverse().join(""):`<div class="empty dkend">${tx("All caught up. New deals come with the next hunt.","خلصت الصفقات. الجديدة تجي مع البحث الجاي.")}</div>`;
   [...deck.querySelectorAll(".dk")].reverse().forEach((el,i)=>{el.style.transform=`translateY(${i*12}px) scale(${1-i*.05})`;el.style.zIndex=10-i});fw.querySelector(".swb").style.visibility=fw.querySelector(".swh").style.visibility=q.length?"":"hidden";left()};
  const save=(d,st)=>{const raw=Object.assign({},d.raw);delete raw.id;delete raw.shared;raw.status=st;put("deals",d.id,raw).catch(()=>toast(tx("Couldn't save","ما انحفظ")))};
  const fling=(dir)=>{const el=[...deck.querySelectorAll(".dk")].pop(),d=q[0];if(!el||!d)return;const w=dir>0?1:-1;
   el.style.transition="transform .32s cubic-bezier(.3,.6,.2,1),opacity .32s";el.style.transform=`translate(${w*460}px,-30px) rotate(${w*22}deg)`;el.style.opacity="0";
   q.shift();d.status=w>0?"saved":"hidden";save(d,d.status);
   if(w>0){const ke=fc.querySelector(".kempty");if(ke)ke.remove();kn.textContent=+kn.textContent+1;kept.innerHTML=addedHTML(m.deals.filter(x=>x.status=="saved"))}
   FT.forEach((t,i)=>{const b=fc.querySelector(`.ftabs [data-ft="${i}"] span`);if(b)b.textContent=t.list.filter(x=>x.status!="saved"&&x.status!="hidden").length});
   try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}setTimeout(()=>{draw();deck.querySelectorAll(".dk").forEach(x=>{x.style.transition="transform .25s cubic-bezier(.3,.6,.2,1)"})},300)};
  fw.querySelector(".sk").onclick=()=>fling(1);fw.querySelector(".sx").onclick=()=>fling(-1);
  go.onclick=ev=>{ev.stopPropagation();q=FT[ti].list.filter(d=>d.status!="saved"&&d.status!="hidden");if(!q.length)return;fw.querySelector(".cwt").innerHTML=FT[ti].n;draw();
   const sc=app.getBoundingClientRect().width/393||1,off=Math.max(0,(document.documentElement.clientWidth/sc-393)/2);fw.style.left=fw.style.right=-off+"px";fw.classList.add("on");fw.setAttribute("aria-hidden","false")};
  fw.querySelector(".cwb").onclick=()=>{fw.classList.remove("on");fw.setAttribute("aria-hidden","true");tab(ti)};
  let x0=null,dx=0,top=null;
  deck.addEventListener("pointerdown",e=>{top=[...deck.querySelectorAll(".dk")].pop();if(!top)return;x0=e.clientX;dx=0;top.style.transition="none";deck.setPointerCapture(e.pointerId)});
  deck.addEventListener("pointermove",e=>{if(x0==null)return;dx=e.clientX-x0;top.style.transform=`translateX(${dx}px) rotate(${dx/18}deg)`;top.querySelector(".keep").style.opacity=cl(dx/90);top.querySelector(".drop").style.opacity=cl(-dx/90)});
  const up=()=>{if(x0==null)return;x0=null;if(Math.abs(dx)>90)fling(dx>0?1:-1);else{top.style.transition="transform .25s cubic-bezier(.3,.6,.2,1)";top.style.transform="";top.querySelectorAll(".stamp").forEach(s=>s.style.opacity=0)}};
  deck.addEventListener("pointerup",up);deck.addEventListener("pointercancel",up);setTimeout(()=>tab(0)); }
 // ---- writes ----
 const toast=msg=>{app.insertAdjacentHTML("beforeend",`<div class="toast">${msg}</div>`);const el=app.querySelector(".toast:last-child");setTimeout(()=>el.remove(),1900)};
 const addCost=async(amount,cat,note)=>{const d=ymd(new Date());await put("expenses",newId(),{date:d,amount:Math.round(amount*100)/100,cat,note:String(note||"").slice(0,120),createdAt:Date.now()})};
 const reload=()=>{try{const c=OK&&document.querySelector(`.card[data-k="${OK}"]`);sessionStorage.setItem("w-ui",JSON.stringify({ok:OK,top:c?c.scrollTop:0,cw:window._cwSt?window._cwSt():null,t:Date.now()}))}catch(e){}setTimeout(()=>location.reload(),900)};
 { const c=document.querySelector('.card[data-k="e"]'),x=c.querySelector(".xadd");if(x){
   x.querySelectorAll(".xc button").forEach(b=>b.onclick=()=>{x.querySelectorAll(".xc button").forEach(y=>y.classList.remove("sel"));b.classList.add("sel")});
   const sm=x.querySelector(".sms"),a=x.querySelector(".xa");sm.addEventListener("input",()=>{const mm=sm.value.replace(/,/g,"").match(/(\d+(?:\.\d+)?)\s*(?:SAR|ر\.س|ريال)?/i);if(mm)a.value=mm[1]});
   x.querySelector(".xb").onclick=async()=>{const v=+a.value;if(!(v>0))return;try{await addCost(v,x.querySelector(".xc .sel").dataset.k,x.querySelector(".xn").value||sm.value.slice(0,60));toast(tx("Added","انضاف"));reload()}catch(e){toast(tx("Couldn't save","ما انحفظ"))}};} }
 const wire=root=>{root.querySelectorAll(".tbtn[data-oadd]").forEach(b=>b.onclick=async()=>{const o=m.others.find(x=>x.k==b.dataset.oadd);if(!o)return;b.disabled=true;try{await put("prices",newId(),{item:o.item.slice(0,80),price:Math.round(o.price*100)/100,store:(o.store||"Store not set").slice(0,50)+" (shared)",size:o.size.slice(0,40),date:o.date||ymd(new Date()),createdAt:Date.now()});toast(tx("Added to My items","انضاف لأغراضك"));reload()}catch(e){b.disabled=false;toast(tx("Couldn't save","ما انحفظ"))}});
 root.querySelectorAll(".tbtn[data-list]").forEach(b=>b.onclick=async()=>{const k=b.dataset.list,keys=m.shopKeys.includes(k)?m.shopKeys.filter(x=>x!=k):m.shopKeys.concat(k);try{await put("settings","shopping",{keys});toast(tx("List updated","انحدثت القائمة"));reload()}catch(e){toast(tx("Couldn't save","ما انحفظ"))}});};wire(document);
 const sh=document.getElementById("sheet"),sc=document.getElementById("scrim"),close=()=>{sh.classList.remove("on");sc.classList.remove("on")};sc.onclick=close;
 const show=(a,html,init)=>{{const k=app.getBoundingClientRect().width/393||1,o=Math.max(0,(document.documentElement.clientWidth/k-393)/2)+"px";sh.style.left=sh.style.right=sc.style.left=sc.style.right="-"+o}sh.style.setProperty("--a",a);sh.innerHTML=`<div class="grab"></div>`+html;sh.classList.add("on");sc.classList.add("on");init()};
 const ACT=[()=>show(ACC.e,`<h3><span style="color:${ACC.e};line-height:0">${PH("plus-circle")}</span>${tx("Add expense","أضف مصروف")}</h3><button class="pmsg">${PH("receipt")}<span>${tx("Paste latest bank message","الصق آخر رسالة من البنك")}</span></button><div class="amt"><span>${RS}</span><input id="amt" inputmode="decimal" placeholder="0"></div><div class="chips">${LOG_CATS.filter(k=>BY[k]).slice(0,10).map((k,i)=>`<button data-k="${k}" class="${i?"":"sel"}">${nm(k)}</button>`).join("")}</div><input class="txt" id="nt" placeholder="${tx("Note (optional)","ملاحظة (اختياري)")}"><button class="go" id="sv" disabled>${tx("Save","حفظ")}</button>`,()=>{
   const a=document.getElementById("amt"),b=document.getElementById("sv");setTimeout(()=>a.focus(),350);a.oninput=()=>{b.disabled=!(+a.value>0)};
   // Beshr 2026-11-24: one tap reads the bank SMS he copied (a web app can't read SMS itself) and fills amount + note
   sh.querySelector(".pmsg").onclick=async()=>{let t="";try{t=await navigator.clipboard.readText()}catch(e){}t=String(t||"").trim();
    if(!t){toast(tx("Copy the bank message first, then tap here","انسخ رسالة البنك أول، بعدين اضغط هنا"));return}
    const n=t.replace(/,/g,""),mm=n.match(/(?:SAR|ر\.?س|ريال|⃁|مبلغ|amount)[:\s]*([\d]+(?:\.\d+)?)/i)||n.match(/([\d]+(?:\.\d+)?)\s*(?:SAR|ر\.?س|ريال)/i)||n.match(/(\d+\.\d{2})/);
    if(!mm){toast(tx("Couldn't find an amount in the copied text","ما لقيت مبلغ في النص المنسوخ"));return}
    a.value=mm[1];b.disabled=!(+a.value>0);const at=t.match(/(?:\bat\b|\bfrom\b|لدى|من|في|merchant)\s*[:：]?\s*([^\n]{2,40})/i);document.getElementById("nt").value=(at?at[1]:t.split("\n")[0]).trim().slice(0,60);{const g=grpOf([document.getElementById("nt").value],""),want={groc:"grocery",cafe:"coffee",food:"food"}[g],btn=want&&sh.querySelector(`.chips button[data-k="${want}"]`);if(btn){sh.querySelectorAll(".chips button").forEach(y=>y.classList.remove("sel"));btn.classList.add("sel")}}toast(tx("Filled from your message","انعبى من رسالتك"))};
   sh.querySelectorAll(".chips button").forEach(x=>x.onclick=()=>{sh.querySelectorAll(".chips button").forEach(y=>y.classList.remove("sel"));x.classList.add("sel")});
   b.onclick=async()=>{b.disabled=true;try{await addCost(+a.value,sh.querySelector(".chips .sel").dataset.k,document.getElementById("nt").value);close();toast(tx("Saved","انحفظ"));reload()}catch(e){b.disabled=false;toast(tx("Couldn't save","ما انحفظ"))}}}),
  // Beshr 2026-11-24: Add bill stays in this app: take a photo or upload a file, Claude reads it, he ticks the items to save
  ()=>show(ACC.e,`<h3><span style="color:${ACC.e};line-height:0">${PH("receipt")}</span>${tx("Add bill","أضف فاتورة")}</h3><div class="pick"><label><span>${PH("camera")}</span>${tx("Take photo","صوّر")}<input type="file" accept="image/*" capture="environment" hidden></label><label><span>${PH("file-arrow-up")}</span>${tx("Upload file","ارفع ملف")}<input type="file" accept="image/*,application/pdf" hidden></label></div><div class="bres"></div>`,()=>{
   const out=sh.querySelector(".bres");sh.querySelectorAll(".pick input").forEach(inp=>inp.onchange=async()=>{const f=inp.files&&inp.files[0];inp.value="";if(!f)return;
    sh.querySelector(".pick").style.display="none";out.innerHTML=`<span class="think" style="justify-content:center;margin:18px 0"><i></i>${tx("Reading your bill","أقرأ فاتورتك")}</span>`;
    try{const r=await readBill(f),items=r.items;
     if(!items.length){out.innerHTML=`<div class="empty">${tx("Couldn't find items on this bill. Try a clearer photo.","ما لقيت أغراض في الفاتورة. جرّب صورة أوضح.")}</div>`;sh.querySelector(".pick").style.display="";return}
     out.innerHTML=`<input class="txt bst" value="${esc(r.store)}" placeholder="${tx("Store","المتجر")}"><div class="bmeta">${esc(r.date)}${r.total?` · ${tx("Total","المجموع")} ${M(r.total)}`:""}</div><div class="blist">${items.map((x,i)=>`<label class="bit"><input type="checkbox" checked data-i="${i}"><span>${esc(x.item)}${x.size?` <small class="ds">${esc(x.size)}</small>`:""}</span><b>${M(x.price.toFixed(x.price%1?2:0))}</b></label>`).join("")}</div><button class="go" id="bsv">${tx(`Save ${items.length} prices`,`احفظ ${items.length} سعر`)}</button>`;
     const b=document.getElementById("bsv"),cnt=()=>{const n=out.querySelectorAll(".bit input:checked").length;b.textContent=tx(`Save ${n} prices`,`احفظ ${n} سعر`);b.disabled=!n};out.querySelectorAll(".bit input").forEach(c=>c.onchange=cnt);
     b.onclick=async()=>{b.disabled=true;const store=norm(out.querySelector(".bst").value).slice(0,60),billId=newId(),have=new Set(m.G2.flatMap(g=>g.recs.map(p=>(g.k+"|"+p.price.toFixed(2)+"|"+p.store).toLowerCase())));let ok=0;
      try{await put("bills",billId,{store,date:r.date,total:r.total||0,name:String(f.name||"Bill").slice(0,100),createdAt:Date.now()});
       for(const c of out.querySelectorAll(".bit input:checked")){const x=items[+c.dataset.i],k=keyOf(x);if(have.has((k+"|"+x.price.toFixed(2)+"|"+store).toLowerCase()))continue;await put("prices",newId(),{item:x.item,price:x.price,store,size:x.size,date:r.date,billId,createdAt:Date.now()});ok++}
       await put("bills",billId,{store,date:r.date,total:r.total||0,name:String(f.name||"Bill").slice(0,100),added:ok,createdAt:Date.now()});
       close();toast(tx(`Saved ${ok} prices from ${store||"the bill"}`,`انحفظ ${ok} سعر من ${store||"الفاتورة"}`));reload()}catch(e){b.disabled=false;toast(tx("Couldn't save","ما انحفظ"))}}}
    catch(e){out.innerHTML=`<div class="empty">${e&&e.code=="rate_limited"?tx("Too many requests. Wait a minute and try again.","طلبات كثيرة. انتظر دقيقة وجرّب."):tx("Couldn't read this bill. Try again.","ما قدرت أقرأ الفاتورة. جرّب مرة ثانية.")}</div>`;sh.querySelector(".pick").style.display=""}})}),
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
 // ---- Store category window (Beshr 2026-11-24: like a grocery app: categories, item tiles, small store name, lowest vs highest price) ----
 { const CATS=catsOf(m);app.insertAdjacentHTML("beforeend",`<div id="cw" aria-hidden="true"><div class="cwh"><button class="cwb" aria-label="${tx("Back","رجوع")}">${PH("caret-left")}</button><b class="cwt"></b><span class="cwn"></span></div><div class="cwc"></div><div class="cwseg"></div><div class="cwtabs"></div><div class="cwbody"></div></div>`);
  const cw=document.getElementById("cw"),body=cw.querySelector(".cwbody"),tabs=cw.querySelector(".cwtabs"),chips=cw.querySelector(".cwc"),seg=cw.querySelector(".cwseg");let who="m";
  const tile=x=>`<button class="pt" data-t="${x.t}" data-pk="${esc(x.k)}"><span class="pti">${x.t=="m"?`<i class="ptadd${m.shopKeys.includes(x.k)?" on":""}" data-add="${esc(x.k)}">${m.shopKeys.includes(x.k)?"✓":"+"}</i>`:""}${x.photo?`<img src="${esc(x.photo)}" alt="" loading="lazy">`:PH(GIC[x.grp]||"shopping-cart")}</span><span class="ptn">${esc(x.item)}</span><span class="pts"><bdi>${esc(x.size||"")}</bdi></span><span class="ptp"><b>${M(p2(x.lo.price))}</b>${x.hi&&x.hi.price>x.lo.price?`<s>${M(p2(x.hi.price))}</s>`:""}</span>${x.hi&&x.hi.price>x.lo.price?`<span class="ptsv">${tx("Save","وفّر")} ${M(p2(x.hi.price-x.lo.price))}</span>`:""}<span class="ptst"><bdi>${esc(x.lo.store)}</bdi>${x.all.length>1?tx(` · ${x.all.length} prices`,` · ${x.all.length} أسعار`):""}</span></button>`;
  let cur=null;
  const fill=k=>{if(k!=(cur&&cur.k))who="m";cur=CATS.find(c=>c.k==k)||CATS[0];if(!cur)return;cw.querySelector(".cwt").textContent=grpName(cur.k);cw.querySelector(".cwn").textContent=tx(`${cur.mine.length+cur.oth.length} items`,`${cur.mine.length+cur.oth.length} غرض`);
   chips.innerHTML=CATS.map(c=>`<button data-cat="${c.k}" class="${c.k==cur.k?"on":""}">${PH(GIC[c.k])}<span>${grpName(c.k)}</span></button>`).join("");
   // My items / Other shoppers stay apart (toggle); inside, supermarket-style subcategories (Beshr 2026-11-24)
   if(who=="o"&&!cur.oth.length)who="m";
   seg.innerHTML=cur.oth.length?`<button data-who="m" class="${who=="m"?"on":""}">${tx("My items","أغراضي")} · ${cur.mine.length}</button><button data-who="o" class="${who=="o"?"on":""}">${tx("Other shoppers","المتسوقين الثانيين")} · ${cur.oth.length}</button>`:"";seg.style.display=cur.oth.length?"":"none";
   const list=who=="o"?cur.oth:cur.mine,parts=subsOf(cur.k,list);
   tabs.innerHTML=parts.map((x,i)=>`<button data-sec="${x.k}" class="${i?"":"on"}">${x.n} <span>${x.list.length}</span></button>`).join("");tabs.style.display=parts.length>1?"":"none";
   body.innerHTML=parts.map(x=>`<h5 id="cw-${x.k}">${x.n}</h5><div class="pgrid">${x.list.map(tile).join("")}</div>`).join("")+`<div style="height:40px"></div>`;
   body.scrollTop=0;const on=chips.querySelector(".on");if(on)on.scrollIntoView({inline:"center",block:"nearest"})};
  // Beshr 2026-11-24: the window grows out of the tapped category tile and shrinks back into it (no side slide)
   let src=null;const EZ="cubic-bezier(.3,.6,.2,1)";
   const rectIn=el=>{const a=el.getBoundingClientRect(),c=cw.getBoundingClientRect(),k=c.width/cw.offsetWidth||1;return `inset(${(a.top-c.top)/k}px ${(c.right-a.right)/k}px ${(c.bottom-a.bottom)/k}px ${(a.left-c.left)/k}px round 14px)`};
   const open=(k,el)=>{src=el;fill(k);const sc=app.getBoundingClientRect().width/393||1,off=Math.max(0,(document.documentElement.clientWidth/sc-393)/2);cw.style.left=cw.style.right=-off+"px";
    cw.style.transition="none";cw.classList.add("on","grow");cw.setAttribute("aria-hidden","false");cw.style.clipPath=el?rectIn(el):"inset(0)";cw.offsetWidth;
    cw.style.transition=`clip-path .46s ${EZ}`;cw.style.clipPath="inset(0px 0px 0px 0px round 0px)";requestAnimationFrame(()=>cw.classList.remove("grow"))};
   const shut=()=>{cw.classList.add("grow");cw.style.transition=`clip-path .38s ${EZ}`;cw.style.clipPath=src?rectIn(src):"inset(50% 50% 50% 50%)";
    setTimeout(()=>{cw.classList.remove("on","grow");cw.style.clipPath="";cw.setAttribute("aria-hidden","true")},380)};
   window._cwSt=()=>cw.classList.contains("on")&&cur?{k:cur.k,who}:null;window._cwOpen=(k,w)=>{who=w||"m";fill(k);who=w||"m";fill(k);src=document.querySelector(`.ctile[data-cat="${k}"]`);const sc=app.getBoundingClientRect().width/393||1,off=Math.max(0,(document.documentElement.clientWidth/sc-393)/2);cw.style.left=cw.style.right=-off+"px";cw.style.transition="none";cw.style.clipPath="";cw.classList.add("on");cw.setAttribute("aria-hidden","false")};
   seg.onclick=ev=>{const b=ev.target.closest("[data-who]");if(b&&b.dataset.who!=who){who=b.dataset.who;fill(cur.k);body.animate([{opacity:0},{opacity:1}],{duration:220})}};
  document.querySelectorAll(".ctile").forEach(b=>b.onclick=ev=>{ev.stopPropagation();open(b.dataset.cat,b)});
  cw.querySelector(".cwb").onclick=shut;
  chips.onclick=ev=>{const b=ev.target.closest("button");if(b){fill(b.dataset.cat);src=document.querySelector(`.ctile[data-cat="${b.dataset.cat}"]`);body.animate([{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"none"}],{duration:260,easing:EZ})}};
  tabs.onclick=ev=>{const b=ev.target.closest("button");if(!b)return;tabs.querySelectorAll("button").forEach(y=>y.classList.toggle("on",y==b));lockT=Date.now();const h=body.querySelector("#cw-"+b.dataset.sec);body.scrollTo({top:h.offsetTop-body.offsetTop-4,behavior:"smooth"})};
  let lockT=0;body.addEventListener("scroll",()=>{if(Date.now()-lockT<800)return;let id="";body.querySelectorAll("h5").forEach(h=>{if(h.offsetTop-body.offsetTop-body.scrollTop<60)id=h.id.slice(3)});tabs.querySelectorAll("button").forEach((b,i)=>b.classList.toggle("on",id?b.dataset.sec==id:!i))},{passive:true});
  body.onclick=ev=>{const ad=ev.target.closest(".ptadd");if(ad){ev.stopPropagation();const k=ad.dataset.add,on=!ad.classList.contains("on");m.shopKeys=on?m.shopKeys.concat(k):m.shopKeys.filter(x=>x!=k);ad.classList.toggle("on",on);ad.textContent=on?"✓":"+";put("settings","shopping",{keys:m.shopKeys}).then(()=>toast(on?tx("Added to shopping list","انضاف لقائمة التسوق"):tx("Removed from list","انشال من القائمة"))).catch(()=>toast(tx("Couldn't save","ما انحفظ")));return}const b=ev.target.closest(".pt");if(!b||!cur)return;const t=b.dataset.t,k=b.dataset.pk,x=cur.mine.concat(cur.oth).find(y=>y.t==t&&y.k==k);if(!x)return;
   const rowsH=x.all.slice(0,8).map((r,i)=>[esc(r.store),M(p2(r.price)),x.lo.price/r.price,i?LN:GR]);
   show(GR,`<h3>${esc(x.item)}${x.size?` <small class="ds" style="font-size:13px;font-weight:500;color:${G}">${esc(x.size)}</small>`:""}</h3><div class="ptr"><div><small>${tx("Lowest","الأقل")}</small><b style="color:${GR}">${M(p2(x.lo.price))}</b><small>${esc(x.lo.store)}</small></div><div><small>${tx("Highest","الأعلى")}</small><b>${M(p2(x.hi.price))}</b><small>${esc(x.hi.store)}</small></div></div>${x.hi.price>x.lo.price?`<div class="gapb">${PH("trend-down")}<span>${tx(`Buy at ${esc(x.lo.store)} and save <b>${M(p2(x.hi.price-x.lo.price))}</b> (${Math.round((1-x.lo.price/x.hi.price)*100)}%) vs ${esc(x.hi.store)}`,`اشترِ من ${esc(x.lo.store)} ووفّر <b>${M(p2(x.hi.price-x.lo.price))}</b> (${Math.round((1-x.lo.price/x.hi.price)*100)}٪) عن ${esc(x.hi.store)}`)}</span></div>`:""}<div class="res">${r2(rowsH)}</div>`+
    (t=="m"?`<button class="go tbtn" data-list="${esc(x.k)}">${m.shopKeys.includes(x.k)?tx("Remove from shopping list","شيله من قائمة التسوق"):tx("Add to shopping list","أضفه لقائمة التسوق")}</button>`:`<button class="go tbtn" data-oadd="${esc(x.k)}">${tx("+ Add to My items","+ أضفه لأغراضي")}</button>`),()=>wire(sh))};
 }

 // ---- Expenses: tap a slice or a name -> details sheet ----
 { const ec=document.querySelector('.card[data-k="e"]');
  ec.addEventListener("click",ev=>{const t=ev.target.closest("[data-cat]");if(!t||!OK)return;ev.stopPropagation();const mon=t.dataset.mon||m.mon,cs=monCats(m,mon),tot=cs.reduce((a,x)=>a+x[1],0)||1,k=t.dataset.cat,ks=k=="_other"?cs.slice(6).map(x=>x[0]):[k],es=m.ex.filter(x=>x.date.startsWith(mon)&&ks.includes(x.cat)).sort((a,b)=>b.date.localeCompare(a.date)),v=es.reduce((a,x)=>a+x.amount,0),pl=ks.reduce((a,q)=>a+m.planOf(q),0),i=cs.findIndex(x=>x[0]==k),col=DCOL[k=="_other"?6:i]||NAVY;
   show(col,`<h3><i style="width:14px;height:14px;border-radius:4px;background:${col};display:inline-block"></i>${k=="_other"?tx("Other","أخرى"):nm(k)}</h3>
    <div class="ptr"><div><small>${tx("Spent","صرفت")}</small><b>${M(v)}</b><small>${Math.round(v/tot*100)}% ${tx("of the month","من الشهر")}</small></div>${pl?`<div><small>${tx("Plan","الخطة")}</small><b>${M(pl)}</b><small style="color:${v>pl?"#DC2626":GR}">${v>pl?tx(`${M(v-pl)} over`,`زايد ${M(v-pl)}`):tx(`${M(pl-v)} left`,`باقي ${M(pl-v)}`)}</small></div>`:`<div><small>${tx("Costs","المصاريف")}</small><b>${es.length}</b><small>${tx(`about ${M(v/Math.max(1,es.length))} each`,`تقريباً ${M(v/Math.max(1,es.length))} للواحد`)}</small></div>`}</div>
    ${pl?`<div class="dkbar" style="margin:2px 0 12px"><i style="width:${Math.min(100,v/pl*100)}%;background:${v>pl?"#DC2626":col}"></i></div>`:""}
    <div class="res" style="max-height:44vh;overflow-y:auto">${rows(es.map(x=>[`${when(x.date)}${k=="_other"?" · "+nm(x.cat):""}${x.note?` <small class="ds">${esc(x.note)}</small>`:""}`,M(x.amount)]))}</div>`,()=>{})},true); }

 // ---- top bar: Edit (arrange Home) and Settings (language, sign out) ----
 const arrange=()=>{if(OK)return;const names={w:tx("Wallet","المحفظة"),e:tx("Expenses","المصاريف"),s:tx("Store","المتجر"),f:tx("Forsa","فرصة")};let o=order.slice();
  const draw=()=>{const l=sh.querySelector(".ord");l.innerHTML=o.map((k,i)=>`<div class="ordr"><span>${names[k]}</span><button data-up="${i}" ${i?"":"disabled"} aria-label="${tx("Up","فوق")}">${PH("caret-up")}</button><button data-dn="${i}" ${i<3?"":"disabled"} aria-label="${tx("Down","تحت")}">${PH("caret-down")}</button></div>`).join("")};
  show(NAVY,`<h3><span style="color:${NAVY};line-height:0">${PH("pencil-simple")}</span>${tx("Arrange Home","ترتيب الرئيسية")}</h3><div class="ord"></div><button class="go" id="osv">${tx("Save","حفظ")}</button>`,()=>{draw();
   sh.querySelector(".ord").onclick=ev=>{const b=ev.target.closest("button");if(!b)return;const i=+(b.dataset.up??b.dataset.dn),j=b.dataset.up!=null?i-1:i+1;[o[i],o[j]]=[o[j],o[i]];draw()};
   document.getElementById("osv").onclick=()=>{try{localStorage.setItem("s-order",JSON.stringify(o))}catch(e){}close();location.reload()}})};
 // ---- Wallet budget rows: pencil beside each item -> change its monthly amount ----
 { const wc=document.querySelector('.card[data-k="w"]');wc&&wc.addEventListener("click",ev=>{const b=ev.target.closest("[data-pe]");if(!b)return;ev.stopPropagation();ev.preventDefault();const k=b.dataset.pe,cur=m.planOf(k);
  show(NAVY,`<h3><span style="color:${NAVY};line-height:0">${PH("pencil-simple")}</span>${nm(k)}</h3><p class="ds" style="margin:0 0 12px">${tx("Monthly amount","المبلغ الشهري")}</p><input id="pev" class="inp" type="number" inputmode="decimal" min="0" value="${cur||""}" placeholder="0" style="width:100%;font-size:22px;padding:12px 14px;border:1px solid #E2E8F0;border-radius:14px;box-sizing:border-box;font-family:inherit"><button class="go" id="pesv">${tx("Save","حفظ")}</button>`,()=>{const i=document.getElementById("pev");setTimeout(()=>i.focus(),250);
   document.getElementById("pesv").onclick=async()=>{const v=Math.max(0,+i.value||0),its=JSON.parse(JSON.stringify(m.planRaw||{}));its[k]=Object.assign({},its[k]||{},{plan:v});
    try{await put("settings","plan",{items:its});close();toast(tx("Saved","تم الحفظ"));setTimeout(reload,500)}catch(e){toast(tx("Could not save, try again","ما انحفظ، جرب مرة ثانية"))}}})},true); }
 document.getElementById("gear").onclick=()=>{if(OK)return;show(NAVY,`<h3><span style="color:${NAVY};line-height:0">${PH("gear-six")}</span>${tx("Settings","الإعدادات")}</h3>
   <div class="setl">${PH("translate")}<span>${tx("Language","اللغة")}</span></div><div class="cwseg" style="margin:0 0 16px"><button data-l="en" class="${AR?"":"on"}">English</button><button data-l="ar" class="${AR?"on":""}">العربية</button></div>
   <button class="setb" id="sarr">${PH("pencil-simple")}<span>${tx("Arrange Home","ترتيب الرئيسية")}</span></button>
   <button class="setb" id="sout">${PH("sign-out")}<span>${tx("Sign out","تسجيل الخروج")}</span></button>
   <a class="seto" href="${location.pathname.includes('/new/')?'../':''}old.html">${tx("Open the old version","افتح النسخة القديمة")}</a>`,()=>{
   sh.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{try{localStorage.setItem("w-lang",b.dataset.l)}catch(e){}location.reload()});
   document.getElementById("sarr").onclick=()=>{close();setTimeout(arrange,350)};
   document.getElementById("sout").onclick=async()=>{try{await sb.auth.signOut()}catch(e){}location.reload()}})};
 // ---- after a save, come back to the same place ----
 try{const u=JSON.parse(sessionStorage.getItem("w-ui")||"null");sessionStorage.removeItem("w-ui");
  if(u&&Date.now()-u.t<20000&&u.ok&&document.querySelector(`.card[data-k="${u.ok}"]`)){OK=u.ok;TL.tap=now()-5;TL.close=1e9;setTimeout(()=>{const c=document.querySelector(`.card[data-k="${u.ok}"]`);c.scrollTop=u.top||0;if(u.cw&&window._cwOpen)window._cwOpen(u.cw.k,u.cw.who)},60)}}catch(e){}

 // ---- Expenses: tap a day bar -> that day's costs ----
 { const ec=document.querySelector('.card[data-k="e"]');ec.addEventListener("click",ev=>{const b=ev.target.closest("[data-day]");if(!b||!OK)return;ev.stopPropagation();const d=b.dataset.day,es=m.ex.filter(x=>x.date==d),t=es.reduce((a,x)=>a+x.amount,0);
  show(NAVY,`<h3>${when(d)} <small class="ds" style="font-size:14px;color:${G};font-weight:500">${M(t)}</small></h3><div class="res" style="max-height:50vh;overflow-y:auto">${rows(es.map(x=>[`${nm(x.cat)}${x.note?` <small class="ds">${esc(x.note)}</small>`:""}`,M(x.amount)]))}</div>`,()=>{})},true); }

 { const ec=document.querySelector('.card[data-k="e"]');ec.addEventListener("click",ev=>{const b=ev.target.closest("[data-mnav]");if(!b||!OK)return;ev.stopPropagation();const box=ec.querySelector(".ringsec"),mon=b.dataset.mnav,
   dPl=m.items.filter(i=>i.g=="Living"||i.g=="Personal").reduce((a,i)=>a+m.planOf(i.k),0),dSp=m.items.filter(i=>i.g=="Living"||i.g=="Personal").reduce((a,i)=>a+(m.spent[i.k]||0),0);
   box.innerHTML=ringFor(m,mon,dPl?Math.max(0,dPl-dSp):null);box.animate([{opacity:.2},{opacity:1}],{duration:260})},true); }

}
// ---------- boot ----------
// Visible height. iPhone Home Screen apps can report the full screen height while the page starts below the status bar,
// which pushed the bottom of the app (quick bar, sheets) off screen (Beshr 2026-11-24). Take the smallest height and remove the status bar in that case.
const visH=()=>{let h=Math.min(document.documentElement.clientHeight||1e4,innerHeight||1e4,(window.visualViewport||{}).height||1e4);
 if(navigator.standalone&&screen.height&&h>=screen.height-1){const p=document.createElement("div");p.style.cssText="position:fixed;top:0;left:0;width:1px;height:0;padding-top:env(safe-area-inset-top)";document.body.appendChild(p);const st=p.offsetHeight;p.remove();
  // the safe-area value can come back 0 on some launches (2026-11-24 screenshot); fall back to the status bar height
  h-=Math.max(st,screen.height>=812?62:20)}return h};
(function fit(){const w=document.documentElement.clientWidth,h=visH(),s=Math.min(w/393,h/770,1.25),a=document.getElementById("app");window.APPH=Math.max(770,h/s);a.style.height=window.APPH+"px";a.style.transform=`translateX(-50%) scale(${s})`})();
const gate=(html)=>{document.getElementById("app").insertAdjacentHTML("beforeend",`<div id="gate"><div>${html}</div></div>`)};
(async()=>{try{const {data}=await sb.auth.getSession();if(!data||!data.session){gate(`${tx("Sign in on your wallet app first, then come back here.","سجّل دخولك في تطبيق المحفظة أول، بعدين ارجع هنا.")}<br><a href="${location.pathname.includes('/new/')?'../':''}old.html">${tx("Open the wallet app","افتح تطبيق المحفظة")}</a>`);return}
 gate(`<span class="think" style="justify-content:center"><i></i>${tx("Loading your data","أحمّل بياناتك")}</span>`);
 const R=await load();const m=model(R);document.getElementById("gate").remove();start(m)}
 catch(e){gate(`${tx("Couldn't load your data. Check your connection and reload.","ما قدرت أحمّل بياناتك. تأكد من الاتصال وحدّث الصفحة.")}<br><small style="color:${G}">${esc(e&&e.message||e)}</small>`)}})();
})();
