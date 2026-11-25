/* Smart Wallet: first-time questions, the "how to use" tour and the bank-message Shortcut guide.
   Light mode, original look (white top + navy wave, corner-tab cards, IBM Plex, Phosphor icons), English + Arabic.
   window.WOB.setup(ctx)  first-time questions (6 steps + "Here is your month"); ctx.save(answers) stores them, ctx.done(how) after
   window.WOB.tour(ctx)   spotlight tour over the real Home (gear, search, 4 cards, 3 quick buttons)
   window.WOB.guide(ctx)  12 drawn steps to set up Beshr's original Shortcut (Wallet tap -> Text -> Copy -> open app with ?sms=) */
(function(){
const PH=n=>window.PH?window.PH(n):"";
const RS="⃁",nf=new Intl.NumberFormat("en-US"),fm=n=>nf.format(Math.round(+n||0)),M=v=>`<bdi dir="ltr">${RS}${typeof v=="number"?(v%1?v.toFixed(2):fm(v)):v}</bdi>`;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let AR=false;const T=(e,a)=>AR?a:e;
const NAVY="#0F2A4A",BLUE="#2563EB",GR="#16A34A",AMB="#F59E0B",G="#64748B";
const WAVE=`<svg viewBox="0 0 786 40" preserveAspectRatio="none"><path d="M0,20 C98,0 295,0 393,20 C491,40 688,40 786,20 L786,40 L0,40Z"/></svg>`;

const CSS=`
.wob{position:fixed;inset:0;z-index:9000;display:flex;flex-direction:column;background:linear-gradient(#16365E,#0F2A4A);color:#0F172A;font-family:"Riyal","IBM Plex Sans","IBM Plex Sans Arabic",sans-serif;font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased;opacity:0;transition:opacity .25s}
.wob[dir=rtl]{font-family:"Riyal","IBM Plex Sans Arabic","IBM Plex Sans",sans-serif}
.wob.on{opacity:1}
.wob button,.wob input{font:inherit;color:inherit}
.wob svg{width:1em;height:1em;fill:currentColor}
.wob .top{position:relative;background:#fff;padding:calc(12px + env(safe-area-inset-top,0px)) 16px 14px;flex:none}
.wob .top .wwv{position:absolute;left:0;right:0;top:calc(100% - 1px);height:28px;overflow:hidden;transform:scaleY(-1);pointer-events:none;direction:ltr}
.wob .top .wwv svg{width:200%;height:100%;fill:#fff;animation:wobwv 16s linear infinite}
@keyframes wobwv{to{transform:translateX(-50%)}}
.wob .wbar{display:flex;align-items:center;gap:8px;height:32px}
.wob .bk{width:32px;height:32px;border:0;background:#EEF2F7;border-radius:16px;display:grid;place-items:center;color:${NAVY};font-size:16px;cursor:pointer;flex:none}
.wob[dir=rtl] .bk svg{transform:scaleX(-1)}
.wob .bk[hidden]{visibility:hidden;display:grid}
.wob .seg{flex:1;display:flex;gap:4px}
.wob .seg i{flex:1;height:4px;border-radius:2px;background:#E2E8F0;overflow:hidden;position:relative}
.wob .seg i::after{content:"";position:absolute;inset:0;background:${NAVY};transform:scaleX(0);transform-origin:left;transition:transform .35s ease}
.wob[dir=rtl] .seg i::after{transform-origin:right}
.wob .seg i.on::after{transform:none}
.wob .lg{height:28px;padding:0 12px;border-radius:14px;border:1px solid #E2E8F0;background:#fff;font-size:13px;font-weight:500;color:${NAVY};cursor:pointer;flex:none}
.wob .kk{margin-top:14px;font-size:13px;font-weight:600;color:${G}}
.wob h1{margin:2px 0 0;font-size:26px;line-height:1.2;font-weight:600;color:${NAVY};letter-spacing:-.01em}
.wob[dir=rtl] h1{line-height:1.5;letter-spacing:0}
.wob .ld{margin:6px 0 0;font-size:15px;color:${G};line-height:1.45}
.wob[dir=rtl] .ld{line-height:1.7}
.wob .body{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:40px 16px 12px;overscroll-behavior:contain}
.wob .foot{flex:none;padding:8px 16px calc(14px + var(--sab,env(safe-area-inset-bottom,0px)))}
body .wob .top,body .wob .body,body .wob .foot,body .wgd .wgh,body .wgd .gs{padding-left:calc(16px + max(0px,(100vw - 560px)/2));padding-right:calc(16px + max(0px,(100vw - 560px)/2))}
.wob .cta{width:100%;height:52px;border:0;border-radius:14px;background:#fff;color:${BLUE};font-weight:600;font-size:17px;cursor:pointer;box-shadow:0 10px 24px -12px rgba(0,0,0,.6);transition:opacity .2s,transform .1s}
.wob .cta:active{transform:scale(.98)}
.wob .cta[disabled]{opacity:.45}
.wob .wlnk{display:block;margin:6px auto 0;height:40px;border:0;background:none;color:#BFD2E6;font-size:14px;cursor:pointer}
.wob .cd{position:relative;background:#fff;border-radius:16px;padding:14px;margin-bottom:12px;box-shadow:0 12px 28px -18px rgba(0,0,0,.7)}
.wob .cd.tab{padding-top:12px}
.wob .ctb{position:absolute;top:0;inset-inline-start:0;width:38px;height:38px;border-radius:16px 0 12px 0;background:#EEF2F7;color:${NAVY};display:grid;place-items:center;font-size:20px}
.wob[dir=rtl] .ctb{border-radius:0 16px 0 12px}
.wob .ck{margin-inline-start:34px;font-size:16px;font-weight:600;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:20px}
.wob .ck small{font-size:13px;font-weight:500;color:${G}}
.wob .q{font-size:16px;line-height:1.45;margin:16px 0 12px;font-weight:500}
.wob[dir=rtl] .q{line-height:1.7}
.wob .op{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:50px;padding:0 14px;margin-top:8px;border:1px solid #E2E8F0;border-radius:12px;background:#F8FAFC;font-size:16px;cursor:pointer;text-align:start;transition:border-color .15s,background .15s}
.wob .op::after{content:"";width:18px;height:18px;border-radius:50%;border:1.5px solid #CBD5E1;flex:none;transition:all .15s}
.wob .op.on{border-color:${BLUE};background:#EFF6FF}
.wob .op.on::after{border:6px solid ${BLUE}}
.wob .wamt{display:flex;align-items:baseline;gap:6px;margin:18px 0 4px;border-bottom:1.5px solid #E2E8F0;padding-bottom:6px}
.wob .wamt:focus-within{border-color:${BLUE}}
.wob .wamt b{font-size:30px;font-weight:600;color:${NAVY}}
.wob .wamt input{flex:1;min-width:0;border:0;outline:0;background:none;font-size:40px;font-weight:600;color:${NAVY};padding:0}
.wob .wamt input::placeholder{color:#CBD5E1}
.wob .pd{display:flex;align-items:center;justify-content:space-between;margin-top:14px;font-size:15px;color:${G}}
.wob .stp{display:flex;align-items:center;gap:4px;background:#F1F5F9;border-radius:12px;padding:3px}
.wob .stp button{width:36px;height:36px;border:0;border-radius:10px;background:#fff;color:${BLUE};font-size:20px;font-weight:500;cursor:pointer;line-height:1}
.wob .stp b{min-width:64px;text-align:center;font-size:16px;font-weight:600;color:${NAVY}}
.wob .row{display:flex;align-items:center;gap:10px;min-height:48px;border-top:1px solid #F1F5F9}
.wob .row:first-of-type{border-top:0}
.wob .row .ic{width:32px;height:32px;border-radius:10px;background:#EEF2F7;color:${NAVY};display:grid;place-items:center;font-size:18px;flex:none}
.wob .row .wnm{flex:1;min-width:0;font-size:15px}
.wob .row input.n{width:100%;border:0;border-bottom:1px dashed #CBD5E1;outline:0;background:none;font-size:15px;padding:2px 0}
.wob .row .v{display:flex;align-items:center;gap:2px;color:${G};font-size:15px}
.wob .row .v input{width:72px;border:0;border-bottom:1px dashed #CBD5E1;outline:0;background:none;text-align:end;font-size:16px;font-weight:500;color:#0F172A;padding:2px 0}
.wob .row .v input:focus,.wob .row input.n:focus{border-bottom-color:${BLUE}}
.wob .wx{width:32px;height:32px;border:0;background:none;color:#94A3B8;font-size:16px;cursor:pointer;display:grid;place-items:center}
.wob .add{border:0;background:none;color:${BLUE};font-size:15px;font-weight:500;height:40px;cursor:pointer;padding:0}
.wob .pills{display:flex;flex-wrap:wrap;gap:6px;padding:6px 0 2px}
.wob .pill{height:34px;padding:0 12px;border-radius:17px;border:1px solid #DBEAFE;background:#EFF6FF;color:${BLUE};font-size:14px;cursor:pointer}
.wob .gl{margin-top:10px;display:flex;align-items:center;gap:10px;font-size:14px;color:${G}}
.wob .gl input[type=range]{flex:1;accent-color:${BLUE}}
.wob .gl b{color:#0F172A;font-weight:500;min-width:110px;text-align:end}
.wob .pr{display:flex;align-items:center;gap:12px;margin-top:16px}
.wob .wph{width:72px;height:72px;border-radius:14px;background:#F1F5F9;display:grid;place-items:center;color:#94A3B8;font-size:30px;flex:none;overflow:hidden}
.wob .wph img{width:100%;height:100%;object-fit:contain;background:#fff}
.wob .pn{flex:1;min-width:0}
.wob .pn b{display:block;font-size:17px;font-weight:600;color:${NAVY}}
.wob .pn small{display:block;font-size:13px;color:${G};margin-top:2px}
.wob .pp{display:flex;align-items:baseline;gap:8px;margin-top:6px}
.wob .pp s{color:#94A3B8;font-size:15px}
.wob .pp b{font-size:24px;font-weight:600;color:${GR}}
.wob .bdg{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 9px;border-radius:12px;font-size:12px;font-weight:600;background:#FEF3C7;color:#92400E}
.wob .bdg.g{background:#DCFCE7;color:#166534}
.wob .bdg.n{background:#EFF6FF;color:${BLUE}}
.wob .bdg.u{background:#F1F5F9;color:${NAVY}}
.wob .tk{display:flex;align-items:center;gap:6px;font-size:13px;color:${G};margin-top:12px}
.wob .tk i{width:8px;height:8px;border-radius:4px;background:${AMB};animation:wobp 1.2s ease-in-out infinite}
@keyframes wobp{50%{opacity:.3}}
.wob .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.wob .wdk{position:relative;background:#fff;border-radius:16px;padding:12px;border:2px solid transparent;cursor:pointer;text-align:start;transition:border-color .15s,transform .15s;box-shadow:0 12px 28px -18px rgba(0,0,0,.7)}
.wob .wdk.on{border-color:${BLUE};transform:translateY(-3px)}
.wob .wdk .wph{width:100%;height:96px;margin:10px 0 8px}
.wob .wdk .wnm{font-size:14px;font-weight:600;color:${NAVY};line-height:1.3;min-height:36px}
.wob .wdk .src{font-size:12px;color:${G};margin-top:2px}
.wob .wdk .pp b{font-size:20px;color:${AMB}}
.wob .wdk .pp s{font-size:13px}
.wob .wdk .pc{font-size:12px;font-weight:600;color:#92400E;margin-top:4px}
.wob .wdk .tick{position:absolute;top:10px;inset-inline-end:10px;width:22px;height:22px;border-radius:11px;border:1.5px solid #CBD5E1;background:#fff}
.wob .wdk.on .tick{background:${BLUE};border-color:${BLUE}}
.wob .wdk.on .tick::after{content:"";position:absolute;left:7px;top:3px;width:5px;height:10px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}
.wob .both{display:block;width:100%;height:46px;margin-top:10px;border-radius:12px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;font-size:15px;cursor:pointer}
.wob .both.on{background:#fff;color:${BLUE};border-color:#fff;font-weight:600}
.wob .say{min-height:22px;margin:12px 2px 0;font-size:14px;color:#DBEAFE;line-height:1.5;transition:opacity .2s}
.wob .say b{color:#fff;font-weight:600}
.wob .wsb{display:flex;height:46px;border-radius:12px;overflow:hidden;gap:3px;margin:16px 0 14px}
.wob .wsb i{height:100%;transition:flex-grow .9s cubic-bezier(.3,.7,.2,1);flex-basis:0;flex-grow:0.001}
.wob .lr{display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-top:1px solid #F1F5F9}
.wob .lr:first-of-type{border-top:0}
.wob .lr .wsw{width:10px;height:10px;border-radius:3px;margin-top:6px;flex:none}
.wob .lr span{flex:1;font-size:15px}
.wob .lr span small{display:block;font-size:13px;color:${G};margin-top:2px}
.wob .lr b{font-size:20px;font-weight:600;color:${NAVY}}
.wob .bn{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;padding-top:12px;border-top:1px solid #F1F5F9;font-size:14px}
.wob .bn small{display:block;font-size:12px;color:${G};margin-bottom:3px}
.wob .bn s{color:#94A3B8}
.wob .bn .nw small{color:${GR}}
.wob .pv{text-align:center;font-size:13px;color:#BFD2E6;margin-top:6px}
.wob .stage{transition:opacity .2s,transform .28s cubic-bezier(.3,.7,.2,1)}
.wob .stage.out{opacity:0;transform:translateX(-24px)}
.wob .stage.in{opacity:0;transform:translateX(24px)}
.wob[dir=rtl] .stage.out{transform:translateX(24px)}
.wob[dir=rtl] .stage.in{transform:translateX(-24px)}
.wob .tw{transition:opacity .2s}
.wob .tw.out{opacity:0}

.wob .fcard{padding:12px 0 14px;overflow:hidden}
.wob .fcard .ck{margin-inline-start:48px;padding-inline-end:14px}
.wob .fcard.done .fsp path{animation:none;stroke-dashoffset:0}
.wob .fpad{padding:0 14px}
.wob .fhero{position:relative;margin:12px 0;background:radial-gradient(120% 90% at 50% 30%,#FFFFFF 0%,#EEF2F7 70%,#E2E8F0 100%)}
.wob .fimg{position:absolute;inset:12px 0;display:grid;place-items:center}
.wob .fimg img{max-height:100%;max-width:70%;object-fit:contain;filter:drop-shadow(0 10px 14px rgba(15,42,74,.18))}
.wob .fico{font-size:84px;color:#94A3B8;line-height:0}
.wob .ftag{position:absolute;top:12px;inset-inline-end:14px;width:60px;height:60px;border-radius:50%;background:${AMB};color:#fff;display:grid;place-items:center;transform:rotate(-10deg);box-shadow:0 8px 18px -8px rgba(180,83,9,.7)}
.wob .ftag b{font-size:17px;font-weight:600}
.wob .ftime{position:absolute;bottom:10px;inset-inline-start:14px;display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 10px;border-radius:13px;background:rgba(255,255,255,.92);font-size:12px;color:${G};box-shadow:0 2px 8px rgba(15,42,74,.12)}
.wob .ftime b{color:${NAVY};font-weight:600}
.wob .ftime.solo{position:static;margin:12px 0 10px;background:#FEF3C7;color:#92400E;box-shadow:none}
.wob .ftime.solo b{color:#92400E}
.wob .fpr{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.wob .fnm{font-size:17px;font-weight:600;color:${NAVY};line-height:1.3}
.wob .fsz{display:block;font-size:13px;color:${G};margin-top:2px}
.wob .fpp{text-align:end;flex:none}
.wob .fold{display:block;font-size:14px;color:#94A3B8}
.wob .fnew{display:block;font-size:32px;font-weight:600;color:${GR};line-height:1.1}
.wob .fsave{display:inline-flex;align-items:center;gap:5px;margin-top:10px;height:28px;padding:0 10px;border-radius:14px;background:#DCFCE7;color:#166534;font-size:13px;font-weight:600}
.wob .fduel{margin-top:12px;display:grid;gap:6px}
.wob .fdr{display:grid;grid-template-columns:76px 1fr auto;align-items:center;gap:8px;font-size:13px;color:${G}}
.wob .fdr b{font-weight:500;color:${G};min-width:52px;text-align:end}
.wob .fdr.w .fdn,.wob .fdr.w b{color:#0F172A;font-weight:600}
.wob .fdn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wob .fdb{height:8px;border-radius:4px;background:#F1F5F9;overflow:hidden}
.wob .fdb i{display:block;height:100%;width:0;border-radius:4px;background:#CBD5E1;transition:width .8s cubic-bezier(.3,.7,.2,1)}
.wob .fdr.w .fdb i{background:${GR}}
.wob .fyr{display:flex;align-items:center;gap:10px;margin-top:12px;padding:10px 12px;border-radius:12px;background:#F8FAFC;font-size:14px;color:#334155;line-height:1.4}
.wob .fyr b{color:${GR};font-weight:600}
.wob svg.fsp{width:56px;height:22px;flex:none;fill:none}
.wob .fsp path{fill:none;stroke:${GR};stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:90;stroke-dashoffset:90;animation:wobdraw 1s .5s ease-out forwards}
@keyframes wobdraw{to{stroke-dashoffset:0}}
.wob .fsoc{display:flex;align-items:center;gap:8px;margin-top:12px;font-size:13px;color:${G}}
.wob .fav{display:flex}
.wob .fav i{width:22px;height:22px;border-radius:11px;border:2px solid #fff;background:hsl(var(--h) 45% 78%);margin-inline-start:-6px}
.wob .fav i:first-child{margin-inline-start:0}
.wob .fbtns{display:flex;gap:8px;padding:14px 14px 0}
.wob .fadd{flex:1;height:48px;border:0;border-radius:12px;background:${BLUE};color:#fff;font-size:15px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:background .25s}
.wob .fadd svg{width:18px;height:18px}
.wob .fadd.on{background:${GR}}
.wob .fck{width:16px;height:16px;position:relative}
.wob .fck::after{content:"";position:absolute;left:5px;top:1px;width:5px;height:10px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}
.wob .fno{flex:none;height:48px;padding:0 14px;border:1px solid #E2E8F0;border-radius:12px;background:#fff;color:${G};font-size:14px;cursor:pointer}
.wob .fno.on{border-color:${BLUE};color:${BLUE}}

/* ---- tour ---- */
#wtour{position:fixed;inset:0;z-index:9100;font-family:"Riyal","IBM Plex Sans","IBM Plex Sans Arabic",sans-serif;-webkit-font-smoothing:antialiased}
#wtour[dir=rtl]{font-family:"Riyal","IBM Plex Sans Arabic","IBM Plex Sans",sans-serif}
#wtour .hole{position:absolute;border-radius:16px;box-shadow:0 0 0 2000px rgba(8,20,38,.72);transition:all .42s cubic-bezier(.3,.7,.2,1);pointer-events:none}
#wtour .hole::after{content:"";position:absolute;inset:-5px;border-radius:inherit;border:2px solid #93C5FD;animation:wtring 1.6s ease-out infinite}
@keyframes wtring{0%{opacity:1;inset:-3px}100%{opacity:0;inset:-14px}}
#wtour .tip{position:absolute;left:16px;right:16px;background:#fff;border-radius:16px;padding:14px 16px 12px;box-shadow:0 18px 40px -12px rgba(0,0,0,.6);transition:top .42s cubic-bezier(.3,.7,.2,1),opacity .2s;color:#0F172A}
#wtour .tip::before{content:"";position:absolute;width:14px;height:14px;background:#fff;transform:rotate(45deg);left:var(--ax,50%);margin-left:-7px}
#wtour .tip.dn::before{top:-6px}
#wtour .tip.up::before{bottom:-6px}
#wtour .tn{font-size:12px;font-weight:600;color:${G}}
#wtour .tt{display:flex;align-items:center;gap:8px;margin-top:4px;font-size:17px;font-weight:600;color:${NAVY}}
#wtour .tt span{width:28px;height:28px;border-radius:9px;background:#EEF2F7;display:grid;place-items:center;font-size:17px;line-height:0}
#wtour .tt svg{width:1em;height:1em;fill:currentColor}
#wtour .tx{margin:6px 0 0;font-size:15px;line-height:1.45;color:#334155}
#wtour[dir=rtl] .tx{line-height:1.7}
#wtour .tb{display:flex;align-items:center;justify-content:space-between;margin-top:12px}
#wtour .dots{display:flex;gap:4px}
#wtour .dots i{width:6px;height:6px;border-radius:3px;background:#E2E8F0;transition:all .25s}
#wtour .dots i.on{width:16px;background:${NAVY}}
#wtour .tb div:last-child{display:flex;gap:6px}
#wtour button{font:inherit;height:38px;padding:0 14px;border-radius:12px;border:0;cursor:pointer;font-size:15px}
#wtour .wsk{background:none;color:${G}}
#wtour .nx{background:${BLUE};color:#fff;font-weight:600;min-width:84px}

/* ---- Shortcut guide ---- */
.wgd{position:fixed;inset:0;z-index:9050;background:#F1F5F9;display:flex;flex-direction:column;font-family:"Riyal","IBM Plex Sans","IBM Plex Sans Arabic",sans-serif;-webkit-font-smoothing:antialiased;color:#0F172A;transform:translateY(100%);transition:transform .38s cubic-bezier(.3,.7,.2,1)}
.wgd[dir=rtl]{font-family:"Riyal","IBM Plex Sans Arabic","IBM Plex Sans",sans-serif}
.wgd.on{transform:none}
.wgd svg{width:1em;height:1em;fill:currentColor}
.wgd .wgh{background:#fff;padding:calc(10px + env(safe-area-inset-top,0px)) 16px 12px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #E2E8F0;flex:none}
.wgd .wgh b{flex:1;font-size:18px;font-weight:600;color:${NAVY}}
.wgd .wgh button{width:36px;height:36px;border:0;border-radius:18px;background:#EEF2F7;color:${NAVY};font-size:16px;display:grid;place-items:center;cursor:pointer}
.wgd .gs{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px 16px calc(24px + var(--sab,env(safe-area-inset-bottom,0px)))}
.wgd .gi{background:#fff;border-radius:16px;padding:14px;font-size:15px;line-height:1.5;color:#334155;margin-bottom:12px}
.wgd[dir=rtl] .gi{line-height:1.7}
.wgd .gi b{color:${NAVY}}
.wgd .lk{display:flex;align-items:center;gap:8px;margin-top:10px;background:#F1F5F9;border-radius:10px;padding:8px 8px 8px 12px}
.wgd .lk code{flex:1;min-width:0;font:500 13px Riyal,"IBM Plex Sans",sans-serif;color:${BLUE};direction:ltr;text-align:left;overflow-wrap:anywhere}
.wgd .lk button{height:32px;padding:0 12px;border:0;border-radius:9px;background:${BLUE};color:#fff;font:600 13px inherit;cursor:pointer;flex:none}
.wgd .st{background:#fff;border-radius:16px;padding:14px;margin-bottom:12px}
.wgd .sh{display:flex;gap:10px;align-items:flex-start}
.wgd .sn{width:28px;height:28px;border-radius:14px;background:${NAVY};color:#fff;font-size:14px;font-weight:600;display:grid;place-items:center;flex:none}
.wgd .sh b{display:block;font-size:16px;font-weight:600;color:${NAVY};line-height:1.35;padding-top:3px}
.wgd .sh p{margin:3px 0 0;font-size:14px;color:${G};line-height:1.45}
.wgd[dir=rtl] .sh p{line-height:1.7}
.wgd .ios{margin:12px auto 0;width:252px;border-radius:30px;border:7px solid #1E293B;background:#F2F2F7;overflow:hidden;position:relative;font:13px "Riyal",-apple-system,"SF Pro Text","IBM Plex Sans","IBM Plex Sans Arabic",sans-serif;color:#000}
.wgd .ios .sbar{display:flex;justify-content:space-between;padding:8px 16px 4px;font-size:11px;font-weight:600;direction:ltr}
.wgd .ios .nav{display:flex;align-items:center;justify-content:space-between;padding:4px 12px 8px;font-size:13px}
.wgd .ios .nav b{font-weight:600}
.wgd .ios .nav .a{color:#007AFF}
.wgd .ios .wbig{font-size:22px;font-weight:700;padding:0 12px 8px}
.wgd .ios .grp{background:#fff;border-radius:10px;margin:0 10px 8px;overflow:hidden}
.wgd .ios .it{display:flex;align-items:center;gap:8px;padding:9px 10px;border-top:.5px solid #E5E5EA;min-height:18px}
.wgd .ios .it:first-child{border-top:0}
.wgd .ios .it i{width:22px;height:22px;border-radius:6px;display:grid;place-items:center;color:#fff;font-size:13px;font-style:normal;flex:none}
.wgd .ios .it span{flex:1}
.wgd .ios .it .hl{flex:none}
.wgd .ios .it em{font-style:normal;color:#8E8E93}
.wgd .ios .act{background:#fff;border-radius:10px;margin:0 10px 8px;padding:9px 10px;line-height:1.6}
.wgd .ios .act .an{display:flex;align-items:center;gap:6px;font-weight:600}
.wgd .ios .act .an i{width:20px;height:20px;border-radius:5px;display:grid;place-items:center;color:#fff;font-size:11px;font-style:normal}
.wgd .ios .tok{display:inline-block;padding:0 5px;border-radius:5px;background:#E1EDFF;color:#007AFF;line-height:1.5}
.wgd .ios .tok.y{background:#FFF1D6;color:#B26B00}
.wgd .ios .tabs{display:flex;justify-content:space-around;border-top:.5px solid #D1D1D6;background:#F9F9F9;padding:6px 0 10px;font-size:10px;color:#8E8E93}
.wgd .ios .tabs span{text-align:center}
.wgd .ios .tabs .on{color:#007AFF}
.wgd .ios .sp{height:12px}
.wgd .ios .wsrch{margin:0 10px 8px;background:#E3E3E8;border-radius:9px;padding:6px 10px;color:#8E8E93}
.wgd .ios .ban{margin:10px;padding:10px;border-radius:12px;background:rgba(255,255,255,.92);box-shadow:0 6px 18px rgba(0,0,0,.18);display:flex;gap:8px;align-items:center}
.wgd .hl{position:relative;outline:2px solid ${BLUE};outline-offset:2px;border-radius:7px}
.wgd .hl::after{content:attr(data-n);position:absolute;top:-10px;inset-inline-end:-8px;background:${BLUE};color:#fff;font:600 10px Riyal,"IBM Plex Sans","IBM Plex Sans Arabic",sans-serif;padding:2px 6px;border-radius:8px;white-space:nowrap;z-index:2}
.wgd .done{text-align:center;padding:18px 14px;color:${G};font-size:14px}
`;
let cssOn=false;const css=()=>{if(cssOn)return;cssOn=true;const s=document.createElement("style");s.textContent=CSS;document.head.appendChild(s)};

/* ================= first-time questions ================= */
const BILL={rent:["Rent","الإيجار","house",2500],util:["Electricity & water","الكهرباء والماء","receipt",330],phone:["Phone & internet","الجوال والإنترنت","device-mobile",345],market:["Groceries","المقاضي","basket",900],
 car:["Car payment","قسط السيارة","credit-card",1800],iqama:["Iqama","الإقامة","shield-check",420],fuel:["Fuel","البنزين","fire",400],family:["Family","العائلة","users",1000],debt:["Installments (Tabby, Tamara…)","أقساط (تابي، تمارا…)","calendar-blank",500],custom:["Something else","شيء ثاني","plus-circle",0]};
const GOAL={trip:["A trip","سفرة",4600,6],emergency:["A safety cushion","مبلغ للطوارئ",10000,10],phone:["A new phone","جوال جديد",4000,5],car:["A car","سيارة",40000,24],umrah:["Umrah","عمرة",3500,4],other:["Something else","شيء ثاني",2000,6]};
const ord=n=>AR?`يوم ${n}`:n+(n%10==1&&n!=11?"st":n%10==2&&n!=12?"nd":n%10==3&&n!=13?"rd":"th");
const monAt=m=>{const d=new Date();d.setMonth(d.getMonth()+m);return d.toLocaleDateString(AR?"ar-SA-u-nu-latn-ca-gregory":"en-GB",{month:"short",year:"numeric"})};


/* Store flash-sale card. Variants (for the options video): A price drop, B shop duel, C yearly saving, D shoppers, E daily timer, F photo hero, G blend (default) */
const pad2=n=>String(n).padStart(2,"0");
const untilMidnight=()=>{const n=new Date(),m=new Date(n);m.setHours(24,0,0,0);const s=Math.max(0,(m-n)/1000|0);return T(`${s/3600|0}h ${pad2(s/60%60|0)}m`,`${s/3600|0}س ${pad2(s/60%60|0)}د`)};
function flashHTML(f,ans,v){
 if(!f)return `<div class="cd"><div class="q">${T("No sale to show right now.","ما فيه تخفيض نعرضه الحين.")}</div></div>`;
 const pc=Math.round((1-f.price/f.was)*100),save=Math.round((f.was-f.price)*100)/100,year=Math.round(save*12),ppl=Math.max(1,+f.people||1);
 const has=k=>v=="G"?"AFBCE".includes(k):v==k;
 const photo=h=>`<div class="fhero" style="height:${h}px"><div class="fimg">${f.photo?`<img src="${esc(f.photo)}" alt="">`:`<span class="fico">${PH("basket")}</span>`}</div>
   <span class="ftag"><b dir="ltr">−${pc}%</b></span>${has("E")?`<span class="ftime">${PH("calendar-blank")} ${T("New pick in","اختيار جديد بعد")} <b class="fcd">${untilMidnight()}</b></span>`:""}</div>`;
 const price=`<div class="fpr"><div><div class="fnm">${esc(f.item)}</div><small class="fsz">${f.size?`<bdi dir="ltr">${esc(f.size)}</bdi> · `:""}${esc(f.store)}</small></div>
   <div class="fpp"><s class="fold">${M(f.was)}</s><b class="fnew" data-from="${f.was}" data-to="${f.price}">${M(f.price)}</b></div></div>
   <div class="fsave">${PH("tag")} ${T(`You save ${M(save)}`,`توفّر ${M(save)}`)}</div>`;
 const duel=f.hiStore?`<div class="fduel">${[[f.store,f.price,1],[f.hiStore,f.was,0]].map(([st,pr,win])=>`<div class="fdr${win?" w":""}"><span class="fdn">${esc(st)}</span><span class="fdb"><i data-w="${Math.round(pr/f.was*100)}%"></i></span><b>${M(pr)}</b></div>`).join("")}</div>`:"";
 const yr=`<div class="fyr"><svg viewBox="0 0 80 28" class="fsp"><path d="M2 26 L20 21 L38 17 L56 10 L78 3"/></svg><span>${T(`Buy it once a month and keep <b>${M(year)}</b> a year`,`لو تشتريه مرة بالشهر توفّر <b>${M(year)}</b> بالسنة`)}</span></div>`;
 const soc=`<div class="fsoc"><span class="fav">${[...Array(Math.min(4,ppl))].map((_,i)=>`<i style="--h:${[210,32,152,262][i]}"></i>`).join("")}</span>${T(`${ppl} ${ppl>1?"shoppers":"shopper"} paid this price`,`${ppl} متسوق دفعوا هالسعر`)}</div>`;
 let body="";
 if(v=="G")body=photo(150)+`<div class="fpad">${price}${duel}${yr}</div>`;
 else if(v=="F")body=photo(190)+`<div class="fpad">${price}</div>`;
 else if(v=="A")body=`<div class="fpad" style="margin-top:12px">${price}</div>`;
 else if(v=="B")body=`<div class="fpad" style="margin-top:12px"><div class="fnm">${esc(f.item)}</div><small class="fsz"><bdi dir="ltr">${esc(f.size||"")}</bdi></small>${duel}<div class="fsave">${PH("tag")} ${T(`${pc}% cheaper at ${esc(f.store)}`,`أرخص ${pc}% عند ${esc(f.store)}`)}</div></div>`;
 else if(v=="C")body=`<div class="fpad" style="margin-top:12px">${price}${yr}</div>`;
 else if(v=="D")body=`<div class="fpad" style="margin-top:12px">${price}${soc}</div>`;
 else if(v=="E")body=`<div class="fpad"><div class="ftime solo">${PH("calendar-blank")} ${T("Today only · new pick in","اليوم بس · اختيار جديد بعد")} <b class="fcd">${untilMidnight()}</b></div>${price}</div>`;
 return `<div class="cd tab fcard${ans?" done":""}"><span class="ctb">${PH("shopping-cart")}</span><div class="ck">${T("Store","المتجر")}<span class="bdg">${PH("fire")} ${T("Flash sale","تخفيض سريع")}</span></div>${body}
  <div class="fbtns"><button class="fadd${ans=="yes"?" on":""}" data-fa="yes">${ans=="yes"?`<span class="fck"></span>${T("Added to your list","انضاف لقائمتك")}`:`${PH("plus-circle")} ${T("Add to my shopping list","أضفه لقائمة التسوق")}`}</button>
  <button class="fno${ans=="no"?" on":""}" data-fa="no">${T("Not for me","ما يناسبني")}</button></div></div>
  <div class="say">${ans=="yes"?T(`<b>Store</b> will always point you to the cheapest shop for it.`,`<b>المتجر</b> بيوريك دايماً أرخص محل له.`):ans=="no"?T("No problem. Store learns what you like from your receipts.","ولا يهمك. المتجر يتعلم اللي تحبه من فواتيرك."):""}</div>`}
function flashAnim(root){const el=root.querySelector(".fnew");if(!el)return;const bars=root.querySelectorAll(".fdb i");
 if(el.dataset.done||root.querySelector(".fadd.on,.fno.on")){bars.forEach(i=>{i.style.transition="none";i.style.width=i.dataset.w});return}
 el.dataset.done=1;const a=+el.dataset.from,b=+el.dataset.to,t0=performance.now();
 (function f(t){const p=Math.min(1,(t-t0-250)/900);if(p<0)return requestAnimationFrame(f);const e=1-Math.pow(1-p,3);el.innerHTML=M(Math.round((a+(b-a)*e)*100)/100);if(p<1)requestAnimationFrame(f);else el.innerHTML=M(b)})(t0);
 bars.forEach((i,k)=>setTimeout(()=>i.style.width=i.dataset.w,350+k*150))}
function setup(ctx){
 css();AR=ctx.lang=="ar";
 const pools=ctx.pools||{},pick=a=>a&&a.length?a[Math.floor(Math.random()*a.length)]:null;
 const S={i:0,knew:null,salary:ctx.salary?String(ctx.salary):"",payday:ctx.payday||27,bills:["rent","util","phone","market"].map(k=>({k,amt:BILL[k][3],name:""})),addB:false,
  goals:[{k:"trip",target:4600,months:6,name:""}],addG:false,flash:(a=>{if(!a||!a.length)return null;a=a.slice().sort((x,y)=>(1-y.price/y.was)-(1-x.price/x.was));const big=a.filter(x=>1-x.price/x.was>=.4);return big.length?big[Math.floor(Date.now()/864e5)%big.length]:a[0]})(pools.flash),fAns:null,forsa:pick(pools.forsa),dAns:null};
 const N=7,root=document.createElement("div");root.className="wob";root.dir=AR?"rtl":"ltr";root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");
 root.innerHTML=`<div class="top"><div class="wbar"><button class="bk" aria-label="${T("Back","رجوع")}">${PH("caret-left")}</button><div class="seg">${"<i></i>".repeat(N-1)}</div><button class="lg">${AR?"English":"العربية"}</button></div><div class="tw"><div class="kk"></div><h1></h1><p class="ld"></p></div><div class="wwv">${WAVE}</div></div><div class="body"><div class="stage"></div></div><div class="foot"><button class="cta"></button><button class="wlnk"></button></div>`;
 document.body.appendChild(root);requestAnimationFrame(()=>root.classList.add("on"));
 const $=s=>root.querySelector(s),stage=$(".stage");
 const sum=a=>a.reduce((x,y)=>x+(+y||0),0);
 const fit=()=>{const sal=+S.salary||0,bills=sum(S.bills.map(b=>b.amt)),room=Math.max(0,sal-bills-Math.round(sal*.15));let r=room;
  const gs=S.goals.filter(g=>+g.target>0).map(g=>{const need=g.target/g.months,give=Math.min(need,r);r-=give;return Object.assign({},g,{give,late:give<need-1,ready:give>0?Math.ceil(g.target/give):null})});
  const gt=sum(gs.map(g=>g.give));return {sal,bills,gs,gt,spend:Math.max(0,sal-bills-gt)}};
 const bName=b=>b.k=="custom"&&b.name?b.name:BILL[b.k][AR?1:0],gName=g=>g.k=="other"&&g.name?g.name:GOAL[g.k][AR?1:0];
 const V=[
  {kk:T("Welcome","أهلاً"),h:T("Let's make your money make sense.","خلّنا نخلي فلوسك واضحة."),ld:T("Six quick questions. One minute.","ستة أسئلة سريعة. دقيقة وحدة."),cta:T("Start","ابدأ"),ok:()=>S.knew!=null,
   html:()=>`<div class="cd tab"><span class="ctb">${PH("wallet")}</span><div class="ck">${T("Wallet","المحفظة")}</div><div class="q">${T("First, honestly: last month, could you say where all of your salary went?","أول شيء، بصراحة: الشهر الماضي، تقدر تقول وين راح راتبك كله؟")}</div>${[T("Yes, all of it","إيه، كله"),T("Some of it","بعضه"),T("Honestly, no","بصراحة، لا")].map((a,i)=>`<button class="op${S.knew==i?" on":""}" data-knew="${i}">${a}</button>`).join("")}</div>`},
  {kk:T("1 of 6","١ من ٦"),h:T("How much lands in your account each month?","كم ينزل في حسابك كل شهر؟"),ld:T("Your salary after deductions.","راتبك بعد الخصومات."),cta:T("Continue","متابعة"),ok:()=>+S.salary>0,
   html:()=>`<div class="cd tab"><span class="ctb">${PH("wallet")}</span><div class="ck">${T("Salary","الراتب")}</div><label class="wamt"><b>${RS}</b><input id="wsal" inputmode="numeric" placeholder="0" value="${S.salary?fm(S.salary):""}" aria-label="${T("Salary","الراتب")}"></label>
   <div class="pd"><span>${T("It arrives on the","ينزل")}</span><span class="stp"><button data-pd="-1" aria-label="-">−</button><b id="wpd">${ord(S.payday)}</b><button data-pd="1" aria-label="+">+</button></span></div></div>`},
  {kk:T("2 of 6","٢ من ٦"),h:T("Your biggest monthly bills","أكبر فواتيرك الشهرية"),ld:T("Change the amounts and add any bill you pay every month.","عدّل المبالغ وأضف أي فاتورة تدفعها كل شهر."),cta:T("Continue","متابعة"),ok:()=>true,
   html:()=>`<div class="cd tab"><span class="ctb">${PH("receipt")}</span><div class="ck">${T("Must pay","التزامات")}<small id="wbt">${M(sum(S.bills.map(b=>b.amt)))}</small></div><div style="margin-top:10px">${S.bills.map((b,i)=>`<div class="row"><span class="ic">${PH(BILL[b.k][2])}</span><span class="wnm">${b.k=="custom"?`<input class="n" data-bn="${i}" placeholder="${T("Name it","سمّها")}" value="${esc(b.name)}" maxlength="40">`:BILL[b.k][AR?1:0]}</span><span class="v"><input data-ba="${i}" inputmode="numeric" value="${b.amt?fm(b.amt):""}" placeholder="0" aria-label="${esc(bName(b))}"></span><button class="wx" data-bx="${i}" aria-label="${T("Remove","حذف")}">${PH("x")}</button></div>`).join("")}</div>
   ${S.addB?`<div class="pills">${Object.keys(BILL).filter(k=>k=="custom"||!S.bills.some(b=>b.k==k)).map(k=>`<button class="pill" data-pb="${k}">${BILL[k][AR?1:0]}</button>`).join("")}</div>`:`<button class="add" data-ab="1">+ ${T("Add another bill","أضف فاتورة ثانية")}</button>`}</div>`},
  {kk:T("3 of 6","٣ من ٦"),h:T("What are you saving for?","وش توفّر له؟"),ld:T("Most important first. The app works out how much a month.","الأهم أولاً. التطبيق يحسب كم شهرياً."),cta:T("Continue","متابعة"),ok:()=>S.goals.some(g=>+g.target>0),
   html:()=>S.goals.map((g,i)=>`<div class="cd tab"><span class="ctb">${PH("target")}</span><div class="ck">${g.k=="other"?`<input class="n" style="flex:1;border:0;border-bottom:1px dashed #CBD5E1;outline:0;font-size:16px;font-weight:600;background:none" data-gn="${i}" placeholder="${T("Name it","سمّها")}" value="${esc(g.name)}" maxlength="40">`:gName(g)}${S.goals.length>1?`<button class="wx" data-gx="${i}" aria-label="${T("Remove","حذف")}">${PH("x")}</button>`:""}</div>
    <label class="wamt" style="margin-top:12px"><b>${RS}</b><input data-gt="${i}" inputmode="numeric" value="${g.target?fm(g.target):""}" placeholder="0" style="font-size:30px"></label>
    <div class="gl"><span>${T("When","متى")}</span><input type="range" min="1" max="36" value="${g.months}" data-gm="${i}" aria-label="${T("How many months","كم شهر")}"><b id="wgm${i}">${T(`in ${g.months} months · ${monAt(g.months)}`,`بعد ${g.months} شهر · ${monAt(g.months)}`)}</b></div></div>`).join("")
    +(S.addG?`<div class="cd"><div class="pills">${Object.keys(GOAL).filter(k=>k=="other"||!S.goals.some(g=>g.k==k)).map(k=>`<button class="pill" data-pg="${k}">${GOAL[k][AR?1:0]}</button>`).join("")}</div></div>`:S.goals.length<4?`<button class="add" style="color:#BFD2E6" data-ag="1">+ ${T("Add a goal","أضف هدف")}</button>`:"")},
  {kk:T("4 of 6 · Quick one","٤ من ٦ · سؤال سريع"),h:T("Today’s flash sale","تخفيض اليوم السريع"),ld:T("Real prices shoppers paid this week.","أسعار حقيقية دفعها متسوقين هالأسبوع."),cta:T("Continue","متابعة"),ok:()=>S.fAns!=null||!S.flash,
   html:()=>flashHTML(S.flash,S.fAns,ctx.fv||window.__FSV||"G")},
  {kk:T("5 of 6 · Forsa","٥ من ٦ · فرصة"),h:T("Used or new?","مستعمل ولا جديد؟"),ld:T("Forsa hunts both. Which one would you grab?","فرصة تدور على الاثنين. أيهم تاخذ؟"),cta:T("Continue","متابعة"),ok:()=>S.dAns!=null||!S.forsa,
   html:()=>{const p=S.forsa;if(!p)return "";const hn=S.dAns=="new"?(p.new.name||p.name):(p.used.name||p.name);const u=p.used,n=p.new,pu=Math.round((1-u.price/u.market)*100),pn=Math.round((1-n.price/n.was)*100);
    const card=(k,d,badge,pc,line)=>`<button class="wdk${S.dAns==k||S.dAns=="both"?" on":""}" data-da="${k}"><span class="bdg ${k=="used"?"u":"n"}">${badge}</span><span class="tick"></span><span class="wph">${d.photo?`<img src="${esc(d.photo)}" alt="">`:PH("device-mobile")}</span><div class="wnm">${esc(d.title||d.name||p.name)}</div><div class="src">${esc(d.source)}${d.city?" · "+esc(d.city):""}</div><div class="pp"><b>${M(d.price)}</b><s>${M(k=="used"?d.market:d.was)}</s></div><div class="pc">${line(pc)}</div></button>`;
    return `<div class="two">${card("used",u,T("Used","مستعمل"),pu,pc=>T(`${pc}% below market`,`أقل من السوق ${pc}%`))}${card("new",n,T("New","جديد"),pn,pc=>T(`${pc}% off · authorized seller`,`خصم ${pc}% · وكيل معتمد`))}</div>
    <button class="both${S.dAns=="both"?" on":""}" data-da="both">${T("Show me both","وريني الاثنين")}</button>
    <div class="say">${S.dAns?T(`Forsa will hunt <b>${esc(hn)}</b> for you${S.dAns=="both"?", used and new":S.dAns=="used"?", used first":", new first"}. Swipe right on a deal to keep it.`,`فرصة بتدور لك على <b>${esc(hn)}</b>${S.dAns=="both"?"، مستعمل وجديد":S.dAns=="used"?"، المستعمل أولاً":"، الجديد أولاً"}. اسحب يمين على العرض عشان تحتفظ فيه.`):""}</div>`}},
  {kk:T("6 of 6","٦ من ٦"),h:T("Here is your month.","هذا شهرك."),ld:"",cta:T("Show me around","وريني التطبيق"),ok:()=>true,
   html:()=>{const F=fit(),sal=F.sal||1,nx=new Date(),pd=new Date(nx.getFullYear(),nx.getMonth()+(nx.getDate()>=S.payday?1:0),S.payday),days=Math.max(1,Math.round((pd-new Date(pd.getFullYear(),pd.getMonth()-1,S.payday))/864e5));
    const L=[[NAVY,T("Bills","الفواتير"),F.bills,""],["#5B82B0",T("Goals","الأهداف"),F.gt,F.gs.map(g=>`${esc(gName(g))}: ${T("ready by","جاهز في")} ${g.ready?monAt(g.ready):"—"}`).join(" · ")],["#BFD2E6",T("Yours to spend","لك تصرفه"),F.spend,T(`about ${M(Math.round(F.spend/days))} a day`,`تقريباً ${M(Math.round(F.spend/days))} يومياً`)]];
    return `<div class="cd tab"><span class="ctb">${PH("chart-pie-slice")}</span><div class="ck">${T("Monthly budget","الميزانية الشهرية")}<small>${M(F.sal)}</small></div>
    <div class="wsb">${L.map(l=>`<i data-g="${l[2]/sal}" style="background:${l[0]}"></i>`).join("")}</div>
    ${L.map(l=>`<div class="lr"><i class="wsw" style="background:${l[0]}"></i><span>${l[1]}${l[3]?`<small>${l[3]}</small>`:""}</span><b data-c="${Math.round(l[2])}">${M(0)}</b></div>`).join("")}
    <div class="bn"><div><small>${T("Before","قبل")}</small><s>“${[T("Yes, all of it","إيه، كله"),T("Some of it","بعضه"),T("Honestly, no","بصراحة، لا")][S.knew||0]}”</s></div><div class="nw"><small>${T("Now","الحين")}</small>${T(`Every riyal of ${M(F.sal)} has a job`,`كل ريال من ${M(F.sal)} له مهمة`)}</div></div></div>`}}
 ];
 const anim=()=>{root.querySelectorAll(".wsb i").forEach((b,i)=>setTimeout(()=>b.style.flexGrow=Math.max(.001,+b.dataset.g),80+i*120));
  root.querySelectorAll("[data-c]").forEach(el=>{const to=+el.dataset.c,t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/900),e=1-Math.pow(1-p,3);el.innerHTML=M(Math.round(to*e));if(p<1)requestAnimationFrame(f)})(t0)})};
 let busy=false;
 function paint(dir){const v=V[S.i];$(".seg").querySelectorAll("i").forEach((s,k)=>s.classList.toggle("on",k<S.i));$(".bk").hidden=S.i==0;
  const fill=()=>{$(".kk").textContent=v.kk;$("h1").textContent=v.h;$(".ld").textContent=v.ld;$(".ld").style.display=v.ld?"":"none";stage.innerHTML=v.html();$(".cta").textContent=v.cta;
   $(".wlnk").textContent=ctx.preview?T("Close","إغلاق"):S.i==V.length-1?T("Open my wallet","افتح محفظتي"):T("Skip for now","تخطّ الحين");okBtn();if(S.i==V.length-1)anim();flashAnim(root);clearInterval(S.cdT);if(root.querySelector(".fcd"))S.cdT=setInterval(()=>root.querySelectorAll(".fcd").forEach(e=>e.textContent=untilMidnight()),30000)};
  if(!dir){fill();return}
  const tw=$(".tw");tw.classList.add("out");stage.classList.add("out");setTimeout(()=>{fill();$(".body").scrollTop=0;stage.classList.remove("out");stage.classList.add("in");if(dir<0){stage.style.transform=getComputedStyle(stage).transform}
   requestAnimationFrame(()=>requestAnimationFrame(()=>{stage.classList.remove("in");stage.style.transform="";tw.classList.remove("out")}))},200)}
 const okBtn=()=>{$(".cta").disabled=!V[S.i].ok()};
 const go=d=>{if(busy)return;let n=S.i+d;while((n==4&&!S.flash)||(n==5&&!S.forsa))n+=d;if(n<0)return;if(n>=V.length)return finish("tour");S.i=n;paint(d)};
 async function finish(how){if(busy)return;busy=true;const F=fit();
  const ans={knew:S.knew,salary:+S.salary||0,payday:S.payday,bills:S.bills.filter(b=>+b.amt>0).map(b=>({k:b.k,amt:+b.amt,name:b.name})),goals:F.gs.map(g=>({name:gName(g),target:+g.target,months:g.months,give:Math.round(g.give)})),
   flash:S.fAns=="yes"?S.flash:null,forsa:S.dAns?{name:(S.dAns=="new"?S.forsa.new.name:S.forsa.used.name)||S.forsa.name,kind:S.dAns}:null};
  if(!ctx.preview&&ctx.save&&how!="skip"){$(".cta").textContent=T("Setting up your wallet…","جاري تجهيز محفظتك…");try{await ctx.save(ans)}catch(e){busy=false;$(".cta").textContent=T("Couldn't save. Try again","ما انحفظ. جرب مرة ثانية");return}}
  if(!ctx.preview&&how=="skip"&&ctx.skip)try{await ctx.skip()}catch(e){}
  root.classList.remove("on");setTimeout(()=>{root.remove();ctx.done&&ctx.done(how,ans)},260)}
 root.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  if(b.classList.contains("cta"))return go(1);
  if(b.classList.contains("wlnk"))return finish(ctx.preview?"close":S.i==V.length-1?"home":"skip");
  if(b.classList.contains("bk"))return go(-1);
  if(b.classList.contains("lg")){AR=!AR;root.dir=AR?"rtl":"ltr";b.textContent=AR?"English":"العربية";ctx.onLang&&ctx.onLang(AR?"ar":"en");paint();return}
  if(d.knew!=null){S.knew=+d.knew;root.querySelectorAll("[data-knew]").forEach(o=>o.classList.toggle("on",o==b));okBtn();return}
  if(d.pd){S.payday=((S.payday-1+ +d.pd+31)%31)+1;$("#wpd").textContent=ord(S.payday);return}
  if(d.bx!=null){S.bills.splice(+d.bx,1);paint();return}
  if(d.ab){S.addB=true;paint();return}
  if(d.pb){S.bills.push({k:d.pb,amt:BILL[d.pb][3],name:""});S.addB=false;paint();const l=root.querySelectorAll(d.pb=="custom"?"[data-bn]":"[data-ba]");l[l.length-1].focus();return}
  if(d.gx!=null){S.goals.splice(+d.gx,1);paint();return}
  if(d.ag){S.addG=true;paint();return}
  if(d.pg){const g=GOAL[d.pg];S.goals.push({k:d.pg,target:g[2],months:g[3],name:""});S.addG=false;paint();return}
  if(d.fa){S.fAns=d.fa;paint();return}
  if(d.da){S.dAns=d.da;paint();return}});
 root.addEventListener("input",e=>{const el=e.target,d=el.dataset,num=()=>+String(el.value).replace(/[^\d]/g,"").slice(0,9)||0;
  if(el.id=="wsal"){S.salary=String(num()||"");const p=el.selectionStart,l=el.value.length;el.value=S.salary?fm(S.salary):"";okBtn();return}
  if(d.ba!=null){S.bills[+d.ba].amt=num();el.value=num()?fm(num()):"";$("#wbt").innerHTML=M(sum(S.bills.map(b=>b.amt)));return}
  if(d.bn!=null){S.bills[+d.bn].name=el.value;return}
  if(d.gn!=null){S.goals[+d.gn].name=el.value;return}
  if(d.gt!=null){S.goals[+d.gt].target=num();el.value=num()?fm(num()):"";okBtn();return}
  if(d.gm!=null){const g=S.goals[+d.gm];g.months=+el.value;$("#wgm"+d.gm).textContent=T(`in ${g.months} months · ${monAt(g.months)}`,`بعد ${g.months} شهر · ${monAt(g.months)}`)}});
 paint();
 return {close:()=>root.remove(),go,state:S};
}

