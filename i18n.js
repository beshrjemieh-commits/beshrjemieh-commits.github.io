// Language: English (default) or Arabic. Arabic translates the page text and flips it right-to-left.
(function(){
  let lang = "en";
  try{ lang = localStorage.getItem("w-lang") === "ar" ? "ar" : "en"; }catch(e){}
  window.walletLang = lang;
  window.setWalletLang = function(l){ try{ localStorage.setItem("w-lang", l === "ar" ? "ar" : "en"); }catch(e){} location.reload(); };

  const D = {
"Smart Wallet":"المحفظة الذكية","Personal finance · SAR":"مالي الشخصي · ريال","+ All":"+ الكل","− All":"− الكل","✏️ Edit":"✏️ تعديل","✓ Done":"✓ تم",
"My Wallet":"محفظتي","Your balance, daily spending, price book and best deals, in one place.":"رصيدك ومصاريفك اليومية ودفتر الأسعار وأفضل العروض، في مكان واحد.",
"Balance":"الرصيد","Tap again to delete everything":"اضغط مرة أخرى لحذف كل شيء","This removes all your data and your login. It can't be undone.":"سيحذف هذا كل بياناتك وحساب الدخول. لا يمكن التراجع عنه.","Deleting…":"جارٍ الحذف…","Couldn't delete. Check your connection and try again.":"تعذّر الحذف. تحقق من الاتصال وحاول مرة أخرى.","Budget":"الميزانية","Expenses":"المصاريف","Prices":"الأسعار","Prices Log":"سجل الأسعار","Forsa":"فرصة",
"Tap a category to rename · ✕ remove · + Add. Tap ✓ Done to save.":"اضغط على الفئة لتغيير اسمها · ✕ حذف · + إضافة. اضغط ✓ تم للحفظ.",
"Hide descriptions":"إخفاء الشرح","Show descriptions":"إظهار الشرح","Reset layout":"إعادة الترتيب الأصلي","Sign out":"تسجيل الخروج","✨ Ask":"✨ اسأل",
"Add a cost":"أضف مصروف","Takes 10 seconds. Try to add everything, even small things.":"تأخذ ١٠ ثوانٍ. حاول تسجيل كل شيء، حتى الأشياء الصغيرة.",
"Amount (SAR)":"المبلغ (ريال)","Date":"التاريخ","Category":"الفئة","Coffee":"قهوة","Eating out":"أكل برّا","Grocery":"بقالة","Supermarket":"سوبرماركت","Smoking":"تدخين","Fun":"ترفيه","Fuel":"بنزين","Car care":"صيانة السيارة","Shopping":"تسوّق","Other":"أخرى","Bills":"فواتير","Phone":"جوال","Family":"العائلة","Car payment":"قسط السيارة","Rent":"إيجار","Iqama":"إقامة","Debt":"دَين",
"Note (optional)":"ملاحظة (اختياري)","Add cost":"أضف المصروف","Paste bank messages":"الصق رسائل البنك","Goals":"الأهداف","Enter both cash and bank (0 if none).":"أدخل الكاش والبنك (0 إذا لا يوجد).","Money in · 24h":"الداخل · ٢٤ ساعة","Money out · 24h":"الخارج · ٢٤ ساعة","🏁 Starting point":"🏁 نقطة البداية","＋ Add money in":"＋ أضف مبلغ داخل","✕ Close":"✕ إغلاق","Split in 2":"قسّم على فئتين","Part 2":"الجزء ٢","Part 2 amount (SAR)":"مبلغ الجزء الثاني (ريال)","Note for part 2 (optional)":"ملاحظة للجزء الثاني (اختياري)","Part 2 category":"فئة الجزء الثاني","Part 2 must be more than 0 and less than the total.":"الجزء الثاني لازم يكون أكبر من صفر وأقل من المجموع.","📋 Paste a bank message":"📋 الصق رسالة البنك","Paste":"لصق","✓ Read from the bank message. Check it, then tap Add cost.":"✓ تمت القراءة من رسالة البنك. تأكد منها ثم اضغط أضف المصروف.","No payment found in this text (no amount, or money coming in).":"ما لقينا عملية دفع في النص (لا يوجد مبلغ، أو مبلغ وارد).","Couldn't read your clipboard here. Long-press the box and tap Paste.":"تعذرت قراءة الحافظة هنا. اضغط مطولاً على المربع واختر لصق.",
"Copy one or more payment SMS from your bank (long-press the message → Copy), paste here, and I'll read the amount, shop and date.":"انسخ رسالة دفع أو أكثر من البنك (اضغط مطولاً على الرسالة ← نسخ)، والصقها هنا، وسأقرأ المبلغ والمحل والتاريخ.",
"Auto-detect":"تحديد تلقائي","📋 Paste & add":"📋 لصق وإضافة","Read messages":"اقرأ الرسائل","Check the category for each one, untick any you don't want, then add.":"تأكد من فئة كل واحدة، وأزل التحديد عن ما لا تريده، ثم أضف.","Add selected":"أضف المحدد",
"This month":"هذا الشهر","Logged spending against your plan.":"المصاريف المسجلة مقارنة بخطتك.","Spent":"المصروف","Per day":"باليوم","average":"المتوسط","Left":"المتبقي","to spend":"للصرف","+ Add card":"+ أضف بطاقة",
"Where your salary goes":"أين يذهب راتبك","Your":"راتبك","SAR salary (tap the Salary tile to change it). Left: what you spend now. Right: the plan.":"ريال شهرياً (اضغط على بطاقة الراتب لتغييره). اليسار: ما تصرفه الآن. اليمين: الخطة.",
"Salary":"الراتب","per month":"بالشهر","Known spending":"المصاريف المعروفة","what you listed":"ما سجلته","Not accounted for":"غير معروف","left over each month":"يتبقى كل شهر","Your listed costs add up to":"مجموع مصاريفك المسجلة","SAR, so about":"ريال، أي حوالي",
"SAR a month is going somewhere you haven't listed. Logging every cost for a month will show where.":"ريال شهرياً تذهب لمكان لم تسجله. تسجيل كل مصروف لمدة شهر سيكشف أين.",
"UNACCOUNTED":"غير معروف","Before":"قبل","Plan":"الخطة","Group":"المجموعة","Must pay":"إلزامي","Rent, iqama, car, bills, phone, family":"إيجار، إقامة، سيارة، فواتير، جوال، عائلة","Living":"المعيشة","Food, groceries, fuel, car care":"أكل، بقالة، بنزين، صيانة السيارة","Personal":"شخصي","Smoking, fun, shopping, other":"تدخين، ترفيه، تسوّق، أخرى","Saving":"ادخار","Emergency fund, debts, goals":"صندوق الطوارئ، الديون، الأهداف",
"Monthly budget":"الميزانية الشهرية","“Spent” and “Left” fill in by themselves from your daily log for the month shown above. Your plan amounts stay as they are until you change them.":"«المصروف» و«المتبقي» يُحسبان تلقائياً من سجلك اليومي للشهر الظاهر أعلاه. مبالغ خطتك تبقى كما هي حتى تغيّرها.",
"✏️ Edit categories":"✏️ تعديل الفئات","Reset to original numbers":"إرجاع الأرقام الأصلية","Edit categories":"تعديل الفئات","Rename, remove or add categories. Removed ones keep their past entries.":"غيّر أسماء الفئات أو احذفها أو أضف جديدة. الفئات المحذوفة تحتفظ بمصاريفها السابقة.","New category":"فئة جديدة","+ Add":"+ إضافة","Cancel":"إلغاء","Save":"حفظ","Item":"البند",
"Rent (set aside monthly)":"الإيجار (يُجنَّب شهرياً)","Iqama fees (set aside monthly)":"رسوم الإقامة (تُجنَّب شهرياً)","Car installment":"قسط السيارة","Electricity, water, internet":"كهرباء، ماء، إنترنت","Family support":"دعم العائلة","Eating out and delivery":"أكل برّا وتوصيل","Grocery (baqala, small shops)":"بقالة (محلات صغيرة)","Car care (wash, service, parts)":"صيانة السيارة (غسيل، صيانة، قطع)","Fun (outings, games, entertainment)":"ترفيه (طلعات، ألعاب، تسلية)","Shopping (clothes, online, electronics)":"تسوّق (ملابس، أونلاين، إلكترونيات)","Emergency fund":"صندوق الطوارئ","Debt repayment":"سداد الديون","Goals and investing (after debts)":"أهداف واستثمار (بعد الديون)","Total":"المجموع",
"Three months of your essential costs, so a surprise (car repair, job gap) doesn't become debt.":"مصاريف ثلاثة أشهر أساسية، حتى لا تتحول أي مفاجأة (تصليح سيارة، انقطاع عمل) إلى دَين.","Target":"الهدف","Saving each month":"الادخار الشهري","Set a monthly amount in the plan to see when you'll reach it.":"حدد مبلغاً شهرياً في الخطة لتعرف متى تصل له.",
"Salary day":"يوم الراتب","Your salary arrives on the":"راتبك ينزل يوم","10th":"١٠",". Make these transfers the same day, before spending anything.":". سوِّ هذه التحويلات في نفس اليوم، قبل أن تصرف أي شيء.","Move on salary day":"حوّل يوم الراتب",
"Debts to repay":"ديون للسداد","Record each repayment here. Debts are paid from the “Debt repayment” line in your plan, smallest first.":"سجّل كل دفعة هنا. الديون تُسدد من بند «سداد الديون» في خطتك، الأصغر أولاً.","Still owed":"المتبقي عليك","SAR":"ريال","Repaid so far":"المسدد حتى الآن","Debt-free by":"بدون ديون بحلول","Done":"تم","all debts repaid":"كل الديون مسددة","+ Add debt":"+ أضف دَين","No debts recorded.":"لا توجد ديون مسجلة.",
"You said smoking and fun together come to about 40 SAR a day. Move the slider to see what cutting back gives you.":"قلت إن التدخين والترفيه معاً حوالي ٤٠ ريال يومياً. حرّك المؤشر لترى كم توفر لو خففت.","Smoke-free streak":"أيام بدون تدخين","Log your cigarettes in Expenses and the streak starts from your last one.":"سجّل السجائر في المصاريف، والعدّاد يبدأ من آخر مرة.","Daily spend":"الصرف اليومي","Per month":"بالشهر","Per year":"بالسنة","Saved per year vs. 40 SAR/day":"التوفير بالسنة مقارنة بـ ٤٠ ريال/يوم",
"Your money right now":"فلوسك الآن","Starts from the cash and bank money you have, adds every bit of money that comes in, and takes away every cost you log in Expenses.":"يبدأ من الكاش ورصيد البنك عندك، ويضيف كل مبلغ يدخل، ويخصم كل مصروف تسجله في المصاريف.","Current balance":"الرصيد الحالي","Set your starting point below so this matches your real money.":"حدد نقطة البداية بالأسفل حتى يطابق هذا فلوسك الحقيقية.","Starting amount":"مبلغ البداية","Money in":"الداخل","Costs logged":"المصاريف المسجلة",
"Add money in":"أضف مبلغ داخل","Salary, a transfer someone sent you, a refund, cash you got back: anything that comes in.":"راتب، تحويل من شخص، استرجاع، كاش رجع لك: أي شيء يدخل.","Type":"النوع","Transfer":"تحويل","Refund":"استرجاع","From / note (optional)":"من / ملاحظة (اختياري)","Nothing added yet.":"لا شيء مضاف بعد.",
"Savings goals":"أهداف الادخار","Name something you're saving for, set the amount, and add money to it as you put it aside.":"سمِّ شيئاً تدّخر له، وحدد المبلغ، وأضف له كلما جنّبت فلوس.","New goal":"هدف جديد","Target (SAR)":"الهدف (ريال)","Add goal":"أضف هدف",
"Starting point":"نقطة البداية","Count the cash in your wallet and check your bank app, then save. Do this again any time to reset the balance to the real number.":"عُدّ الكاش في محفظتك وشيّك تطبيق البنك، ثم احفظ. كرر هذا في أي وقت لتصحيح الرصيد.","Cash on hand (SAR)":"الكاش (ريال)","Bank balance (SAR)":"رصيد البنك (ريال)","Save starting point":"احفظ نقطة البداية",
"Forsa · deals below market":"فرصة · عروض أقل من السوق","Listings on Haraj, OpenSooq and other Saudi sites priced well under what the same item usually sells for, plus the best offers from delivery, restaurant and shopping apps (Pizza Hut, HungerStation, Jahez and more), all in one place. Always inspect the item and meet the seller before buying.":"إعلانات في حراج والسوق المفتوح ومواقع سعودية أخرى بأسعار أقل بكثير من سعرها المعتاد، مع أفضل عروض تطبيقات التوصيل والمطاعم والتسوق (بيتزا هت، هنقرستيشن، جاهز وغيرها)، في مكان واحد. افحص الغرض وقابل البائع دائماً قبل الشراء.",
"Open ad":"افتح الإعلان","Open offer":"افتح العرض","See price":"شوف السعر","👥 From other users' price books":"👥 من دفاتر أسعار المستخدمين الآخرين","Items other people bought (no names shown). Tap + Add to copy one into your price book.":"أصناف اشتراها غيرك (بدون أسماء). اضغط + أضف لنسخها إلى دفتر أسعارك.","+ Add":"+ أضف","✓ Add":"✓ أضف","💡 Friends found it cheaper":"💡 غيرك لقاه أرخص","Other users paid less for items you buy. Tap ✓ Add to put that price in your price book.":"مستخدمين آخرين دفعوا أقل في أصناف تشتريها. اضغط ✓ أضف لإضافة السعر إلى دفتر أسعارك.","✎ Rename":"✎ غيّر الاسم","Shared name":"اسم موحّد","🔒 Shared name: other users bought the same item, so everyone sees one name.":"🔒 اسم موحّد: مستخدمين آخرين اشتروا نفس المنتج، فالكل يشوف نفس الاسم.","Product name":"اسم المنتج","🧾 Cheaper than I paid":"🧾 أرخص مما دفعت","☆ Save":"☆ احفظ","★ Saved":"★ محفوظ","Hide":"إخفاء",
"All categories":"كل الفئات","🍕 Food":"🍕 أكل","🛍️ Shopping":"🛍️ تسوّق","✈️ Travel":"✈️ سفر","🚗 Cars":"🚗 سيارات","📱 Electronics":"📱 إلكترونيات","👕 Clothes":"👕 ملابس","🏠 Home":"🏠 المنزل","💰 Forsa Flip":"💰 فرصة للبيع","🆕 New":"🆕 جديد","♻️ Used":"♻️ مستعمل","🔎 My searches":"🔎 بحوثاتي","Categories":"الفئات",
"Order now:":"اطلب الآن:","Shop now:":"تسوّق الآن:","Nearby on Maps ↗":"القريب على الخرائط ↗","No deals for this yet. Tap + Hunt for this and the next hourly hunt will look.":"لا توجد عروض لهذا بعد. اضغط «+ ابحث عن هذا» وسيبحث عنه البحث القادم خلال ساعة.",
"New deals":"عروض جديدة","Best profit":"أفضل ربح","Last hunt":"آخر بحث","+ Hunt for this":"+ ابحث عن هذا","🔄 Update hunt":"🔄 حدّث البحث","New":"جديد","High confidence":"ثقة عالية","App offers":"عروض التطبيقات","Saved":"المحفوظ","All":"الكل","No deals yet. The daily hunt will fill this list.":"لا توجد عروض بعد. البحث اليومي سيملأ هذه القائمة.",
"Upload photos or PDFs of your supermarket receipts. They're kept here, and Claude can read the items into your price book.":"ارفع صور أو PDF لفواتير السوبرماركت. تُحفظ هنا، ويقدر Claude يقرأ الأصناف ويضيفها لدفتر الأسعار.","⬆ Upload bill":"⬆ ارفع فاتورة","No bills yet. Tap Upload bill to add your first one.":"لا توجد فواتير بعد. اضغط ارفع فاتورة لإضافة أول واحدة.",
"Price book":"دفتر الأسعار","Write down what things cost and where. Next time you shop, check here to see which store is cheapest.":"سجّل أسعار الأشياء وأين. المرة الجاية لما تتسوق، شيّك هنا لتعرف أي محل أرخص.","Entering a receipt? Set the store once. It stays filled while you add each item.":"تدخل فاتورة؟ اختر المحل مرة واحدة، ويبقى معبأ وأنت تضيف كل صنف.","Store":"المحل","Price (SAR)":"السعر (ريال)","Size or pack (optional)":"الحجم أو العبوة (اختياري)","Save price":"احفظ السعر",
"My items":"أصنافي","Every item you've saved, with its cheapest store.":"كل صنف حفظته، مع أرخص محل له.","Items":"الأصناف","Stores":"المحلات","Prices saved":"الأسعار المحفوظة","🛒 Shopping list":"🛒 قائمة المشتريات","Clear list":"امسح القائمة","No prices yet. Add the first one above.":"لا توجد أسعار بعد. أضف أول سعر بالأعلى.","Tap an item to see every price you've saved for it. The cheapest one is shown in green.":"اضغط على أي صنف لترى كل أسعاره المحفوظة. الأرخص يظهر بالأخضر.","Nothing matches your search.":"لا نتائج لبحثك.",
"Settings":"الإعدادات","My money":"فلوسي","Name":"الاسم","Add":"أضف","Monthly salary":"الراتب الشهري","Payday":"يوم الراتب","Display":"العرض","Text size":"حجم الخط","Rename, hide or move sections":"تسمية الأقسام أو إخفاؤها أو نقلها","App":"التطبيق","Get the latest version":"حمّل آخر نسخة","Signed in as":"مسجل الدخول باسم","Smart Wallet · your data syncs to your account":"المحفظة الذكية · بياناتك تتزامن مع حسابك","Language":"اللغة","Updating…":"جارٍ التحديث…","Delete":"حذف","Tap again to delete":"اضغط مرة أخرى للحذف","Tap again":"اضغط مرة أخرى","Delete account":"حذف الحساب","Deleting your data…":"جارٍ حذف بياناتك…","Could not delete your data. Please try again.":"تعذّر حذف بياناتك. حاول مرة أخرى.",
"Open all sections":"افتح كل الأقسام","Close all sections":"أغلق كل الأقسام","Pages":"الصفحات","🔍 Search or ask: how much left for food?":"🔍 ابحث أو اسأل: كم باقي للأكل؟","Tap to show or hide":"اضغط للإظهار أو الإخفاء","e.g. lunch with work, Jahez, petrol":"مثلاً: غداء مع الدوام، جاهز، بنزين",
"Move up":"لأعلى","Move down":"لأسفل","Hide":"إخفاء","Previous month":"الشهر السابق","Next month":"الشهر التالي","Rename card":"تغيير اسم البطاقة","Hide or show card":"إخفاء أو إظهار البطاقة","Tap to change":"اضغط للتغيير","e.g. Gym, Kids school":"مثلاً: نادي، مدرسة الأولاد",
"Who / what":"مين / إيش","e.g. Company, Ahmed, Noon refund":"مثلاً: الشركة، أحمد، استرجاع نون","e.g. Umrah, New phone":"مثلاً: عمرة، جوال جديد","Search, e.g. iPhone, PS5, pizza":"ابحث، مثلاً: آيفون، بلايستيشن، بيتزا","What the hunt looks for":"ما يبحث عنه البحث","Filter deals":"تصفية العروض","e.g. Panda, Tamimi, Lulu":"مثلاً: بنده، التميمي، لولو","e.g. Almarai milk":"مثلاً: حليب المراعي","e.g. 2 L, 1 kg, 20 pack":"مثلاً: ٢ لتر، ١ كجم، ٢٠ حبة","Search items or stores":"ابحث في الأصناف أو المحلات","Search prices":"ابحث في الأسعار","Previous hint":"النصيحة السابقة","Next hint":"النصيحة التالية","Smaller text":"خط أصغر","Bigger text":"خط أكبر","Settings button":"الإعدادات",
"Your name (shown at the top)":"اسمك (يظهر بالأعلى)","Your monthly salary (SAR)":"راتبك الشهري (ريال)","Which day of the month does your salary arrive? (1 to 31)":"أي يوم في الشهر ينزل راتبك؟ (من ١ إلى ٣١)","Put all sections back the way they were?":"ترجع كل الأقسام لترتيبها الأصلي؟","Sign out of your wallet?":"تسجيل الخروج من محفظتك؟","English":"English","Still connecting… tap here to try again.":"ما زال يتصل… اضغط هنا للمحاولة مرة ثانية.","Connecting to your saved data…":"جارٍ الاتصال ببياناتك المحفوظة…","Money out":"الخارج","More info":"معلومات","Sign in":"تسجيل الدخول","Loading…":"جارٍ التحميل…","Connecting…":"جارٍ الاتصال…"
  };
  const MONTHS = {January:"يناير",February:"فبراير",March:"مارس",April:"أبريل",May:"مايو",June:"يونيو",July:"يوليو",August:"أغسطس",September:"سبتمبر",October:"أكتوبر",November:"نوفمبر",December:"ديسمبر"};
  const DAYS = {Sun:"الأحد",Mon:"الاثنين",Tue:"الثلاثاء",Wed:"الأربعاء",Thu:"الخميس",Fri:"الجمعة",Sat:"السبت"};
  const MON3 = {Jan:"يناير",Feb:"فبراير",Mar:"مارس",Apr:"أبريل",Jun:"يونيو",Jul:"يوليو",Aug:"أغسطس",Sep:"سبتمبر",Oct:"أكتوبر",Nov:"نوفمبر",Dec:"ديسمبر",May:"مايو"};
  const WDAY = {Sunday:"الأحد",Monday:"الاثنين",Tuesday:"الثلاثاء",Wednesday:"الأربعاء",Thursday:"الخميس",Friday:"الجمعة",Saturday:"السبت",Sun:"الأحد",Mon:"الاثنين",Tue:"الثلاثاء",Wed:"الأربعاء",Thu:"الخميس",Fri:"الجمعة",Sat:"السبت"};
  const mon = s => s.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g, m=>MONTHS[m]);
  const dateTxt = s => s.replace(/\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat), (\d+) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})\b/g, (m,d,n,mo,y)=>`${DAYS[d]} ${n} ${MON3[mo]} ${y}`);
  const RULES = [
    [/^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/, m=>mon(m[0])],
    [/^(.+)'s Wallet$/, m=>`محفظة ${m[1]}`],
    [/^Counting from (\S+) \(cash (.+), bank (.+)\)\.$/, m=>`محسوب من ${m[1]} (كاش ${m[2]}، بنك ${m[3]}).`],
    [/^Set your starting point below so this matches your real money\.$/, ()=>"حدد نقطة البداية بالأسفل حتى يطابق هذا فلوسك الحقيقية."],
    [/^Latest: (.+?) · (.+)$/, m=>`آخر مصروف: ${m[1]} · ${m[2].split(' · ').map(x=>D[x]||x).join(' · ')}`],
    [/^(\d+) entr(?:y|ies) in SAR$/, m=>`${m[1]} مصروف بالريال`],
    [/^in (\d+) days?$/, m=>`بعد ${m[1]} يوم`],
    [/^Next salary: (.+)$/, m=>`الراتب القادم: ${dateTxt(m[1])}`],
    [/^Nothing logged for (.+) yet\. Add your first cost above\.$/, m=>`لا شيء مسجل لشهر ${mon(m[1])} بعد. أضف أول مصروف بالأعلى.`],
    [/^Not accounted for: (.+) SAR \((\d+)%\)$/, m=>`غير معروف: ${m[1]} ريال (${m[2]}%)`],
    [/^([\d,.]+) SAR$/, m=>`${m[1]} ريال`],
    [/^(\d+)(st|nd|rd|th) of the month$/, m=>`يوم ${m[1]} من الشهر`],
    [/^(\d+)(st|nd|rd|th)$/, m=>m[1]],
    [/^(.+) (before|plan)$/, m=>D[m[1]]?`${D[m[1]]} ${m[2]==="before"?"قبل":"الخطة"}`:null],
    [/^💰 Balance (.+) SAR for (\d+) days? until salary: about (.+) SAR a day\.$/, m=>`💰 رصيدك ${m[1]} ريال لمدة ${m[2]} يوم حتى الراتب: حوالي ${m[3]} ريال يومياً.`],
    [/^⚠️ (.+) is (.+) SAR over this month's budget\.$/, m=>`⚠️ ${D[m[1]]||m[1]} تجاوز ميزانية الشهر بـ ${m[2]} ريال.`],
    [/^🚭 Skipping cigarettes for a day saves about (.+) SAR \((.+) a month\)\.$/, m=>`🚭 ترك السجائر يوماً واحداً يوفر حوالي ${m[1]} ريال (${m[2]} بالشهر).`],
    [/^💰 About (.+) SAR a day keeps you safe until salary day\.$/, m=>`💰 حوالي ${m[1]} ريال يومياً تكفيك حتى يوم الراتب.`],
    [/^💵 Last money in: (.+) SAR on (.+)\. Log your salary on the (\d+)\w*\.$/, m=>`💵 آخر مبلغ دخل: ${m[1]} ريال بتاريخ ${m[2]}. سجّل راتبك يوم ${m[3]}.`],
    [/^💵 Log your salary here on the (\d+)\w* so your balance stays right\.$/, m=>`💵 سجّل راتبك هنا يوم ${m[1]} حتى يبقى رصيدك صحيحاً.`],
    [/^🗓️ (\d+) days? until salary\. Make the transfers on the same day, before spending\.$/, m=>`🗓️ باقي ${m[1]} يوم على الراتب. سوِّ التحويلات في نفس اليوم، قبل الصرف.`],
    [/^🚭 Cigarettes this month: (.+) SAR\. That's (.+) SAR a year at this rate\.$/, m=>`🚭 السجائر هذا الشهر: ${m[1]} ريال. يعني ${m[2]} ريال بالسنة بهذا المعدل.`],
    [/^✅ Every category is within budget this month\.$/, ()=>"✅ كل الفئات ضمن الميزانية هذا الشهر."],
    [/^⚠️ Over budget this month by (.+) SAR\. Spent (.+) of (.+) planned\.$/, m=>`⚠️ تجاوزت ميزانية هذا الشهر بـ ${m[1]} ريال. صرفت ${m[2]} من ${m[3]} مخطط.`],
    [/^⚠️ Over budget: (.+)\.$/, m=>`⚠️ تجاوز الميزانية: ${m[1].replace(/ SAR$/,"")} ريال.`],
    [/^✅ (\d+) high-confidence deals? waiting for you\.$/, m=>`✅ ${m[1]} عرض بثقة عالية بانتظارك.`],
    [/^💡 Best flip: (.+), \+(.+) SAR \((\d+)% below market\)\.$/, m=>`💡 أفضل فرصة: ${m[1]}، +${m[2]} ريال (أقل من السوق بـ ${m[3]}%).`],
    [/^💡 Buy at (.+): (.+) SAR cheaper than (.+)\.$/, m=>`💡 اشترِ من ${m[1]}: أرخص بـ ${m[2]} ريال من ${m[3]}.`],
    [/^💡 Good time to buy: this is the lowest price you've seen\.$/, ()=>"💡 وقت مناسب للشراء: هذا أقل سعر شفته."],
    [/^💡 Add this item's price from another store to compare\.$/, ()=>"💡 أضف سعر هذا الصنف من محل ثاني للمقارنة."],
    [/^💡 Add the same item from a second store to get money-saving hints here\.$/, ()=>"💡 أضف نفس الصنف من محل ثاني لتظهر لك نصائح التوفير هنا."],
    [/^👀 (.+): only (.+) SAR left this month\.$/, m=>`👀 ${D[m[1]]||m[1]}: باقي ${m[2]} ريال فقط هذا الشهر.`],
    [/^📅 Today so far: (.+) SAR logged\.$/, m=>`📅 اليوم حتى الآن: ${m[1]} ريال مسجلة.`],
    [/^📆 (.+) is usually cheapest on (\w+)\.$/, m=>`📆 ${m[1]} غالباً أرخص يوم ${WDAY[m[2]]||m[2]}.`],
    [/^🔎 No deals yet\. Add what you want with "\+ Hunt for this" and tap Update hunt\.$/, ()=>"🔎 لا توجد عروض بعد. أضف ما تريده بزر «+ ابحث عن هذا» ثم اضغط حدّث البحث."],
    [/^⏳ Update requested (.+)\. It runs within the hour\.$/, m=>`⏳ طُلب التحديث ${m[1]}. سيتم خلال ساعة.`],
    [/^✓ Hunt updated (.+?)\.(?: (.+))?$/, m=>`✓ تم تحديث البحث ${m[1]}.${m[2]?" "+m[2]:""}`],
    [/^Found (\d+) payments(?:, skipped (\d+))?\.$/, m=>`وجدنا ${m[1]} عمليات دفع${m[2]?`، وتجاهلنا ${m[2]}`:""}.`],
    [/^✨ Auto: (.+)$/, m=>`✨ تلقائي: ${D[m[1]]||m[1]}`],
    [/^Part 1: ([\d,.\-]+) SAR · (.+)$/, m=>`الجزء ١: ${m[1]} ريال · ${D[m[2]]||m[2]}`],
    [/^Saved ([\d,.]+) SAR · (.+) \+ ([\d,.]+) SAR · (.+)$/, m=>`تم حفظ ${m[1]} ريال · ${D[m[2]]||m[2]} + ${m[3]} ريال · ${D[m[4]]||m[4]}`],
    [/^Found at (.+)$/, m=>`لقيناه عند ${m[1]}`],
    [/^👥 Others paid this at (.+) \((\d+) (?:person|people)\)$/, m=>`👥 غيرك اشتراه عند ${m[1]} (${m[2]} ${m[2]==="1"?"شخص":"أشخاص"})`],
    [/^👥 Others paid ([\d,.]+) at (.+)$/, m=>`👥 غيرك دفع ${m[1]} عند ${m[2]==="a store"?"محل":m[2]}`],
    [/^👥 (.+) \((\d+) (?:person|people)\)$/, m=>`👥 ${m[1]==="Store not set"?"المحل غير محدد":m[1]} (${m[2]} ${m[2]==="1"?"شخص":"أشخاص"})`],
    [/^👥 Cheaper at (.+): you paid ([\d,.]+)$/, m=>`👥 أرخص عند ${m[1]==="another store"?"محل ثاني":m[1]}: أنت دفعت ${m[2]}`],
    [/^Added (.+) to your price book\.$/, m=>`تمت إضافة ${m[1]} إلى دفتر أسعارك.`],
    [/^Renamed to (.+)\.$/, m=>`تم تغيير الاسم إلى ${m[1]}.`],
    [/^Renamed (\d+) of (\d+)\. Try again\.$/, m=>`تم تغيير ${m[1]} من ${m[2]}. حاول مرة ثانية.`],
    [/^Similar at (.+?): (.+?)(?: \(([\d,.]+) SAR\))?$/, m=>`منتج مشابه عند ${m[1]}: ${m[2]==="close match"?"قريب منه":m[2]}${m[3]?` (${m[3]} ريال)`:""}`],
    [/^You paid ([\d,.]+) SAR(?: at (.+))?$/, m=>`دفعت ${m[1]} ريال${m[2]?" عند "+m[2]:""}`],
    [/^Save ([\d,.]+) SAR \((\d+)%\)$/, m=>`وفّر ${m[1]} ريال (${m[2]}%)`],
    [/^🧾 (.+) is ([\d,.]+) SAR cheaper at (.+) than you paid\.$/, m=>`🧾 ${m[1]} أرخص بـ ${m[2]} ريال عند ${m[3]} من اللي دفعته.`],
    [/^🍕 (.+?)(?: · code (.+))?$/, m=>`🍕 ${m[1]}${m[2]?" · كود "+m[2]:""}`],
    [/^🤝 (.+): offer about (.+) SAR first\. Sellers on Haraj usually take 5-10% off, and you'd resell near (.+)\.$/, m=>`🤝 ${m[1]}: اعرض حوالي ${m[2]} ريال أولاً. البائعين في حراج غالباً ينزلون ٥-١٠٪، وتقدر تبيعه بحوالي ${m[3]}.`],
    [/^⏰ (.+?) offer ends (today|tomorrow|in (\d+) days): (.+)$/, m=>`⏰ عرض ${m[1]} ينتهي ${m[2]==="today"?"اليوم":m[2]==="tomorrow"?"بكرة":"بعد "+m[3]+" أيام"}: ${m[4]}`],
    [/^📱 Buying a used phone\? .+$/, ()=>"📱 بتشتري جوال مستعمل؟ تأكد أن حساب iCloud أو Google مسجّل خروج، وشيّك صحة البطارية، وأن رقم IMEI يطابق الكرتون."],
    [/^🚗 Buying a used car\? .+$/, ()=>"🚗 بتشتري سيارة مستعملة؟ شيّك مخالفاتها وتاريخها في أبشر، وسوّ لها فحص قبل الدفع."],
    [/^⚠️ (\d+) low-confidence deals?: .+$/, m=>`⚠️ ${m[1]} عرض بثقة منخفضة: إعلانات مشابهة قليلة، فتأكد من السعر قبل ما تروح.`],
    [/^★ (\d+) saved deals?\. Check them before they're gone\.$/, m=>`★ ${m[1]} عرض محفوظ. شيّك عليها قبل ما تروح.`],
    [/^👀 Always see the item and meet in a safe public place before paying\.$/, ()=>"👀 دائماً عاين الغرض وقابل البائع في مكان عام وآمن قبل الدفع."],
    [/^❗ Important: set your starting point so your balance matches your real money\.$/, ()=>"❗ مهم: حدد نقطة البداية حتى يطابق رصيدك فلوسك الحقيقية."],
    [/^❗ Important: you haven't checked your accounts in (\d+) days\. Count your cash and check your bank app\.$/, m=>`❗ مهم: لم تراجع حساباتك منذ ${m[1]} يوم. عُدّ الكاش وشيّك تطبيق البنك.`],
    [/^🔁 Check your total accounts once a week\. Last checked (today|(\d+) days? ago)\.$/, m=>`🔁 راجع مجموع حساباتك مرة كل أسبوع. آخر مراجعة: ${m[2]?"قبل "+m[2]+" يوم":"اليوم"}.`],
    [/^🎯 (.+): (.+) SAR to go\. Putting in (.+) a month finishes it in 6 months\.$/, m=>`🎯 ${m[1]}: باقي ${m[2]} ريال. لو حطيت ${m[3]} بالشهر تخلّصه في ٦ أشهر.`],
    [/^🎯 Add a goal, like an emergency fund\. Saving is easier with a target\.$/, ()=>"🎯 أضف هدفاً، مثل صندوق طوارئ. الادخار أسهل لما يكون عندك هدف."],
    [/^📅 Today: (.+) SAR in (\d+) items?\. Keep logging small things too\.$/, m=>`📅 اليوم: ${m[1]} ريال في ${m[2]} مصروف. استمر بتسجيل الأشياء الصغيرة.`],
    [/^📅 Nothing logged today yet\. Even a coffee counts\.$/, ()=>"📅 لا شيء مسجل اليوم بعد. حتى القهوة تُحسب."],
    [/^📊 (.+) takes (\d+)% of this month's spending \((.+) of (.+) SAR\)\.$/, m=>`📊 ${D[m[1]]||m[1]} يأخذ ${m[2]}% من مصاريف هذا الشهر (${m[3]} من ${m[4]} ريال).`],
    [/^🔍 Most of your money is really going to (.+)\.$/, m=>`🔍 أغلب فلوسك تذهب فعلاً إلى ${m[1].split(", ").map(x=>{ const k=x.replace(/ \d+%$/,""); return (D[k]||k)+x.slice(k.length); }).join("، ")}.`],
    [/^⛓️ (.+) SAR of debt left\. Paying the smallest first builds momentum\.$/, m=>`⛓️ باقي ${m[1]} ريال ديون. سداد الأصغر أولاً يعطيك دفعة.`],
    [/^🎉 No debt left!$/, ()=>"🎉 ما عليك ديون!"],
    [/^🧾 (\d+) bills? not read yet\. Tap Read items to add the prices\.$/, m=>`🧾 ${m[1]} فاتورة لم تُقرأ بعد. اضغط اقرأ الأصناف لإضافة الأسعار.`],
    [/^🧾 More receipts mean smarter price hints\. Upload your next bill\.$/, ()=>"🧾 فواتير أكثر تعني نصائح أسعار أذكى. ارفع فاتورتك الجاية."],
    [/^💡 Don't buy now if you can wait: it was (.+) on (.+), now (.+)\.$/, m=>`💡 لا تشترِ الآن لو تقدر تنتظر: كان ${m[1]} بتاريخ ${m[2]}، والآن ${m[3]}.`],
    [/^💡 The (.+) pack is cheaper per (kg|litre) \((.+) vs (.+)\)\.$/, m=>`💡 عبوة ${m[1]} أرخص لكل ${m[2]==="kg"?"كيلو":"لتر"} (${m[3]} مقابل ${m[4]}).`],
    [/^💡 Best value size: cheaper per (kg|litre) than the (.+) pack\.$/, m=>`💡 أفضل حجم قيمةً: أرخص لكل ${m[1]==="kg"?"كيلو":"لتر"} من عبوة ${m[2]}.`],
    [/^(.+?): (💡.+|[^💡].+)$/, m=>{ const r=tr(m[2]); return r?`${m[1]}: ${r}`:null; }],
  ];
  function tr(s){
    const t = s.replace(/\s+/g," ").trim(); if(!t) return null;
    if(D[t]) return D[t];
    for(const [re,f] of RULES){ const m=t.match(re); if(m){ const r=f(m); if(r) return r; } }
    return null;
  }
  window.T = s => lang==="ar" ? (tr(s)||s) : s;
  if(lang !== "ar") return;

  const html = document.documentElement; html.lang = "ar"; html.dir = "rtl";
  const css = document.createElement("style");
  css.textContent = `@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap");
:root{--sans:"IBM Plex Sans Arabic","IBM Plex Sans",system-ui,-apple-system,sans-serif}
html[dir=rtl] .r,html[dir=rtl] th.r,html[dir=rtl] td.r{text-align:left}
html[dir=rtl] .eyebrow,html[dir=rtl] .grp{letter-spacing:0}
html[dir=rtl] #setSheet .row .val::after{content:" ‹"}
@keyframes tickR{to{transform:translateX(50%)}}
html[dir=rtl] .hintbar .mq.tick{animation-name:tickR!important}
html[dir=rtl] .num,html[dir=rtl] input[type=number]{direction:ltr;unicode-bidi:isolate}`;
  (document.head||html).appendChild(css);

  const ATTRS = ["placeholder","aria-label","title"];
  const KEYED = el => el && (el.tagName==="H2" || el.id==="wTitle" || el.getAttribute("role")==="tab");
  function doText(n){
    const p = n.parentElement; if(!p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName) || p.isContentEditable) return;
    if(p.closest("[data-noi18n]")) return;
    const v = n.nodeValue; const r = tr(v); if(!r || r===v.trim()) return;
    if(KEYED(p) && !p.dataset.en) p.dataset.en = p.textContent.trim();
    const lead = v.match(/^\s*/)[0], tail = v.match(/\s*$/)[0];
    n.nodeValue = lead + r + tail;
  }
  function doEl(el){
    for(const a of ATTRS){ const v=el.getAttribute(a); if(v){ const r=tr(v); if(r && r!==v) el.setAttribute(a,r); } }
  }
  function walk(root){
    if(root.nodeType===3){ doText(root); return; }
    if(root.nodeType!==1) return;
    doEl(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
    let n; while((n=w.nextNode())){ if(n.nodeType===3) doText(n); else doEl(n); }
  }
  const mo = new MutationObserver(list=>{
    for(const m of list){
      if(m.type==="characterData") doText(m.target);
      else if(m.type==="attributes") doEl(m.target);
      else m.addedNodes.forEach(walk);
    }
  });
  mo.observe(html, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:ATTRS});
  document.addEventListener("DOMContentLoaded", ()=>walk(document.body));
  // Native dialogs
  const P = window.prompt.bind(window), C = window.confirm.bind(window), A = window.alert.bind(window);
  window.prompt = (m,d)=>P(T(String(m||"")),d); window.confirm = m=>C(T(String(m||""))); window.alert = m=>A(T(String(m||"")));
})();
