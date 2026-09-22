// BACKUP FLOW v2: GitHub-style flow chart (App → Main / Backup), add-backup form,
// badge manager, payload push targets, preview list. Self-contained + idempotent.
(function(){
 if(window.__vbBackupFlow)return;
 window.__vbBackupFlow=true;
 function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
 function say(m){if(window.toast)toast(m);else console.log(m)}
 function enc(s){try{return btoa(unescape(encodeURIComponent("vb1:"+String(s))))}catch(e){return String(s)}}
 function dec(s){try{var x=decodeURIComponent(escape(atob(String(s))));return x.indexOf("vb1:")===0?x.slice(4):x}catch(e){return String(s)}}
 function validRepo(r){return /^[^\/\s]+\/[^\/\s]+$/.test(String(r||"").trim())}
 function shortName(r){if(!r)return "not connected";var p=String(r).split("/");return p.length===2?p[1]:r}
 var KEY="vb_backupflow";
 var state={repo:"",branch:"main",pat:""};
 try{var s0=JSON.parse(localStorage.getItem(KEY)||"null");if(s0)Object.assign(state,s0)}catch(e){}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
 function hasBackup(){return !!state.repo}
 function mainRepo(){
  var el=document.getElementById("repo");
  if(el&&el.value.trim())return el.value.trim();
  try{return JSON.parse(localStorage.getItem("vb")||"{}").r||""}catch(e){return ""}
 }
 function mainBranch(){
  var el=document.getElementById("branch");
  if(el&&el.value.trim())return el.value.trim();
  try{return JSON.parse(localStorage.getItem("vb")||"{}").b||"main"}catch(e){return "main"}
 }
 function mainPat(){
  var el=document.getElementById("pat");
  if(el&&el.value.trim())return el.value.trim();
  try{return JSON.parse(localStorage.getItem("vb")||"{}").p||""}catch(e){return ""}
 }
 function backupPat(){return state.pat?dec(state.pat):mainPat()}
 var modal=null,chart=null,previewBox=null,statusEl=null,form=null,fRepo=null,fBranch=null,fPat=null;
 var lastParsedOps=[];
 function css(){
  if(document.getElementById("bkflow-css"))return;
  var st=document.createElement("style");
  st.id="bkflow-css";
  st.textContent=""
   +"#connbadge{cursor:pointer;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
   +".bkf-card{max-width:820px;width:96%;max-height:92vh;overflow:auto;background:var(--card,#161b22);border:1px solid var(--line,#30363d);border-radius:16px;padding:18px}"
   +".bkf-card h3{font-size:15px;color:var(--text,#e6edf3);margin-bottom:4px}"
   +".bkf-help{font-size:11.5px;color:var(--faint,#8b949e);margin-bottom:12px}"
   +".bkf-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px}"
   +".bkf-btn{border:1px solid var(--line,#30363d);border-radius:9px;padding:7px 14px;font-size:12px;font-weight:700;color:var(--text,#e6edf3);background:rgba(148,163,184,.08);cursor:pointer}"
   +".bkf-btn:hover{border-color:var(--accent,#4493f8);background:rgba(59,130,246,.12)}"
   +".bkf-btn.primary{background:#238636;border-color:transparent;color:#fff}"
   +".bkf-btn.primary:hover{background:#2ea043}"
   +".bkf-btn.danger{background:rgba(248,81,73,.12);border-color:rgba(248,81,73,.35);color:#fca5a5}"
   +".bkf-target{font-size:11px;color:var(--faint,#8b949e);margin:-4px 0 10px}"
   +".bk-chart{position:relative;height:250px;border:1px solid rgba(148,163,184,.16);border-radius:14px;background:radial-gradient(120% 100% at 8% 0%,rgba(68,147,248,.08),transparent 42%),radial-gradient(120% 100% at 92% 100%,rgba(210,153,34,.07),transparent 44%),rgba(8,12,20,.4);overflow:hidden;margin-bottom:10px}"
   +".bk-svg{position:absolute;inset:0;width:100%;height:100%}"
   +".bk-line{fill:none;stroke:rgba(148,163,184,.4);stroke-width:2;stroke-dasharray:7 7;animation:bkdash 1.1s linear infinite}"
   +".bk-line.ok{stroke:rgba(63,185,80,.65)}"
   +"@keyframes bkdash{to{stroke-dashoffset:-28}}"
   +".bk-node{position:absolute;background:rgba(13,17,23,.94);border:1px solid rgba(148,163,184,.2);border-radius:12px;padding:10px 12px;box-shadow:0 12px 30px rgba(0,0,0,.3);width:240px}"
   +".bk-app{left:16px;top:50%;transform:translateY(-50%);width:170px;border-color:rgba(68,147,248,.4)}"
   +".bk-main{right:16px;top:16px;border-color:rgba(63,185,80,.4)}"
   +".bk-backup{right:16px;bottom:16px;border-color:rgba(210,153,34,.4)}"
   +".bk-label{font:9px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.16em;text-transform:uppercase;color:#8b949e;margin-bottom:6px}"
   +".bk-title{font-size:13px;font-weight:700;color:var(--text,#e6edf3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
   +".bk-sub{font-size:10.5px;color:#8b949e;margin-top:3px}"
   +".bk-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}"
   +".bk-mini{border:1px solid rgba(148,163,184,.25);border-radius:7px;padding:3px 9px;font-size:10.5px;font-weight:700;color:#dbe7ff;background:rgba(148,163,184,.08);cursor:pointer}"
   +".bk-mini:hover{border-color:rgba(96,165,250,.45);background:rgba(59,130,246,.14)}"
   +".bk-mini.go{color:#7ee2a8;border-color:rgba(63,185,80,.4)}"
   +".bk-status{font:11px/1.6 ui-monospace,Menlo,Consolas,monospace;color:#8b949e;white-space:pre-wrap;margin:8px 0}"
   +".bk-status.good{color:#4ade80}"
   +".bk-status.bad{color:#fb7185}"
   +".bk-ta{width:100%;min-height:110px;background:var(--code,#0d1117);color:var(--text,#e6edf3);border:1px solid var(--line,#30363d);border-radius:10px;padding:10px 12px;font:12px/1.55 ui-monospace,Menlo,Consolas,monospace;resize:vertical;outline:none}"
   +".bk-prevhead{font:10px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:#8b949e;margin:12px 0 6px}"
   +".bk-preview{border:1px solid rgba(148,163,184,.14);border-radius:12px;padding:10px;max-height:200px;overflow:auto;background:rgba(8,12,20,.5)}"
   +".bk-op{display:flex;gap:8px;align-items:center;padding:7px 9px;border:1px solid rgba(148,163,184,.1);border-radius:9px;margin-bottom:6px;cursor:pointer;background:rgba(148,163,184,.04)}"
   +".bk-op:hover{background:rgba(148,163,184,.09)}"
   +".bk-op .k{font-size:9px;font-weight:900;border-radius:5px;padding:3px 6px;flex:none}"
   +".bk-op .k.FILE{background:rgba(63,185,80,.14);color:#4ade80}"
   +".bk-op .k.EDIT{background:rgba(210,153,34,.14);color:#fbbf24}"
   +".bk-op .k.DELETE{background:rgba(248,81,73,.14);color:#fb7185}"
   +".bk-op .p{font:11.5px/1.35 ui-monospace,Menlo,Consolas,monospace;color:#93c5fd;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}"
   +".bk-op .d{font-size:10px;color:#8b949e;flex:none}"
   +".bk-opp{display:none;margin:-2px 0 8px;padding:9px 10px;border:1px solid rgba(148,163,184,.1);border-radius:9px;background:rgba(5,8,14,.65);font:11px/1.55 ui-monospace,Menlo,Consolas,monospace;color:#9fb1d0;white-space:pre-wrap;word-break:break-word}"
   +".bk-empty{font-size:12px;color:#8b949e;padding:8px}"
   +".bk-form{margin:10px 0;border:1px dashed rgba(148,163,184,.3);border-radius:12px;padding:12px}"
   +".bk-form input{width:100%;margin:4px 0;background:var(--code,#0d1117);color:var(--text,#e6edf3);border:1px solid rgba(148,163,184,.2);border-radius:8px;padding:7px 10px;font-size:12px}"
   +"@media(max-width:760px){.bk-chart{height:auto;display:flex;flex-direction:column;gap:10px;padding:12px}.bk-svg{display:none}.bk-node{position:static;transform:none;width:auto}}"
   ;
  document.head.appendChild(st);
 }
 function setStatus(msg,kind){if(statusEl){statusEl.textContent=msg;statusEl.className="bk-status "+(kind||"")}}
 function node(cls,label,title,sub){
  var n=E("div","bk-node "+cls);
  n.appendChild(E("div","bk-label",label));
  var t=E("div","bk-title");t.textContent=title;n.appendChild(t);
  var s=E("div","bk-sub");s.textContent=sub;n.appendChild(s);
  var a=E("div","bk-actions");n.appendChild(a);
  return {el:n,actions:a};
 }
 function mini(label,fn,go){var b=E("button","bk-mini"+(go?" go":""),label);b.onclick=function(e){e.stopPropagation();fn()};return b}
 function renderChart(){
  if(!chart)return;
  chart.innerHTML="";
  var NS="http://www.w3.org/2000/svg";
  var svg=document.createElementNS(NS,"svg");
  svg.setAttribute("class","bk-svg");
  svg.setAttribute("viewBox","0 0 600 250");
  svg.setAttribute("preserveAspectRatio","none");
  var p1=document.createElementNS(NS,"path");
  p1.setAttribute("d","M190 125 C 270 125 270 62 350 62");
  p1.setAttribute("class","bk-line ok");
  var p2=document.createElementNS(NS,"path");
  p2.setAttribute("d","M190 125 C 270 125 270 188 350 188");
  p2.setAttribute("class","bk-line"+(hasBackup()?" ok":""));
  svg.appendChild(p1);svg.appendChild(p2);
  chart.appendChild(svg);
  var app=node("bk-app","App","VibeBridge",lastParsedOps.length?lastParsedOps.length+" ops ready":"no payload yet");
  app.actions.appendChild(mini("Flow targets",function(){say("main: "+(mainRepo()||"none")+" · backup: "+(state.repo||"none"))}));
  chart.appendChild(app.el);
  var mn=node("bk-main","Main",shortName(mainRepo()),"branch "+mainBranch());
  mn.actions.appendChild(mini("Push main",function(){pushMain(lastParsedOps,mn.actions)},true));
  mn.actions.appendChild(mini("Open",function(){if(mainRepo())window.open("https://github.com/"+mainRepo(),"_blank");else say("not connected")}));
  chart.appendChild(mn.el);
  var bk=node("bk-backup","Backup",hasBackup()?shortName(state.repo):"No backup repo",hasBackup()?("branch "+(state.branch||"main")):"click add backup to set a target");
  if(hasBackup()){
   bk.actions.appendChild(mini("Push backup",function(){pushBackup(lastParsedOps,bk.actions)},true));
   bk.actions.appendChild(mini("Backup → Main",function(){backupThenMain(lastParsedOps,null)}));
   bk.actions.appendChild(mini("Open",function(){window.open("https://github.com/"+state.repo,"_blank")}));
   bk.actions.appendChild(mini("Edit",function(){showForm(true)}));
  }else{
   bk.actions.appendChild(mini("Add backup",function(){showForm(false)},true));
  }
  chart.appendChild(bk.el);
 }
 function renderPreview(){
  if(!previewBox)return;
  previewBox.innerHTML="";
  if(!lastParsedOps.length){previewBox.appendChild(E("div","bk-empty","No payload parsed yet. Paste one above or use the composer payload button."));return}
  lastParsedOps.forEach(function(op){
   var row=E("div","bk-op");
   row.appendChild(E("span","k "+op.kind,op.kind));
   var p=E("span","p");p.textContent=op.path;row.appendChild(p);
   var det=op.kind==="FILE"?String(op.content||"").split("\n").length+" lines":op.kind==="EDIT"?((op.hunks||[]).length+" hunks"):"remove";
   row.appendChild(E("span","d",det));
   var prev=E("div","bk-opp");
   var lines=[];
   var pf=window.previewFor||(typeof previewFor!=="undefined"?previewFor:null);
   if(pf){try{lines=pf(op)}catch(e){}}
   if(!lines.length){
    if(op.kind==="FILE")lines=String(op.content||"").split("\n").slice(0,8);
    else if(op.kind==="EDIT"&&op.hunks&&op.hunks[0])lines=["FIND:",String(op.hunks[0].find||"").slice(0,300),"REPLACE:",String(op.hunks[0].replace||"").slice(0,300)];
    else lines=["delete "+op.path];
   }
   prev.textContent=lines.join("\n");
   row.onclick=function(){prev.style.display=prev.style.display==="block"?"none":"block"};
   previewBox.appendChild(row);
   previewBox.appendChild(prev);
  });
 }
 function buildModal(){
  var m=E("div","modal hidden");
  var card=E("div","bkf-card");
  card.appendChild(E("h3","","Backup & Preview"));
  card.appendChild(E("div","bkf-help","Parse a payload, see the flow, push to backup first, test backup CI, then push to main. If backup fails, copy the error and fix before touching main."));
  var row=E("div","bkf-row");
  var ta=null;
  var bUse=E("button","bkf-btn","Use composer payload");
  var bParse=E("button","bkf-btn","Parse / Preview");
  var bBack=E("button","bkf-btn primary","Push to backup");
  var bMain=E("button","bkf-btn primary","Push to main");
  var bErr=E("button","bkf-btn danger","Copy backup error");
  var bAdd=E("button","bkf-btn","Add / edit backup");
  var bClose=E("button","bkf-btn","Close");
  row.appendChild(bUse);row.appendChild(bParse);row.appendChild(bBack);row.appendChild(bMain);row.appendChild(bErr);row.appendChild(bAdd);row.appendChild(bClose);
  card.appendChild(row);
  var tgt=E("div","bkf-target");tgt.id="bkf-target";
  card.appendChild(tgt);
  chart=E("div","bk-chart");
  card.appendChild(chart);
  ta=document.createElement("textarea");
  ta.className="bk-ta";
  ta.placeholder="Paste a bridge payload here, or use composer payload.";
  card.appendChild(ta);
  statusEl=E("div","bk-status");statusEl.textContent="idle";
  card.appendChild(statusEl);
  card.appendChild(E("div","bk-prevhead","Payload preview"));
  previewBox=E("div","bk-preview");
  card.appendChild(previewBox);
  form=E("div","bk-form");form.style.display="none";
  fRepo=document.createElement("input");fRepo.placeholder="backup owner/repo";
  fBranch=document.createElement("input");fBranch.placeholder="branch (main)";
  fPat=document.createElement("input");fPat.type="password";fPat.placeholder="backup PAT (optional — blank uses main PAT)";
  var fSave=E("button","bkf-btn primary","Save backup");
  var fCancel=E("button","bkf-btn","Cancel");
  var fRemove=E("button","bkf-btn danger","Remove backup");
  form.appendChild(fRepo);form.appendChild(fBranch);form.appendChild(fPat);
  var fRow=E("div","bkf-row");fRow.style.marginBottom="0";
  fRow.appendChild(fSave);fRow.appendChild(fCancel);fRow.appendChild(fRemove);
  form.appendChild(fRow);
  card.appendChild(form);
  m.appendChild(card);
  document.body.appendChild(m);
  m._ta=ta;
  bUse.onclick=function(){var i=document.getElementById("input");if(i&&i.value.trim()){ta.value=i.value;parseDev()}else say("composer is empty")};
  bParse.onclick=parseDev;
  bBack.onclick=function(){pushBackup(lastParsedOps,null)};
  bMain.onclick=function(){pushMain(lastParsedOps,null)};
  bErr.onclick=function(){navigator.clipboard.writeText(window.vbBackupLastError||"");say("backup error copied")};
  bAdd.onclick=function(){showForm(hasBackup())};
  bClose.onclick=function(){m.classList.add("hidden")};
  fSave.onclick=saveForm;
  fCancel.onclick=function(){form.style.display="none"};
  fRemove.onclick=removeBackup;
  return m;
 }
 function showForm(edit){
  if(!modal)modal=buildModal();
  if(edit){fRepo.value=state.repo||"";fBranch.value=state.branch||"main";fPat.value="";fPat.placeholder="leave blank to keep current backup PAT"}
  else{fRepo.value="";fBranch.value="main";fPat.value="";fPat.placeholder="backup PAT (optional — blank uses main PAT)"}
  form.style.display="";
  modal.classList.remove("hidden");
 }
 function saveForm(){
  var repo=fRepo.value.trim(),branch=fBranch.value.trim()||"main";
  if(!validRepo(repo)){say("backup owner/repo is invalid");return}
  state.repo=repo;state.branch=branch;
  if(fPat.value.trim())state.pat=enc(fPat.value.trim());
  save();
  form.style.display="none";
  renderChart();refreshBadge();syncTarget();
  say("backup target saved: "+repo);
 }
 function removeBackup(){
  state={repo:"",branch:"main",pat:""};
  save();
  form.style.display="none";
  renderChart();refreshBadge();syncTarget();
  say("backup target removed");
 }
 function syncTarget(){
  var t=document.getElementById("bkf-target");
  if(t)t.textContent="Main: "+(mainRepo()||"not connected")+" @ "+mainBranch()+" · Backup: "+(state.repo?(state.repo+" @ "+(state.branch||"main")):"not set");
 }
 function parseDev(){
  var ta=modal?modal._ta:null;
  if(!ta)return;
  var text=ta.value||"";
  if(!text.trim()){setStatus("paste a payload first","bad");return}
  var parse=window.parsePayload||(typeof parsePayload!=="undefined"?parsePayload:null);
  var r=parse?parse(text):{ops:[]};
  lastParsedOps=r.ops||[];
  renderPreview();renderChart();syncTarget();
  setStatus(lastParsedOps.length?("parsed "+lastParsedOps.length+" operation(s) — ready for backup or main"):"payload seen but no ops parsed","good");
 }
 async function pushTarget(repo,branch,pat,ops,message){
  var sc=window.setConn||(typeof setConn!=="undefined"?setConn:null);
  var commit=window.commitOps||(typeof commitOps!=="undefined"?commitOps:null);
  if(!sc||!commit)throw new Error("VibeBridge engine missing");
  if(!repo)throw new Error("no target repo");
  if(!pat)throw new Error("no PAT available for target");
  var mR=mainRepo(),mB=mainBranch(),mP=mainPat();
  sc(pat,repo,branch||"main");
  try{return await commit(ops,message)}
  finally{
   if(mR&&mP)sc(mP,mR,mB);
   var ri=document.getElementById("repo");if(ri&&mR)ri.value=mR;
   var bi=document.getElementById("branch");if(bi&&mB)bi.value=mB;
   refreshBadge();
  }
 }
 async function testBackup(onStatus){
  var saw=false;
  for(var i=0;i<8;i++){
   await new Promise(function(r){setTimeout(r,8000)});
   var run=null;
   try{
    run=await (function(){
     var lr=window.latestRun||(typeof latestRun!=="undefined"?latestRun:null);
     return lr?lr():Promise.resolve(null);
    })();
   }catch(e){}
   if(run){
    saw=true;
    onStatus("backup CI "+run.status+(run.conclusion?" / "+run.conclusion:""));
    if(run.status==="completed"){
     if(run.conclusion==="success")return true;
     var log="";
     try{
      var rl=window.runLog||(typeof runLog!=="undefined"?runLog:null);
      if(rl)log=await rl(run.id);
     }catch(e){}
     var errs=[];
     try{
      var ex=window.extractErrors||(typeof extractErrors!=="undefined"?extractErrors:null);
      if(ex)errs=ex(log);
     }catch(e){}
     window.vbBackupLastError=(errs&&errs.length?errs.join("\n"):String(log||"").slice(-5000));
     return false;
    }
   }else if(!saw&&i>=2){
    onStatus("no CI found on backup — assuming ok");
    return true;
   }
  }
  onStatus("backup CI timeout");
  return false;
 }
 async function pushBackup(ops,actionsEl){
  if(!hasBackup()){showForm(false);return}
  if(!ops||!ops.length){setStatus("parse a payload first","bad");return}
  setStatus("pushing "+ops.length+" ops to backup "+state.repo+" @ "+(state.branch||"main")+"…");
  try{
   var c=await pushTarget(state.repo,state.branch||"main",backupPat(),ops,"backup: web push ("+ops.length+" ops)");
   var sha=String(c.sha||"").slice(0,7);
   if(window.addNoteBubble)addNoteBubble("backup commit "+sha+" → "+state.repo,false);
   setStatus("backup push ok · "+sha+" · testing CI…","good");
   var ok=await testBackup(setStatus);
   if(ok){setStatus("backup ok · "+sha+" — safe to push main","good");window.vbLastBackupOk=true}
   else{setStatus("backup CI failed — copy the error, fix, retry before main","bad")}
  }catch(e){
   window.vbBackupLastError=String(e.message||e);
   setStatus("backup failed: "+e.message,"bad");
   say("backup failed");
  }
 }
 function recordPush(sha,opsCount,ok,msg){
  try{
   var arr=JSON.parse(localStorage.getItem("vb_pushes")||"[]");
   arr.push({sha:sha,ts:Date.now(),ops:opsCount,ok:ok,message:msg});
   localStorage.setItem("vb_pushes",JSON.stringify(arr.slice(-50)));
   if(window.renderPushLog)renderPushLog();
   if(window.updateKeyStats)updateKeyStats();
  }catch(e){}
 }
 async function pushMain(ops,actionsEl){
  if(!ops||!ops.length){setStatus("parse a payload first","bad");return}
  if(hasBackup()&&!window.vbLastBackupOk){
   if(!confirm("Backup-first not verified this session. Push main anyway?"))return;
  }
  setStatus("pushing main "+mainRepo()+" @ "+mainBranch()+"…");
  try{
   var c=await pushTarget(mainRepo(),mainBranch(),mainPat(),ops,"feat: main push ("+ops.length+" ops)");
   recordPush(c.sha,ops.length,true,"main push");
   setStatus("main pushed "+String(c.sha||"").slice(0,7),"good");
   if(window.addNoteBubble)addNoteBubble("main push complete "+String(c.sha||"").slice(0,7),false);
  }catch(e){
   recordPush("",ops.length,false,"main push failed");
   setStatus("main push failed: "+e.message,"bad");
  }
 }
 async function backupThenMain(ops,mainBtn){
  if(!hasBackup()){showForm(false);return}
  if(!ops||!ops.length){setStatus("parse a payload first","bad");return}
  setStatus("backup-first flow started…");
  try{
   var c=await pushTarget(state.repo,state.branch||"main",backupPat(),ops,"backup: web push ("+ops.length+" ops)");
   window.vbLastBackupOk=true;
   if(window.addNoteBubble)addNoteBubble("backup ok "+String(c.sha||"").slice(0,7)+" — pushing main",false);
   setStatus("backup ok — pushing main…","good");
   if(mainBtn&&!mainBtn.disabled)mainBtn.click();
   else pushMain(ops,null);
  }catch(e){
   window.vbBackupLastError=String(e.message||e);
   setStatus("backup-first failed: "+e.message+" — main untouched","bad");
   if(window.addNoteBubble)addNoteBubble("backup failed — main untouched",true);
  }
 }
 function addCardFlow(body,r){
  lastParsedOps=(r&&r.ops)||[];
  var btns=body?body.querySelector(".cardbtns"):null;
  if(!btns||btns.dataset.bkf)return;
  btns.dataset.bkf="1";
  var mainBtn=btns.querySelector(".green");
  if(mainBtn){mainBtn.textContent="Push main";mainBtn.classList.add("bkf-main")}
  var flow=E("button","mini","Flow");
  flow.onclick=function(){open()};
  btns.appendChild(flow);
  if(hasBackup()){
   var bb=E("button","mini amber","Push backup");
   bb.onclick=function(){pushBackup(lastParsedOps,null)};
   var bm=E("button","mini","Backup → Main");
   bm.onclick=function(){backupThenMain(lastParsedOps,mainBtn)};
   if(mainBtn)btns.insertBefore(bb,mainBtn);else btns.appendChild(bb);
   btns.appendChild(bm);
  }else{
   var ab=E("button","mini","Add backup");
   ab.onclick=function(){showForm(false)};
   btns.appendChild(ab);
  }
  if(modal&&!modal.classList.contains("hidden")){renderChart();renderPreview();syncTarget()}
 }
 window.vbBackupFlowCard=function(body,r){
  try{addCardFlow(body,r);refreshBadge()}catch(e){}
 };
 function hookAddParseCard(){
  if(window.__bkParseHooked)return;
  var orig=window.addParseCard;
  if(!orig)return;
  window.__bkParseHooked=true;
  window.addParseCard=function(r){
   orig(r);
   try{
    var all=document.querySelectorAll("#flow .abody");
    var body=all[all.length-1];
    if(body&&window.vbBackupFlowCard)window.vbBackupFlowCard(body,r);
   }catch(e){}
  };
 }
 function refreshBadge(){
  var badge=document.getElementById("connbadge");
  if(!badge)return;
  var mr=mainRepo();
  if(badge.classList.contains("on")&&mr){
   var txt=shortName(mr);
   if(hasBackup())txt+=" ⇄ "+shortName(state.repo);
   badge.textContent=txt;
   badge.title="Main: "+mr+(hasBackup()?"\nBackup: "+state.repo:"")+"\nClick for backup flow";
  }
 }
 function open(){
  if(!modal)modal=buildModal();
  renderChart();renderPreview();syncTarget();
  modal.classList.remove("hidden");
 }
 css();
 document.addEventListener("click",function(e){
  if(e.target&&e.target.id==="connbadge")open();
 },true);
 var tries=0;
 var iv=setInterval(function(){
  tries++;
  hookAddParseCard();
  refreshBadge();
  if(tries>240)clearInterval(iv);
 },300);
 window.vbBackupFlow={open:open,addBackup:function(){showForm(false)},state:function(){return state}};
})();