/* ================= tour ================= */
const STEPS=[
 ["#gear","gear-six",["Settings","Language, arrange Home, bank messages, and this tour again. Share usage is on: only which screens you use, never amounts or names."],["الإعدادات","اللغة، ترتيب الرئيسية، رسائل البنك، وهذا الشرح مرة ثانية. مشاركة الاستخدام شغّالة: بس أي شاشات تستخدم، أبداً مبالغ أو أسماء."]],
 [".srch","sparkle",["Search or ask","Find any item, or ask about your money: “How much did I spend on coffee?”"],["ابحث أو اسأل","دوّر أي غرض، أو اسأل عن فلوسك: «كم صرفت على القهوة؟»"]],
 ['.card[data-k="w"]',"wallet",["Wallet","Your money now and days to salary. Tap it for your monthly budget."],["المحفظة","فلوسك الحين وكم باقي على الراتب. اضغطها لميزانيتك الشهرية."]],
 ['.card[data-k="e"]',"receipt",["Expenses","Where your money went this month. Tap a slice of the ring for details."],["المصاريف","وين راحت فلوسك هالشهر. اضغط جزء من الدائرة للتفاصيل."]],
 ['.card[data-k="s"]',"shopping-cart",["Store","The cheapest shop for what you buy. Tap + on an item to build your shopping list."],["المتجر","أرخص محل للي تشتريه. اضغط + على الغرض عشان تبني قائمة التسوق."]],
 ['.card[data-k="f"]',"fire",["Forsa","Deals below market, used and new. Swipe right to keep one, left to hide it."],["فرصة","عروض أقل من السوق، مستعمل وجديد. اسحب يمين تحتفظ فيه، يسار تخفيه."]],
 [".abar .ab:nth-child(1)","plus-circle",["Add expense","Log a cost in two taps, or paste a bank message."],["أضف مصروف","سجّل مصروف بضغطتين، أو الصق رسالة البنك."]],
 [".abar .ab:nth-child(2)","camera",["Add bill","Take a photo of a receipt. Prices are saved and cheaper shops found."],["أضف فاتورة","صوّر الفاتورة. الأسعار تنحفظ ونلقى لك محلات أرخص."]],
 [".abar .ab:nth-child(3)","fire",["New hunt","Tell Forsa what you are looking for. New deals arrive during the day."],["صيد جديد","قول لفرصة وش تدور عليه. العروض الجديدة توصل خلال اليوم."]]];
