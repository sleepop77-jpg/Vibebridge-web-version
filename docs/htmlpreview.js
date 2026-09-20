// HTML PREVIEW v1: sandbox, repo file preview, payload preview. Lives under Developer options.
(function(){
 if(window.__vbHtmlPreview)return;
 window.__vbHtmlPreview=true;
 function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
 function say(m){if(window.toast)toast(m);else console.log(m)}
 var KEY="vb_htmlpreview";
 var state={sandbox:'<div style="font:16px/1.6 -apple-system,\'Segoe UI\',sans-serif;padding:24px;color:#111">\n  <h2>HTML sandbox</h2>\n  <p>Edit HTML here and preview live.</p>\n</div>',repoPath:"docs/index.html",baseUrl:""};
 try{var s0=JSON.parse(localStorage.getItem(KEY)||"null");if(s0)Object.assign(state,s0)}catch(e){}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
 function css(){
  if(document.getElementById("vbhp-css"))return;
  var st=document.createElement("style");st.id="vbhp-css";
  st.textContent="#vbhp{position:fixed;top:28px;left:0;right:0;bottom:0;z-index:997;background:var(--bg,#0d1117);display:flex;flex-direction:column}"
   +"#vbhp.hidden{display:none!important}"
   +".vbhp-top{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line,#30363d);background:var(--side,#161b22)}"
   +".vbhp-title{font-size:13px;font-weight:700;letter-spacing:.04em}"
   +".vbhp-tabs{display:flex;gap:6px;margin:0 10px}"
   +".vbhp-tab{border:1px solid var(--line,#30363d);border-radius:8px;padding:5px 10px;font-size:12px;color:var(--dim,#8b949e);background:transparent}"
   +".vbhp-tab.on{color:var(--text,#e6edf3);border-color:var(--accent,#4493f8);background:var(--bubble,rgba(128,128,128,.15))}"
   +".vbhp-spacer{flex:1}"
   +".vbhp-page{flex:1;min-height:0;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}"
   +".vbhp-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}"
   +".vbhp-input{flex:1;min-width:140px;background:var(--code,#0d1117);border:1px solid var(--line,#30363d);color:var(--text,#e6edf3);border-radius:8px;padding:7px 9px;font-size:12px}"
   +".vbhp-btn{border:1px solid var(--line,#30363d);border-radius:8px;padding:6px 11px;font-size:12px;font-weight:600;color:var(--text,#e6edf3);background:var(--card,#161b22);cursor:pointer}"
   +".vbhp-btn:hover{border-color:var(--accent,#4493f8)}"
   +".vbhp-status{font-size:11px;color:var(--faint,#6e7681)}"
   +".vbhp-split{display:flex;gap:12px;flex:1;min-height:0}"
   +".vbhp-col{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}"
   +".vbhp-code{flex:1;resize:none;background:var(--code,#0d1117);color:var(--text,#e6edf3);border:1px solid var(--line,#30363d);border-radius:10px;padding:10px 12px;font:12px/1.5 ui-monospace,Menlo,Consolas,monospace;outline:none}"
   +".vbhp-frame{flex:1;border:1px solid var(--line,#30363d);border-radius:10px;background:#fff;width:100%}"
   +".vbhp-list{max-height:160px;overflow:auto;border:1px solid var(--line,#30363d);border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:6px}"
   +".vbhp-op{display:flex;gap:8px;align-items:center;font-size:12px}"
   +".vbhp-kind{font-size:9px;font-weight:700;border-radius:4px;padding:2px 6px;flex:none}"
   +".vbhp-kind.FILE{background:rgba(63,185,80,.15);color:#3fb950}"
   +".vbhp-kind.EDIT{background:rgba(210,153,34,.15);color:#d29922}"
   +".vbhp-kind.DELETE{background:rgba(248,81,73,.15);color:#f85149}"
   +".vbhp-path{font-family:ui-monospace,Menlo,Consolas,monospace;color:var(--accent,#4493f8);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}"
   +"@media(max-width:860px){.vbhp-split{flex-direction:column}.vbhp-frame{min-height:260px}}";
  document.head.appendChild(st);
 }
 var panel=null,pages={},sandboxTa=null,sandboxFrame=null,findStat=null,repoPathInp=null,repoBaseInp=null,repoStatus=null,repoFrame=null,payloadTa=null,payloadList=null,payloadFrame=null,payloadStatus=null,currentOps=null;
 function decodeB64(s){try{return decodeURIComponent(escape(atob(String(s).replace(/\s/g,""))))}catch(e){try{return atob(String(s).replace(/\s/g,""))}catch(e2){return ""}}}
 function encPath(p){return String(p).split("/").map(function(x){return encodeURIComponent(x)}).join("/")}
 function ensureConn(){
  if(typeof PAT!=="undefined"&&PAT&&typeof OWNER!=="undefined"&&OWNER&&typeof REPO!=="undefined"&&REPO)return true;
  try{
   var s=JSON.parse(localStorage.getItem("vb")||"null");
   if(s&&s.p&&s.r&&window.setConn){window.setConn(s.p,s.r,s.b||"main");return !!(typeof PAT!=="undefined"&&PAT&&OWNER&&REPO)}
  }catch(e){}
  return false;
 }
 function pagesBase(){try{if(ensureConn())return "https://"+String(OWNER).toLowerCase()+".github.io/"+REPO+"/"}catch(e){}return ""}
 function guessBase(path){
  var base=pagesBase();if(!base)return "";
  try{
   var p=String(path||"").replace(/^docs\//,"");
   var parts=p.split("/");parts.pop();
   if(parts.length&&parts[0])base+=parts.join("/")+"/";
  }catch(e){}
  return base;
 }
 function injectBase(html,base){
  base=(base||"").trim();
  if(!base||/<base[^>]*>/i.test(html))return html;
  var tag='<base href="'+base.replace(/"/g,"&quot;")+'">';
  if(/<head[^>]*>/i.test(html))return html.replace(/<head([^>]*)>/i,function(m){return m+tag});
  return tag+"\n"+html;
 }
 function setFrame(frame,html,path){
  if(!frame)return;
  var base=path?(state.baseUrl||guessBase(path)):state.baseUrl;
  frame.srcdoc=injectBase(html,base);
 }
 async function fetchRepoFile(path){
  if(!ensureConn())throw new Error("connect to GitHub first");
  var meta=await window.api("GET","/repos/"+OWNER+"/"+REPO+"/contents/"+encPath(path)+"?ref="+(typeof BRANCH!=="undefined"&&BRANCH?BRANCH:"main"));
  return decodeB64(meta.content);
 }
 async function materializePath(path,ops){
  var content=null;
  var list=(ops||[]).filter(function(o){return o&&o.path===path});
  for(var i=0;i<list.length;i++){
   var op=list[i];
   if(op.kind==="FILE"){content=op.content}
   else if(op.kind==="EDIT"){
    if(content==null)content=await fetchRepoFile(path);
    var ae=window.applyEdit||(typeof applyEdit!=="undefined"?applyEdit:null);
    if(!ae)throw new Error("applyEdit missing");
    for(var hi=0;hi<(op.hunks||[]).length;hi++){
     var h=op.hunks[hi];
     var next=ae(content,h.find,h.replace);
     if(next==null)throw new Error("EDIT miss in "+path+" hunk "+(hi+1));
     content=next;
    }
   }
   else if(op.kind==="DELETE"){content=""}
  }
  if(content==null)content=await fetchRepoFile(path);
  return content;
 }
 function htmlOps(ops){return (ops||[]).filter(function(o){return /\.html?$/i.test(o.path||"")})}
 function renderPayloadOps(ops){
  currentOps=ops||[];
  if(!payloadList)return;
  payloadList.innerHTML="";
  var hs=htmlOps(currentOps);
  if(!hs.length){payloadStatus.textContent="no .html ops in payload";return}
  payloadStatus.textContent=hs.length+" HTML op(s) ready";
  hs.forEach(function(op){
   var row=E("div","vbhp-op");
   row.appendChild(E("span","vbhp-kind "+op.kind,op.kind));
   row.appendChild(E("span","vbhp-path",op.path));
   var b=E("button","vbhp-btn","Preview");
   b.onclick=function(){previewPath(op.path,currentOps)};
   row.appendChild(b);
   payloadList.appendChild(row);
  });
 }
 async function previewPath(path,ops){
  if(!payloadFrame)return;
  payloadStatus.textContent="building "+path+"…";
  try{
   var html=await materializePath(path,ops);
   if(!html)html='<body style="font:14px sans-serif;padding:24px">file deleted</body>';
   setFrame(payloadFrame,html,path);
   payloadStatus.textContent="previewing "+path;
  }catch(e){
   payloadStatus.textContent="failed: "+e.message;
   payloadFrame.srcdoc='<pre style="font:12px monospace;padding:16px;color:#b00">'+String(e.message).replace(/</g,"&lt;")+"</pre>";
  }
 }
 function renderSandbox(){if(sandboxFrame)setFrame(sandboxFrame,state.sandbox,"")}
 function findNext(ta,q){
  if(!ta||!q){if(findStat)findStat.textContent="type to find";return}
  var v=ta.value,low=v.toLowerCase(),needle=q.toLowerCase();
  var start=ta.selectionEnd||0;
  var idx=low.indexOf(needle,start),wrapped=false;
  if(idx<0){idx=low.indexOf(needle);wrapped=true}
  if(idx<0){if(findStat)findStat.textContent="not found";return}
  ta.focus();ta.setSelectionRange(idx,idx+q.length);
  var line=v.slice(0,idx).split("\n").length;
  try{ta.scrollTop=Math.max(0,(line-4)*18)}catch(e){}
  if(findStat)findStat.textContent=(wrapped?"wrapped · ":"")+"line "+line;
 }
 function loadRepo(){
  var p=repoPathInp.value.trim()||"docs/index.html";
  state.repoPath=p;state.baseUrl=repoBaseInp.value.trim();save();
  repoStatus.textContent="loading…";
  fetchRepoFile(p).then(function(html){setFrame(repoFrame,html,p);repoStatus.textContent="previewing "+p}).catch(function(e){repoStatus.textContent="failed: "+e.message});
 }
 async function editRepoInSandbox(){
  var p=repoPathInp.value.trim()||"docs/index.html";
  state.repoPath=p;state.baseUrl=repoBaseInp.value.trim();save();
  repoStatus.textContent="loading into sandbox…";
  try{
   var html=await fetchRepoFile(p);
   state.sandbox=html;save();
   if(sandboxTa)sandboxTa.value=html;
   openTab("sandbox");renderSandbox();
   repoStatus.textContent="loaded into sandbox";
  }catch(e){repoStatus.textContent="failed: "+e.message}
 }
 function parsePayloadTab(){
  var txt=payloadTa.value||"";
  if(!txt.trim()){payloadStatus.textContent="paste a payload first";return}
  var parse=window.parsePayload||(typeof parsePayload!=="undefined"?parsePayload:null);
  var r=parse?parse(txt):null;
  if(r&&r.ops&&r.ops.length){
   renderPayloadOps(r.ops);
   var hs=htmlOps(r.ops);
   if(hs.length)previewPath(hs[0].path,r.ops);
  }else payloadStatus.textContent="no ops parsed";
 }
 function openTab(name){
  if(!panel)build();
  panel.classList.remove("hidden");
  Object.keys(pages).forEach(function(k){pages[k].classList.toggle("hidden",k!==name)});
  var btns=panel.querySelectorAll(".vbhp-tab");
  Array.prototype.forEach.call(btns,function(b){b.classList.toggle("on",b.dataset.tab===name)});
  if(name==="sandbox")renderSandbox();
  if(name==="repo"&&repoBaseInp)repoBaseInp.placeholder=state.baseUrl||guessBase(repoPathInp.value);
 }
 function close(){if(panel)panel.classList.add("hidden")}
 function build(){
  panel=E("div","vbhp hidden");panel.id="vbhp";
  var top=E("div","vbhp-top");
  top.appendChild(E("span","vbhp-title","HTML PREVIEW"));
  var tabs=E("div","vbhp-tabs");
  var spacer=E("span","vbhp-spacer");
  var closeBtn=E("button","vbhp-btn","Close");closeBtn.onclick=close;
  top.appendChild(tabs);top.appendChild(spacer);top.appendChild(closeBtn);
  panel.appendChild(top);
  pages.sandbox=E("div","vbhp-page");
  pages.repo=E("div","vbhp-page hidden");
  pages.payload=E("div","vbhp-page hidden");
  var srow=E("div","vbhp-row");
  var findInp=E("input","vbhp-input");findInp.placeholder="Find in sandbox";findInp.style.maxWidth="220px";
  var findBtn=E("button","vbhp-btn","Find");
  findStat=E("span","vbhp-status");
  findBtn.onclick=function(){findNext(sandboxTa,findInp.value)};
  findInp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();findNext(sandboxTa,findInp.value)}});
  var copyBtn=E("button","vbhp-btn","Copy");copyBtn.onclick=function(){navigator.clipboard.writeText(state.sandbox);say("copied")};
  var dlBtn=E("button","vbhp-btn","Download");dlBtn.onclick=function(){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([state.sandbox],{type:"text/html"}));a.download="sandbox.html";a.click()};
  var openBtn=E("button","vbhp-btn","Open tab");openBtn.onclick=function(){window.open(URL.createObjectURL(new Blob([state.sandbox],{type:"text/html"})),"_blank")};
  srow.appendChild(findInp);srow.appendChild(findBtn);srow.appendChild(findStat);srow.appendChild(copyBtn);srow.appendChild(dlBtn);srow.appendChild(openBtn);
  pages.sandbox.appendChild(srow);
  var ssplit=E("div","vbhp-split");var sleft=E("div","vbhp-col");var sright=E("div","vbhp-col");
  sandboxTa=E("textarea","vbhp-code");sandboxTa.spellcheck=false;sandboxTa.value=state.sandbox;
  var debounce=null;
  sandboxTa.oninput=function(){state.sandbox=sandboxTa.value;save();clearTimeout(debounce);debounce=setTimeout(renderSandbox,250)};
  sandboxFrame=E("iframe","vbhp-frame");sandboxFrame.setAttribute("sandbox","allow-scripts allow-forms allow-modals allow-popups");
  sleft.appendChild(sandboxTa);sright.appendChild(sandboxFrame);ssplit.appendChild(sleft);ssplit.appendChild(sright);
  pages.sandbox.appendChild(ssplit);
  var rrow=E("div","vbhp-row");
  repoPathInp=E("input","vbhp-input");repoPathInp.value=state.repoPath;repoPathInp.placeholder="docs/index.html";repoPathInp.style.maxWidth="260px";
  repoBaseInp=E("input","vbhp-input");repoBaseInp.value=state.baseUrl;repoBaseInp.placeholder="base URL (auto)";
  var loadBtn=E("button","vbhp-btn","Load repo file");loadBtn.onclick=loadRepo;
  repoStatus=E("span","vbhp-status");
  repoPathInp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();loadRepo()}});
  repoBaseInp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();loadRepo()}});
  var editBtn=E("button","vbhp-btn","Edit in sandbox");editBtn.onclick=editRepoInSandbox;
  rrow.appendChild(repoPathInp);rrow.appendChild(repoBaseInp);rrow.appendChild(loadBtn);rrow.appendChild(editBtn);rrow.appendChild(repoStatus);
  pages.repo.appendChild(rrow);
  repoFrame=E("iframe","vbhp-frame");repoFrame.setAttribute("sandbox","allow-scripts allow-forms allow-modals allow-popups");
  pages.repo.appendChild(repoFrame);
  var prow=E("div","vbhp-row");
  var parseBtn=E("button","vbhp-btn","Parse payload");parseBtn.onclick=parsePayloadTab;
  var useBtn=E("button","vbhp-btn","Use current chat ops");
  useBtn.onclick=function(){
   if(window.vbPendingOps&&window.vbPendingOps.length){renderPayloadOps(window.vbPendingOps);payloadStatus.textContent="loaded current chat ops"}
   else payloadStatus.textContent="no current chat ops";
  };
  payloadStatus=E("span","vbhp-status");
  prow.appendChild(parseBtn);prow.appendChild(useBtn);prow.appendChild(payloadStatus);
  pages.payload.appendChild(prow);
  payloadTa=E("textarea","vbhp-code");payloadTa.placeholder="Paste a bridge payload here, then Parse payload.";payloadTa.style.maxHeight="140px";
  pages.payload.appendChild(payloadTa);
  payloadList=E("div","vbhp-list");
  pages.payload.appendChild(payloadList);
  payloadFrame=E("iframe","vbhp-frame");payloadFrame.setAttribute("sandbox","allow-scripts allow-forms allow-modals allow-popups");
  pages.payload.appendChild(payloadFrame);
  function addTab(k,label){var b=E("button","vbhp-tab"+(k==="sandbox"?" on":""),label);b.dataset.tab=k;b.onclick=function(){openTab(k)};tabs.appendChild(b)}
  addTab("sandbox","Sandbox");addTab("repo","Repo file");addTab("payload","Payload");
  panel.appendChild(pages.sandbox);panel.appendChild(pages.repo);panel.appendChild(pages.payload);
  document.body.appendChild(panel);
  renderSandbox();
 }
 function addEntries(){
  var vboLayout=document.getElementById("vbo-page-layout");
  if(vboLayout&&!document.getElementById("vbhp-devoptions-entry")){
   var vbob=E("button","vbo-btn","HTML Preview");vbob.id="vbhp-devoptions-entry";vbob.onclick=function(){openTab("sandbox")};
   vboLayout.appendChild(vbob);
  }
  var bar=document.getElementById("vbmenubar");
  if(!bar)return false;
  if(document.getElementById("vbhp-menu-entry"))return true;
  var dev=document.getElementById("vbdevmenu");
  if(dev){
   var menu=dev.querySelector(".menu");
   if(menu){
    var b=E("button","","HTML Preview");b.id="vbhp-menu-entry";
    b.onclick=function(e){e.stopPropagation();menu.classList.add("hidden");openTab("sandbox")};
    menu.appendChild(b);
    return true;
   }
  }
  var wrap=E("span","vwrap");wrap.id="vbhp-menu-wrap";
  var btn=E("button","vmenubtn","Developer");
  var m=E("div","menu hidden");
  var item=E("button","","HTML Preview");item.id="vbhp-menu-entry";
  item.onclick=function(e){e.stopPropagation();m.classList.add("hidden");openTab("sandbox")};
  m.appendChild(item);
  btn.onclick=function(e){e.stopPropagation();m.classList.toggle("hidden")};
  wrap.appendChild(btn);wrap.appendChild(m);
  var right=bar.querySelector(".vb-right");
  bar.insertBefore(wrap,right||null);
  return true;
 }
 css();
 var tries=0;
 var iv=setInterval(function(){tries++;if(addEntries()||tries>200)clearInterval(iv)},250);
 document.addEventListener("keydown",function(e){
  if(e.key==="Escape"&&panel&&!panel.classList.contains("hidden")){e.stopPropagation();close()}
 },true);
 window.vbHtmlPreview={
  open:openTab,
  previewOp:function(op){openTab("payload");renderPayloadOps([op]);previewPath(op.path,[op])},
  previewOps:function(ops){openTab("payload");renderPayloadOps(ops);var hs=htmlOps(ops);if(hs.length)previewPath(hs[0].path,ops)}
 };
})();