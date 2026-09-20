// DEVELOPER MODE v8 — real workspace panel, real placement, real controls.
// Builds a full Developer workspace, patches old Developer buttons/menus, and exposes window.vbDevMode.
(function(){
 if(window.__vbDeveloper)return;
 window.__vbDeveloper=true;
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
 function currentBranch(){var el=document.getElementById("vbd-branch");return (el&&el.value.trim())||branch()}
 function b64text(s){try{return decodeURIComponent(escape(atob(String(s).replace(/\s/g,""))))}catch(e){try{return atob(String(s).replace(/\s/g,""))}catch(e2){return ""}}}
 function css(){
  if(document.getElementById("vbdeveloper-css"))return;
  var st=document.createElement("style");
  st.id="vbdeveloper-css";
  st.textContent=""
   +"body.vbdeveloper #chat,body.vbdeveloper #composerwrap,body.vbdeveloper .footnote,body.vbdeveloper #vtabnav,body.vbdeveloper #vactivity,body.vbdeveloper #empty{display:none!important}"
   +"body.vbdeveloper #main{background:#05070c!important;overflow:hidden}"
   +"body.vbdeveloper #vbwork{display:none!important}"
   +"#vbdeveloper{position:fixed;top:28px;left:0;right:0;bottom:0;z-index:997;display:flex;flex-direction:column;overflow:hidden;color:#dbe7ff;background:radial-gradient(120% 90% at 12% 0%,rgba(34,211,238,.08),transparent 42%),radial-gradient(100% 80% at 88% 8%,rgba(163,225,18,.05),transparent 38%),linear-gradient(180deg,#080d16 0%,#05080e 100%);font:13px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif}"
   +"#vbdeveloper.hidden{display:none!important}"
   +".vbd-head{display:flex;gap:12px;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(148,163,184,.12);background:linear-gradient(180deg,rgba(12,18,29,.92),rgba(7,11,18,.82));backdrop-filter:blur(20px);flex-wrap:wrap}"
   +".vbd-id{display:flex;gap:10px;align-items:center;min-width:0}"
   +".vbd-logo{width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#22d3ee,#3b82f6 46%,#a3e112);box-shadow:0 0 24px rgba(59,130,246,.24);flex:none}"
   +".vbd-title{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#f4f8ff}"
   +".vbd-sub{font:10px/1.4 ui-monospace,Menlo,Consolas,monospace;color:#7186a8;letter-spacing:.05em}"
   +".vbd-target{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-left:auto}"
   +".vbd-chip{font:10px/1 ui-monospace,Menlo,Consolas,monospace;color:#9fb1d0;background:rgba(148,163,184,.08);border:1px solid rgba(148,163,184,.12);border-radius:999px;padding:5px 9px;white-space:nowrap}"
   +".vbd-chip.accent{color:#bfdbfe;border-color:rgba(59,130,246,.25);background:rgba(59,130,246,.1)}"
   +".vbd-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}"
   +".vbd-btn{border:1px solid rgba(148,163,184,.14);border-radius:9px;padding:6px 12px;font-size:11.5px;font-weight:700;color:#dbe7ff;background:rgba(148,163,184,.07);cursor:pointer;transition:transform .16s,background .16s,border-color .16s}"
   +".vbd-btn:hover{border-color:rgba(96,165,250,.35);background:rgba(59,130,246,.12);transform:translateY(-1px)}"
   +".vbd-btn:disabled{opacity:.42;cursor:not-allowed;transform:none}"
   +".vbd-btn.primary{background:linear-gradient(180deg,#3b82f6,#2563eb);border-color:rgba(147,197,253,.35);color:#fff;box-shadow:0 10px 24px rgba(37,99,235,.2)}"
   +".vbd-btn.danger{color:#fecaca;background:rgba(248,81,73,.1);border-color:rgba(248,81,73,.25)}"
   +".vbd-btn.ghost{background:transparent}"
   +".vbd-body{flex:1;display:flex;min-height:0;position:relative}"
   +".vbd-left{width:44%;min-width:280px;display:flex;flex-direction:column;min-height:0;background:linear-gradient(180deg,rgba(9,14,23,.72),rgba(6,9,15,.94));border-right:1px solid rgba(148,163,184,.1)}"
   +".vbd-pane-top{display:flex;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(148,163,184,.09);background:rgba(9,14,23,.68);flex-wrap:wrap}"
   +".vbd-label{font:10px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.16em;text-transform:uppercase;color:#7286a7;font-weight:700}"
   +".vbd-spacer{flex:1}"
   +".vbd-mini{border:1px solid rgba(148,163,184,.14);border-radius:7px;padding:3px 9px;font-size:10.5px;font-weight:700;color:#b9c8e8;background:rgba(148,163,184,.07);cursor:pointer}"
   +".vbd-mini:hover{border-color:rgba(96,165,250,.35);background:rgba(59,130,246,.12)}"
   +".vbd-code{flex:1;min-width:0;margin:0;border:none;background:#070c14;color:#e8f0ff;font:12px/20px ui-monospace,Menlo,Consolas,monospace;padding:13px 14px;resize:none;outline:none;white-space:pre;overflow:auto;tab-size:2}"
   +".vbd-code::placeholder{color:#4f6280}"
   +".vbd-pane-foot{padding:8px 12px;border-top:1px solid rgba(148,163,184,.08);font:10px/1.5 ui-monospace,Menlo,Consolas,monospace;color:#5f7392;background:rgba(7,11,18,.72)}"
   +".vbd-right{flex:1;min-width:300px;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:12px;background:radial-gradient(90% 60% at 100% 0%,rgba(34,211,238,.05),transparent 45%)}"
   +".vbd-card{border:1px solid rgba(148,163,184,.12);border-radius:14px;background:linear-gradient(180deg,rgba(15,21,32,.78),rgba(9,13,21,.88));box-shadow:0 14px 34px rgba(1,4,9,.2);overflow:hidden;animation:vbdIn .22s cubic-bezier(.3,.7,.3,1)}"
   +"@keyframes vbdIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}"
   +".vbd-card-head{display:flex;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(148,163,184,.08);background:rgba(148,163,184,.04)}"
   +".vbd-card-title{font:10px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:#93a8c9;font-weight:800}"
   +".vbd-card-note{margin-left:auto;font:10px/1 ui-monospace,Menlo,Consolas,monospace;color:#66799a}"
   +".vbd-card-body{padding:12px}"
   +".vbd-empty{color:#93a4c2;font-size:12.5px;margin-bottom:10px}"
   +".vbd-steps{display:flex;flex-direction:column;gap:6px}"
   +".vbd-step{display:flex;gap:9px;align-items:center;color:#8ba0c1;font-size:12px}"
   +".vbd-step .n{width:20px;height:20px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.2);color:#bfdbfe;font:10px/1 ui-monospace,Menlo,Consolas,monospace}"
   +".vbd-warn{border-left:2px solid #f59e0b;background:rgba(245,158,11,.08);color:#fcd34d;border-radius:8px;padding:8px 10px;font-size:11.5px;margin-bottom:6px}"
   +".vbd-op{display:flex;gap:10px;align-items:center;padding:9px 10px;border:1px solid rgba(148,163,184,.08);border-radius:11px;background:rgba(7,11,19,.5);margin-bottom:7px}"
   +".vbd-op:last-child{margin-bottom:0}"
   +".vbd-op .k{flex:none;font:8.5px/1 ui-monospace,Menlo,Consolas,monospace;font-weight:800;letter-spacing:.08em;border-radius:5px;padding:4px 6px}"
   +".vbd-op .k.FILE{background:rgba(63,185,80,.14);color:#4ade80}"
   +".vbd-op .k.EDIT{background:rgba(210,153,34,.14);color:#fbbf24}"
   +".vbd-op .k.DELETE{background:rgba(248,81,73,.14);color:#fb7185}"
   +".vbd-op .p{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:11.5px/1.4 ui-monospace,Menlo,Consolas,monospace;color:#93c5fd}"
   +".vbd-op .d{flex:none;font:10px/1 ui-monospace,Menlo,Consolas,monospace;color:#6f82a3}"
   +".vbd-op .v{flex:none;font:9px/1 ui-monospace,Menlo,Consolas,monospace;font-weight:800;letter-spacing:.06em;border-radius:999px;padding:5px 8px;border:1px solid transparent}"
   +".vbd-op .v.ok,.vbd-badge.ok{background:rgba(63,185,80,.12);color:#4ade80;border-color:rgba(63,185,80,.22)}"
   +".vbd-op .v.miss,.vbd-badge.miss{background:rgba(248,81,73,.12);color:#fb7185;border-color:rgba(248,81,73,.24)}"
   +".vbd-op .v.wait,.vbd-badge.wait{background:rgba(148,163,184,.08);color:#94a3b8;border-color:rgba(148,163,184,.12)}"
   +".vbd-badge{flex:none;font:9px/1 ui-monospace,Menlo,Consolas,monospace;font-weight:800;border-radius:999px;padding:5px 8px}"
   +".vbd-check{display:flex;gap:8px;align-items:center;padding:7px 9px;border:1px solid rgba(148,163,184,.08);border-radius:9px;background:rgba(7,11,19,.45);margin-bottom:6px;font-size:12px;color:#9db0cf}"
   +".vbd-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}"
   +".vbd-row:last-child{margin-bottom:0}"
   +".vbd-input{flex:1;min-width:120px;margin:0;background:#080d16;color:#e8f0ff;border:1px solid rgba(148,163,184,.14);border-radius:9px;padding:8px 10px;font:12px/1.4 ui-monospace,Menlo,Consolas,monospace;outline:none}"
   +".vbd-input:focus{border-color:rgba(59,130,246,.45);box-shadow:0 0 0 3px rgba(59,130,246,.12)}"
   +".vbd-log{max-height:190px;overflow:auto;display:flex;flex-direction:column;gap:5px;font:11px/1.55 ui-monospace,Menlo,Consolas,monospace}"
   +".vbd-logline{color:#8497b6;border-left:2px solid rgba(148,163,184,.16);padding-left:8px;white-space:pre-wrap;word-break:break-word}"
   +".vbd-logline.good{color:#86efac;border-left-color:rgba(63,185,80,.45)}"
   +".vbd-logline.bad{color:#fca5a5;border-left-color:rgba(248,81,73,.45)}"
   +".vbd-logline.warn{color:#fcd34d;border-left-color:rgba(245,158,11,.45)}"
   +".vbd-logline.info{color:#93c5fd;border-left-color:rgba(59,130,246,.45)}"
   +".vbd-foot{display:flex;gap:12px;align-items:center;padding:9px 14px;border-top:1px solid rgba(148,163,184,.12);background:rgba(5,8,14,.95);font:11px/1.4 ui-monospace,Menlo,Consolas,monospace;color:#7d90b0}"
   +".vbd-status{display:flex;align-items:center;gap:8px;min-width:0;color:#a8bad8}"
   +".vbd-status::before{content:'';width:7px;height:7px;border-radius:50%;background:#64748b;box-shadow:0 0 10px rgba(100,116,139,.55);flex:none}"
   +".vbd-status.ok{color:#86efac}"
   +".vbd-status.ok::before{background:#22c55e;box-shadow:0 0 10px rgba(34,197,94,.5)}"
   +".vbd-status.bad{color:#fca5a5}"
   +".vbd-status.bad::before{background:#ef4444;box-shadow:0 0 10px rgba(239,68,68,.5)}"
   +".vbd-status.warn{color:#fcd34d}"
   +".vbd-status.warn::before{background:#f59e0b;box-shadow:0 0 10px rgba(245,158,11,.5)}"
   +".vbd-status.info{color:#93c5fd}"
   +".vbd-status.info::before{background:#3b82f6;box-shadow:0 0 10px rgba(59,130,246,.5)}"
   +".vbd-foot-right{margin-left:auto;color:#66799a;white-space:nowrap}"
   +"@media(max-width:960px){.vbd-body{flex-direction:column}.vbd-left{width:auto;min-width:0;height:42%;border-right:none;border-bottom:1px solid rgba(148,163,184,.1)}.vbd-right{min-width:0}}";
  document.head.appendChild(st);
 }
 var panel=null,ta=null,rightEl=null,statusEl=null,repoChip=null,branchChip=null,ops=[],parseTimer=null,missCount=0,pending=0;
 function isOn(){return document.body.classList.contains("vbdeveloper")}
 function setStatus(msg,kind){
  if(!statusEl)return;
  statusEl.className="vbd-status "+(kind||"");
  statusEl.textContent=msg;
 }
 function updateFootMeta(extra){
  var el=document.getElementById("vbd-footmeta");
  if(!el)return;
  var t=ops.length?ops.length+" ops":"no ops";
  if(missCount)t+=" · "+missCount+" blockers";
  else if(ops.length)t+=" · clean";
  if(extra)t+=" · "+extra;
  el.textContent=t;
 }
 function log(msg,kind){
  var box=document.getElementById("vbd-log");
  if(!box)return;
  var d=new Date();
  var ts=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+":"+String(d.getSeconds()).padStart(2,"0");
  var line=E("div","vbd-logline "+(kind||""),"["+ts+"] "+msg);
  box.appendChild(line);
  box.scrollTop=box.scrollHeight;
 }
 function updateTarget(){
  var rp=repoParts();
  if(repoChip)repoChip.textContent="repo · "+(rp?rp.join("/"):"not connected");
  if(branchChip)branchChip.textContent="branch · "+currentBranch();
 }
 function openDev(){
  if(!panel)build();
  document.body.classList.remove("vbdev");
  document.body.classList.add("vbdeveloper");
  panel.classList.remove("hidden");
  var oldBtn=document.getElementById("devbtn");
  if(oldBtn)oldBtn.classList.add("on");
  try{localStorage.setItem("vb_developer_open","1")}catch(e){}
  updateTarget();
  if(ta)doParse(ta.value);
 }
 function closeDev(){
  document.body.classList.remove("vbdeveloper");
  if(panel)panel.classList.add("hidden");
  var oldBtn=document.getElementById("devbtn");
  if(oldBtn)oldBtn.classList.remove("on");
  try{localStorage.setItem("vb_developer_open","0")}catch(e){}
 }
 function toggleDev(force){
  var target=(typeof force==="boolean")?force:!isOn();
  if(target)openDev();
  else closeDev();
 }
 function card(title,note){
  var c=E("div","vbd-card");
  var h=E("div","vbd-card-head");
  h.appendChild(E("div","vbd-card-title",title));
  if(note)h.appendChild(E("div","vbd-card-note",note));
  var b=E("div","vbd-card-body");
  c.appendChild(h);c.appendChild(b);
  return {card:c,body:b};
 }
 function emptyState(){
  var c=card("developer workspace ready","paste a payload");
  c.body.appendChild(E("div","vbd-empty","This is the actual Developer Mode workspace. Paste a bridge payload on the left and everything needed to push appears here."));
  var steps=E("div","vbd-steps");
  ["Paste a VibeBridge payload.","Preflight checks every operation.","Push only when all rows are green."].forEach(function(s,i){
   var row=E("div","vbd-step");
   row.appendChild(E("span","n",String(i+1)));
   row.appendChild(E("span","",s));
   steps.appendChild(row);
  });
  c.body.appendChild(steps);
  return c;
 }
 function doParse(text){
  if(!rightEl)return;
  rightEl.innerHTML="";
  ops=[];missCount=0;pending=0;
  if(!text||!/===VIBEBRIDGE===|===== (FILE|EDIT|DELETE):/.test(text)){
   rightEl.appendChild(emptyState().card);
   setStatus("waiting for payload","info");
   updateFootMeta();
   return;
  }
  var parse=window.parsePayload||(typeof parsePayload!=="undefined"?parsePayload:null);
  var r=parse?parse(text):null;
  if(!r||!r.ops||!r.ops.length){
   var wc=card("parse warning","blocked");
   wc.body.appendChild(E("div","vbd-warn","payload detected but no FILE / EDIT / DELETE operations were found."));
   rightEl.appendChild(wc.card);
   setStatus("no operations parsed","warn");
   updateFootMeta();
   return;
  }
  ops=r.ops;
  var files=ops.filter(function(o){return o.kind==="FILE"}).length;
  var edits=ops.filter(function(o){return o.kind==="EDIT"}).length;
  var dels=ops.filter(function(o){return o.kind==="DELETE"}).length;
  var sum=card("payload summary",ops.length+" operations");
  sum.body.appendChild(E("div","vbd-empty",files+" FILE · "+edits+" EDIT · "+dels+" DELETE"));
  rightEl.appendChild(sum.card);
  var warns=(r.warnings||[]).concat(r.warning?[r.warning]:[]);
  if(warns.length){
   var wcard=card("parser warnings",warns.length+" issue(s)");
   warns.forEach(function(x){wcard.body.appendChild(E("div","vbd-warn",String(x)))});
   rightEl.appendChild(wcard.card);
  }
  var list=card("operations","live preflight");
  var rows=[];
  ops.forEach(function(op){
   var det=op.kind==="FILE"?op.content.split("\n").length+" lines":op.kind==="EDIT"?(op.hunks||[]).length+" hunks":"remove";
   var row=E("div","vbd-op");
   row.appendChild(E("span","k "+op.kind,op.kind));
   row.appendChild(E("span","p",op.path));
   row.appendChild(E("span","d",det));
   var pill=E("span","v wait","…");
   row.appendChild(pill);
   list.body.appendChild(row);
   rows.push({op:op,pill:pill});
  });
  rightEl.appendChild(list.card);
  if(window.checklistFor){
   try{
    var items=checklistFor(ops);
    if(items&&items.length){
     var ck=card("feature checklist","protected files");
     items.forEach(function(it){
      var row=E("div","vbd-check");
      row.appendChild(E("span","vbd-badge "+(it.ok?"ok":"miss"),it.ok?"present":"missing"));
      row.appendChild(E("span","",it.name+" · "+it.path));
      ck.body.appendChild(row);
     });
     rightEl.appendChild(ck.card);
    }
   }catch(e){}
  }
  var cm=card("commit target","preflight required");
  var row1=E("div","vbd-row");
  var msg=document.createElement("input");msg.id="vbd-msg";msg.className="vbd-input";msg.value="feat: developer push ("+ops.length+" ops)";
  var br=document.createElement("input");br.id="vbd-branch";br.className="vbd-input";br.value=branch();br.style.maxWidth="130px";
  br.onchange=updateTarget;
  row1.appendChild(msg);row1.appendChild(br);
  cm.body.appendChild(row1);
  var row2=E("div","vbd-row");
  var push=E("button","vbd-btn primary","Push to GitHub");push.id="vbd-push";push.disabled=true;push.onclick=doPush;
  var rev=E("button","vbd-btn danger","Revert last");rev.onclick=doRevert;
  var open=E("button","vbd-btn ghost","Open repo");
  open.onclick=function(){var rp=repoParts();if(rp)window.open("https://github.com/"+rp[0]+"/"+rp[1],"_blank");else say("no repo connected")};
  row2.appendChild(push);row2.appendChild(rev);row2.appendChild(open);
  cm.body.appendChild(row2);
  rightEl.appendChild(cm.card);
  var act=card("activity","live");
  var logBox=E("div","vbd-log");logBox.id="vbd-log";
  act.body.appendChild(logBox);
  rightEl.appendChild(act.card);
  log("parsed "+ops.length+" operation(s)","info");
  setStatus("running preflight…","info");
  updateTarget();
  startPreflight(rows);
 }
 function startPreflight(rows){
  pending=rows.length;
  missCount=0;
  updateFootMeta("preflight running");
  if(!pending){setStatus("parsed","info");return}
  var push=document.getElementById("vbd-push");
  if(push)push.disabled=true;
  rows.forEach(function(r){
   preflightOp(r.op,r.pill,function(ok){
    if(!ok)missCount++;
    pending--;
    updateFootMeta();
    if(pending===0){
     var p=document.getElementById("vbd-push");
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
  if(!window.api||!rp){pill.textContent="no conn";pill.className="v wait";done(true);return}
  var url="/repos/"+rp[0]+"/"+rp[1]+"/contents/"+op.path+"?ref="+br;
  try{
   if(op.kind==="FILE"){pill.textContent="ready";pill.className="v ok";done(true);return}
   if(op.kind==="DELETE"){
    await window.api("GET",url);
    pill.textContent="target exists";
    pill.className="v ok";
    done(true);
    return;
   }
   var meta=await window.api("GET",url);
   var content=b64text(meta.content);
   var ae=window.applyEdit||(typeof applyEdit!=="undefined"?applyEdit:null);
   if(!ae){pill.textContent="no applyEdit";pill.className="v miss";done(false);return}
   for(var hi=0;hi<(op.hunks||[]).length;hi++){
    var h=op.hunks[hi];
    var next=ae(content,h.find,h.replace);
    if(next==null){pill.textContent="hunk "+(hi+1)+" miss";pill.className="v miss";done(false);return}
    content=next;
   }
   pill.textContent=(op.hunks||[]).length+" hunks ready";
   pill.className="v ok";
   done(true);
  }catch(e){
   if(e&&e.code===404){
    if(op.kind==="DELETE"){pill.textContent="already absent";pill.className="v wait";done(true)}
    else{pill.textContent="file missing";pill.className="v miss";done(false)}
   }else{
    pill.textContent="error";
    pill.className="v miss";
    done(false);
   }
  }
 }
 async function doPush(){
  if(!ops.length){say("nothing parsed to push");return}
  var missEls=document.querySelectorAll("#vbdeveloper .v.miss");
  if(missEls.length){
   say(missEls.length+" preflight blocker(s) — fix before push");
   setStatus("push blocked by preflight","bad");
   log("push blocked: "+missEls.length+" preflight issue(s)","bad");
   return;
  }
  var commit=window.commitOps||(typeof commitOps!=="undefined"?commitOps:null);
  if(!commit){say("commitOps missing");return}
  var rp=repoParts();
  var msg=(document.getElementById("vbd-msg")||{}).value||"feat: developer push";
  var br=(document.getElementById("vbd-branch")||{}).value||branch();
  var push=document.getElementById("vbd-push");
  if(push){push.disabled=true;push.textContent="Pushing…"}
  setStatus("preparing commit…","info");
  log("pushing "+ops.length+" ops to "+(rp?rp.join("/"):"repo")+" @ "+br,"info");
  if(br!==branch()){
   var pat=(document.getElementById("pat")||{}).value||"";
   if(!pat){try{pat=JSON.parse(localStorage.getItem("vb")||"{}").p||""}catch(e){}}
   if(pat&&rp&&window.setConn)window.setConn(pat,rp[0]+"/"+rp[1],br);
  }
  try{
   var c=await commit(ops,msg);
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
 function clearPayload(){
  if(ta){ta.value="";doParse("")}
  updateFootMeta();
 }
 function build(){
  panel=E("div");panel.id="vbdeveloper";panel.className="hidden";
  var head=E("div","vbd-head");
  var id=E("div","vbd-id");
  id.innerHTML="<span class='vbd-logo'></span><div><div class='vbd-title'>Developer Mode</div><div class='vbd-sub'>workspace · payload · preflight · push</div></div>";
  head.appendChild(id);
  var target=E("div","vbd-target");
  repoChip=E("span","vbd-chip","repo · none");
  branchChip=E("span","vbd-chip","branch · main");
  var safeChip=E("span","vbd-chip accent","safe preflight");
  target.appendChild(repoChip);target.appendChild(branchChip);target.appendChild(safeChip);
  head.appendChild(target);
  var actions=E("div","vbd-actions");
  var parseBtn=E("button","vbd-btn","Parse");parseBtn.onclick=function(){if(ta)doParse(ta.value)};
  var clearBtn=E("button","vbd-btn ghost","Clear");clearBtn.onclick=clearPayload;
  var closeBtn=E("button","vbd-btn","Exit");closeBtn.onclick=closeDev;
  actions.appendChild(parseBtn);actions.appendChild(clearBtn);actions.appendChild(closeBtn);
  head.appendChild(actions);
  panel.appendChild(head);
  var body=E("div","vbd-body");
  var left=E("div","vbd-left");
  var leftTop=E("div","vbd-pane-top");
  leftTop.innerHTML="<span class='vbd-label'>payload editor</span><span class='vbd-spacer'></span>";
  var copyBtn=E("button","vbd-mini","Copy");
  copyBtn.onclick=function(){if(ta)navigator.clipboard.writeText(ta.value)};
  var clearMini=E("button","vbd-mini","Clear");
  clearMini.onclick=clearPayload;
  leftTop.appendChild(copyBtn);leftTop.appendChild(clearMini);
  left.appendChild(leftTop);
  ta=document.createElement("textarea");
  ta.className="vbd-code";
  ta.id="vbd-payload";
  ta.placeholder="Paste a VibeBridge payload here.\nFILE / EDIT / DELETE blocks parse live.\nCtrl+Enter pushes.";
  ta.oninput=function(){clearTimeout(parseTimer);parseTimer=setTimeout(function(){doParse(ta.value)},350)};
  ta.addEventListener("keydown",function(e){if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();doPush()}});
  left.appendChild(ta);
  left.appendChild(E("div","vbd-pane-foot","exact FIND first · whitespace-normalized fuzzy fallback · push aborts on any miss"));
  rightEl=E("div","vbd-right");
  rightEl.id="vbd-right";
  body.appendChild(left);body.appendChild(rightEl);
  panel.appendChild(body);
  var foot=E("div","vbd-foot");
  foot.innerHTML="<span id='vbd-status' class='vbd-status'>developer workspace ready</span><span class='vbd-foot-right' id='vbd-footmeta'>no payload</span>";
  panel.appendChild(foot);
  statusEl=document.getElementById("vbd-status");
  document.body.appendChild(panel);
 }
 function existingDevMenu(){
  var bar=document.getElementById("vbmenubar");
  if(!bar)return null;
  var btns=bar.querySelectorAll(".vmenubtn,.vbdevbtn");
  for(var i=0;i<btns.length;i++){
   if(/developer/i.test(btns[i].textContent||"")){
    var w=btns[i].closest(".vwrap,.vbdevwrap");
    var m=w?w.querySelector(".menu,.vbdevmenu"):null;
    return {btn:btns[i],wrap:w,menu:m};
   }
  }
  return null;
 }
 function patchMenus(){
  var dev=existingDevMenu();
  if(!dev)return false;
  if(dev.btn&&!dev.btn.dataset.vbdPatched){
   dev.btn.dataset.vbdPatched="1";
   dev.btn.onclick=function(e){
    e.stopPropagation();
    if(dev.menu)dev.menu.classList.toggle("hidden");
    else toggleDev();
   };
  }
  if(dev.menu&&!dev.menu.querySelector("#vbd-menu-entry")){
   var b=E("button","","Open Developer Workspace");
   b.id="vbd-menu-entry";
   b.onclick=function(e){e.stopPropagation();dev.menu.classList.add("hidden");openDev()};
   dev.menu.appendChild(b);
  }
  if(dev.menu){
   var btns=dev.menu.querySelectorAll("button");
   Array.prototype.forEach.call(btns,function(x){
    if(/developer (chat|workbench|mode)/i.test(x.textContent||"")&&!x.dataset.vbdPatched){
     x.dataset.vbdPatched="1";
     x.onclick=function(e){e.stopPropagation();dev.menu.classList.add("hidden");toggleDev()};
    }
   });
  }
  return true;
 }
 function addTopMenu(){
  var bar=document.getElementById("vbmenubar");
  if(!bar||document.getElementById("vbdev-topmenu"))return false;
  if(existingDevMenu())return false;
  var w=E("span","vwrap");w.id="vbdev-topmenu";
  var b=E("button","vmenubtn","Developer");
  var m=E("div","menu hidden");
  function item(label,fn){
   var mi=E("button","",label);
   mi.onclick=function(e){e.stopPropagation();m.classList.add("hidden");fn()};
   m.appendChild(mi);
  }
  item("Developer mode",function(){toggleDev()});
  item("Open workspace",openDev);
  item("Close workspace",closeDev);
  item("Clear payload",clearPayload);
  item("Open repo",function(){var rp=repoParts();if(rp)window.open("https://github.com/"+rp[0]+"/"+rp[1],"_blank");else say("no repo connected")});
  b.onclick=function(e){e.stopPropagation();m.classList.toggle("hidden")};
  w.appendChild(b);w.appendChild(m);
  var right=bar.querySelector(".vb-right");
  bar.insertBefore(w,right||null);
  return true;
 }
 function patchOld(){
  var b=document.getElementById("devbtn");
  if(b&&!b.dataset.vbdPatched){
   b.dataset.vbdPatched="1";
   b.textContent="Developer";
   b.title="Developer workspace";
   b.onclick=function(){toggleDev()};
  }
  var items=document.querySelectorAll("#vbmenubar .menu button, .vbdevmenu button");
  Array.prototype.forEach.call(items,function(x){
   if(/developer (chat|workbench|mode)/i.test(x.textContent||"")&&!x.dataset.vbdPatched){
    x.dataset.vbdPatched="1";
    x.onclick=function(e){
     e.stopPropagation();
     var m=x.closest(".menu,.vbdevmenu");
     if(m)m.classList.add("hidden");
     toggleDev();
    };
   }
  });
 }
 css();
 var tries=0;
 var iv=setInterval(function(){
  tries++;
  patchOld();
  if(patchMenus()||addTopMenu()||tries>200)clearInterval(iv);
 },250);
 document.addEventListener("keydown",function(e){
  if(e.key==="Escape"&&isOn())closeDev();
 },true);
 try{
  if(localStorage.getItem("vb_developer_open")==="1")openDev();
 }catch(e){}
 window.vbDevMode={
  open:openDev,
  close:closeDev,
  toggle:toggleDev,
  on:isOn
 };
 window.vbToggleDevChat=function(force){toggleDev(force)};
})();