function tour(ctx){
 css();AR=(ctx&&ctx.lang)=="ar";if(document.getElementById("wtour"))return;
 const steps=STEPS.filter(s=>document.querySelector(s[0]));if(!steps.length)return;
 const w=document.createElement("div");w.id="wtour";w.dir=AR?"rtl":"ltr";w.setAttribute("role","dialog");w.setAttribute("aria-modal","true");
 w.innerHTML=`<div class="hole"></div><div class="tip" role="status"><div class="tn"></div><div class="tt"><span></span><b></b></div><p class="tx"></p><div class="tb"><div class="dots">${steps.map(()=>"<i></i>").join("")}</div><div><button class="wsk">${T("Skip","تخطّ")}</button><button class="nx"></button></div></div></div>`;
 document.body.appendChild(w);const hole=w.querySelector(".hole"),tip=w.querySelector(".tip");let i=0;
 function show(){const s=steps[i],el=document.querySelector(s[0]);if(!el)return next();const r=el.getBoundingClientRect(),p=8,vh=innerHeight;
  const rad=/gear|ab:/.test(s[0])?Math.min(r.width,r.height)/2+p:18;
  Object.assign(hole.style,{left:r.left-p+"px",top:r.top-p+"px",width:r.width+2*p+"px",height:r.height+2*p+"px",borderRadius:rad+"px"});
  const L=s[AR?3:2];tip.querySelector(".tn").textContent=T(`${i+1} of ${steps.length}`,`${i+1} من ${steps.length}`);tip.querySelector(".tt span").innerHTML=PH(s[1]);tip.querySelector(".tt b").textContent=L[0];tip.querySelector(".tx").textContent=L[1];
  w.querySelectorAll(".dots i").forEach((d,k)=>d.classList.toggle("on",k==i));w.querySelector(".nx").textContent=i==steps.length-1?T("Done","تم"):T("Next","التالي");
  const below=r.bottom+p+14,th=tip.offsetHeight||150,dn=below+th<vh-10;tip.className="tip "+(dn?"dn":"up");tip.style.top=(dn?below:Math.max(10,r.top-p-14-th))+"px";
  // wide screens (tablet/computer): a phone-width tip next to its target, arrow kept on the target
  const tw=Math.min(innerWidth-32,400),cx=r.left+r.width/2,tl=Math.max(16,Math.min(innerWidth-16-tw,cx-tw/2));tip.style.left=tl+"px";tip.style.right="auto";tip.style.width=tw+"px";
  tip.style.setProperty("--ax",Math.max(24,Math.min(tw-40,cx-16-(tl-16)))+"px")}
 function next(){i++;window.track&&window.track(i>=steps.length?"tour_done":"tour_step","tour","s"+i);if(i>=steps.length)return end();show()}
 function end(){w.style.transition="opacity .25s";w.style.opacity=0;setTimeout(()=>w.remove(),260);ctx&&ctx.done&&ctx.done()}
 w.querySelector(".nx").onclick=e=>{e.stopPropagation();next()};w.querySelector(".wsk").onclick=e=>{e.stopPropagation();window.track&&window.track("tour_skip","tour","s"+(i+1));end()};
 w.addEventListener("click",e=>{if(!tip.contains(e.target))next()});
 addEventListener("resize",()=>document.getElementById("wtour")&&show());
 show();return {next,end};
}

