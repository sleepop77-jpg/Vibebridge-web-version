// DEV MODE v6 — professional workbench redesign.
// Visual research: VS Code (split editor + status bar), Linear (clean cards/chips), Vercel (monochrome precision),
// GitHub (status/diff semantics), Figma Dev Mode (inspect panel), Chrome DevTools (dense activity log).
(function(){
 if(window.__vbDev)return;
 window.__vbDev=true;
 function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
 function say(m){if(window.toast)toast(m);else console.log(m)}
 function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
 function repoParts(){
  var r=(document.getElementById("repo")||{}).value||"";
  if(!r){try{r=JSON.parse(localStorage.getItem("vb")||"{}").r||""}catch(e){}}
  var p=String(r).split("/");
  return p.length===2?p:null;
 }
 function branch(){try{return JSON.parse(localStorage.getItem("vb")||"{}").b||"main"}catch(e){return "main"}}
 function currentBranch(){var b=document.getElementById("vbbranch");return (b&&b.value.trim())||branch()}
 function b64text(s){try{return decodeURIComponent(escape(atob(String(s).replace(/\s/g,""))))}catch(e){try{return atob(String(s).replace(/\s/g,""))}catch(e2){return ""}}}
 function css(){
  if(document.getElementById("vbdevmode-css"))return;
  var st=document.createElement("style");
  st.id="vbdevmode-css";
  st.textContent=""
   +".vbdevwrap{position:relative;display:inline-flex;vertical-align:middle}"
   +".vbdevbtn{font:600 12px/1 system-ui,-apple-system,'Segoe UI',sans-serif;letter-spacing:.04em;padding:5px 11px;border-radius:8px;border:1px solid transparent;color:var(--dim,#8b949e);background:transparent;cursor:pointer;white-space:nowrap}"
   +".vbdevbtn:hover{color:var(--text,#e6edf3);background:rgba(148,163,184,.12);border-color:rgba(148,163,184,.16)}"
   +".vbdevbtn.on{color:#e0f2fe;background:rgba(59,130,246,.14);border-color:rgba(59,130,246,.32);box-shadow:0 0 0 1px rgba(59,130,246,.08),0 8px 20px rgba(37,99,235,.12)}"
   +".vbdevmenu{position:absolute;top:calc(100% + 8px);left:0;min-width:240px;z-index:1000;background:rgba(8,12,20,.96);border:1px solid rgba(148,163,184,.14);border-radius:12px;padding:6px;box-shadow:0 18px 50px rgba(0,0,0,.45);backdrop-filter:blur(18px)}"
   +".vbdevitem{display:flex;flex-direction:column;gap:2px;width:100%;text-align:left;padding:8px 9px;border-radius:8px;color:#dbe6ff;background:transparent;border:none;cursor:pointer}"
   +".vbdevitem:hover{background:rgba(59,130,246,.12)}"
   +".vbdevitem .t{font-size:12px;font-weight:650}"
   +".vbdevitem .d{font-size:10px;color:#7e90b2}"
   +".vbdevitem.danger .t{color:#fca5a5}"
   +"body.vbdev #chat,body.vbdev #composerwrap,body.vbdev .footnote,body.vbdev #vtabnav,body.vbdev #vactivity{display:none!important}"
   +"body.vbdev #vbdock,body.vbdev #vbstars,body.vbdev #starA,body.vbdev #starB,body.vbdev #galaxy{display:none!important}"
   +"body.vbdev #main{position:relative;background:#070b12!important;overflow:hidden}"
   +"#vbwork{display:none;position:absolute;inset:0;z-index:6;flex-direction:column;overflow:hidden;color:#dbe7ff;background:radial-gradient(120% 90% at 12% 0%,rgba(34,211,238,.08),transparent 42%),radial-gradient(100% 80% at 88% 8%,rgba(163,225,18,.05),transparent 38%),linear-gradient(180deg,#080d16 0%,#05080e 100%);font:13px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif}"
   +"body.vbdev #vbwork{display:flex}"
   +".vw-head{display:flex;gap:14px;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(148,163,184,.12);background:linear-gradient(180deg,rgba(12,18,29,.92),rgba(7,11,18,.82));backdrop-filter:blur(20px)}"
   +".vw-id{display:flex;gap:10px;align-items:center;min-width:0}"
   +".vw-logo{width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#22d3ee,#3b82f6 46%,#a3e112);box-shadow:0 0 24px rgba(59,130,246,.24);flex:none}"
   +".vw-title{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#f4f8ff}"
   +".vw-sub{font:10px/1.4 ui-monospace,Menlo,Consolas,monospace;color:#7186a8;letter-spacing:.05em}"
   +".vw-target{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-left:auto}"
   +".vw-chip{font:10px/1 ui-monospace,Menlo,Consolas,monospace;color:#9fb1d0;background:rgba(148,163,184,.08);border:1px solid rgba(148,163,184,.12);border-radius:999px;padding:5px 9px;white-space:nowrap}"
   +".vw-chip.accent{color:#bfdbfe;border-color:rgba(59,130,246,.25);background:rgba(59,130,246,.1)}"
   +".vw-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}"
   +".vw-btn{border:1px solid rgba(148,163,184,.14);border-radius:9px;padding:6px 12px;font-size:11.5px;font-weight:700;color:#dbe7ff;background:rgba(148,163,184,.07);cursor:pointer;transition:transform .16s,background .16s,border-color .16s}"
   +".vw-btn:hover{border-color:rgba(96,165,250,.35);background:rgba(59,130,246,.12);transform:translateY(-1px)}"
   +".vw-btn:disabled{opacity:.42;cursor:not-allowed;transform:none}"
   +".vw-btn.primary{background:linear-gradient(180deg,#3b82f6,#2563eb);border-color:rgba(147,197,253,.35);color:#fff;box-shadow:0 10px 24px rgba(37,99,235,.2)}
   +".vw-btn.danger{color:#fecaca;background:rgba(248,81,73,.1);border-color:rgba(248,81,73,.25)}"
   +".vw-btn.ghost{background:transparent}"
   +".vw-body{flex:1;display:flex;min-height:0;position:relative}"
   +".vw-left{width:46%;min-width:280px;display:flex;flex-direction:column;min-height:0;background:linear-gradient(180deg,rgba(9,14,23,.72),rgba(6,9,15,.94));border-right:1px solid rgba(148,163,184,.1)}"
   +".vw-pane-top{display:flex;gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(148,163,184,.09);background:rgba(9,14,23,.68)}"
   +".vw-label{font:10px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.16em;text-transform:uppercase;color:#7286a7;font-weight:700}"
   +".vw-spacer{flex:1}"
   +".vw-count{font:10px/1 ui-monospace,Menlo,Consolas,monospace;color:#6f82a3}"
   +".vw-editor{flex:1;display:flex;min-height:0;background:#070c14}"
   +".vw-gutter{width:54px;flex:none;overflow:hidden;padding:13px 9px 13px 0;text-align:right;background:#060a11;border-right:1px solid rgba(148,163,184,.08);color:#3f5170;font:12px/20px ui-monospace,Menlo,Consolas,monospace;user-select:none}"
   +".vw-gutter span{display:block;height:20px}"
   +"#vbpay{flex:1;min-width:0;margin:0;border:none;background:transparent;color:#e8f0ff;font:12px/20px ui-monospace,Menlo,Consolas,monospace;padding:13px 14px;resize:none;outline:none;white-space:pre;overflow:auto;tab-size:2}"
   +"#vbpay::placeholder{color:#4f6280}"
   +".vw-pane-foot{padding:8px 12px;border-top:1px solid rgba(148,163,184,.08);font:10px/1.5 ui-monospace,Menlo,Consolas,monospace;color:#5f7392;background:rgba(7,11,18,.72)}"
   +".vw-divider{width:9px;flex:none;cursor:col-resize;background:linear-gradient(180deg,transparent,rgba(59,130,246,.18),transparent);position:relative}"
   +".vw-divider:hover,.vw-divider:active{background:linear-gradient(180deg,transparent,rgba(59,130,246,.42),transparent)}"
   +".vw-right{flex:1;min-width:300px;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:12px;background:radial-gradient(90% 60% at 100% 0%,rgba(34,211,238,.05),transparent 45%)}"
   +".vw-card{border:1px solid rgba(148,163,184,.12);border-radius:14px;background:linear-gradient(180deg,rgba(15,21,32,.78),rgba(9,13,21,.88));box-shadow:0 14px 34px rgba(1,4,9,.2);overflow:hidden;animation:vwIn .22s cubic-bezier(.3,.7,.3,1)}"
   +"@keyframes vwIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}"
   +".vw-card-head{display:flex;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(148,163,184,.08);background:rgba(148,163,184,.04)}"
   +".vw-card-title{font:10px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:#93a8c9;font-weight:800}"
   +".vw-card-note{margin-left:auto;font:10px/1 ui-monospace,Menlo,Consolas,monospace;color:#66799a}"
   +".vw-card-body{padding:12px}"
   +".vw-metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(72px,1fr));gap:8px}"
   +".vw-metric{padding:11px 8px;border-radius:12px;background:rgba(148,163,184,.05);border:1px solid rgba(148,163,184,.08);text-align:center}"
   +".vw-metric .v{font:700 20px/1 ui-monospace,Menlo,Consolas,monospace;color:#f5f9ff}"
   +".vw-metric .k{margin-top:6px;font:9px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.1em;text-transform:uppercase;color:#7286a7}"
   +".vw-metric.file .v{color:#86efac}"
   +".vw-metric.edit .v{color:#fcd34d}"
   +".vw-metric.delete .v{color:#fca5a5}"
   +".vw-op{display:flex;gap:10px;align-items:center;padding:9px 10px;border:1px solid rgba(148,163,184,.08);border-radius:11px;background:rgba(7,11,19,.5);margin-bottom:7px}"
   +".vw-op:last-child{margin-bottom:0}"
   +".vw-op .k{flex:none;font:8.5px/1 ui-monospace,Menlo,Consolas,monospace;font-weight:800;letter-spacing:.08em;border-radius:5px;padding:4px 6px}"
   +".vw-op .k.FILE{background:rgba(63,185,80,.14);color:#4ade80}"
   +".vw-op .k.EDIT{background:rgba(210,153,34,.14);color:#fbbf24}"
   +".vw-op .k.DELETE{background:rgba(248,81,73,.14);color:#fb7185}"
   +".vw-op .p{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:11.5px/1.4 ui-monospace,Menlo,Consolas,monospace;color:#93c5fd}"
   +".vw-op .d{flex:none;font:10px/1 ui-monospace,Menlo,Consolas,monospace;color:#6f82a3}"
   +".vw-op .v{flex:none;font:9px/1 ui-monospace,Menlo,Consolas,monospace;font-weight:800;letter-spacing:.06em;border-radius:999px;padding:5px 8px;border:1px solid transparent}"
   +".vw-op .v.ok,.vw-badge.ok{background:rgba(63,185,80,.12);color:#4ade80;border-color:rgba(63,185,80,.22)}"
   +".vw-op .v.miss,.vw-badge.miss{background:rgba(248,81,73,.12);color:#fb7185;border-color:rgba(248,81,73,.24)}"
   +".vw-op .v.wait,.vw-badge.wait{background:rgba(148,163,184,.08);color:#94a3b8;border-color:rgba(148,163,184,.12)}"
   +".vw-warn{border-left:2px solid #f59e0b;background:rgba(245,158,11,.08);color:#fcd34d;border-radius:8px;padding:8px 10px;font-size:11.5px;margin-bottom:6px}"
   +".vw-empty{color:#93a4c2;font-size:12.5px;margin-bottom:10px}"
   +".vw-steps{display:flex;flex-direction:column;gap:6px}"
   +".vw-step{display:flex;gap:9px;align-items:center;color:#8ba0c1;font-size:12px}"
   +".vw-step .n{width:20px;height:20px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.2);color:#bfdbfe;font:10px/1 ui-monospace,Menlo,Consolas,monospace}"
   +".vw-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}"
   +".vw-row:last-child{margin-bottom:0}"
   +".vw-input{flex:1;min-width:120px;margin:0;background:#080d16;color:#e8f0ff;border:1px solid rgba(148,163,184,.14);border-radius:9px;padding:8px 10px;font:12px/1.4 ui-monospace,Menlo,Consolas,monospace;outline:none}"
   +".vw-input:focus{border-color:rgba(59,130,246,.45);box-shadow:0 0 0 3px rgba(59,130,246,.12)}"
   +".vw-check{display:flex;gap:8px;align-items:center;padding:7px 9px;border:1px solid rgba(148,163,184,.08);border-radius:9px;background:rgba(7,11,19,.45);margin-bottom:6px;font-size:12px;color:#9db0cf}"
   +".vw-badge{flex:none;font:9px/1 ui-monospace,Menlo,Consolas,monospace;font-weight:800;border-radius:999px;padding:5px 8px}"
   +".vw-log{max-height:190px;overflow:auto;display:flex;flex-direction:column;gap:5px;font:11px/1.55 ui-monospace,Menlo,Consolas,monospace}"
   +".vw-logline{color:#8497b6;border-left:2px solid rgba(148,163,184,.16);padding-left:8px;white-space:pre-wrap;word-break:break-word}"
   +".vw-logline.good{color:#86efac;border-left-color:rgba(63,185,80,.45)}"
   +".vw-logline.bad{color:#fca5a5;border-left-color:rgba(248,81,73,.45)}"
   +".vw-logline.warn{color:#fcd34d;border-left-color:rgba(245,158,11,.45)}"
   +".vw-logline.info{color:#93c5fd;border-left-color:rgba(59,130,246,.45)}"
   +".vw-foot{display:flex;gap:12px;align-items:center;padding:9px 14px;border-top:1px solid rgba(148,163,184,.12);background:rgba(5,8,14,.95);font:11px/1.4 ui-monospace,Menlo,Consolas,monospace;color:#7d90b0}"
   +".vw-status{display:flex;align-items:center;gap:8px;min-width:0;color:#a8bad8}"
   +".vw-status::before{content:'';width:7px;height:7px;border-radius:50%;background:#64748b;box-shadow:0 0 10px rgba(100,116,139,.55);flex:none}"
   +".vw-status.ok{color:#86efac}"
   +".vw-status.ok::before{background:#22c55e;box-shadow:0 0 10px rgba(34,197,94,.5)}"
   +".vw-status.bad{color:#fca5a5}"
   +".vw-status.bad::before{background:#ef4444;box-shadow:0 0 10px rgba(239,68,68,.5)}"
   +".vw-status.warn{color:#fcd34d}"
   +".vw-status.warn::before{background:#f59e0b;box-shadow:0 0 10px rgba(245,158,11,.5)}"
   +".vw-status.info{color:#93c5fd}"
   +".vw-status.info::before{background:#3b82f6;box-shadow:0 0 10px rgba(59,130,246,.5)}"
   +".vw-foot-right{margin-left:auto;color:#66799a;white-space:nowrap}"
   +"@media(max-width:960px){.vw-head{flex-wrap:wrap}.vw-target{margin-left:0;order:3;width:100%}.vw-body{flex-direction:column}.vw-left{width:auto;min-width:0;height:42%;border-right:none;border-bottom:1px solid rgba(148,163,184,.1)}.vw-divider{display:none}.vw-right{min-width:0}}";
  document.head.appendChild(st);
 }
 var work=null,ops=[],parseTimer=null,btn=null,ta=null,gutter=null,countEl=null,missCount=0,pendingPreflight=0;
 function isVisible(el){if(!el||!el.parentNode)return false;var r=el.getBoundingClientRect();return r.width>0&&r.height>0}
 function makeBtn(){
  var w=E("span","vbdevwrap");w.id="vbdev-mode-entry";
  var b=E("button","vbdevbtn","Developer");b.id="devbtn";b.type="button";b.title="Developer workbench";b.setAttribute("aria-haspopup","true");
  var m=E("div","vbdevmenu hidden");m.id="vbdev-mode-menu";
  function item(label,desc,fn,danger){
   var it=E("button","vbdevitem"+(danger?" danger":""));
   it.type="button";
   it.appendChild(E("span","t",label));
   if(desc)it.appendChild(E("span","d",desc));
   it.onclick=function(e){e.stopPropagation();m.classList.add("hidden");try{fn()}catch(err){say("developer action failed: "+err.message)}};
   return it;
  }
  m.appendChild(item("Developer workbench","toggle payload engine",function(){setDev(!document.body.classList.contains("vbdev"))}));
  m.appendChild(item("Reload preflight","parse current payload",function(){setDev(true);doParse(ta?ta.value:"")}));
  m.appendChild(item("Clear payload","empty editor",function(){setDev(true);if(ta){ta.value="";updateGutter();doParse("")}}));
  m.appendChild(item("Revert last push","undo latest successful commit",doRevert,true));
  m.appendChild(item("Open target repo","github repo page",function(){var rp=repoParts();if(rp)window.open("https://github.com/"+rp[0]+"/"+rp[1],"_blank");else say("no repo connected")}));
  m.appendChild(item("Exit developer mode","return to normal chat",function(){setDev(false)}));
  b.onclick=function(e){e.stopPropagation();m.classList.toggle("hidden")};
  w.appendChild(b);w.appendChild(m);
  document.addEventListener("click",function(){m.classList.add("hidden")});
  return w;
 }
 function barSlot(){
  var bar=document.getElementById("vbmenubar");if(!bar)return null;
  var menus=bar.querySelectorAll(".mb, .vmenubtn");
  var ref=menus.length?menus[menus.length-1].nextSibling:null;
  if(!ref){var brand=bar.querySelector(".vbbrand");ref=brand?brand.nextSibling:bar.firstChild}
  return {parent:bar,ref:ref};
 }
 function headerSlot(){
  var hdr=document.querySelector("#main header");if(!hdr)return null;
  var mw=hdr.querySelector(".modelwrap");
  return {parent:hdr,ref:mw?mw.nextSibling:hdr.firstChild};
 }
 function sbSlot(){
  var sb=document.getElementById("sb");if(!sb)return null;
  return {parent:sb,ref:sb.querySelector(".sbfoot")};
 }
 function ensure(){
  var oldMenu=document.getElementById("vbdevmenu");
  if(oldMenu&&oldMenu!==btn){
   var menu=oldMenu.querySelector(".menu");
   if(menu&&!document.getElementById("vbdev-old-entry")){
    var it=document.createElement("button");
    it.id="vbdev-old-entry";
    it.textContent="Developer workbench";
    it.onclick=function(e){e.stopPropagation();menu.classList.add("hidden");setDev(!document.body.classList.contains("vbdev"))};
    menu.appendChild(it);
   }
   if(btn)btn.style.display="none";
   return true;
  }
  if(!btn)btn=makeBtn();
  if(isVisible(btn))return true;
  var slots=[barSlot(),headerSlot(),sbSlot()];
  for(var i=0;i<slots.length;i++){
   var s=slots[i];if(!s)continue;
   s.parent.insertBefore(btn,s.ref);
   if(isVisible(btn)){
    var old=document.getElementById("dev-side");if(old)old.remove();
    return true;
   }
  }
  return false;
 }
 function card(title,note){
  var c=E("div","vw-card");
  var h=E("div","vw-card-head");
  h.appendChild(E("div","vw-card-title",title));
  if(note)h.appendChild(E("div","vw-card-note",note));
  var b=E("div","vw-card-body");
  c.appendChild(h);c.appendChild(b);
  return {card:c,body:b};
 }
 function metric(label,value,cls){
  var m=E("div","vw-metric"+(cls?" "+cls:""));
  m.appendChild(E("div","v",String(value)));
  m.appendChild(E("div","k",label));
  return m;
 }
 function setStatus(msg,kind){
  var s=document.getElementById("vbstatus");
  if(!s)return;
  s.className="vw-status "+(kind||"");
  s.textContent=msg;
 }
 function updateFootMeta(extra){
  var el=document.getElementById("vbfootmeta");
  if(!el)return;
  var t=ops.length?ops.length+" ops":"no ops";
  if(missCount)t+=" · "+missCount+" blockers";
  else if(ops.length)t+=" · clean";
  if(extra)t+=" · "+extra;
  el.textContent=t;
 }
 function log(msg,kind){
  var box=document.getElementById("vblog");
  if(!box)return;
  var d=new Date();
  var ts=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+":"+String(d.getSeconds()).padStart(2,"0");
  var line=E("div","vw-logline "+(kind||""),"["+ts+"] "+msg);
  box.appendChild(line);
  box.scrollTop=box.scrollHeight;
 }
 function updateGutter(){
  if(!ta||!gutter)return;
  var lines=ta.value.split("\n");
  var n=lines.length;
  var out=[];
  for(var i=0;i<Math.min(n,2000);i++)out.push("<span>"+(i+1)+"</span>");
  if(n>2000)out.push("<span>…</span>");
  gutter.innerHTML=out.join("");
  if(countEl)countEl.textContent=ta.value.length+" chars · "+n+" line"+(n===1?"":"s");
  updateFootMeta();
 }
 function updateTarget(){
  var rp=repoParts();
  var rc=document.getElementById("vbdev-repo");
  var bc=document.getElementById("vbdev-branch");
  if(rc)rc.textContent="repo · "+(rp?rp.join("/"):"not connected");
  if(bc)bc.textContent="branch · "+currentBranch();
 }
 function emptyState(){
  var c=card("waiting for payload","developer mode active");
  c.body.appendChild(E("div","vw-empty","Paste a bridge payload into the left editor. Parsing, preflight and commit controls appear here."));
  var steps=E("div","vw-steps");
  ["Ask your AI for code or file changes.","Paste the returned bridge payload here.","Preflight checks every FIND/REPLACE hunk.","Push only when every operation is green."].forEach(function(s,i){
   var row=E("div","vw-step");
   row.appendChild(E("span","n",String(i+1)));
   row.appendChild(E("span","",s));
   steps.appendChild(row);
  });
  c.body.appendChild(steps);
  return c;
 }
 function setPill(pill,cls,text){
  if(!pill)return;
  pill.className="v "+cls;
  pill.textContent=text;
 }
 function build(){
  var w=E("div");w.id="vbwork";
  var head=E("div","vw-head");
  var id=E("div","vw-id");
  id.innerHTML="<span class='vw-logo'></span><div><div class='vw-title'>Developer Workbench</div><div class='vw-sub'>payload · preflight · commit · ci</div></div>";
  head.appendChild(id);
  var target=E("div","vw-target");
  var repoChip=E("span","vw-chip","repo · none");repoChip.id="vbdev-repo";
  var branchChip=E("span","vw-chip","branch · main");branchChip.id="vbdev-branch";
  var safeChip=E("span","vw-chip accent","safe preflight");
  target.appendChild(repoChip);target.appendChild(branchChip);target.appendChild(safeChip);
  head.appendChild(target);
  var actions=E("div","vw-actions");
  var parseBtn=E("button","vw-btn","Parse");parseBtn.onclick=function(){doParse(ta?ta.value:"")};
  var clearBtn=E("button","vw-btn ghost","Clear");clearBtn.onclick=function(){if(ta){ta.value="";updateGutter();doParse("")}};
  var revertBtn=E("button","vw-btn danger","Revert");revertBtn.onclick=doRevert;
  var exitBtn=E("button","vw-btn","Exit");exitBtn.onclick=function(){setDev(false)};
  actions.appendChild(parseBtn);actions.appendChild(clearBtn);actions.appendChild(revertBtn);actions.appendChild(exitBtn);
  head.appendChild(actions);
  w.appendChild(head);
  var body=E("div","vw-body");
  var left=E("div","vw-left");
  var leftTop=E("div","vw-pane-top");
  leftTop.innerHTML="<span class='vw-label'>payload editor</span><span class='vw-spacer'></span>";
  countEl=E("span","vw-count","0 chars · 1 line");
  leftTop.appendChild(countEl);
  left.appendChild(leftTop);
  var ed=E("div","vw-editor");
  gutter=E("div","vw-gutter");
  ta=document.createElement("textarea");
  ta.id="vbpay";
  ta.spellcheck=false;
  ta.placeholder="Paste a VibeBridge payload here.\n\nLive parse, preflight, commit and CI appear on the right.\n\nCtrl+Enter = push";
  ta.oninput=function(){clearTimeout(parseTimer);updateGutter();parseTimer=setTimeout(function(){doParse(ta.value)},350)};
  ta.addEventListener("scroll",function(){gutter.scrollTop=ta.scrollTop});
  ta.addEventListener("keydown",function(e){if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();doPush()}});
  ed.appendChild(gutter);ed.appendChild(ta);
  left.appendChild(ed);
  left.appendChild(E("div","vw-pane-foot","exact FIND first · whitespace-normalized fuzzy fallback · push aborts on any miss"));
  var div=E("div","vw-divider");
  var right=E("div","vw-right");right.id="vbright";
  body.appendChild(left);body.appendChild(div);body.appendChild(right);
  w.appendChild(body);
  var foot=E("div","vw-foot");
  foot.innerHTML="<span id='vbstatus' class='vw-status'>developer workbench ready</span><span class='vw-foot-right' id='vbfootmeta'>no payload</span>";
  w.appendChild(foot);
  div.addEventListener("mousedown",function(e){
   e.preventDefault();
   function mv(ev){var r=body.getBoundingClientRect();var pct=((ev.clientX-r.left)/r.width)*100;left.style.width=Math.max(22,Math.min(76,pct))+"%"}
   function up(){removeEventListener("mousemove",mv);removeEventListener("mouseup",up)}
   addEventListener("mousemove",mv);addEventListener("mouseup",up);
  });
  return w;
 }
 function doParse(text){
  var right=document.getElementById("vbright");
  if(!right)return;
  right.innerHTML="";
  ops=[];missCount=0;pendingPreflight=0;
  updateGutter();
  if(!text||!/===VIBEBRIDGE===|===== (FILE|EDIT|DELETE):/.test(text)){
   right.appendChild(emptyState().card);
   setStatus("waiting for payload","info");
   updateFootMeta();
   return;
  }
  var parse=window.parsePayload||(typeof parsePayload!=="undefined"?parsePayload:null);
  var r=parse?parse(text):null;
  if(!r||!r.ops||!r.ops.length){
   var wc=card("parse warning","blocked");
   wc.body.appendChild(E("div","vw-warn","payload detected but no FILE / EDIT / DELETE operations were found."));
   right.appendChild(wc.card);
   setStatus("no operations parsed","warn");
   updateFootMeta();
   return;
  }
  ops=r.ops;
  var files=ops.filter(function(o){return o.kind==="FILE"}).length;
  var edits=ops.filter(function(o){return o.kind==="EDIT"}).length;
  var dels=ops.filter(function(o){return o.kind==="DELETE"}).length;
  var sum=card("payload summary",ops.length+" operations");
  var grid=E("div","vw-metrics");
  grid.appendChild(metric("total",ops.length));
  grid.appendChild(metric("file",files,"file"));
  grid.appendChild(metric("edit",edits,"edit"));
  grid.appendChild(metric("delete",dels,"delete"));
  sum.body.appendChild(grid);
  right.appendChild(sum.card);
  var warns=(r.warnings||[]).concat(r.warning?[r.warning]:[]);
  if(warns.length){
   var wcard=card("parser warnings",warns.length+" issue(s)");
   warns.forEach(function(x){wcard.body.appendChild(E("div","vw-warn",String(x)))});
   right.appendChild(wcard.card);
  }
  var list=card("operations","live preflight");
  var rows=[];
  ops.forEach(function(op){
   var det=op.kind==="FILE"?op.content.split("\n").length+" lines":op.kind==="EDIT"?(op.hunks||[]).length+" hunks":"remove";
   var row=E("div","vw-op");
   row.appendChild(E("span","k "+op.kind,op.kind));
   row.appendChild(E("span","p",op.path));
   row.appendChild(E("span","d",det));
   var pill=E("span","v wait","…");
   row.appendChild(pill);
   list.body.appendChild(row);
   rows.push({op:op,pill:pill});
  });
  right.appendChild(list.card);
  if(window.checklistFor){
   try{
    var items=checklistFor(ops);
    if(items&&items.length){
     var ck=card("feature checklist","protected files");
     items.forEach(function(it){
      var row=E("div","vw-check");
      row.appendChild(E("span","vw-badge "+(it.ok?"ok":"miss"),it.ok?"present":"missing"));
      row.appendChild(E("span","",it.name+" · "+it.path));
      ck.body.appendChild(row);
     });
     right.appendChild(ck.card);
    }
   }catch(e){}
  }
  var cm=card("commit target","preflight required");
  var row1=E("div","vw-row");
  var msg=document.createElement("input");msg.id="vbmsg";msg.className="vw-input";msg.value="feat: web push ("+ops.length+" ops)";
  var br=document.createElement("input");br.id="vbbranch";br.className="vw-input";br.value=branch();br.style.maxWidth="130px";
  br.onchange=updateTarget;
  row1.appendChild(msg);row1.appendChild(br);
  cm.body.appendChild(row1);
  var row2=E("div","vw-row");
  var push=E("button","vw-btn primary","Push to GitHub");push.id="vbdev-push";push.disabled=true;push.onclick=doPush;
  var rev=E("button","vw-btn danger","Revert last");rev.onclick=doRevert;
  var open=E("button","vw-btn ghost","Open repo");
  open.onclick=function(){var rp=repoParts();if(rp)window.open("https://github.com/"+rp[0]+"/"+rp[1],"_blank");else say("no repo connected")};
  row2.appendChild(push);row2.appendChild(rev);row2.appendChild(open);
  cm.body.appendChild(row2);
  right.appendChild(cm.card);
  var act=card("activity","live");
  var logBox=E("div","vw-log");logBox.id="vblog";
  act.body.appendChild(logBox);
  right.appendChild(act.card);
  log("parsed "+ops.length+" operation(s)","info");
  setStatus("running preflight…","info");
  updateTarget();
  startPreflight(rows);
 }
 function startPreflight(rows){
  pendingPreflight=rows.length;
  missCount=0;
  updateFootMeta("preflight running");
  if(!pendingPreflight){setStatus("parsed","info");return}
  var push=document.getElementById("vbdev-push");
  if(push)push.disabled=true;
  rows.forEach(function(r){
   preflightOp(r.op,r.pill,function(ok){
    if(!ok)missCount++;
    pendingPreflight--;
    updateFootMeta();
    if(pendingPreflight===0){
     var p=document.getElementById("vbdev-push");
     if(p)p.disabled=missCount>0;
     if(missCount){setStatus("preflight blocked · "+missCount+" issue(s)","bad");log("preflight blocked: "+missCount+" issue(s)","bad")}
     else{setStatus("preflight clean · ready to push","ok");log("preflight clean","good")}
    }
   });
  });
 }
 async function preflightOp(op,pill,done){
  var rp=repoParts();
  var br=currentBranch();
  if(!window.api||!rp){setPill(pill,"wait","no conn");done(true);return}
  var url="/repos/"+rp[0]+"/"+rp[1]+"/contents/"+op.path+"?ref="+br;
  try{
   if(op.kind==="FILE"){setPill(pill,"ok","ready");done(true);return}
   if(op.kind==="DELETE"){
    await window.api("GET",url);
    setPill(pill,"ok","target exists");
    done(true);
    return;
   }
   var meta=await window.api("GET",url);
   var content=b64text(meta.content);
   var ae=window.applyEdit||(typeof applyEdit!=="undefined"?applyEdit:null);
   if(!ae){setPill(pill,"miss","no applyEdit");done(false);return}
   for(var hi=0;hi<(op.hunks||[]).length;hi++){
    var h=op.hunks[hi];
    var next=ae(content,h.find,h.replace);
    if(next==null){setPill(pill,"miss","hunk "+(hi+1)+" miss");done(false);return}
    content=next;
   }
   setPill(pill,"ok",(op.hunks||[]).length+" hunks ready");
   done(true);
  }catch(e){
   if(e&&e.code===404){
    if(op.kind==="DELETE"){setPill(pill,"wait","already absent");done(true)}
    else{setPill(pill,"miss","file missing");done(false)}
   }else{
    setPill(pill,"miss","error");
    done(false);
   }
  }
 }
 async function doPush(){
  if(!ops.length){say("nothing parsed to push");return}
  var missEls=document.querySelectorAll("#vbright .v.miss");
  if(missEls.length){
   say(missEls.length+" preflight blocker(s) — fix before push");
   setStatus("push blocked by preflight","bad");
   log("push blocked: "+missEls.length+" preflight issue(s)","bad");
   return;
  }
  if(!window.commitOps){say("commitOps missing");return}
  var rp=repoParts();
  var msg=(document.getElementById("vbmsg")||{}).value||"feat: web push";
  var br=(document.getElementById("vbbranch")||{}).value||branch();
  var push=document.getElementById("vbdev-push");
  if(push){push.disabled=true;push.textContent="Pushing…"}
  setStatus("preparing commit…","info");
  log("pushing "+ops.length+" ops to "+(rp?rp.join("/"):"repo")+" @ "+br,"info");
  if(br!==branch()){
   var pat=(document.getElementById("pat")||{}).value||"";
   if(!pat){try{pat=JSON.parse(localStorage.getItem("vb")||"{}").p||""}catch(e){}}
   if(pat&&rp&&window.setConn)window.setConn(pat,rp[0]+"/"+rp[1],br);
  }
  try{
   var c=await window.commitOps(ops,msg);
   var sha=String(c.sha||"").slice(0,7);
   log("committed "+sha,"good");
   setStatus("commit "+sha+" · polling CI","ok");
   updateTarget();
   pollCi(c.sha);
  }catch(e){
   log("push failed: "+e.message,"bad");
   setStatus("push failed","bad");
   say("push failed: "+e.message);
  }
  if(push){push.disabled=false;push.textContent="Push to GitHub"}
 }
 async function pollCi(sha){
  var rp=repoParts();
  if(!rp||!window.latestRun)return;
  log("polling CI…","info");
  for(var i=0;i<12;i++){
   await sleep(10000);
   try{
    var run=await window.latestRun();
    if(run){
     var label="CI "+run.status+(run.conclusion?" / "+run.conclusion:"");
     setStatus(label+" · "+String(sha).slice(0,7),"info");
     log(label,"info");
     if(run.conclusion){
      if(run.conclusion==="success"){setStatus("CI passed · "+String(sha).slice(0,7),"ok");log("CI passed","good")}
      else{setStatus("CI "+run.conclusion+" · "+String(sha).slice(0,7),"bad");log("CI "+run.conclusion+" · "+(run.html_url||""),"bad")}
      return;
     }
    }
   }catch(e){}
  }
  setStatus("CI polling timeout · "+String(sha).slice(0,7),"warn");
  log("CI polling stopped after timeout","warn");
 }
 async function doRevert(){
  var rp=repoParts();
  if(!rp||!window.api){say("connect first");return}
  if(!confirm("Revert the last successful push?"))return;
  var br=currentBranch();
  var hist=[];
  try{hist=JSON.parse(localStorage.getItem("vb_pushes")||"[]")}catch(e){}
  var last=null;
  for(var i=hist.length-1;i>=0;i--){if(hist[i].ok&&hist[i].sha){last=hist[i];break}}
  if(!last){say("no pushed sha in history");return}
  setStatus("reverting "+String(last.sha).slice(0,7)+"…","warn");
  log("reverting "+String(last.sha).slice(0,7),"warn");
  try{
   var bad=await window.api("GET","/repos/"+rp[0]+"/"+rp[1]+"/git/commits/"+last.sha);
   var parentSha=bad.parents&&bad.parents[0]?bad.parents[0].sha:null;
   if(!parentSha){say("cannot revert root commit");return}
   var parent=await window.api("GET","/repos/"+rp[0]+"/"+rp[1]+"/git/commits/"+parentSha);
   var nc=await window.api("POST","/repos/"+rp[0]+"/"+rp[1]+"/git/commits",{message:"revert: "+String(last.sha).slice(0,7),tree:parent.tree.sha,parents:[last.sha]});
   await window.api("PATCH","/repos/"+rp[0]+"/"+rp[1]+"/git/refs/heads/"+br,{sha:nc.sha,force:false});
   log("reverted to "+String(nc.sha).slice(0,7),"good");
   setStatus("reverted · "+String(nc.sha).slice(0,7),"ok");
   say("reverted");
  }catch(e){
   log("revert failed: "+e.message,"bad");
   setStatus("revert failed","bad");
   say("revert failed: "+e.message);
  }
 }
 function setDev(on){
  try{localStorage.setItem("vb_devmode",on?"1":"0")}catch(e){}
  document.body.classList.toggle("vbdev",on);
  var b=document.getElementById("devbtn");
  if(b){b.classList.toggle("on",on);b.setAttribute("aria-expanded",on?"true":"false")}
  if(on&&!work){
   work=build();
   var main=document.getElementById("main");
   if(main)main.appendChild(work);
  }
  if(on){
   updateTarget();
   updateGutter();
   doParse(ta?ta.value:"");
  }else{
   var m=document.getElementById("vbdev-mode-menu");
   if(m)m.classList.add("hidden");
  }
 }
 css();
 var ticks=0;
 var iv=setInterval(function(){ticks++;ensure();if(ticks>150)clearInterval(iv)},400);
 ensure();
 try{if(localStorage.getItem("vb_devmode")==="1")setDev(true)}catch(e){}
 window.vbDevMode={toggle:setDev,parse:doParse,push:doPush,revert:doRevert};
})();