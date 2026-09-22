// BACKUP FLOW v1: GitHub-style Main/Backup flow chart, green repo badge manager,
// payload push target buttons (Main / Backup / Backup -> Main), and payload preview panel.
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
 function getMainRepo(){
  var el=document.getElementById("repo");
  if(el&&el.value.trim())return el.value.trim();
  try{return JSON.parse(localStorage.getItem("vb")||"{}").r||""}catch(e){return ""}
 }
 function getMainBranch(){
  var el=document.getElementById("branch");
  if(el&&el.value.trim())return el.value.trim();
  try{return JSON.parse(localStorage.getItem("vb")||"{}").b||"main"}catch(e){return "main"}
 }
 function getMainPat(){
  var el=document.getElementById("pat");
  if(el&&el.value.trim())return el.value.trim();
  try{return JSON.parse(localStorage.getItem("vb")||"{}").p||""}catch(e){return ""}
 }
 function getBackupPat(){return state.pat?dec(state.pat):getMainPat()}
 var modal=null,chart=null,previewBox=null,form=null,bRepo=null,bBranch=null,bPat=null,lastParsedOps=[];
 function css(){
  if(document.getElementById("bkflow-css"))return;
  var st=document.createElement("style");
  st.id="bkflow-css";
  st.textContent=""
   +"#connbadge{cursor:pointer;max-width:230px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
   +".bk-card{max-width:780px;width:96%;max-height:90vh;overflow:auto;background:var(--card,#161b22);border:1px solid var(--line,#30363d);border-radius:16px;padding:18px}"
   +".bk-card h3{font-size:15px;margin-bottom:6px;color:var(--text,#e6edf3)}"
   +".bk-help{font-size:11.5px;color:var(--faint,#8b949e);margin-bottom:12px}"
   +".bk-chart{position:relative;height:270px;border:1px solid rgba(148,163,184,.16);border-radius:14px;background:radial-gradient(120% 100% at 10% 0%,rgba(68,147,248,.08),transparent 40%),radial-gradient(120% 100% at 90% 100%,rgba(210,153,34,.07),transparent 42%),rgba(8,12,20,.35);overflow:hidden}"
   +".bk-svg{position:absolute;inset:0;width:100%;height:100%}"
   +".bk-line{fill:none;stroke:rgba(148,163,184,.42);stroke-width:2;stroke-dasharray:7 7;animation:bkdash 1.1s linear infinite}"
   +".bk-line.ok{stroke:rgba(63,185,80,.68)}"
   +"@keyframes bkdash{to{stroke-dashoffset:-28}}"
   +".bk-node{position:absolute;background:rgba(13,17,23,.92);border:1px solid rgba(148,163,184,.18);border-radius:12px;padding:10px;box-shadow:0 12px 30px rgba(0,0,0,.25);min-width:180px}"
   +".bk-app{left:18px;top:50%;transform:translateY(-50%);width:160px}"
   +".bk-main{right:18px;top:22px;width:250px;border-color:rgba(68,147,248,.35)}"
   +".bk-backup{right:18px;bottom:22px;width:250px;border-color:rgba(210,153,34,.35)}"
   +".bk-label{font:9px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:#8b949e;margin-bottom:6px}"
   +".bk-title{font-size:13px;font-weight:700;color:#e6edf3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
   +".bk-sub{font-size:10.5px;color:#8b949e;margin-top:3px}"
   +".bk-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}"
   +".bk-btn{border:1px solid rgba(148,163,184,.2);border-radius:7px;padding:4px 9px;font-size:11px;font-weight:700;color:#dbe7ff;background:rgba(148,163,184,.08);cursor:pointer}"
   +".bk-btn:hover{border-color:rgba(96,165,250,.4);background:rgba(59,130,246,.12)}"
   +".bk-btn.primary{background:rgba(35,134,54,.2);border-color:rgba(63,185,80,.35);color:#7ee2a8}"
   +".bk-btn.danger{background:rgba(248,81,73,.1);border-color:rgba(248,81,73,.3);color:#fca5a5}"
   +".bk-status{margin-top:10px;font:11px/1.55 ui-monospace,Menlo,Consolas,monospace;color:#8b949e;white-space:pre-wrap}"
   +".bk-status.good{color:#4ade80}"
   +".bk-status.bad{color:#fb7185}"
   +".bk-prevhead{margin:14px 0 6px;font:10px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:#8b949e}"
   +".bk-preview{border:1px solid rgba(148,163,184,.14);border-radius:12px;padding:10px;max-height:220px;overflow:auto;background:rgba(8,12,20,.5)}"
   +".bk-op{display:flex;gap:8px;align-items:center;padding:7px 8px;border:1px solid rgba(148,163,184,.1);border-radius:9px;margin-bottom:6px;cursor:pointer;background:rgba(148,163,184,.04)}"
   +".bk-op:hover{background:rgba(148,163,184,.09)}"
   +".bk-op .k{font-size:9px;font-weight:900;border-radius:5px;padding:3px 6px;flex:none}"
   +".bk-op .k.FILE{background:rgba(63,185,80,.14);color:#4ade80}"
   +".bk-op .k.EDIT{background:rgba(210,153,34,.14);color:#fbbf24}"
   +".bk-op .k.DELETE{background:rgba(248,81,73,.14);color:#fb7185}"
   +".bk-op .p{font:11.5px/1.35 ui-monospace,Menlo,Consolas,monospace;color:#93c5fd;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}"
   +".bk-op .d{font-size:10px;color:#8b949e;flex:none}"
   +".bk-opp{display:none;margin:-2px 0 8px;padding:9px 10px;border:1px solid rgba(148,163,184,.1);border-radius:9px;background:rgba(5,8,14,.65);font:11px/1.55 ui-monospace,Menlo,Consolas,monospace;color:#9fb1d0;white-space:pre-wrap;word-break:break-word}"
   +".bk-empty{font-size:12px;color:#8b949e;padding:8px}"
   +".bk-form{margin-top:12px;border:1px dashed rgba(148,163,184,.25);border-radius:12px;padding:12px}"
   +".bk-input{width:100%;margin:4px 0;background:#0d1117;color:#e6edf3;border:1px solid rgba(148,163,184,.18);border-radius:8px;padding:7px 9px;font-size:12px}"
   +".bk-formbtns{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}"
   +"@media(max-width:760px){.bk-chart{height:auto;display:flex;flex-direction:column;gap:10px;padding:12px}.bk-svg{display:none}.bk-node{position:static;transform:none;width:auto!important;min-width:0}.bk-app{order:0}.bk-main{order:1}.bk-backup{order:2}}";
  document.head.appendChild(st);
 }
 function openModal(){
  if(!modal)buildModal();
  renderChart();
  renderPreview();
  modal.classList.remove("hidden");
 }
 function closeModal(){if(modal)modal.classList.add("hidden")}
 function buildModal(){
  modal=E("div","modal hidden");
  var card=E("div","bk-card");
  card.appendChild(E("h3","","Backup & Preview Flow"));
  card.appendChild(E("div","bk-help","Payload flows from VibeBridge to Main or Backup. Click the green repo badge anytime. Backup push does not replace main push."));
  chart=E("div","bk-chart");
  card.appendChild(chart);
  var status=E("div","bk-status");
  status.id="bk-status";
  card.appendChild(status);
  card.appendChild(E("div","bk-prevhead","Payload preview"));
  previewBox=E("div","bk-preview");
  card.appendChild(previewBox);
  form=E("div","bk-form hidden");
  bRepo=E("input","bk-input");bRepo.placeholder="backup owner/repo";
  bBranch=E("input","bk-input");bBranch.placeholder="branch (main)";bBranch.value=state.branch||"main";
  bPat=E("input","bk-input");bPat.type="password";bPat.placeholder="backup PAT (optional — blank uses main PAT)";
  form.appendChild(bRepo);form.appendChild(bBranch);form.appendChild(bPat);
  var fBtns=E("div","bk-formbtns");
  var saveBtn=E("button","bk-btn primary","Save backup");saveBtn.onclick=saveForm;
  var cancelBtn=E("button","bk-btn","Cancel");cancelBtn.onclick=function(){form.classList.add("hidden")};
  var removeBtn=E("button","bk-btn danger","Remove backup");removeBtn.onclick=removeBackup;
  fBtns.appendChild(saveBtn);fBtns.appendChild(cancelBtn);fBtns.appendChild(removeBtn);
  form.appendChild(fBtns);
  card.appendChild(form);
  var closeBtn=E("button","bk-btn","Close");closeBtn.onclick=closeModal;closeBtn.style.marginTop="12px";
  card.appendChild(closeBtn);
  modal.appendChild(card);
  document.body.appendChild(modal);
 }
 function setStatus(msg,kind){
  var s=document.getElementById("bk-status");
  if(s){s.textContent=msg;s.className="bk-status "+(kind||"")}
 }
 function renderChart(){
  if(!chart)return;
  chart.innerHTML='<svg class="bk-svg" viewBox="0 0 600 270" preserveAspectRatio="none"><path class="bk-line ok" d="M185 135 C 260 135 260 72 345 72"></path><path class="bk-line '+(hasBackup()?"ok":"")+'" d="M185 135 C 260 135 260 198 345 198"></path></svg>';
  var app=E("div","bk-node bk-app");
  app.appendChild(E("div","bk-label","App"));
  app.appendChild(E("div","bk-title","VibeBridge"));
  var sub=E("div","bk-sub");
  sub.textContent=(lastParsedOps&&lastParsedOps.length)?lastParsedOps.length+" ops ready":"no payload yet";
  app.appendChild(sub);
  chart.appendChild(app);
  var mainRepo=getMainRepo();
  var main=E("div","bk-node bk-main");
  main.appendChild(E("div","bk-label","Main"));
  var mt=E("div","bk-title");mt.textContent=shortName(mainRepo)||"not connected";
  main.appendChild(mt);
  var ms=E("div","bk-sub");ms.textContent="branch: "+getMainBranch();
  main.appendChild(ms);
  var ma=E("div","bk-actions");
  var mp=E("button","bk-btn primary","Push main");
  mp.onclick=function(){
   var t=latestMainBtn();
   if(t&&t.btn&&!t.btn.disabled){t.btn.click();setStatus("main push started","good")}
   else say("send a payload in chat first");
  };
  var mo=E("button","bk-btn","Open");
  mo.onclick=function(){if(mainRepo)window.open("https://github.com/"+mainRepo,"_blank");else say("no main repo connected")};
  ma.appendChild(mp);ma.appendChild(mo);
  main.appendChild(ma);
  chart.appendChild(main);
  var backup=E("div","bk-node bk-backup");
  backup.appendChild(E("div","bk-label","Backup"));
  var bt=E("div","bk-title");bt.textContent=hasBackup()?shortName(state.repo):"No backup repo";
  backup.appendChild(bt);
  var bs=E("div","bk-sub");bs.textContent=hasBackup()?("branch: "+(state.branch||"main")):"add a backup target";
  backup.appendChild(bs);
  var ba=E("div","bk-actions");
  if(hasBackup()){
   var bp=E("button","bk-btn primary","Push backup");
   bp.onclick=function(){doBackupPush(bp,lastParsedOps,"chart")};
   var bm=E("button","bk-btn","Backup → Main");
   bm.onclick=function(){backupThenMain(bm,lastParsedOps)};
   var bo=E("button","bk-btn","Open");
   bo.onclick=function(){window.open("https://github.com/"+state.repo,"_blank")};
   var be=E("button","bk-btn","Edit");
   be.onclick=function(){showForm(true)};
   ba.appendChild(bp);ba.appendChild(bm);ba.appendChild(bo);ba.appendChild(be);
  }else{
   var add=E("button","bk-btn primary","Add backup");
   add.onclick=function(){showForm(false)};
   ba.appendChild(add);
  }
  backup.appendChild(ba);
  chart.appendChild(backup);
 }
 function showForm(edit){
  if(!form)return;
  if(edit){
   bRepo.value=state.repo||"";
   bBranch.value=state.branch||"main";
   bPat.value="";
   bPat.placeholder="leave blank to keep current backup PAT";
  }else{
   bRepo.value="";
   bBranch.value="main";
   bPat.value="";
   bPat.placeholder="backup PAT (optional — blank uses main PAT)";
  }
  form.classList.remove("hidden");
 }
 function saveForm(){
  var repo=bRepo.value.trim();
  var branch=bBranch.value.trim()||"main";
  if(!validRepo(repo)){say("backup owner/repo is invalid");return}
  state.repo=repo;
  state.branch=branch;
  if(bPat.value.trim())state.pat=enc(bPat.value.trim());
  save();
  form.classList.add("hidden");
  renderChart();
  refreshBadge();
  say("backup target saved");
 }
 function removeBackup(){
  state={repo:"",branch:"main",pat:""};
  save();
  form.classList.add("hidden");
  renderChart();
  refreshBadge();
  say("backup target removed");
 }
 function renderPreview(){
  if(!previewBox)return;
  previewBox.innerHTML="";
  var ops=lastParsedOps||[];
  if(!ops.length){
   previewBox.appendChild(E("div","bk-empty","No payload parsed yet. Send a payload in chat and it will appear here."));
   return;
  }
  ops.forEach(function(op){
   var row=E("div","bk-op");
   row.appendChild(E("span","k "+op.kind,op.kind));
   var p=E("span","p");p.textContent=op.path;
   row.appendChild(p);
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
 async function pushTarget(repo,branch,pat,ops,message){
  var sc=window.setConn||(typeof setConn!=="undefined"?setConn:null);
  var commit=window.commitOps||(typeof commitOps!=="undefined"?commitOps:null);
  if(!sc||!commit)throw new Error("VibeBridge engine missing");
  if(!repo)throw new Error("no target repo");
  if(!pat)throw new Error("no PAT available for target");
  var mainRepo=getMainRepo(),mainBranch=getMainBranch(),mainPat=getMainPat();
  sc(pat,repo,branch||"main");
  try{
   return await commit(ops,message);
  }finally{
   if(mainRepo&&mainPat)sc(mainPat,mainRepo,mainBranch);
   var ri=document.getElementById("repo");if(ri&&mainRepo)ri.value=mainRepo;
   var bi=document.getElementById("branch");if(bi&&mainBranch)bi.value=mainBranch;
   refreshBadge();
  }
 }
 async function doBackupPush(btn,ops,src){
  if(!hasBackup()){openModal();return}
  if(!ops||!ops.length){say("no parsed payload to push");return}
  var old=btn.textContent;
  btn.disabled=true;btn.textContent="Backup pushing…";
  setStatus("pushing "+ops.length+" ops to backup "+state.repo+"…");
  try{
   var c=await pushTarget(state.repo,state.branch||"main",getBackupPat(),ops,"backup: web push ("+ops.length+" ops)");
   var sha=String(c.sha||"").slice(0,7);
   if(window.addNoteBubble)addNoteBubble("backup commit "+sha+" → "+state.repo,false);
   setStatus("backup push ok · "+sha,"good");
   btn.textContent="Backup ✓";
  }catch(e){
   if(window.addNoteBubble)addNoteBubble("backup failed: "+e.message,true);
   setStatus("backup failed: "+e.message,"bad");
   btn.textContent="Backup failed";
  }
  setTimeout(function(){btn.disabled=false;btn.textContent=old},2500);
 }
 async function backupThenMain(btn,ops){
  if(!hasBackup()){openModal();return}
  if(!ops||!ops.length){say("no parsed payload to push");return}
  var old=btn.textContent;
  btn.disabled=true;btn.textContent="Backup first…";
  setStatus("backup-first flow started…");
  try{
   var c=await pushTarget(state.repo,state.branch||"main",getBackupPat(),ops,"backup: web push ("+ops.length+" ops)");
   var sha=String(c.sha||"").slice(0,7);
   if(window.addNoteBubble)addNoteBubble("backup ok "+sha+" — pushing main",false);
   setStatus("backup ok · "+sha+" — pushing main","good");
   btn.textContent="Backup ✓ → main";
   var t=latestMainBtn();
   if(t&&t.btn&&!t.btn.disabled)t.btn.click();
   else say("main push button not ready");
  }catch(e){
   if(window.addNoteBubble)addNoteBubble("backup-first failed: "+e.message,true);
   setStatus("backup-first failed: "+e.message,"bad");
   btn.textContent="Backup failed";
  }
  setTimeout(function(){btn.disabled=false;btn.textContent=old},2500);
 }
 function latestMainBtn(){
  var all=document.querySelectorAll("#flow .cardbtns");
  for(var i=all.length-1;i>=0;i--){
   var btns=all[i].querySelectorAll("button");
   for(var j=0;j<btns.length;j++){
    var b=btns[j];
    if(b.classList.contains("bk-mainbtn")||/push main/i.test(b.textContent||"")||/push to github/i.test(b.textContent||"")){
     return {btn:b,body:all[i].parentElement};
    }
   }
  }
  return null;
 }
 function addCardFlow(body,r){
  lastParsedOps=(r&&r.ops)||[];
  var btns=body?body.querySelector(".cardbtns"):null;
  if(!btns||btns.dataset.bkflow)return;
  btns.dataset.bkflow="1";
  var mainBtn=btns.querySelector(".green")||null;
  if(mainBtn){mainBtn.textContent="Push main";mainBtn.classList.add("bk-mainbtn")}
  var flow=E("button","mini","Flow");
  flow.onclick=openModal;
  btns.appendChild(flow);
  if(hasBackup()){
   var bb=E("button","mini amber","Push backup");
   bb.onclick=function(){doBackupPush(bb,lastParsedOps,"card")};
   var both=E("button","mini","Backup → Main");
   both.onclick=function(){backupThenMain(both,lastParsedOps)};
   if(mainBtn)btns.insertBefore(bb,mainBtn);
   else btns.appendChild(bb);
   btns.appendChild(both);
  }else{
   var ab=E("button","mini","Add backup");
   ab.onclick=openModal;
   btns.appendChild(ab);
  }
  if(modal&&!modal.classList.contains("hidden")){renderChart();renderPreview()}
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
  var main=getMainRepo();
  if(badge.classList.contains("on")&&main){
   var txt=shortName(main);
   if(hasBackup())txt+=" ⇄ "+shortName(state.repo);
   badge.textContent=txt;
   badge.title="Main: "+main+(hasBackup()?"\nBackup: "+state.repo:"")+"\nClick to open backup flow";
  }
 }
 css();
 document.addEventListener("click",function(e){
  if(e.target&&e.target.id==="connbadge")openModal();
 },true);
 var tries=0;
 var iv=setInterval(function(){
  tries++;
  hookAddParseCard();
  refreshBadge();
  if(tries>220)clearInterval(iv);
 },300);
})();