/* ================= Shortcut guide (Beshr's original: Wallet tap -> Text -> Copy -> open app) ================= */
function guide(ctx){
 css();AR=(ctx&&ctx.lang)=="ar";const link=(ctx&&ctx.link)||"https://beshrjemieh-commits.github.io/?sms=";
 const A=(e,a)=>AR?`${a}`:e; // iPhone labels in the phone's language
 const sb=`<div class="sbar"><span>9:41</span><span>●●● ▮</span></div>`;
 const tabs=on=>`<div class="tabs">${[[A("Shortcuts","الاختصارات")],[A("Automation","الأتمتة")],[A("Gallery","المعرض")]].map((t,k)=>`<span class="${k==on?"on hl":""}"${k==on?` data-n="${T("Tap","اضغط")}"`:""}>${t[0]}</span>`).join("")}</div>`;
 const act=(c,ic,n,body)=>`<div class="act"><div class="an"><i style="background:${c}">${ic}</i>${n}</div>${body||""}</div>`;
 const tok=(t,y)=>`<span class="tok${y?" y":""}">${t}</span>`;
 const hl=(html,n)=>`<span class="hl" data-n="${n}">${html}</span>`;
 const TEXT=act("#F5A623","≡",A("Text","نص"),`<div dir="ltr" style="text-align:left">Purchase<br>Amount: SAR ${tok(A("Amount","المبلغ"))}<br>At: ${tok(A("Merchant","التاجر"))}</div>`);
 const COPY=act("#0A84FF","⧉",`${A("Copy","نسخ")} ${tok("≡ "+A("Text","نص"),1)} ${A("to Clipboard","إلى الحافظة")}`);
 const ENC=act("#8E8E93","%",`${A("URL Encode","ترميز URL")} ${tok("≡ "+A("Text","نص"),1)}`);
 const OPEN=(h)=>act("#0A84FF","↗",A("Open","فتح"),`<div style="direction:ltr;text-align:left;word-break:break-all">${h?hl(`beshrjemieh-commits.github.io/?sms=${tok(A("URL Encoded Text","نص URL مرمَّز"),1)}`,T("Type + pick","اكتب واختر")):`beshrjemieh-commits.github.io/?sms=${tok(A("URL Encoded Text","نص URL مرمَّز"),1)}`}</div>`);
 const nav=(l,c,r)=>`<div class="nav"><span class="a">${l||""}</span><b>${c||""}</b><span class="a">${r||""}</span></div>`;
 const S=[
  [T("Open the Shortcuts app","افتح تطبيق الاختصارات"),T("It is already on your iPhone. Tap Automation at the bottom.","موجود في جوالك. اضغط الأتمتة تحت."),
   `${sb}<div class="wbig">${A("Shortcuts","الاختصارات")}</div><div class="grp"><div class="it"><i style="background:#5E5CE6">✦</i><span>${A("My Shortcuts","اختصاراتي")}</span></div></div><div style="height:120px"></div>${tabs(1)}`],
  [T("Tap + to make a new automation","اضغط + عشان تسوي أتمتة جديدة"),T("The + is at the top right.","علامة + فوق على اليمين."),
   `${sb}${nav("","",hl("+",T("Tap","اضغط")))}<div class="wbig">${A("Automation","الأتمتة")}</div><div class="grp"><div class="it"><span style="color:#8E8E93">${A("No automations yet","ما فيه أتمتة")}</span></div></div><div style="height:96px"></div>${tabs(1)}`],
  [T("Choose Wallet","اختر المحفظة (Wallet)"),T("Scroll down the list and tap Wallet. This runs each time you pay with Apple Pay.","انزل في القائمة واضغط المحفظة. هذا يشتغل كل ما تدفع بـ Apple Pay."),
   `${sb}${nav(A("Cancel","إلغاء"),A("New Automation","أتمتة جديدة"))}<div class="wsrch">${A("Search","بحث")}</div><div class="grp"><div class="it"><i style="background:#34C759">✉</i><span>${A("Message","رسالة")}</span></div><div class="it"><i style="background:#FF9500">☀</i><span>${A("Sunset","الغروب")}</span></div><div class="it">${hl(`<i style="background:#000">▤</i>`,T("Tap","اضغط"))}<span>${A("Wallet","المحفظة")}</span></div><div class="it"><i style="background:#FF3B30">⏰</i><span>${A("Alarm","المنبه")}</span></div></div><div class="sp"></div>`],
  [T("Pick your cards, then Run Immediately","اختر بطاقاتك، ثم تشغيل فوراً"),T("Tick every card you pay with. Choose Run Immediately so it never asks. Tap Next.","علّم كل البطاقات اللي تدفع فيها. اختر تشغيل فوراً عشان ما يسألك. اضغط التالي."),
   `${sb}${nav(A("Back","رجوع"),A("Wallet","المحفظة"),hl(A("Next","التالي"),"3"))}<div class="grp"><div class="it"><span>${A("When I tap","عندما ألمس")}</span>${hl(`<em style="color:#007AFF">${A("Any Card","أي بطاقة")}</em>`,"1")}</div><div class="it"><span>${A("At","في")}</span><em>${A("Any Merchant","أي تاجر")}</em></div></div><div class="grp"><div class="it"><span>${A("Run After Confirmation","التشغيل بعد التأكيد")}</span></div><div class="it">${hl(`<span>✓ ${A("Run Immediately","تشغيل فوراً")}</span>`,"2")}</div></div><div class="sp"></div>`],
  [T("Tap New Blank Automation","اضغط أتمتة فارغة جديدة"),T("You will add three small actions after this.","بعدها بتضيف ثلاث إجراءات صغيرة."),
   `${sb}${nav(A("Back","رجوع"),A("When I tap any card","عندما ألمس أي بطاقة"))}<div class="grp"><div class="it">${hl(`<span style="color:#007AFF">＋ ${A("New Blank Automation","أتمتة فارغة جديدة")}</span>`,T("Tap","اضغط"))}</div></div><div style="height:110px"></div>`],
  [T("Add the action “Text”","أضف الإجراء «نص» (Text)"),T("Tap Add Action, type Text in the search, tap Text.","اضغط إضافة إجراء، اكتب «نص» في البحث، اضغط نص."),
   `${sb}${nav("",A("New Automation","أتمتة جديدة"),A("Done","تم"))}<div class="wsrch">${hl(`🔍 ${A("Text","نص")}`,"1")}</div><div class="grp"><div class="it">${hl(`<i style="background:#F5A623">≡</i>`,"2")}<span>${A("Text","نص")}</span></div><div class="it"><i style="background:#F5A623">≡</i><span>${A("Get Text from Input","الحصول على النص من المدخل")}</span></div></div><div style="height:70px"></div>`],
  [T("Write the message","اكتب الرسالة"),T("Type Purchase, then Amount: SAR and tap Shortcut Input → Amount. On a new line At: and tap Shortcut Input → Merchant.","اكتب Purchase، ثم Amount: SAR واضغط مدخل الاختصار ← المبلغ. في سطر جديد At: واضغط مدخل الاختصار ← التاجر."),
   `${sb}${nav("",A("New Automation","أتمتة جديدة"),A("Done","تم"))}${act("#F5A623","≡",A("Text","نص"),`<div dir="ltr" style="text-align:left">Purchase<br>Amount: SAR ${hl(tok(A("Amount","المبلغ")),"1")}<br>At: ${hl(tok(A("Merchant","التاجر")),"2")}</div>`)}<div class="grp"><div class="it"><span style="color:#8E8E93">${A("Shortcut Input","مدخل الاختصار")}</span></div><div class="it"><span>${A("Amount","المبلغ")}</span></div><div class="it"><span>${A("Merchant","التاجر")}</span></div></div>`],
  [T("Add “Copy to Clipboard”","أضف «نسخ إلى الحافظة»"),T("Search Copy, tap Copy to Clipboard. It picks Text by itself. If it says Shortcut Input, tap it and choose Text.","ابحث «نسخ»، اضغط نسخ إلى الحافظة. يختار النص لحاله. لو كتب مدخل الاختصار، اضغطه واختر نص."),
   `${sb}${nav("",A("New Automation","أتمتة جديدة"),A("Done","تم"))}${TEXT}<div style="text-align:center;color:#8E8E93">↓</div><div class="hl" data-n="${T("New","جديد")}" style="margin:0 10px 8px;border-radius:10px">${COPY.replace('class="act"','class="act" style="margin:0"')}</div>`],
  [T("Add “URL Encode”","أضف «ترميز URL» (URL Encode)"),T("Search Encode, tap URL Encode. It should say Text.","ابحث «ترميز»، اضغط ترميز URL. لازم يكون مكتوب نص."),
   `${sb}${nav("",A("New Automation","أتمتة جديدة"),A("Done","تم"))}${TEXT.replace("<br>At:"," · At:")}${COPY}<div class="hl" data-n="${T("New","جديد")}" style="margin:0 10px 8px;border-radius:10px">${ENC.replace('class="act"','class="act" style="margin:0"')}</div>`],
  [T("Add “Open URLs” with your app link","أضف «فتح عناوين URL» مع رابط التطبيق"),T("Search Open URLs, tap it. Paste the link below, then tap right after it and pick URL Encoded Text.","ابحث «فتح عناوين URL»، اضغطه. الصق الرابط اللي تحت، بعدين اضغط بعده مباشرة واختر نص URL مرمَّز."),
   `${sb}${nav("",A("New Automation","أتمتة جديدة"),A("Done","تم"))}${COPY}${ENC}${OPEN(1)}`,1],
  [T("Tap Done","اضغط تم"),T("Your automation is saved. It looks like this:","انحفظت الأتمتة. شكلها كذا:"),
   `${sb}${nav("",A("Automation","الأتمتة"),"")}<div class="grp"><div class="it"><i style="background:#000">▤</i><span>${A("When I tap any card","عندما ألمس أي بطاقة")}<br><em>${A("Text, Copy to Clipboard, URL Encode, Open URLs","نص، نسخ إلى الحافظة، ترميز URL، فتح عناوين URL")}</em></span></div></div><div style="height:96px"></div>${tabs(1)}`],
  [T("Sign in once in Safari","سجّل دخولك مرة وحدة في سفاري"),T("The Shortcut opens the link in Safari, so open the app link in Safari and sign in once. Then pay with Apple Pay: the cost is saved by itself, with Undo.","الاختصار يفتح الرابط في سفاري، فافتح رابط التطبيق في سفاري وسجّل دخولك مرة وحدة. بعدها ادفع بـ Apple Pay: المصروف ينحفظ لحاله، مع تراجع."),
   `${sb}<div class="ban"><i style="width:26px;height:26px;border-radius:7px;background:${NAVY};display:grid;place-items:center;color:#fff;font-style:normal">▣</i><div style="font-size:12px;line-height:1.4"><b>${T("Saved","انحفظ")} ${M(45)} · Albaik</b><br><span style="color:#2563EB">${T("Undo","تراجع")}</span></div></div><div style="height:130px;display:grid;place-items:center;color:#8E8E93">beshrjemieh-commits.github.io</div>`]];
 const w=document.createElement("div");w.className="wgd";w.dir=AR?"rtl":"ltr";w.setAttribute("role","dialog");w.setAttribute("aria-modal","true");
 const lk=`<div class="lk"><code>${esc(link)}</code><button data-cp="1">${T("Copy","انسخ")}</button></div>`;
 w.innerHTML=`<div class="wgh"><b>${T("Connect bank messages","ربط رسائل البنك")}</b><button aria-label="${T("Close","إغلاق")}">${PH("x")}</button></div><div class="gs">
  <div class="gi">${T("Each time you pay with Apple Pay, your Shortcut opens the app with the payment and <b>the cost is saved by itself</b>. Set it up once, about 3 minutes.","كل ما تدفع بـ Apple Pay، الاختصار يفتح التطبيق مع الدفعة و<b>ينحفظ المصروف لحاله</b>. جهّزه مرة وحدة، تقريباً ٣ دقايق.")}${lk}</div>
  ${S.map((s,i)=>`<div class="st"><div class="sh"><span class="sn">${i+1}</span><div><b>${s[0]}</b><p>${s[1]}</p></div></div>${s[3]?lk:""}<div class="ios">${s[2]}</div></div>`).join("")}
  <div class="done">${T("Illustrations, not real screenshots. Your iPhone may look a little different.","رسومات توضيحية، مو صور حقيقية. جوالك ممكن يختلف شوي.")}</div></div>`;
 document.body.appendChild(w);requestAnimationFrame(()=>requestAnimationFrame(()=>w.classList.add("on")));
 const close=()=>{w.classList.remove("on");setTimeout(()=>w.remove(),380);ctx&&ctx.done&&ctx.done()};
 w.querySelector(".wgh button").onclick=close;
 w.addEventListener("click",async e=>{const b=e.target.closest("[data-cp]");if(!b)return;try{await navigator.clipboard.writeText(link);b.textContent=T("Copied","انتسخ")}catch(_){b.textContent=T("Hold to copy","اضغط مطولاً")}setTimeout(()=>b.textContent=T("Copy","انسخ"),1600)});
 return {close,el:w};
}
window.WOB={setup,tour,guide};
})();
