// MULTI-REPO v1: multiple PAT/project profiles, secure-ish local storage, taskbar project chip,
// backup-first push, backup CI test, preview/backup developer panel.
(function(){
 if(window.__vbMultiRepo)return;
 window.__vbMultiRepo=true;
 function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
 function say(m){if(window.toast)toast(m);else console.log(m)}
 function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
 function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
 function enc(s){try{return btoa(unescape(encodeURIComponent("vb1:"+String(s))))}catch(e){return String(s)}}
 function dec(s){try{var x=decodeURIComponent(escape(atob(String(s))));return x.indexOf("vb1:")===0?x.slice(4):x}catch(e){return String(s)}}
 function maskPat(p){p=String(p||"");if(p.length<=10)return "********";return p.slice(0,6)+"…"+p.slice(-4)}
 function validRepo(r){return /^[^\/\s]+\/[^\/\s]+$/.test(String(r||"").trim())}
 var KEY="vb_projects";
 var state={projects:[],active:""};
 function load(){
  try{
   var s=JSON.parse(localStorage.getItem(KEY)||"null");
   if(s&&s.projects){state.projects=s.projects;state.active=s.active||""}
  }catch(e){state={projects:[],active:""}}
 }
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
 function byId(id){for(var i=0;i<state.projects.length;i++)if(state.projects[i].id===id)return state.projects[i];return null}
 function activeProject(){
  var p=byId(state.active);
  if(!p&&state.projects.length)p=state.projects[0];
  if(!p)return null;
  return Object.assign({},p,{pat:dec(p.pat)});
 }
 function setConnProject(p){
  if(p&&window.setConn)window.setConn(p.pat,p.repo,p.branch||"main");
 }
 function refreshConnUI(){
  var p=activeProject();
  if(p){
   setConnProject(p);
   var repoInp=document.getElementById("repo");if(repoInp)repoInp.value=p.repo;
   var brInp=document.getElementById("branch");if(brInp)brInp.value=p.branch||"main";
   var badge=document.getElementById("connbadge");
   if(badge){badge.className="badge on";badge.textContent=p.repo}
   var st=document.getElementById("connstatus");
   if(st){st.textContent="project connected";st.className="dim small good"}
  }
  updateChip();
 }
 function migrate(){
  if(!state.projects.length){
   var vb=null;
   try{vb=JSON.parse(localStorage.getItem("vb")||"null")}catch(e){}
   if(vb&&vb.p&&vb.r){
    var id=uid();
    state.projects.push({id:id,name:"Default project",pat:enc(vb.p),repo:vb.r,branch:vb.b||"main",backupRepo:"",backupBranch:"",backupEnabled:false,testBackup:false,previewEnabled:false,createdAt:Date.now()});
    state.active=id;
    save();
   }
  }
  if(!byId(state.active)&&state.projects.length)state.active=state.projects[0].id;
  save();
 }
 function css(){
  if(document.getElementById("mrepo-css"))return;
  var st=document.createElement("style");
  st.id="mrepo-css";
  st.textContent=""
   +"#mrepo-chip{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;font-weight:800;color:#3fb950;background:rgba(63,185,80,.12);border:1px solid rgba(63,185,80,.35);border-radius:999px;padding:3px 10px;cursor:pointer;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
   +"#mrepo-chip:hover{background:rgba(63,185,80,.18)}"
   +".mrepo-menu{position:fixed;z-index:1100;min-width:260px;max-width:340px;background:var(--card,#161b22);border:1px solid var(--line,#30363d);border-radius:12px;padding:6px;box-shadow:0 18px 50px rgba(0,0,0,.45);animation:fadeIn .12s ease-out}"
   +".mrepo-menu .mh{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint,#6e7681);padding:6px 8px}"
   +".mrepo-menu button{display:block;width:100%;text-align:left;padding:7px 9px;border-radius:8px;font-size:12.5px;color:var(--text,#e6edf3)}"
   +".mrepo-menu button:hover{background:rgba(128,128,128,.14)}"
   +".mrepo-menu .sep{height:1px;background:var(--line,#30363d);margin:5px 4px}"
   +".mrepo-modal{max-width:760px;width:96%;max-height:88vh;overflow:auto;background:var(--card,#161b22);border:1px solid var(--line,#30363d);border-radius:14px;padding:18px}"
   +".mrepo-modal h3{font-size:14px;margin-bottom:6px;color:var(--text,#e6edf3)}"
   +".mrepo-help{font-size:11px;color:var(--faint,#6e7681);margin-bottom:12px}"
   +".mrepo-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}"
   +".mrepo-grid input{width:100%;margin:0}"
   +".mrepo-check{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--dim,#8b949e);margin:8px 0}"
   +".mrepo-check input{width:auto;margin:0}"
   +".mrepo-btnrow{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}"
   +".mrepo-btn{border:1px solid var(--line,#30363d);border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;color:var(--text,#e6edf3);background:rgba(128,128,128,.08);cursor:pointer}"
   +".mrepo-btn:hover{border-color:var(--accent,#4493f8)}"
   +".mrepo-btn.primary{background:#238636;border-color:transparent;color:#fff}"
   +".mrepo-btn.danger{background:rgba(248,81,73,.12);color:#f85149;border-color:rgba(248,81,73,.28)}"
   +".mrepo-list{margin-top:14px;display:flex;flex-direction:column;gap:10px}"
   +".mrepo-card{border:1px solid var(--line,#30363d);border-radius:12px;padding:12px;background:rgba(128,128,128,.05)}"
   +".mrepo-card.active{border-color:rgba(63,185,80,.45);box-shadow:0 0 0 1px rgba(63,185,80,.18)}"
   +".mrepo-card .top{display:flex;gap:10px;align-items:center;flex-wrap:wrap}"
   +".mrepo-card .name{font-weight:800;color:var(--text,#e6edf3)}"
   +".mrepo-card .meta{font-size:11px;color:var(--dim,#8b949e);margin-top:6px;line-height:1.5}"
   +".mrepo-card .rowbtns{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}"
   +".mrepo-mini{border:1px solid var(--line,#30363d);border-radius:7px;padding:4px 9px;font-size:11px;font-weight:700;color:var(--dim,#8b949e);background:transparent;cursor:pointer}"
   +".mrepo-mini:hover{color:var(--text,#e6edf3);border-color:var(--accent,#4493f8)}"
   +".mrepo-mini.on{color:#3fb950;border-color:rgba(63,185,80,.35)}"
   +".mrepo-ops{display:flex;flex-direction:column;gap:6px;margin:8px 0}"
   +".mrepo-op{display:flex;gap:8px;align-items:center;padding:7px 9px;border:1px solid var(--line,#30363d);border-radius:9px;background:rgba(128,128,128,.05);font-size:12px}"
   +".mrepo-op .k{font-size:9px;font-weight:900;border-radius:5px;padding:3px 6px}"
   +".mrepo-op .k.FILE{background:rgba(63,185,80,.14);color:#4ade80}"
   +".mrepo-op .k.EDIT{background:rgba(210,153,34,.14);color:#fbbf24}"
   +".mrepo-op .k.DELETE{background:rgba(248,81,73,.14);color:#fb7185}"
   +".mrepo-op .p{font-family:ui-monospace,Menlo,Consolas,monospace;color:var(--accent,#4493f8);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}"
   +".mrepo-op .d{font-size:10px;color:var(--faint,#6e7681)}"
   +".mrepo-status{font:11px/1.6 ui-monospace,Menlo,Consolas,monospace;color:var(--dim,#8b949e);white-space:pre-wrap;margin-top:8px}"
   +".mrepo-status.good{color:#4ade80}"
   +".mrepo-status.bad{color:#fb7185}"
   +"@media(max-width:860px){.mrepo-grid{grid-template-columns:1fr}}";
  document.head.appendChild(st);
 }
 var manageModal=null,devModal=null,chipMenu=null;
 var nameInp=null,patInp=null,repoInp=null,branchInp=null,backupRepoInp=null,backupBranchInp=null,backupEnabledChk=null,testBackupChk=null,previewChk=null,editingId=null;
 function buildManageModal(){
  var m=E("div","modal hidden");
  var card=E("div","mrepo-modal");
  card.appendChild(E("h3","","Projects / Multi-repo"));
  card.appendChild(E("div","mrepo-help","Add multiple PAT/repo projects. Active project is used for normal pushes. Backup repo receives payload first when backup-first is enabled. PAT is stored locally and masked in the UI."));
  var grid=E("div","mrepo-grid");
  nameInp=E("input","");nameInp.placeholder="project name";
  patInp=E("input","");patInp.type="password";patInp.placeholder="github PAT";
  repoInp=E("input","");repoInp.placeholder="owner/repo";
  branchInp=E("input","");branchInp.placeholder="branch (main)";branchInp.value="main";
  backupRepoInp=E("input","");backupRepoInp.placeholder="backup owner/repo (optional)";
  backupBranchInp=E("input","");backupBranchInp.placeholder="backup branch (same as main if blank)";
  grid.appendChild(nameInp);grid.appendChild(patInp);grid.appendChild(repoInp);grid.appendChild(branchInp);grid.appendChild(backupRepoInp);grid.appendChild(backupBranchInp);
  card.appendChild(grid);
  var c1=E("label","mrepo-check");backupEnabledChk=document.createElement("input");backupEnabledChk.type="checkbox";c1.appendChild(backupEnabledChk);c1.appendChild(document.createTextNode("backup-first push (push to backup before main)"));
  var c2=E("label","mrepo-check");testBackupChk=document.createElement("input");testBackupChk.type="checkbox";c2.appendChild(testBackupChk);c2.appendChild(document.createTextNode("test backup CI before main push"));
  var c3=E("label","mrepo-check");previewChk=document.createElement("input");previewChk.type="checkbox";c3.appendChild(previewChk);c3.appendChild(document.createTextNode("show backup/preview panel in developer options"));
  card.appendChild(c1);card.appendChild(c2);card.appendChild(c3);
  var btns=E("div","mrepo-btnrow");
  var saveBtn=E("button","mrepo-btn primary","Save project");
  saveBtn.onclick=saveProjectForm;
  var clearBtn=E("button","mrepo-btn","Clear form");
  clearBtn.onclick=clearForm;
  var closeBtn=E("button","mrepo-btn","Close");
  closeBtn.onclick=function(){m.classList.add("hidden")};
  btns.appendChild(saveBtn);btns.appendChild(clearBtn);btns.appendChild(closeBtn);
  card.appendChild(btns);
  var list=E("div","mrepo-list");list.id="mrepo-list";
  card.appendChild(list);
  m.appendChild(card);
  document.body.appendChild(m);
  return m;
 }
 function clearForm(){
  editingId=null;
  nameInp.value="";patInp.value="";patInp.placeholder="github PAT";repoInp.value="";branchInp.value="main";backupRepoInp.value="";backupBranchInp.value="";
  backupEnabledChk.checked=false;testBackupChk.checked=false;previewChk.checked=false;
 }
 function saveProjectForm(){
  var data={
   name:nameInp.value.trim(),
   pat:patInp.value.trim(),
   repo:repoInp.value.trim(),
   branch:branchInp.value.trim()||"main",
   backupRepo:backupRepoInp.value.trim(),
   backupBranch:backupBranchInp.value.trim(),
   backupEnabled:backupEnabledChk.checked,
   testBackup:testBackupChk.checked,
   previewEnabled:previewChk.checked
  };
  if(!validRepo(data.repo)){say("owner/repo is required");return}
  if(data.backupRepo&&!validRepo(data.backupRepo)){say("backup owner/repo is invalid");return}
  if(editingId){
   var p=byId(editingId);
   if(!p)return;
   p.name=data.name||data.repo;
   p.repo=data.repo;
   p.branch=data.branch;
   p.backupRepo=data.backupRepo;
   p.backupBranch=data.backupBranch;
   p.backupEnabled=data.backupEnabled;
   p.testBackup=data.testBackup;
   p.previewEnabled=data.previewEnabled;
   if(data.pat)p.pat=enc(data.pat);
   save();refreshConnUI();renderProjectList();clearForm();say("project updated");
   return;
  }
  if(!data.pat){say("PAT is required for a new project");return}
  var id=uid();
  state.projects.push({id:id,name:data.name||data.repo,pat:enc(data.pat),repo:data.repo,branch:data.branch,backupRepo:data.backupRepo,backupBranch:data.backupBranch,backupEnabled:data.backupEnabled,testBackup:data.testBackup,previewEnabled:data.previewEnabled,createdAt:Date.now()});
  if(!state.active)state.active=id;
  save();refreshConnUI();renderProjectList();clearForm();say("project added");
 }
 function editProject(id){
  var p=byId(id);if(!p)return;
  editingId=id;
  nameInp.value=p.name||p.repo;
  patInp.value="";
  patInp.placeholder="leave blank to keep current PAT";
  repoInp.value=p.repo;
  branchInp.value=p.branch||"main";
  backupRepoInp.value=p.backupRepo||"";
  backupBranchInp.value=p.backupBranch||"";
  backupEnabledChk.checked=!!p.backupEnabled;
  testBackupChk.checked=!!p.testBackup;
  previewChk.checked=!!p.previewEnabled;
  if(manageModal)manageModal.classList.remove("hidden");
 }
 function renderProjectList(){
  var box=document.getElementById("mrepo-list");if(!box)return;
  box.innerHTML="";
  if(!state.projects.length){box.appendChild(E("div","mrepo-help","No projects yet. Add one above."));return}
  state.projects.forEach(function(p){
   var decPat=dec(p.pat);
   var card=E("div","mrepo-card"+(p.id===state.active?" active":""));
   var top=E("div","top");
   top.appendChild(E("span","name",p.name||p.repo));
   var act=E("button","mrepo-mini"+(p.id===state.active?" on":""),p.id===state.active?"Active":"Activate");
   act.onclick=function(){state.active=p.id;save();refreshConnUI();renderProjectList();say("project activated: "+p.repo)};
   top.appendChild(act);
   card.appendChild(top);
   var meta=E("div","meta","repo: "+p.repo+"<br>branch: "+(p.branch||"main")+"<br>PAT: "+maskPat(decPat)+(p.backupRepo?("<br>backup: "+p.backupRepo+(p.backupBranch?" @ "+p.backupBranch:"")):"<br>backup: not set"));
   card.appendChild(meta);
   var toggles=E("div","rowbtns");
   var b1=E("button","mrepo-mini"+(p.backupEnabled?" on":""),"backup-first");
   b1.onclick=function(){p.backupEnabled=!p.backupEnabled;save();renderProjectList()};
   var b2=E("button","mrepo-mini"+(p.testBackup?" on":""),"test backup CI");
   b2.onclick=function(){p.testBackup=!p.testBackup;save();renderProjectList()};
   var b3=E("button","mrepo-mini","Copy PAT");
   b3.onclick=function(){navigator.clipboard.writeText(decPat);say("PAT copied")};
   var b4=E("button","mrepo-mini","Edit");
   b4.onclick=function(){editProject(p.id)};
   var b5=E("button","mrepo-mini danger","Delete");
   b5.onclick=function(){if(!confirm("Delete project "+(p.name||p.repo)+"?"))return;state.projects=state.projects.filter(function(x){return x.id!==p.id});if(state.active===p.id)state.active=state.projects.length?state.projects[0].id:"";save();refreshConnUI();renderProjectList()};
   toggles.appendChild(b1);toggles.appendChild(b2);toggles.appendChild(b3);toggles.appendChild(b4);toggles.appendChild(b5);
   card.appendChild(toggles);
   box.appendChild(card);
  });
 }
 function openManage(){
  if(!manageModal)manageModal=buildManageModal();
  renderProjectList();
  manageModal.classList.remove("hidden");
 }
 function closeChipMenu(){if(chipMenu){chipMenu.remove();chipMenu=null}}
 function openChipMenu(anchor){
  closeChipMenu();
  var p=activeProject();
  chipMenu=E("div","mrepo-menu");
  chipMenu.onclick=function(e){e.stopPropagation()};
  chipMenu.appendChild(E("div","mh",p?("Active: "+(p.name||p.repo)):"No active project"));
  function item(label,fn){
   var b=E("button","",label);
   b.onclick=function(){closeChipMenu();fn()};
   chipMenu.appendChild(b);
  }
  item("Manage projects",openManage);
  item("Backup & Preview panel",openDevPanel);
  if(p){
   item("Copy PAT ("+maskPat(p.pat)+")",function(){navigator.clipboard.writeText(p.pat);say("PAT copied")});
   item("Copy repo",function(){navigator.clipboard.writeText(p.repo);say("repo copied")});
   item("Open repo",function(){window.open("https://github.com/"+p.repo,"_blank")});
   if(p.backupRepo)item("Open backup repo",function(){window.open("https://github.com/"+p.backupRepo,"_blank")});
  }
  if(state.projects.length>1){
   chipMenu.appendChild(E("div","sep"));
   chipMenu.appendChild(E("div","mh","Switch project"));
   state.projects.forEach(function(x){
    item((x.id===state.active?"✓ ":"")+(x.name||x.repo),function(){state.active=x.id;save();refreshConnUI();renderProjectList();say("project activated")});
   });
  }
  document.body.appendChild(chipMenu);
  var r=anchor.getBoundingClientRect();
  chipMenu.style.top=Math.min(innerHeight-chipMenu.offsetHeight-10,r.bottom+8)+"px";
  chipMenu.style.right=Math.max(8,innerWidth-r.right)+"px";
  chipMenu.style.left="auto";
 }
 function updateChip(){
  var right=document.querySelector("#vbmenubar .vb-right");
  if(!right)return;
  var chip=document.getElementById("mrepo-chip");
  var p=activeProject();
  if(!p){if(chip)chip.remove();return}
  if(!chip){
   chip=E("button","");chip.id="mrepo-chip";
   chip.onclick=function(e){e.stopPropagation();openChipMenu(chip)};
   right.insertBefore(chip,right.firstChild);
  }
  chip.title="Active project: "+(p.name||p.repo)+"\nClick for PAT copy / switch / backup";
  chip.textContent="✓ "+p.repo;
 }
 function buildDevPanel(){
  var m=E("div","modal hidden");
  var card=E("div","mrepo-modal");
  card.appendChild(E("h3","","Backup & Preview"));
  card.appendChild(E("div","mrepo-help","Parse a payload, preview operations, push to backup first, test backup CI, then push to main. If backup fails, copy the error and fix before main push."));
  var row=E("div","mrepo-btnrow");
  var useComposer=E("button","mrepo-btn","Use composer payload");
  useComposer.onclick=function(){var i=document.getElementById("input");if(i&&i.value.trim())devTa.value=i.value;parseDevPayload()};
  var parseBtn=E("button","mrepo-btn","Parse / Preview");
  parseBtn.onclick=parseDevPayload;
  var backupBtn=E("button","mrepo-btn primary","Push to backup");
  backupBtn.onclick=pushBackupFromPanel;
  var mainBtn=E("button","mrepo-btn primary","Push to main");
  mainBtn.onclick=pushMainFromPanel;
  var copyErr=E("button","mrepo-btn danger","Copy backup error");
  copyErr.onclick=function(){navigator.clipboard.writeText(window.vbBackupLastError||"");say("backup error copied")};
  var closeBtn=E("button","mrepo-btn","Close");
  closeBtn.onclick=function(){m.classList.add("hidden")};
  row.appendChild(useComposer);row.appendChild(parseBtn);row.appendChild(backupBtn);row.appendChild(mainBtn);row.appendChild(copyErr);row.appendChild(closeBtn);
  card.appendChild(row);
  var target=E("div","mrepo-help");target.id="mrepo-dev-target";
  card.appendChild(target);
  var ta=document.createElement("textarea");
  ta.className="mrepo-status";
  ta.style.height="110px";
  ta.placeholder="Paste a bridge payload here, or use composer payload.";
  card.appendChild(ta);
  var ops=E("div","mrepo-ops");ops.id="mrepo-dev-ops";
  card.appendChild(ops);
  var status=E("div","mrepo-status");status.id="mrepo-dev-status";status.textContent="idle";
  card.appendChild(status);
  m.appendChild(card);
  document.body.appendChild(m);
  m._ta=ta;
  return m;
 }
 function openDevPanel(){
  if(!devModal)devModal=buildDevPanel();
  var p=activeProject();
  var target=document.getElementById("mrepo-dev-target");
  if(target){
   target.textContent=p?("Main: "+p.repo+" @ "+(p.branch||"main")+" · Backup: "+(p.backupRepo?(p.backupRepo+(p.backupBranch?" @ "+p.backupBranch:"")):"not set")):"No active project";
  }
  var i=document.getElementById("input");
  if(i&&i.value&&/===VIBEBRIDGE===/.test(i.value)&&devModal._ta&&!devModal._ta.value.trim())devModal._ta.value=i.value;
  devModal.classList.remove("hidden");
 }
 function setDevStatus(msg,kind){
  var s=document.getElementById("mrepo-dev-status");
  if(s){s.textContent=msg;s.className="mrepo-status "+(kind||"")}
 }
 function parseDevPayload(){
  var ta=devModal?devModal._ta:null;
  if(!ta)return [];
  var text=ta.value||"";
  var list=document.getElementById("mrepo-dev-ops");
  if(list)list.innerHTML="";
  if(!text.trim()){setDevStatus("paste a payload first","bad");return []}
  var parse=window.parsePayload||(typeof parsePayload!=="undefined"?parsePayload:null);
  var r=parse?parse(text):{ops:[]};
  var ops=r.ops||[];
  if(!ops.length){setDevStatus("payload detected but no ops parsed","bad");return []}
  ops.forEach(function(op){
   var row=E("div","mrepo-op");
   row.appendChild(E("span","k "+op.kind,op.kind));
   row.appendChild(E("span","p",op.path));
   var det=op.kind==="FILE"?String(op.content||"").split("\n").length+" lines":op.kind==="EDIT"?((op.hunks||[]).length+" hunks"):"remove";
   row.appendChild(E("span","d",det));
   list.appendChild(row);
  });
  setDevStatus("parsed "+ops.length+" operation(s)","good");
  return ops;
 }
 function currentDevOps(){
  var ta=devModal?devModal._ta:null;
  if(!ta)return [];
  return parseDevPayload();
 }
 function targetFor(proj,useBackup){
  if(!proj)return null;
  if(useBackup){
   if(!proj.backupRepo)return null;
   return {pat:proj.pat,repo:proj.backupRepo,branch:proj.backupBranch||proj.branch||"main",label:"backup"};
  }
  return {pat:proj.pat,repo:proj.repo,branch:proj.branch||"main",label:"main"};
 }
 async function withTarget(target,fn){
  var active=activeProject();
  if(target&&window.setConn)window.setConn(target.pat,target.repo,target.branch||"main");
  try{return await fn()}
  finally{
   if(active&&window.setConn)window.setConn(active.pat,active.repo,active.branch||"main");
  }
 }
 async function pushOpsToTarget(ops,target,message){
  var commit=window.commitOps||(typeof commitOps!=="undefined"?commitOps:null);
  if(!commit)throw new Error("commitOps missing");
  return withTarget(target,function(){return commit(ops,message)});
 }
 async function testTarget(target,onStatus){
  var saw=false;
  for(var i=0;i<8;i++){
   await sleep(8000);
   var run=null;
   try{
    run=await withTarget(target,function(){
     var lr=window.latestRun||(typeof latestRun!=="undefined"?latestRun:null);
     return lr?lr():null;
    });
   }catch(e){}
   if(run){
    saw=true;
    onStatus("backup CI "+run.status+(run.conclusion?" / "+run.conclusion:""));
    if(run.status==="completed"){
     if(run.conclusion==="success")return true;
     var log="";
     try{
      log=await withTarget(target,function(){
       var rl=window.runLog||(typeof runLog!=="undefined"?runLog:null);
       return rl?rl(run.id):"";
      });
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
 async function backupPushOps(ops,onStatus,testOverride){
  var proj=activeProject();
  if(!proj)throw new Error("no active project");
  var target=targetFor(proj,true);
  if(!target)throw new Error("set a backup repo first");
  onStatus("pushing "+ops.length+" ops to backup "+target.repo+" @ "+target.branch+"…");
  var commit=await pushOpsToTarget(ops,target,"backup: "+ops.length+" ops via VibeBridge");
  onStatus("backup commit "+String(commit.sha||"").slice(0,7));
  var shouldTest=(typeof testOverride==="boolean")?testOverride:!!proj.testBackup;
  if(shouldTest){
   onStatus("testing backup CI…");
   var ok=await testTarget(target,onStatus);
   if(!ok)throw new Error("backup CI failed — copy backup error");
   onStatus("backup CI ok");
  }
  return commit;
 }
 async function pushBackupFromPanel(){
  var ops=currentDevOps();
  if(!ops.length)return;
  try{
   await backupPushOps(ops,setDevStatus,true);
   setDevStatus("backup push ok — you can now push main","good");
  }catch(e){
   setDevStatus("backup failed: "+e.message,"bad");
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
 async function pushMainFromPanel(){
  var proj=activeProject();
  if(!proj){say("no active project");return}
  var ops=currentDevOps();
  if(!ops.length)return;
  if(proj.backupEnabled&&!window.vbLastBackupOk){
   if(!confirm("Backup-first is enabled but no backup success was recorded this session. Push main anyway?"))return;
  }
  var target=targetFor(proj,false);
  setDevStatus("pushing main "+target.repo+" @ "+target.branch+"…");
  try{
   var commit=await pushOpsToTarget(ops,target,"feat: multi-repo main push ("+ops.length+" ops)");
   recordPush(commit.sha,ops.length,true,"multi-repo main push");
   setDevStatus("main pushed "+String(commit.sha||"").slice(0,7),"good");
   say("main push complete");
  }catch(e){
   recordPush("",ops.length,false,"multi-repo main push failed");
   setDevStatus("main push failed: "+e.message,"bad");
   say("main push failed");
  }
 }
 function hookDoPush(){
  if(window.__vbDoPushHooked||!window.doPush)return;
  window.__vbDoPushHooked=true;
  var orig=window.doPush;
  window.doPush=function(body,btn){
   var proj=activeProject();
   var ops=window.vbPendingOps;
   if(proj&&proj.backupEnabled&&proj.backupRepo&&ops&&ops.length){
    if(btn){btn.disabled=true;btn.textContent="Backup…"}
    if(window.addNoteBubble)addNoteBubble("multi-repo: pushing to backup first → "+proj.backupRepo,false);
    backupPushOps(ops,function(msg){if(window.addNoteBubble)addNoteBubble(msg,false)},true).then(function(){
     window.vbLastBackupOk=true;
     if(window.addNoteBubble)addNoteBubble("backup ok — pushing main",false);
     if(btn){btn.disabled=false;btn.textContent="Push to GitHub"}
     return orig.call(window,body,btn);
    }).catch(function(e){
     if(btn){btn.disabled=false;btn.textContent="Push to GitHub"}
     if(window.addNoteBubble)addNoteBubble("backup failed: "+e.message,true);
     say("backup failed — main push blocked");
    });
    return;
   }
   return orig.call(window,body,btn);
  };
 }
 function ensureSidebar(){
  var sb=document.getElementById("sb");
  if(!sb||document.getElementById("mrepo-side"))return;
  var b=E("button","sidebtn","Projects / Backup");
  b.id="mrepo-side";
  b.onclick=openManage;
  var foot=sb.querySelector(".sbfoot");
  sb.insertBefore(b,foot||null);
 }
 function addDeveloperMenu(){
  var bar=document.getElementById("vbmenubar");
  if(!bar)return false;
  var wraps=bar.querySelectorAll(".vwrap");
  for(var i=0;i<wraps.length;i++){
   var label=wraps[i].querySelector(".vmenubtn,.vbdevbtn");
   if(label&&/developer/i.test(label.textContent||"")){
    var menu=wraps[i].querySelector(".menu,.vbdevmenu");
    if(menu&&!menu.querySelector("#mrepo-dev-entry")){
     var b1=E("button","","Backup & Preview");
     b1.id="mrepo-dev-entry";
     b1.onclick=function(e){e.stopPropagation();menu.classList.add("hidden");openDevPanel()};
     var b2=E("button","","Projects / Multi-repo");
     b2.onclick=function(e){e.stopPropagation();menu.classList.add("hidden");openManage()};
     menu.appendChild(b1);
     menu.appendChild(b2);
    }
    return true;
   }
  }
  if(document.getElementById("mrepo-devmenu"))return true;
  var w=E("span","vwrap");w.id="mrepo-devmenu";
  var b=E("button","vmenubtn","Developer");
  var m=E("div","menu hidden");
  function item(label,fn){
   var mi=E("button","",label);
   mi.onclick=function(e){e.stopPropagation();m.classList.add("hidden");fn()};
   m.appendChild(mi);
  }
  item("Backup & Preview",openDevPanel);
  item("Projects / Multi-repo",openManage);
  item("Developer workbench",function(){var d=document.getElementById("devbtn");if(d)d.click()});
  b.onclick=function(e){e.stopPropagation();m.classList.toggle("hidden")};
  w.appendChild(b);w.appendChild(m);
  var right=bar.querySelector(".vb-right");
  bar.insertBefore(w,right||null);
  return true;
 }
 document.addEventListener("click",function(){closeChipMenu()});
 css();
 load();
 migrate();
 refreshConnUI();
 var tries=0;
 var iv=setInterval(function(){
  tries++;
  hookDoPush();
  ensureSidebar();
  updateChip();
  addDeveloperMenu();
  if(tries>220)clearInterval(iv);
 },350);
 window.vbMultiRepo={open:openManage,openBackup:openDevPanel,projects:function(){return state.projects},active:activeProject};
})();