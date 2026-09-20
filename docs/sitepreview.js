// SITE PREVIEW v2: repo payload preview + local folder/zip preview + resizable window.
(function(){
 if(window.__vbSitePreview)return;
 window.__vbSitePreview=true;
 function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
 var KEY="vb_sitepreview";
 var state={entry:"docs/index.html",baseUrl:"",source:"repo"};
 try{var s0=JSON.parse(localStorage.getItem(KEY)||"null");if(s0)Object.assign(state,s0)}catch(e){}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
 function css(){
  if(document.getElementById("vbsp-css"))return;
  var st=document.createElement("style");st.id="vbsp-css";
  st.textContent="#vbsp{position:fixed;top:28px;left:0;right:0;bottom:0;z-index:997;background:var(--bg,#0d1117);display:flex;flex-direction:column;overflow:auto}"
   +"#vbsp.hidden{display:none!important}"
   +".vbsp-top{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line,#30363d);background:var(--side,#161b22)}"
   +".vbsp-title{font-size:13px;font-weight:700;letter-spacing:.04em}"
   +".vbsp-spacer{flex:1}"
   +".vbsp-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 14px 0}"
   +".vbsp-input{flex:1;min-width:140px;background:var(--code,#0d1117);border:1px solid var(--line,#30363d);color:var(--text,#e6edf3);border-radius:8px;padding:7px 9px;font-size:12px}"
   +".vbsp-btn{border:1px solid var(--line,#30363d);border-radius:8px;padding:6px 11px;font-size:12px;font-weight:600;color:var(--text,#e6edf3);background:var(--card,#161b22);cursor:pointer}"
   +".vbsp-btn:hover{border-color:var(--accent,#4493f8)}"
   +".vbsp-status{font-size:11px;color:var(--faint,#6e7681);padding:0 14px}"
   +".vbsp-help{font-size:11px;color:var(--faint,#6e7681);padding:0 14px}"
   +".vbsp-code{margin:10px 14px 0;height:100px;resize:none;background:var(--code,#0d1117);color:var(--text,#e6edf3);border:1px solid var(--line,#30363d);border-radius:10px;padding:10px 12px;font:12px/1.5 ui-monospace,Menlo,Consolas,monospace;outline:none}"
   +".vbsp-list{margin:10px 14px 0;max-height:120px;overflow:auto;border:1px solid var(--line,#30363d);border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:6px}"
   +".vbsp-file{display:flex;gap:8px;align-items:center;font-size:12px}"
   +".vbsp-kind{font-size:9px;font-weight:700;border-radius:4px;padding:2px 6px;flex:none}"
   +".vbsp-kind.FILE{background:rgba(63,185,80,.15);color:#3fb950}"
   +".vbsp-kind.EDIT{background:rgba(210,153,34,.15);color:#d29922}"
   +".vbsp-kind.DELETE{background:rgba(248,81,73,.15);color:#f85149}"
   +".vbsp-kind.LOCAL{background:rgba(68,147,248,.15);color:#4493f8}"
   +".vbsp-path{font-family:ui-monospace,Menlo,Consolas,monospace;color:var(--accent,#4493f8);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}"
   +".vbsp-stage{width:100%;height:420px;margin:10px auto;border:1px solid var(--line,#30363d);border-radius:10px;background:#fff;resize:both;overflow:hidden;position:relative}"
   +".vbsp-frame{width:100%;height:100%;border:none;background:#fff}"
   +".vbsp-stage:fullscreen{width:100%!important;height:100%!important;border:none;border-radius:0;margin:0}"
   +"@media(max-width:860px){.vbsp-stage{min-height:280px}}";
  document.head.appendChild(st);
 }
 var panel=null,entryInp=null,baseInp=null,statusEl=null,listEl=null,stage=null,frame=null,payloadTa=null,folderInput=null,zipInput=null,widthInp=null;
 var currentOps=[],objectURLs=[],renderCache={},lastHTML="",localMap=null,localName="",activeResolver=null;
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
 function autoBase(path){
  var base=pagesBase();if(!base)return "";
  try{
   var p=String(path||"").replace(/^docs\//,"");
   var parts=p.split("/");parts.pop();
   if(parts.length&&parts[0])base+=parts.join("/")+"/";
  }catch(e){}
  return base;
 }
 function mimeOf(p){
  if(/\.html?$/i.test(p))return "text/html";
  if(/\.css$/i.test(p))return "text/css";
  if(/\.(js|mjs)$/i.test(p))return "text/javascript";
  if(/\.json$/i.test(p))return "application/json";
  if(/\.svg$/i.test(p))return "image/svg+xml";
  if(/\.png$/i.test(p))return "image/png";
  if(/\.(jpe?g)$/i.test(p))return "image/jpeg";
  if(/\.gif$/i.test(p))return "image/gif";
  if(/\.webp$/i.test(p))return "image/webp";
  if(/\.ico$/i.test(p))return "image/x-icon";
  if(/\.woff2?$/i.test(p))return "font/woff2";
  if(/\.(ttf|otf)$/i.test(p))return "font/ttf";
  if(/\.txt$/i.test(p))return "text/plain";
  if(/\.md$/i.test(p))return "text/markdown";
  return "application/octet-stream";
 }
 function textish(p){return /\.(html?|css|js|mjs|json|svg|md|txt|xml|yml|yaml|ts)$/i.test(p)}
 function skipPath(n){return /(^|\/)(\.git|node_modules|__MACOSX|\.idea|\.gradle)\//.test(n)||/\.DS_Store$/i.test(n)}
 function normalizeRepoPath(basePath,rel){
  rel=String(rel||"").split("#")[0].split("?")[0].trim();
  if(!rel)return null;
  if(/^[a-z]+:/i.test(rel)||rel.indexOf("//")===0||rel.indexOf("blob:")===0||rel.indexOf("data:")===0)return null;
  if(rel.charAt(0)==="/"){
   var abs=rel.replace(/^\/+/,"");
   return (/^docs\//.test(basePath||"")?"docs/":"")+abs;
  }
  var dir=String(basePath||"").split("/");dir.pop();
  var parts=dir.concat(rel.split("/"));
  var out=[];
  for(var i=0;i<parts.length;i++){
   var seg=parts[i];
   if(!seg||seg===".")continue;
   if(seg==="..")out.pop();
   else out.push(seg);
  }
  return out.join("/");
 }
 async function fetchText(path){
  if(!ensureConn())throw new Error("connect to GitHub first");
  var meta=await window.api("GET","/repos/"+OWNER+"/"+REPO+"/contents/"+encPath(path)+"?ref="+(typeof BRANCH!=="undefined"&&BRANCH?BRANCH:"main"));
  return decodeB64(meta.content);
 }
 function siteOps(ops){return (ops||[]).filter(function(o){return /\.(html?|css|js|mjs|svg|json)$/i.test(o.path||"")})}
 async function materializePath(path,ops){
  var content=null;
  var relevant=(ops||[]).filter(function(o){return o&&o.path===path});
  for(var i=0;i<relevant.length;i++){
   var op=relevant[i];
   if(op.kind==="FILE"){content=op.content}
   else if(op.kind==="EDIT"){
    if(content==null)content=await fetchText(path);
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
  if(content==null)content=await fetchText(path);
  return content;
 }
 async function buildChangedMap(ops){
  var map={},paths={};
  siteOps(ops).forEach(function(o){paths[o.path]=1});
  for(var p in paths){
   var relevant=(ops||[]).filter(function(o){return o.path===p});
   var lastKind=relevant.length?relevant[relevant.length-1].kind:"";
   if(lastKind==="DELETE")map[p]=null;
   else map[p]=await materializePath(p,ops);
  }
  return map;
 }
 function makeBlob(content,type){
  var u=URL.createObjectURL(new Blob([content],{type:type}));
  objectURLs.push(u);
  return u;
 }
 function rewriteCssUrls(cssText,cssPath){
  return String(cssText).replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g,function(m,q,u){
   if(/^\s*(data:|blob:|http|#|\/\/)/i.test(u))return m;
   if(!activeResolver)return m;
   var b=activeResolver(cssPath,u);
   return b?("url("+q+b+q+")"):m;
  });
 }
 function repoBlobFor(p,map){
  if(renderCache[p])return renderCache[p]==="pending"?null:renderCache[p];
  var c=map[p];
  if(c==null)return null;
  renderCache[p]="pending";
  if(/\.css$/i.test(p))c=rewriteCssUrls(c,p);
  var u=makeBlob(c,mimeOf(p));
  renderCache[p]=u;
  return u;
 }
 function repoResolver(map){
  return function(basePath,url){
   var p=normalizeRepoPath(basePath,url);
   if(!p||map[p]==null)return null;
   return repoBlobFor(p,map);
  };
 }
 function localBlobFor(p){
  if(renderCache[p])return renderCache[p]==="pending"?null:renderCache[p];
  var e=localMap&&localMap[p];
  if(!e)return null;
  renderCache[p]="pending";
  var blob;
  if(e.text!=null){
   var c=e.text;
   if(/\.css$/i.test(p))c=rewriteCssUrls(c,p);
   blob=new Blob([c],{type:e.mime||mimeOf(p)});
  }else if(e.bytes){
   blob=new Blob([e.bytes],{type:e.mime||mimeOf(p)});
  }else if(e.file){
   blob=e.file;
  }else return null;
  var u=URL.createObjectURL(blob);
  objectURLs.push(u);
  renderCache[p]=u;
  return u;
 }
 function localResolver(basePath,url){
  var p=normalizeRepoPath(basePath,url);
  if(!p||!localMap)return null;
  var candidates=[p,p.replace(/^docs\//,""),"docs/"+p,p+"/index.html"];
  for(var i=0;i<candidates.length;i++){
   if(localMap[candidates[i]])return localBlobFor(candidates[i]);
  }
  return null;
 }
 function rewriteHtml(html,entryPath,baseHref,resolver){
  activeResolver=resolver;
  var doc=new DOMParser().parseFromString(html,"text/html");
  if(baseHref){
   var baseEl=doc.querySelector("base");
   if(!baseEl){baseEl=doc.createElement("base");doc.head.insertBefore(baseEl,doc.head.firstChild)}
   baseEl.href=baseHref;
  }
  function swap(el,attr){
   var val=el.getAttribute(attr);
   if(!val)return;
   if(/^\s*(data:|blob:|http|#|mailto:|javascript:|\/\/)/i.test(val))return;
   var u=resolver(entryPath,val);
   if(u)el.setAttribute(attr,u);
  }
  doc.querySelectorAll("link[href]").forEach(function(el){swap(el,"href")});
  doc.querySelectorAll("script[src]").forEach(function(el){swap(el,"src")});
  doc.querySelectorAll("img[src]").forEach(function(el){swap(el,"src")});
  doc.querySelectorAll("source[src]").forEach(function(el){swap(el,"src")});
  doc.querySelectorAll("video[src]").forEach(function(el){swap(el,"src")});
  doc.querySelectorAll("audio[src]").forEach(function(el){swap(el,"src")});
  var hook=doc.createElement("script");
  hook.textContent="document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;if(!a)return;var h=a.getAttribute('href')||'';if(/^#|mailto:|javascript:|blob:|data:/i.test(h))return;if(/\\.html?$/i.test(h)||h.indexOf('/')>=0||h&&!/^[a-z]+:/i.test(h)){e.preventDefault();try{parent.postMessage({vbsitenav:h},'*')}catch(err){}}});window.onerror=function(m){try{parent.postMessage({vbsiteerr:String(m)},'*')}catch(e){}};";
  if(doc.body)doc.body.appendChild(hook);
  return "<!doctype html>\n"+doc.documentElement.outerHTML;
 }
 async function readZip(buf){
  var dv=new DataView(buf),u8=new Uint8Array(buf),td=new TextDecoder();
  var eocd=-1;
  for(var i=buf.byteLength-22;i>=Math.max(0,buf.byteLength-65558);i--){if(dv.getUint32(i,true)===0x06054b50){eocd=i;break}}
  if(eocd<0)throw new Error("not a zip file");
  var count=dv.getUint16(eocd+10,true),p=dv.getUint32(eocd+16,true),out=[];
  for(var n=0;n<count;n++){
   if(dv.getUint32(p,true)!==0x02014b50)break;
   var method=dv.getUint16(p+10,true),csize=dv.getUint32(p+20,true);
   var nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true);
   var lo=dv.getUint32(p+42,true);
   var name=td.decode(u8.subarray(p+46,p+46+nl));
   var lnl=dv.getUint16(lo+26,true),lel=dv.getUint16(lo+28,true);
   var raw=u8.subarray(lo+30+lnl+lel,lo+30+lnl+lel+csize);
   if(!/\/$/.test(name)){
    var bytes=null;
    if(method===0)bytes=raw;
    else if(method===8&&window.DecompressionStream){
     bytes=new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
    }
    if(bytes)out.push({name:name,bytes:bytes});
   }
   p+=46+nl+el+cl;
  }
  return out;
 }
 function commonRoot(paths){
  if(!paths.length)return "";
  var first=paths[0].split("/");
  if(first.length<2)return "";
  var root=first[0];
  for(var i=1;i<paths.length;i++){
   if(paths[i].split("/")[0]!==root)return "";
  }
  return root+"/";
 }
 async function loadFolder(files){
  status("loading folder…");
  var arr=[];
  for(var i=0;i<files.length;i++){
   var f=files[i];
   var p=f.webkitRelativePath||f.name;
   if(p)arr.push({f:f,p:p});
  }
  var paths=arr.map(function(x){return x.p});
  var root=commonRoot(paths);
  localMap={};localName="folder";
  for(var j=0;j<arr.length;j++){
   var p2=arr[j].p;
   if(root&&p2.indexOf(root)===0)p2=p2.slice(root.length);
   if(!p2||skipPath(p2))continue;
   var file=arr[j].f;
   var entry={kind:"file",file:file,mime:file.type||mimeOf(p2)};
   if(textish(p2)&&file.size<1500000){
    try{entry.text=await file.text()}catch(e){}
   }
   localMap[p2]=entry;
  }
  chooseLocalEntry();
  state.source="local";save();
  if(entryInp)entryInp.value=state.entry;
  render();
 }
 async function loadZip(file){
  status("unzipping…");
  var entries=await readZip(await file.arrayBuffer());
  localMap={};localName=file.name;
  var td=new TextDecoder();
  entries.forEach(function(e){
   if(skipPath(e.name)||/\/$/.test(e.name))return;
   var entry={kind:"zip",bytes:e.bytes,mime:mimeOf(e.name)};
   if(textish(e.name)&&e.bytes.length<1500000){
    try{entry.text=td.decode(e.bytes)}catch(err){}
   }
   localMap[e.name]=entry;
  });
  chooseLocalEntry();
  state.source="local";save();
  if(entryInp)entryInp.value=state.entry;
  render();
 }
 function chooseLocalEntry(){
  if(!localMap)return;
  var keys=Object.keys(localMap);
  var candidates=["index.html","docs/index.html","home.html","main.html"];
  for(var i=0;i<candidates.length;i++){
   if(localMap[candidates[i]]){state.entry=candidates[i];return}
  }
  for(var j=0;j<keys.length;j++){
   if(/\.html?$/i.test(keys[j])){state.entry=keys[j];return}
  }
  if(keys.length)state.entry=keys[0];
 }
 function status(m){if(statusEl)statusEl.textContent=m}
 function clearRender(){
  objectURLs.forEach(function(u){try{URL.revokeObjectURL(u)}catch(e){}});
  objectURLs=[];renderCache={};lastHTML="";
 }
 function renderListRepo(map){
  if(!listEl)return;
  listEl.innerHTML="";
  var keys=Object.keys(map||{});
  if(!keys.length){listEl.appendChild(E("div","vbsp-status","no payload overrides staged"));return}
  keys.forEach(function(p){
   var op=(currentOps||[]).filter(function(o){return o.path===p})[0]||{kind:"FILE"};
   var row=E("div","vbsp-file");
   row.appendChild(E("span","vbsp-kind "+op.kind,op.kind));
   row.appendChild(E("span","vbsp-path",p));
   row.appendChild(E("span","vbsp-status",map[p]==null?"deleted":"override"));
   listEl.appendChild(row);
  });
 }
 function renderListLocal(){
  if(!listEl)return;
  listEl.innerHTML="";
  var keys=Object.keys(localMap||{}).slice(0,100);
  if(!keys.length){listEl.appendChild(E("div","vbsp-status","no local files loaded"));return}
  keys.forEach(function(p){
   var row=E("div","vbsp-file");
   row.appendChild(E("span","vbsp-kind LOCAL","LOCAL"));
   row.appendChild(E("span","vbsp-path",p));
   listEl.appendChild(row);
  });
  if(Object.keys(localMap).length>100)listEl.appendChild(E("div","vbsp-status",Object.keys(localMap).length+" local files total"));
 }
 async function renderRepo(){
  if(!panel)build();
  state.source="repo";save();
  if(entryInp)state.entry=entryInp.value.trim()||state.entry;
  if(baseInp)state.baseUrl=baseInp.value.trim();
  save();
  clearRender();
  status("building repo preview…");
  try{
   var ops=currentOps||[];
   var changedMap=await buildChangedMap(ops);
   var html=changedMap[state.entry];
   if(html===null)html='<body style="font:14px sans-serif;padding:24px">entry file deleted</body>';
   else if(html===undefined)html=await fetchText(state.entry);
   var baseHref=state.baseUrl||autoBase(state.entry);
   var finalHtml=rewriteHtml(html,state.entry,baseHref,repoResolver(changedMap));
   lastHTML=finalHtml;
   if(frame)frame.srcdoc=finalHtml;
   renderListRepo(changedMap);
   status("repo preview · "+state.entry+" · "+Object.keys(changedMap).length+" payload override(s)");
  }catch(e){
   status("failed: "+e.message);
   lastHTML="<pre style='font:12px monospace;padding:16px;color:#b00'>"+String(e.message).replace(/</g,"&lt;")+"</pre>";
   if(frame)frame.srcdoc=lastHTML;
   renderListRepo({});
  }
 }
 async function renderLocal(){
  if(!panel)build();
  if(entryInp)state.entry=entryInp.value.trim()||state.entry;
  save();
  clearRender();
  status("building local preview…");
  try{
   if(!localMap)throw new Error("load a folder or ZIP first");
   var entry=localMap[state.entry];
   if(!entry)throw new Error("entry not found: "+state.entry);
   var html=entry.text!=null?entry.text:(entry.file?await entry.file.text():new TextDecoder().decode(entry.bytes));
   var finalHtml=rewriteHtml(html,state.entry,"",localResolver);
   lastHTML=finalHtml;
   if(frame)frame.srcdoc=finalHtml;
   renderListLocal();
   status("local preview · "+state.entry+" · "+Object.keys(localMap).length+" files from "+localName);
  }catch(e){
   status("failed: "+e.message);
   lastHTML="<pre style='font:12px monospace;padding:16px;color:#b00'>"+String(e.message).replace(/</g,"&lt;")+"</pre>";
   if(frame)frame.srcdoc=lastHTML;
   renderListLocal();
  }
 }
 function render(){
  if(state.source==="local"&&localMap)renderLocal();
  else renderRepo();
 }
 function open(){
  if(!panel)build();
  panel.classList.remove("hidden");
 }
 function close(){if(panel)panel.classList.add("hidden")}
 function parseManual(){
  if(!payloadTa)return;
  var txt=payloadTa.value||"";
  if(!txt.trim()){status("paste a payload first");return}
  var parse=window.parsePayload||(typeof parsePayload!=="undefined"?parsePayload:null);
  var r=parse?parse(txt):null;
  if(r&&r.ops&&r.ops.length){currentOps=r.ops;state.source="repo";save();status("parsed "+r.ops.length+" ops");renderRepo()}
  else status("no ops parsed");
 }
 function useCurrentOps(){
  if(window.vbPendingOps&&window.vbPendingOps.length){currentOps=window.vbPendingOps;state.source="repo";save();status("loaded current chat ops");renderRepo()}
  else status("no current chat ops");
 }
 function setStageWidth(w){if(stage)stage.style.width=w}
 function build(){
  panel=E("div","vbsp hidden");panel.id="vbsp";
  var top=E("div","vbsp-top");
  top.appendChild(E("span","vbsp-title","WEBSITE PREVIEW"));
  top.appendChild(E("span","vbsp-spacer"));
  var closeBtn=E("button","vbsp-btn","Close");closeBtn.onclick=close;
  top.appendChild(closeBtn);
  panel.appendChild(top);
  panel.appendChild(E("div","vbsp-help","HTML alone is not a full website. Load folder/ZIP for local files, or use repo/payload mode for GitHub files."));
  var row1=E("div","vbsp-row");
  entryInp=E("input","vbsp-input");entryInp.value=state.entry;entryInp.placeholder="entry file: docs/index.html";
  baseInp=E("input","vbsp-input");baseInp.value=state.baseUrl;baseInp.placeholder="base URL for repo mode (auto)";
  var refresh=E("button","vbsp-btn","Refresh");refresh.onclick=render;
  var openTab=E("button","vbsp-btn","Open tab");
  openTab.onclick=function(){if(lastHTML)window.open(URL.createObjectURL(new Blob([lastHTML],{type:"text/html"})),"_blank")};
  entryInp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();render()}});
  baseInp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();render()}});
  row1.appendChild(entryInp);row1.appendChild(baseInp);row1.appendChild(refresh);row1.appendChild(openTab);
  panel.appendChild(row1);
  var row2=E("div","vbsp-row");
  var repoBtn=E("button","vbsp-btn","Repo / payload");repoBtn.onclick=function(){state.source="repo";save();renderRepo()};
  var folderBtn=E("button","vbsp-btn","Load folder");folderBtn.onclick=function(){folderInput.click()};
  var zipBtn=E("button","vbsp-btn","Load ZIP");zipBtn.onclick=function(){zipInput.click()};
  var clearLocal=E("button","vbsp-btn","Clear local");clearLocal.onclick=function(){localMap=null;localName="";state.source="repo";save();renderRepo()};
  statusEl=E("span","vbsp-status");
  row2.appendChild(repoBtn);row2.appendChild(folderBtn);row2.appendChild(zipBtn);row2.appendChild(clearLocal);row2.appendChild(statusEl);
  panel.appendChild(row2);
  var row3=E("div","vbsp-row");
  var parseBtn=E("button","vbsp-btn","Parse payload");parseBtn.onclick=parseManual;
  var useBtn=E("button","vbsp-btn","Use current chat ops");useBtn.onclick=useCurrentOps;
  var clearOps=E("button","vbsp-btn","Clear ops");clearOps.onclick=function(){currentOps=[];renderListRepo({});status("ops cleared")};
  row3.appendChild(parseBtn);row3.appendChild(useBtn);row3.appendChild(clearOps);
  panel.appendChild(row3);
  payloadTa=E("textarea","vbsp-code");payloadTa.placeholder="Paste a bridge payload here for repo/payload preview.";
  panel.appendChild(payloadTa);
  listEl=E("div","vbsp-list");
  panel.appendChild(listEl);
  var row4=E("div","vbsp-row");
  [["Phone","390px"],["Tablet","768px"],["Desktop","1280px"],["Full","100%"]].forEach(function(sp){
   var b=E("button","vbsp-btn",sp[0]);b.onclick=function(){setStageWidth(sp[1])};row4.appendChild(b);
  });
  widthInp=E("input","vbsp-input");widthInp.type="number";widthInp.placeholder="custom px";widthInp.style.maxWidth="120px";
  widthInp.oninput=function(){if(widthInp.value)setStageWidth(parseInt(widthInp.value,10)+"px")};
  row4.appendChild(widthInp);
  var normalH=E("button","vbsp-btn","Normal height");normalH.onclick=function(){if(stage)stage.style.height="420px"};
  var tallH=E("button","vbsp-btn","Tall");tallH.onclick=function(){if(stage)stage.style.height="70vh"};
  var full=E("button","vbsp-btn","Fullscreen");full.onclick=function(){if(stage&&stage.requestFullscreen)stage.requestFullscreen()};
  row4.appendChild(normalH);row4.appendChild(tallH);row4.appendChild(full);
  panel.appendChild(row4);
  stage=E("div","vbsp-stage");
  frame=E("iframe","vbsp-frame");
  frame.setAttribute("sandbox","allow-scripts allow-forms allow-modals allow-popups");
  frame.allowFullscreen=true;
  stage.appendChild(frame);
  panel.appendChild(stage);
  folderInput=document.createElement("input");
  folderInput.type="file";folderInput.multiple=true;
  folderInput.setAttribute("webkitdirectory","");
  folderInput.style.display="none";
  folderInput.onchange=function(){if(folderInput.files.length)loadFolder(folderInput.files);folderInput.value=""};
  zipInput=document.createElement("input");
  zipInput.type="file";zipInput.accept=".zip,application/zip";
  zipInput.style.display="none";
  zipInput.onchange=function(){if(zipInput.files[0])loadZip(zipInput.files[0]);zipInput.value=""};
  document.body.appendChild(panel);
  document.body.appendChild(folderInput);
  document.body.appendChild(zipInput);
 }
 function addEntries(){
  var sb=document.getElementById("sb");
  if(sb&&!document.getElementById("vbsp-side")){
   var side=E("button","sidebtn","Website Preview");side.id="vbsp-side";side.onclick=open;
   var foot=sb.querySelector(".sbfoot");
   sb.insertBefore(side,foot||null);
  }
  var bar=document.getElementById("vbmenubar");
  if(!bar)return false;
  if(document.getElementById("vbsp-menu-entry"))return true;
  var dev=document.getElementById("vbdevmenu");
  if(dev){
   var menu=dev.querySelector(".menu");
   if(menu){
    var b=E("button","","Website Preview");b.id="vbsp-menu-entry";
    b.onclick=function(e){e.stopPropagation();menu.classList.add("hidden");open()};
    menu.appendChild(b);
    return true;
   }
  }
  var wrap=E("span","vwrap");wrap.id="vbsp-menu-wrap";
  var btn=E("button","vmenubtn","Developer");
  var m=E("div","menu hidden");
  var item=E("button","","Website Preview");item.id="vbsp-menu-entry";
  item.onclick=function(e){e.stopPropagation();m.classList.add("hidden");open()};
  m.appendChild(item);
  btn.onclick=function(e){e.stopPropagation();m.classList.toggle("hidden")};
  wrap.appendChild(btn);wrap.appendChild(m);
  var right=bar.querySelector(".vb-right");
  bar.insertBefore(wrap,right||null);
  return true;
 }
 css();
 addEventListener("message",function(e){
  if(e.data&&e.data.vbsitenav){
   var p=normalizeRepoPath(state.entry,e.data.vbsitenav);
   if(!p)return;
   if(state.source==="local"&&localMap){
    var candidates=[p,p.replace(/^docs\//,""),"docs/"+p,p+"/index.html"];
    var found=null;
    for(var i=0;i<candidates.length;i++){if(localMap[candidates[i]]){found=candidates[i];break}}
    if(!found){status("local file not found: "+p);return}
    p=found;
   }
   if(/\/$/.test(p))p+="index.html";
   state.entry=p;save();
   if(entryInp)entryInp.value=p;
   render();
  }
  if(e.data&&e.data.vbsiteerr){status("preview error: "+e.data.vbsiteerr)}
 });
 var tries=0;
 var iv=setInterval(function(){tries++;if(addEntries()||tries>200)clearInterval(iv)},250);
 document.addEventListener("keydown",function(e){
  if(e.key==="Escape"&&panel&&!panel.classList.contains("hidden")){e.stopPropagation();close()}
 },true);
 window.vbSitePreview={
  open:open,
  previewOps:function(ops){
   currentOps=ops||[];
   var html=(ops||[]).filter(function(o){return /\.html?$/i.test(o.path||"")})[0];
   if(html)state.entry=html.path;
   state.source="repo";save();
   open();
   if(entryInp)entryInp.value=state.entry;
   renderRepo();
  },
  previewLocal:function(){state.source="local";open();renderLocal()}
 };
})();