// Run: node tests/smsguard.test.js   (all SMS text below is made up)
const assert=require("assert");const {smsKind}=require("../new/smsguard.js");
const cases=[
 ["promo EN (the reported bug)","Win 10,000 SAR now! Special offer, join the draw today. T&C apply.","promo"],
 ["promo AR","اربح 10,000 ريال! فرصة للفوز بجائزة في مسابقة هذا الشهر","promo"],
 ["real deposit EN","Credit: SAR 2,500.00 deposited to account ending 1234 on 01/01. Balance: SAR 9,100.00","txn"],
 ["real deposit AR","إيداع مبلغ 3,000.00 ريال في حسابك رقم 5678. الرصيد 8,000.00","txn"],
 ["real purchase","Purchase SAR 45.00 at Test Cafe, card ending 4321. Available balance 500.00","txn"],
 ["no marker","Your amount 500 SAR is waiting for you","unclear"],
];
for(const [n,t,want] of cases){assert.strictEqual(smsKind(t),want,n);console.log("ok -",n)}
