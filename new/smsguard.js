// Is this message a real bank transaction? Ads and promos must never become income or costs.
// "txn"   = a transaction word AND an account/card/balance/reference marker  -> may be logged
// "promo" = promo wording and no real transaction marker                    -> ignored
// "unclear" = neither                                                         -> goes to the "Check this" list
(function(root){
  const AR_D=t=>String(t||"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d));
  const TXN=/(\bcredit(ed)?\b|\bdebit(ed)?\b|\bdeposit(ed)?\b|\btransfer(red)?\b|\bpurchase[ds]?\b|\bpos\b|\bwithdraw(al|n)?\b|\brefund(ed)?\b|\bsalary\b|\bpayment\b|\bpaid\b|إيداع|ايداع|حوالة|تحويل|شراء|مشتريات|سحب نقدي|سحب من|مدفوعات|خصم|استرداد|راتب)/i;
  const REF=/((card|acc(ount|t)?|a\/c|iban|ending|ref(erence)?|balance|\bbal\b|avl|available)[^\n]{0,25}[0-9]{3,}|[x*•]{2,}\s?[0-9]{3,4}|\b[0-9]{4}\s?\*{2,}|(بطاقة|حساب|مدى|رقم المرجع|مرجع|رصيد|الرصيد|المتاح)[^\n]{0,25}[0-9]{3,}|[0-9]{3,}\s?(بطاقة|حساب))/i;
  const PROMO=/(\bwin(ner|ners|ning)?\b|\bprizes?\b|\boffers?\b|\bchance\b|\bcompetition\b|\bdraw\b|\bgiveaway\b|\bcongratulations\b|اربح|إربح|ربح|فرصة|جائزة|جوائز|مسابقة|سحب|عرض|عروض)/i;
  function smsKind(raw){
    const t=AR_D(raw);
    if(TXN.test(t)&&REF.test(t))return "txn";
    if(PROMO.test(t))return "promo";
    return "unclear";
  }
  root.smsKind=smsKind;
  if(typeof module!=="undefined"&&module.exports)module.exports={smsKind};
})(typeof window!=="undefined"?window:globalThis);
