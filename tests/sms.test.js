// Run: node tests/sms.test.js  (all SMS text below is made up). Loads the reader functions straight from new/app.js.
const fs=require("fs"),assert=require("assert");
const L=fs.readFileSync(__dirname+"/../new/app.js","utf8").split("\n");
const start=L.findIndex(l=>l.startsWith("const AR_D=")),end=L.findIndex(l=>l.startsWith("// ?sms=<text>"));
const readSms=new Function(L.slice(start,end).join("\n")+"\nreturn {readSms,smsAd,smsIn}")();
const {readSms:rs,smsAd,smsIn}=readSms;
const none=[
 ["promo EN (reported bug)","Win 10,000 SAR now! Special offer, join the draw today."],
 ["promo AR","اربح 10,000 ريال! فرصة للفوز بجائزة في مسابقة هذا الشهر"],
];
const real=[
 ["deposit EN","Credit: SAR 2,500.00 deposited to account ending 1234. Balance: SAR 9,100.00"],
 ["deposit AR","إيداع مبلغ 3,000.00 ريال في حسابك رقم 5678. الرصيد 8,000.00"],
 ["purchase","Purchase SAR 45.00 at Test Cafe, card ending 4321. Available balance 500.00"],
];
for(const [n,t] of none){assert.deepStrictEqual(rs(t),[],n);console.log("ok - nothing logged:",n)}
// this reader only logs spending; deposits are recognised as money in (the server log_sms logs them as income) and must not be treated as ads
for(const [n,t] of real.slice(0,2)){assert.strictEqual(smsAd(t),false,n+" is not an ad");assert.strictEqual(smsIn(t),true,n+" is money in");console.log("ok - real deposit kept:",n)}
assert.strictEqual(rs(real[2][1]).length,1,"purchase still logs");console.log("ok - purchase logs");
