// Run: node tests/push.test.js  (fake data only). Tests the push rules and the web-push encryption in supabase/functions/push/index.ts
const assert=require("assert");
(async()=>{
const P=await import("../supabase/functions/push/index.ts");
let n=0;const t=(name,fn)=>{fn();n++};
// Riyadh = UTC+3. Wed 2026-12-02 12:00 Riyadh = 09:00 UTC
const at=(ymd,h,m=0)=>Date.parse(ymd+"T00:00:00Z")+(h-3)*36e5+m*6e4;
const NOW=at("2026-12-02",12); // Wednesday
const base=o=>Object.assign({now:NOW,kinds:{},log:[],terms:[],acted:{},deals:[],prices:[],expenses:[],smscheck:[]},o);
const deal=(id,o)=>Object.assign({id,title:"Sony PlayStation 5 console",price:1600,market:2000,foundAt:NOW-10*6e4},o);
// --- caps
t("quiet hours",()=>{assert.equal(P.blocked(at("2026-12-02",21,59),[]),null);assert.equal(P.blocked(at("2026-12-02",22,0),[]),"quiet-hours");assert.equal(P.blocked(at("2026-12-02",8,59),[]),"quiet-hours");assert.equal(P.blocked(at("2026-12-02",9,0),[]),null)});
t("friday",()=>{assert.equal(P.riyadh(at("2026-12-04",10)).dow,5);assert.equal(P.blocked(at("2026-12-04",13,29),[]),"friday-morning");assert.equal(P.blocked(at("2026-12-04",13,30),[]),null)});
t("1 a day, 3 a week",()=>{const L=(d,h)=>({kind:"x",ref:"r"+d+h,sent:at(d,h),clicked:true});assert.equal(P.blocked(NOW,[L("2026-12-02",10)]),"daily-cap");
 assert.equal(P.blocked(NOW,[L("2026-12-01",10),L("2026-11-30",10)]),null);assert.equal(P.blocked(NOW,[L("2026-12-01",10),L("2026-11-30",10),L("2026-11-29",10)]),"weekly-cap");assert.equal(P.blocked(NOW,[L("2026-11-25",10),L("2026-11-26",10),L("2026-11-27",10)]),null)});
t("day boundary is Riyadh not UTC",()=>{const sent=at("2026-12-02",1); // 01:00 Riyadh = 22:00 UTC the day before
 assert.equal(P.riyadh(sent).ymd,"2026-12-02");assert.equal(P.blocked(NOW,[{kind:"x",ref:"a",sent,clicked:true}]),"daily-cap")});
t("ignored twice pauses 14 days",()=>{const l=(d,c)=>({kind:"price",ref:"r"+d,sent:at(d,10),clicked:c});
 assert.ok(P.paused("price",[l("2026-11-20",false),l("2026-11-25",false)],NOW));assert.ok(!P.paused("price",[l("2026-11-20",true),l("2026-11-25",false)],NOW));assert.ok(!P.paused("hunt",[l("2026-11-20",false),l("2026-11-25",false)],NOW));
 assert.ok(!P.paused("price",[l("2026-11-01",false),l("2026-11-05",false)],NOW))});
// --- hunt
t("hunt matches, 15%+, 2h",()=>{const i=base({terms:["ps5","playstation"],deals:[deal("a")]});const p=P.pickHunt(i);assert.equal(p.ref,"a");assert.equal(p.vars.pct,20);assert.equal(p.vars.mins,10);assert.equal(p.url,"?go=hunt&d=a");
 assert.equal(P.pickHunt(base({terms:["playstation"],deals:[deal("a",{price:1800})]})),null,"10% is too small");
 assert.equal(P.pickHunt(base({terms:["playstation"],deals:[deal("a",{foundAt:NOW-3*36e5})]})),null,"older than 2h");
 assert.equal(P.pickHunt(base({terms:["laptop"],deals:[deal("a")]})),null,"no matching hunt");
 assert.equal(P.pickHunt(base({terms:["playstation"],deals:[deal("a")],acted:{a:"hidden"}})),null,"he skipped it");
 assert.equal(P.pickHunt(base({terms:["playstation"],deals:[deal("a",{ended:true})]})),null);
 assert.equal(P.pickHunt(base({terms:["playstation"],deals:[deal("a",{price:300})]})),null,">75% off is a trap");
 assert.equal(P.pickHunt(base({terms:["بلايستيشن"],deals:[deal("a")]})).ref,"a","Arabic hunt finds English deal");
 assert.equal(P.pickHunt(base({terms:["playstation"],deals:[deal("a"),deal("b",{price:1400})]})).ref,"b","biggest pct wins")});
// --- price
const pr=(item,store,price,at,date)=>({id:Math.random()+"",item,size:"2L",store,price,date:date||"2026-12-02",createdAt:at});
t("price drop in last 24h",()=>{const i=base({prices:[pr("Milk","Panda",11,NOW-5*864e5,"2026-11-27"),pr("Milk","Panda",9.5,NOW-2*36e5)]});const p=P.pickPrice(i);assert.ok(p);assert.deepEqual([p.vars.from,p.vars.to,p.vars.store],["11.00","9.50","Panda"]);
 assert.equal(P.pickPrice(base({prices:[pr("Milk","Panda",11,NOW-5*864e5,"2026-11-27"),pr("Milk","Panda",9.5,NOW-30*36e5)]})),null,"entered 30h ago");
 assert.equal(P.pickPrice(base({prices:[pr("Milk","Panda",9,NOW-5*864e5,"2026-11-27"),pr("Milk","Panda",9.5,NOW-2*36e5)]})),null,"price went up");
 assert.equal(P.pickPrice(base({prices:[pr("Milk","Panda",9.5,NOW-2*36e5)]})),null,"first price, no earlier one");
 assert.equal(P.pickPrice(base({prices:[pr("Milk","Danube",11,NOW-5*864e5,"2026-11-27"),pr("Milk","Panda",9.5,NOW-2*36e5)]})),null,"different store is not a drop (G2.drop logic)")});
t("price ignores shared tag",()=>{assert.equal(P.pickPrice(base({prices:[pr("Milk","Panda (shared)",11,NOW-5*864e5,"2026-11-27"),pr("Milk","Panda (shared)",9.5,NOW-36e5)]})),null)});
// --- quiet
const ex=d=>({id:d+Math.random(),date:d,amount:10});
t("quiet week",()=>{const old=["2026-11-10","2026-11-14","2026-11-20"].map(ex);const p=P.pickQuiet(base({expenses:old}));assert.ok(p);assert.equal(p.vars.days,12);
 assert.equal(P.pickQuiet(base({expenses:old.concat(ex("2026-12-01"))})),null,"logged yesterday");assert.equal(P.pickQuiet(base({expenses:old.slice(0,2)})),null,"fewer than 3 before");
 assert.equal(P.pickQuiet(base({expenses:old,log:[{kind:"quiet",ref:"q",sent:NOW-10*864e5,clicked:false}]})),null,"once per 14 days");assert.ok(P.pickQuiet(base({expenses:old,log:[{kind:"quiet",ref:"q",sent:NOW-15*864e5,clicked:false}]})));
 assert.equal(P.pickQuiet(base({expenses:[]})),null,"brand-new user")});
// --- bank
t("bank: only new waiting messages",()=>{const sc=[{id:"c1",kind:"pay"},{id:"c2",kind:"in"}];const p=P.pickBank(base({smscheck:sc}));assert.equal(p.vars.n,2);assert.equal(p.vars.pay,1);
 assert.equal(P.pickBank(base({smscheck:sc,log:[{kind:"bank",ref:p.ref,sent:NOW-864e5,clicked:false}]})),null);
 assert.ok(P.pickBank(base({smscheck:sc.concat({id:"c3",kind:"pay"}),log:[{kind:"bank",ref:p.ref,sent:NOW-864e5,clicked:false}]})));assert.equal(P.pickBank(base()),null)});
// --- decide: priority, switches, never resend
t("priority hunt>price>bank>quiet",()=>{const all={terms:["playstation"],deals:[deal("a")],prices:[pr("Milk","Panda",11,NOW-5*864e5,"2026-11-27"),pr("Milk","Panda",9.5,NOW-36e5)],smscheck:[{id:"c1",kind:"pay"}],expenses:["2026-11-10","2026-11-14","2026-11-20"].map(ex)};
 assert.equal(P.decide(base(all)).pick.kind,"hunt");assert.equal(P.decide(base({...all,kinds:{hunt:false}})).pick.kind,"price");assert.equal(P.decide(base({...all,kinds:{hunt:false,price:false}})).pick.kind,"bank");assert.equal(P.decide(base({...all,kinds:{hunt:false,price:false,bank:false}})).pick.kind,"quiet");
 assert.equal(P.decide(base({...all,kinds:{hunt:false,price:false,bank:false,quiet:false}})).why,"nothing-new");
 assert.equal(P.decide(base({...all,log:[{kind:"hunt",ref:"a",sent:NOW-2*864e5,clicked:true}]})).pick.kind,"price","same deal is never sent twice");
 assert.equal(P.decide(base({...all,now:at("2026-12-02",23)})).why,"quiet-hours");
 assert.equal(P.decide(base({...all,log:[{kind:"hunt",ref:"z",sent:NOW-36e5,clicked:false}]})).why,"daily-cap")});
// --- words
t("words EN + AR, Western digits",()=>{const p=P.pickHunt(base({terms:["playstation"],deals:[deal("a")]}));const e=P.words(p,"en"),a=P.words(p,"ar");assert.match(e.body,/20% below market, listed 10 min ago/);assert.match(a.body,/بـ 20%/);assert.ok(!/[٠-٩]/.test(a.body));
 const q=P.words({kind:"quiet",vars:{days:9}},"ar");assert.match(q.body,/9 أيام/);assert.match(P.words({kind:"quiet",vars:{days:12}},"ar").body,/12 يوم\./);const b=P.words({kind:"bank",vars:{n:2,pay:1,inn:1}},"ar");assert.equal(b.title,"رسالتين من البنك تحتاجك");assert.equal(P.words({kind:"bank",vars:{n:1,pay:0,inn:1}},"en").title,"1 bank message to check")});
// --- web push crypto: encrypt like a phone would, then decrypt it back (RFC 8291)
const ua=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);const uaPub=new Uint8Array(await crypto.subtle.exportKey("raw",ua.publicKey));const authS=crypto.getRandomValues(new Uint8Array(16));
const body=await P.encrypt(JSON.stringify({title:"مرحبا",body:"x"}),P.b64u(uaPub),P.b64u(authS));
const salt=body.slice(0,16),idl=body[20],asPub=body.slice(21,21+idl),ct=body.slice(21+idl);assert.equal(idl,65);assert.equal(body[18]*256+body[19],4096);
const hk=async(s,k,i,l)=>new Uint8Array(await crypto.subtle.deriveBits({name:"HKDF",hash:"SHA-256",salt:s,info:i},await crypto.subtle.importKey("raw",k,"HKDF",false,["deriveBits"]),l*8));
const sec=new Uint8Array(await crypto.subtle.deriveBits({name:"ECDH",public:await crypto.subtle.importKey("raw",asPub,{name:"ECDH",namedCurve:"P-256"},false,[])},ua.privateKey,256));const te=new TextEncoder();
const cat=(...a)=>{const o=new Uint8Array(a.reduce((n,x)=>n+x.length,0));let p=0;a.forEach(x=>{o.set(x,p);p+=x.length});return o};
const prk=await hk(authS,sec,cat(te.encode("WebPush: info\0"),uaPub,asPub),32),cek=await hk(salt,prk,te.encode("Content-Encoding: aes128gcm\0"),16),nonce=await hk(salt,prk,te.encode("Content-Encoding: nonce\0"),12);
const pt=new Uint8Array(await crypto.subtle.decrypt({name:"AES-GCM",iv:nonce},await crypto.subtle.importKey("raw",cek,"AES-GCM",false,["decrypt"]),ct));assert.equal(pt.at(-1),2);assert.deepEqual(JSON.parse(new TextDecoder().decode(pt.slice(0,-1))),{title:"مرحبا",body:"x"});n++;
// --- vapid key: 65-byte public key, private imports and signs
const v=await P.makeVapid();assert.equal(P.unb64u(v.vapid_public).length,65);const k=await crypto.subtle.importKey("jwk",JSON.parse(v.vapid_private),{name:"ECDSA",namedCurve:"P-256"},false,["sign"]);assert.equal((await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},k,new Uint8Array(3))).byteLength,64);n++;
console.log("push tests: "+n+" groups passed")})().catch(e=>{console.error(e);process.exit(1)});
