/* Smart Wallet: first-time questions, the "how to use" tour and the bank-message Shortcut guide.
   Light mode, original look (white top + navy wave, corner-tab cards, IBM Plex, Phosphor icons), English + Arabic.
   window.WOB.setup(ctx)  first-time questions (6 steps + "Here is your month"); ctx.save(answers) stores them, ctx.done(how) after
   window.WOB.tour(ctx)   3-screen intro: bank messages add themselves, shoppers' bills find the cheapest, one Forsa search
   window.WOB.guide(ctx)  bank-message setup: how-to video + 5 steps (iPhone Shortcut / Android MacroDroid) */
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
.wob .wday{display:flex;align-items:baseline;gap:8px;margin:14px 0 16px}.wob .wday b{font-size:40px;font-weight:700;color:#0F2A4A;letter-spacing:-.5px}.wob .wday span{font-size:15px;color:#64748B}.wob .wlg{display:flex;gap:14px;margin-top:10px;font-size:12px;color:#64748B}.wob .wlg span{display:flex;align-items:center;gap:6px}.wob .wlg .wsw{margin:0}
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

/* ---- intro (what the app is for) ---- */
.wit .wbar>span{width:32px}
.wit .xeg{display:inline-block;font-size:12px;font-weight:600;color:#BFD2E6;border:1px solid rgba(191,210,230,.4);border-radius:10px;padding:2px 8px;margin-bottom:10px}
.wit .xsms{display:flex;gap:10px;align-items:center;background:rgba(245,245,247,.97);border-radius:18px;padding:10px 12px;margin-bottom:12px;opacity:0;transform:translateY(-12px);transition:all .4s cubic-bezier(.2,.8,.2,1);direction:ltr;text-align:left}
.wit .xsms.on{opacity:1;transform:none}.wit .xsms>span{width:26px;height:26px;border-radius:7px;background:${GR};color:#fff;display:grid;place-items:center;font-size:15px;flex:none}
.wit .xsms p{margin:0;font-size:14px;color:#1F2937}.wit .xsms b{display:block;font-size:13px}
.wit .x3{display:flex;gap:8px;margin-bottom:12px}
.wit .x3 div{flex:1;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.15);border-radius:12px;padding:8px 6px;text-align:center;font-size:13px;font-weight:600;color:#E8EFF7;transition:all .3s}
.wit .x3 em{display:block;font-style:normal;font-size:18px}
.wit .x3 div.on{background:#fff;border-color:#fff;color:${NAVY}}.wit .x3 div.on em{color:${BLUE}}
.wit .xr{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #F1F5F9}.wit .xr:first-child{border:0}
.wit .xr .ic{width:34px;height:34px;border-radius:10px;background:#EEF2F7;color:${NAVY};display:grid;place-items:center;font-size:18px;flex:none}
.wit .xr div{flex:1;min-width:0}.wit .xr small{display:block;font-size:13px;color:${G}}.wit .xr b{font-weight:600}
.wit .xa{font-style:normal;font-size:11px;font-weight:600;color:${NAVY};background:#E0E7FF;border-radius:6px;padding:1px 6px;margin-inline-start:6px;vertical-align:1px}
.wit .xr.nw{max-height:0;opacity:0;padding:0;overflow:hidden;transition:all .45s}.wit .xr.nw.on{max-height:60px;opacity:1;padding:8px;margin:0 -8px;background:#F0FDF4;border-radius:10px}
.wit .xq{max-width:82%;padding:9px 13px;border-radius:18px;font-size:15px;margin-bottom:8px;opacity:0;transform:translateY(8px);transition:all .4s}
.wit .xq.on,.wit .xc.on,.wit .xd.on{opacity:1;transform:none}
.wit .xq.l{background:#fff;border-end-start-radius:6px}.wit .xq.r{background:#1E4170;color:#fff;margin-inline-start:auto;border-end-end-radius:6px}
.wit .xc,.wit .xd{opacity:0;transform:translateY(10px);transition:all .45s}
.wit .xb{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:15px}.wit .xb span{width:64px}.wit .xb i{flex:1;height:8px;border-radius:4px;background:#E2E8F0;overflow:hidden}
.wit .xb u{display:block;height:100%;width:var(--w);border-radius:4px}.wit .xb b{min-width:44px;text-align:end;font-weight:600}
.wit .xt{display:flex;gap:6px;align-items:center;margin-top:8px;font-size:14px;color:${G}}
.wit .xs{display:flex;align-items:center;gap:8px;height:44px;border-radius:12px;background:#fff;padding:0 12px;font-size:16px;color:${G}}.wit .xs span{color:#0F172A}
.wit .xsrc{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 12px}.wit .xsrc span{font-size:13px;font-weight:600;padding:4px 10px;border-radius:14px;color:#BFD2E6;border:1px solid rgba(191,210,230,.35);transition:all .3s}
.wit .xsrc span.on{color:${GR};background:#F0FDF4;border-color:#BBF7D0}.wit .xsrc span.on::before{content:"✓ "}
.wit .xdr{display:flex;align-items:center;justify-content:space-between;gap:8px}.wit .xdr s{color:${G}}.wit .xbig{font-size:26px;font-weight:700;color:${NAVY}}
.wit .xpc{background:${GR};color:#fff;font-size:12px;font-weight:700;border-radius:6px;padding:2px 6px}
.wit .xad{display:flex;gap:8px;margin-top:10px;padding:9px 10px;border-radius:10px;background:#FFFBEB;border-inline-start:3px solid ${AMB};font-size:14px;color:#334155}.wit .xad svg{color:#B45309;font-size:18px;flex:none;margin-top:1px}.wit .xad b{display:block;color:#0F172A}
/* ---- Shortcut guide ---- */
.wgd.pg .gs{padding-bottom:90px}.wgd .gft{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:10px;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #E2E8F0}.wgd .gft button{height:44px;border:0;border-radius:12px;font:600 15px inherit;font-family:inherit;padding:0 18px}.wgd .gl{background:#F1F5F9;color:#0F172A}.wgd .gn{background:#2563EB;color:#fff;flex:1}.wgd .gc{font-size:13px;color:#64748B;min-width:52px;text-align:center}
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
.wgd .vid{display:block;margin:0 auto 12px;width:min(78vw,300px);aspect-ratio:392/852;max-height:42vh;border-radius:22px;background:#E2E8F0;box-shadow:0 6px 20px rgba(15,42,74,.14);object-fit:contain}
.wgd .gb{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:50px;border:0;border-radius:14px;background:${BLUE};color:#fff;font:600 16px inherit;font-family:inherit;cursor:pointer;margin-bottom:10px}
.wgd .gb.l{background:#EEF2F7;color:${NAVY}}.wgd .gb.s{height:40px;font-size:14px;margin:0}
.wgd .gr{display:flex;gap:8px;margin-top:4px}
.wgd ol{margin:0;padding-inline-start:20px;font-size:15px;line-height:1.55;color:#334155}.wgd ol li{margin:3px 0}.wgd ol b{color:${NAVY}}
.wgd .gst{display:flex;align-items:center;gap:8px;margin:-4px 0 12px;padding:10px 12px;border-radius:12px;background:#fff;font-size:14px;font-weight:500;color:${G}}
.wgd .gst i{width:10px;height:10px;border-radius:50%;background:#94A3B8;flex:none;animation:wgp 1.4s ease-in-out infinite}
.wgd .gst.ok{background:#F0FDF4;color:${GR}}.wgd .gst.ok i{background:${GR};animation:none}
@keyframes wgp{50%{opacity:.3}}
.wgd .gout{min-height:20px;margin-top:8px;font-size:14px;text-align:center;color:${G}}.wgd .gout.ok{color:${GR}}
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
  goals:[],addG:false,flash:(a=>{if(!a||!a.length)return null;a=a.slice().sort((x,y)=>(1-y.price/y.was)-(1-x.price/x.was));const big=a.filter(x=>1-x.price/x.was>=.4);return big.length?big[Math.floor(Date.now()/864e5)%big.length]:a[0]})(pools.flash),fAns:null,forsa:pick(pools.forsa),dAns:null};
 const N=3,root=document.createElement("div");root.className="wob";root.dir=AR?"rtl":"ltr";root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");
 root.innerHTML=`<div class="top"><div class="wbar"><button class="bk" aria-label="${T("Back","رجوع")}">${PH("caret-left")}</button><div class="seg">${"<i></i>".repeat(N-1)}</div><button class="lg">${AR?"English":"العربية"}</button></div><div class="tw"><div class="kk"></div><h1></h1><p class="ld"></p></div><div class="wwv">${WAVE}</div></div><div class="body"><div class="stage"></div></div><div class="foot"><button class="cta"></button><button class="wlnk"></button></div>`;
 document.body.appendChild(root);requestAnimationFrame(()=>root.classList.add("on"));
 const $=s=>root.querySelector(s),stage=$(".stage");
 const sum=a=>a.reduce((x,y)=>x+(+y||0),0);
 const fit=()=>{const sal=+S.salary||0,bills=sum(S.bills.map(b=>b.amt)),room=Math.max(0,sal-bills-Math.round(sal*.15));let r=room;
  const gs=S.goals.filter(g=>+g.target>0).map(g=>{const need=g.target/g.months,give=Math.min(need,r);r-=give;return Object.assign({},g,{give,late:give<need-1,ready:give>0?Math.ceil(g.target/give):null})});
  const gt=sum(gs.map(g=>g.give));return {sal,bills,gs,gt,spend:Math.max(0,sal-bills-gt)}};
 const bName=b=>b.k=="custom"&&b.name?b.name:BILL[b.k][AR?1:0],gName=g=>g.k=="other"&&g.name?g.name:GOAL[g.k][AR?1:0];
 const V=[
  {kk:T("1 of 2","1 من 2"),h:T("How much lands in your account each month?","كم ينزل في حسابك كل شهر؟"),ld:T("Your salary after deductions.","راتبك بعد الخصومات."),cta:T("Continue","متابعة"),ok:()=>+S.salary>0,
   html:()=>`<div class="cd tab"><span class="ctb">${PH("wallet")}</span><div class="ck">${T("Salary","الراتب")}</div><label class="wamt"><b>${RS}</b><input id="wsal" inputmode="numeric" placeholder="0" value="${S.salary?fm(S.salary):""}" aria-label="${T("Salary","الراتب")}"></label>
   <div class="pd"><span>${T("It arrives on the","ينزل")}</span><span class="stp"><button data-pd="-1" aria-label="-">−</button><b id="wpd">${ord(S.payday)}</b><button data-pd="1" aria-label="+">+</button></span></div></div>`},
  {kk:T("2 of 2","2 من 2"),h:T("Your biggest monthly bills","أكبر فواتيرك الشهرية"),ld:T("Change the amounts and add any bill you pay every month.","عدّل المبالغ وأضف أي فاتورة تدفعها كل شهر."),cta:T("See my month","شوف شهري"),ok:()=>true,
   html:()=>`<div class="cd tab"><span class="ctb">${PH("receipt")}</span><div class="ck">${T("Must pay","التزامات")}<small id="wbt">${M(sum(S.bills.map(b=>b.amt)))}</small></div><div style="margin-top:10px">${S.bills.map((b,i)=>`<div class="row"><span class="ic">${PH(BILL[b.k][2])}</span><span class="wnm">${b.k=="custom"?`<input class="n" data-bn="${i}" placeholder="${T("Name it","سمّها")}" value="${esc(b.name)}" maxlength="40">`:BILL[b.k][AR?1:0]}</span><span class="v"><input data-ba="${i}" inputmode="numeric" value="${b.amt?fm(b.amt):""}" placeholder="0" aria-label="${esc(bName(b))}"></span><button class="wx" data-bx="${i}" aria-label="${T("Remove","حذف")}">${PH("x")}</button></div>`).join("")}</div>
   ${S.addB?`<div class="pills">${Object.keys(BILL).filter(k=>k=="custom"||!S.bills.some(b=>b.k==k)).map(k=>`<button class="pill" data-pb="${k}">${BILL[k][AR?1:0]}</button>`).join("")}</div>`:`<button class="add" data-ab="1">+ ${T("Add another bill","أضف فاتورة ثانية")}</button>`}</div>`},
  {kk:T("Your month","شهرك"),h:T("Here is your month.","هذا شهرك."),ld:"",cta:T("Show me around","وريني التطبيق"),ok:()=>true,
   html:()=>{const F=fit(),sal=F.sal||1,nx=new Date(),pd=new Date(nx.getFullYear(),nx.getMonth()+(nx.getDate()>=S.payday?1:0),S.payday),days=Math.max(1,Math.round((pd-new Date(pd.getFullYear(),pd.getMonth()-1,S.payday))/864e5));
    const L=[[NAVY,T("Bills","الفواتير"),F.bills,""],["#5B82B0",T("Goals","الأهداف"),F.gt,F.gs.map(g=>`${esc(gName(g))}: ${T("ready by","جاهز في")} ${g.ready?monAt(g.ready):"—"}`).join(" · ")],["#BFD2E6",T("Yours to spend","لك تصرفه"),F.spend,T(`about ${M(Math.round(F.spend/days))} a day`,`تقريباً ${M(Math.round(F.spend/days))} يومياً`)]];
    return `<div class="cd tab"><span class="ctb">${PH("chart-pie-slice")}</span><div class="ck">${T("Yours to spend","لك تصرفه")}</div>
    <div class="wday"><b data-c="${Math.round(F.spend/days)}">${M(0)}</b><span>${T("a day","يومياً")}</span></div>
    <div class="wsb">${L.map(l=>`<i data-g="${l[2]/sal}" style="background:${l[0]}"></i>`).join("")}</div>
    <div class="wlg">${L.filter(l=>l[2]>0).map(l=>`<span><i class="wsw" style="background:${l[0]}"></i>${l[1]}</span>`).join("")}</div></div>`}}
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
 const go=d=>{if(busy)return;let n=S.i+d;if(n<0)return;if(n>=V.length)return finish("tour");S.i=n;paint(d)};
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

/* ================= intro (replaces the spotlight tour) =================
   Beshr 2026-11-25: after the wallet questions, 4 short screens (bill photo added 2026-11-25) on what the app is for:
   bank messages add themselves (1-2-3), shoppers' bills find the cheapest, one Forsa search checks every store.
   Figures are a labelled example, not his data. ctx.done() (if given) runs after the last screen. */
function tour(ctx){
 css();AR=(ctx&&ctx.lang)=="ar";if(document.querySelector(".wob"))return;
 const root=document.createElement("div");root.className="wob wit";root.dir=AR?"rtl":"ltr";root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");
 root.innerHTML=`<div class="top"><div class="wbar"><button class="bk" aria-label="${T("Back","رجوع")}">${PH("caret-left")}</button><div class="seg"><i></i><i></i><i></i><i></i></div><span></span></div><div class="tw"><div class="kk"></div><h1></h1><p class="ld"></p></div><div class="wwv">${WAVE}</div></div><div class="body"><div class="stage"></div></div><div class="foot"><button class="cta"></button><button class="wlnk">${T("Skip","تخطّ")}</button></div>`;
 document.body.appendChild(root);requestAnimationFrame(()=>root.classList.add("on"));
 const $=s=>root.querySelector(s),ex=`<div class="xeg">${T("Example","مثال")}</div>`;
 const row=(ic,n,sub,v,nw)=>`<div class="xr${nw?" nw":""}"><span class="ic">${PH(ic)}</span><div><b>${n}<i class="xa">${T("Auto","تلقائي")}</i></b><small>${sub}</small></div><b>${M(v)}</b></div>`;
 const bar=(n,v,w,g)=>`<div class="xb"><span>${n}</span><i><u style="--w:${w}%;background:${g?GR:"#94A3B8"}"></u></i><b${g?` style="color:${GR}"`:""}>${M(v)}</b></div>`;
 const V=[
  {kk:T("1 of 4 · Expenses","1 من 4 · المصاريف"),h:T("Bank messages add themselves","رسائل البنك تنضاف لحالها"),ld:T("No typing. Every card purchase is logged.","بدون كتابة. كل شراء بالبطاقة ينسجّل."),
   html:()=>`<div class="xsms"><span>${PH("receipt")}</span><p><b>${T("Bank","البنك")}</b>${T("Purchase SAR 45.00 at Panda","شراء 45.00 ريال من بنده")}</p></div>
   <div class="x3">${[T("SMS arrives","توصل الرسالة"),T("Shortcut sends it","الاختصار يرسلها"),T("Expense added","ينضاف المصروف")].map((s,i)=>`<div><em>${i+1}</em>${s}</div>`).join("")}</div>
   <div class="cd">${row("basket",T("Panda","بنده"),T("Groceries · from bank SMS","بقالة · من رسالة البنك"),45,1)}${row("coffee",T("Coffee shop","مقهى"),T("Coffee · from bank SMS","قهوة · من رسالة البنك"),18)}</div>`},
  {kk:T("2 of 4 · Store","2 من 4 · المتجر"),h:T("Shoppers' bills find the cheapest","فواتير الناس تكشف الأرخص"),ld:T("Everyone adds bills. Everyone saves.","الكل يضيف فواتيره، والكل يوفّر."),
   html:()=>`${ex}<div class="xq l">${T("I paid","دفعت")} ${M(40)} ${T("for Fairy 3L","على فيري 3 لتر")}</div><div class="xq r">${T("Same item:","نفس الغرض:")} ${M(20)} ${T("at Lulu","في لولو")}</div>
   <div class="cd xc">${bar(T("Lulu","لولو"),20,50,1)}${bar(T("Panda","بنده"),29,72)}${bar(T("Danube","الدانوب"),40,100)}<div class="xt">${PH("users")} ${T("Add your bills to keep prices fresh. Shared with no name. Turn off in Settings.","أضف فواتيرك عشان تبقى الأسعار محدّثة. تنشارك بدون اسم، وتقدر توقفها من الإعدادات.")}</div></div>`},
  // Beshr 2026-11-25: show how easy adding a bill is (photo -> we read it -> prices saved)
  {kk:T("3 of 4 · Add a bill","3 من 4 · أضف فاتورة"),h:T("Snap a bill, done","صوّر الفاتورة، وخلاص"),ld:T("Tap Add bill, take a photo. We read every item and price.","اضغط أضف فاتورة وصوّرها. نقرأ كل غرض وسعره."),
   html:()=>`${ex}<div class="xsms"><span>${PH("camera")}</span><p><b>${T("Bill photo","صورة الفاتورة")}</b>${T("Lulu · 3 items","لولو · 3 أغراض")}</p></div>
   <div class="x3">${[T("Take a photo","صوّر"),T("We read it","نقرأها"),T("Prices saved","تنحفظ الأسعار")].map((s,i)=>`<div><em>${i+1}</em>${s}</div>`).join("")}</div>
   <div class="cd">${[["basket",T("Rice 5kg","رز 5 كيلو"),39],["basket",T("Fairy 3L","فيري 3 لتر"),20],["coffee",T("Nescafé Gold","نسكافيه قولد"),21]].map(([ic,n,v])=>`<div class="xr nw"><span class="ic">${PH(ic)}</span><div><b>${n}</b><small>${T("Lulu · saved","لولو · انحفظ")}</small></div><b>${M(v)}</b></div>`).join("")}</div>`},
  {kk:T("4 of 4 · Forsa","4 من 4 · فرصة"),h:T("One search checks every store","بحث واحد يفحص كل المتاجر"),ld:T("Buy smart, or flip it for profit.","اشترِ بذكاء، أو اقلبها بربح."),
   html:()=>`${ex}<div class="xs">${PH("magnifying-glass")}<span class="xty" data-t="${T("iPhone 15 Pro","آيفون 15 برو")}"></span></div>
   <div class="xsrc">${["Haraj","Amazon","Noon","Extra","Jarir","OpenSooq"].map(s=>`<span>${s}</span>`).join("")}</div>
   <div class="cd xd"><div class="xdr"><b>${T("iPhone 15 Pro 256GB","آيفون 15 برو 256")}</b><span class="xpc">▼ 22%</span></div><div class="xdr"><b class="xbig">${M(2650)}</b><s>${M(3400)}</s></div>
   <div class="xad">${PH("info")}<span><b>${T("Good time to buy","وقت مناسب للشراء")}</b>${T("Lowest of 41 ads this month.","الأرخص من 41 إعلان هذا الشهر.")}</span></div></div>`}];
 let i=0,tm=[];const later=(f,ms)=>tm.push(setTimeout(f,ms));
 const play=()=>{tm.forEach(clearTimeout);tm=[];const st=$(".stage");
  if(i==0){later(()=>{st.querySelector(".xsms").classList.add("on");st.querySelectorAll(".x3 div")[0].classList.add("on")},350);later(()=>st.querySelectorAll(".x3 div")[1].classList.add("on"),1150);
   later(()=>{st.querySelector(".xsms").classList.remove("on");st.querySelectorAll(".x3 div")[2].classList.add("on");st.querySelector(".xr.nw").classList.add("on")},1900)}
  if(i==1)[".xq.l",".xq.r",".xc"].forEach((s,k)=>later(()=>st.querySelector(s).classList.add("on"),300+k*700));
  if(i==2){later(()=>{st.querySelector(".xsms").classList.add("on");st.querySelectorAll(".x3 div")[0].classList.add("on")},350);later(()=>st.querySelectorAll(".x3 div")[1].classList.add("on"),1100);
   later(()=>{st.querySelectorAll(".x3 div")[2].classList.add("on")},1800);st.querySelectorAll(".xr.nw").forEach((r,k)=>later(()=>r.classList.add("on"),1900+k*350))}
  if(i==3){const el=st.querySelector(".xty"),tx=el.dataset.t;for(let k=1;k<=tx.length;k++)later(()=>el.textContent=tx.slice(0,k),200+k*45);const t0=300+tx.length*45;
   st.querySelectorAll(".xsrc span").forEach((s,k)=>later(()=>s.classList.add("on"),t0+k*150));later(()=>st.querySelector(".xd").classList.add("on"),t0+1000)}};
 const paint=dir=>{const v=V[i];$(".seg").querySelectorAll("i").forEach((s,k)=>s.classList.toggle("on",k<=i));$(".bk").hidden=i==0;
  const fill=()=>{$(".kk").textContent=v.kk;$("h1").textContent=v.h;$(".ld").textContent=v.ld;$(".stage").innerHTML=v.html();$(".cta").textContent=i<V.length-1?T("Next","التالي"):ctx&&ctx.done?T("Set up bank messages","جهّز رسائل البنك"):T("Done","تم");$(".wlnk").style.visibility=i<V.length-1?"":"hidden";play()};
  if(!dir)return fill();const tw=$(".tw"),st=$(".stage");tw.classList.add("out");st.classList.add("out");setTimeout(()=>{fill();st.classList.remove("out");tw.classList.remove("out")},200)};
 const end=()=>{tm.forEach(clearTimeout);root.classList.remove("on");setTimeout(()=>{root.remove();ctx&&ctx.done&&ctx.done()},260)};
 root.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.classList.contains("cta")){window.track&&window.track(i>=V.length-1?"tour_done":"tour_step","tour","s"+(i+1));if(i>=V.length-1)return end();i++;return paint(1)}
  if(b.classList.contains("bk")&&i>0){i--;return paint(-1)}
  if(b.classList.contains("wlnk")){window.track&&window.track("tour_skip","tour","s"+(i+1));end()}});
 paint();return {end};
}

/* ================= Bank-message guide (2026-11-25): 5 steps + how-to video; the Shortcut sends each bank SMS to log_sms with the user's key ================= */
// ctx: lang, first, done, getKey(), newKey(), test(key), smsUrl, shortcut (iCloud link of the shared Shortcut)
function guide(ctx){
 ctx=ctx||{};css();AR=ctx.lang=="ar";const AND=/Android/i.test(navigator.userAgent),L=AR?"ar":"en";
 let key="";const getK=()=>Promise.resolve(ctx.getKey?ctx.getKey():"").then(k=>key=k||"").catch(()=>"");getK();
 const body=k=>JSON.stringify({k,msg:"[sms_message]"});
 const steps=AND?[T("Tap <b>Copy URL</b> below, install <b>MacroDroid</b> and open it.","اضغط <b>نسخ الرابط</b> تحت، نزّل <b>MacroDroid</b> وافتحه."),
   T("<b>Add Macro</b>. Trigger: <b>SMS Received</b> from your bank.","<b>إضافة ماكرو</b>. المُشغِّل: <b>SMS واردة</b> من بنكك."),
   T("Action: <b>HTTP Request</b>, method POST. Paste the URL.","الإجراء: <b>HTTP Request</b>، الطريقة POST. الصق الرابط."),
   T("Come back, tap <b>Copy Body</b>, paste it in Body (JSON). OK.","ارجع، اضغط <b>نسخ المحتوى</b>، والصقه في المحتوى (JSON). موافق."),
   T("Name it <b>Wallet bank messages</b> and Save.","سمّه <b>رسائل البنك للمحفظة</b> واحفظ.")]
  :[T("Tap <b>Add the Shortcut</b> below. Your key is copied.","اضغط <b>أضف الاختصار</b> تحت. ينسخ مفتاحك."),
   T("<b>Set Up Shortcut</b>, paste your key, <b>Add Shortcut</b>.","<b>إعداد الاختصار</b>، الصق المفتاح، <b>إضافة اختصار</b>."),
   T("Shortcuts app: <b>Automation</b>, <b>New Automation</b>, <b>Message</b>.","تطبيق الاختصارات: <b>أتمتة</b>، <b>أتمتة جديدة</b>، <b>رسالة</b>."),
   T("Message Contains: <b>SAR</b>. Pick <b>Run Immediately</b>. Next.","الرسالة تحتوي على: <b>SAR</b>. اختر <b>التشغيل فورًا</b>. التالي."),
   T("Pick <b>Wallet bank messages</b>, then <b>Done</b>.","اختر <b>رسائل البنك للمحفظة</b>، ثم <b>تم</b>.")];
 const btns=AND?`<button class="gb" data-a="url">${T("1 · Copy URL","1 · نسخ الرابط")}</button><button class="gb l" data-a="body">${T("2 · Copy Body","2 · نسخ المحتوى")}</button>`
  :`<button class="gb" data-a="add">${PH("plus-circle")}${T("Add the Shortcut","أضف الاختصار")}</button>`;
 const w=document.createElement("div");w.className="wgd";w.dir=AR?"rtl":"ltr";w.setAttribute("role","dialog");w.setAttribute("aria-modal","true");
 w.innerHTML=`<div class="wgh"><b>${T("Connect bank messages","ربط رسائل البنك")}</b><button aria-label="${T("Close","إغلاق")}">${PH("x")}</button></div><div class="gs">
  <div class="gi">${T("Your bank purchase messages <b>add themselves</b>. Codes (OTP) are never saved. About 1 minute, once.","رسائل مشترياتك من البنك <b>تنضاف لحالها</b>. الرموز (OTP) ما تنحفظ أبداً. دقيقة وحدة، مرة وحدة بس.")}</div>
  <div class="gst"><i></i><span>${T("Waiting for your first bank message…","ننتظر أول رسالة من البنك…")}</span></div>
  <video class="vid" src="new/media/sms-${AND?"android":"ios"}-${L}.mp4?v=2" autoplay muted loop playsinline preload="auto" aria-label="${T("How-to video","فيديو الطريقة")}"></video>
  ${btns}
  <div class="st"><ol>${steps.map(x=>`<li>${x}</li>`).join("")}</ol></div>
  <div class="st"><div class="gr"><button class="gb l s" data-a="test">${T("Send a test","أرسل تجربة")}</button><button class="gb l s" data-a="new">${T("New key","مفتاح جديد")}</button></div><div class="gout"></div></div>
  <div class="done">${T("Your phone may look a little different.","جوالك ممكن يختلف شوي.")}</div></div>`;
 if(ctx.first)w.insertAdjacentHTML("beforeend",`<div class="gft"><button class="gl">${T("Later","بعدين")}</button><span class="gc"></span><button class="gn">${T("Done","تم")}</button></div>`);
 document.body.appendChild(w);requestAnimationFrame(()=>requestAnimationFrame(()=>w.classList.add("on")));
 // live status (2026-11-25): turns green when a bank message has arrived
 const gst=w.querySelector(".gst");let poll=0;const ago=ms=>{const m=Math.round(ms/6e4);return m<1?T("just now","الحين"):m<60?T(`${m} min ago`,`قبل ${m} دقيقة`):m<1440?T(`${Math.round(m/60)} h ago`,`قبل ${Math.round(m/60)} ساعة`):T(`${Math.round(m/1440)} days ago`,`قبل ${Math.round(m/1440)} يوم`)};
 const check=async()=>{if(!ctx.lastSms||!w.isConnected)return;const t=await Promise.resolve(ctx.lastSms()).catch(()=>0);if(t){gst.classList.add("ok");gst.querySelector("span").textContent=T("Connected ✓ Last bank message ","متصل ✓ آخر رسالة بنك ")+ago(Date.now()-t)}else poll=setTimeout(check,4000)};check();
 const out=w.querySelector(".gout"),say=(t,ok)=>{out.textContent=t;out.classList.toggle("ok",!!ok)};
 const close=()=>{clearTimeout(poll);const v=w.querySelector("video");v&&v.pause();w.classList.remove("on");setTimeout(()=>w.remove(),380);ctx.done&&ctx.done()};
 w.querySelector(".wgh button").onclick=close;
 if(ctx.first){w.querySelector(".gl").onclick=()=>{window.track&&window.track("shortcut_later","guide","s1");close()};w.querySelector(".gn").onclick=close}
 const copy=async t=>{try{await navigator.clipboard.writeText(t);return true}catch(e){return false}};
 w.addEventListener("click",async e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
  if(a=="test"){say(T("Sending…","أرسل…"));if(!key)await getK();const r=key&&ctx.test?await ctx.test(key).catch(()=>""):"";
   return say(String(r).startsWith("Logged")?T("It works. The test cost was saved and removed again.","شغّال. انحفظ مصروف التجربة وانحذف."):T("Not working yet. Ask for help in the app chat.","ما اشتغل للحين. اطلب مساعدة."),String(r).startsWith("Logged"))}
  if(a=="new"){if(!ctx.newKey)return;if(!b.dataset.sure){b.dataset.sure=1;b.textContent=T("Sure? Tap again","متأكد؟ اضغط مرة ثانية");return say(T("The old key and Shortcut will stop working.","المفتاح والاختصار القديم بيوقفون."))}delete b.dataset.sure;b.textContent=T("New key","مفتاح جديد");const k=await Promise.resolve(ctx.newKey()).catch(()=>"");if(!k)return say(T("Couldn't make a new key.","ما قدرت أسوي مفتاح جديد."));key=k;
   return say(T("New key made. The old one stopped working. Set up the Shortcut again.","انسوى مفتاح جديد. القديم وقف. جهّز الاختصار مرة ثانية."),1)}
  if(!key){say(T("One moment…","لحظة…"));await getK();if(!key)return say(T("Your key isn't ready. Try again in a minute.","مفتاحك مو جاهز. جرّب بعد دقيقة."))}
  if(a=="url")return say(await copy(ctx.smsUrl||"")?T("URL copied. Paste it in MacroDroid.","انتسخ الرابط. الصقه في MacroDroid."):ctx.smsUrl);
  if(a=="body")return say(await copy(body(key))?T("Body copied. Paste it in MacroDroid.","انتسخ المحتوى. الصقه في MacroDroid."):body(key));
  // iPhone: copy the key on this tap only, then open the shared Shortcut at once (Security lead 2026-11-25)
  const ok=await copy(key);window.track&&window.track("shortcut_add","guide",ok?"copied":"nocopy");
  if(!ok)return say(T("Couldn't copy. Your key: ","ما انتسخ. مفتاحك: ")+key);
  say(T("Key copied. Paste it now in the Shortcut.","انتسخ المفتاح. الصقه الحين في الاختصار."),1);
  if(ctx.shortcut)setTimeout(()=>{location.href=ctx.shortcut},250)});
 return {close,el:w};
}
window.WOB={setup,tour,guide};
})();
