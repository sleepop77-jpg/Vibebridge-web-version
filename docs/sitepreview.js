// SITE PREVIEW v1 (Phase 2): virtual repo website preview before push. Lives under Developer options.
(function(){
 if(window.__vbSitePreview)return;
 window.__vbSitePreview=true;
 function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
 var KEY="vb_sitepreview";
 var state={entry:"docs/index.html",baseUrl:""};
 try{var s0=JSON.parse(localStorage.getItem(KEY)||"null");if(s0)Object.assign(state,s0)}catch(e){}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
 function css(){
  if(document.getElementById("vbsp-css"))return;
  var st=document.createElement("style");st.id="vbsp-css";
  st.textContent="#vbsp{position:fixed;top:28px;left:0;right:0;bottom:0;z-index:997;background:var(--bg,#0d1117);display:flex;flex-direction:column}"
   +"#vbsp.hidden{display:none!important}"
   +".vbsp-top{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line,#30363d);background:var(--side,#161b22)}"
   +".vbsp-title{font-size:13px;font-weight:700;letter-spacing:.04em}"
   +".vbsp-spacer{flex:1}"
   +".vbsp-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 14px 0}"
   +".vbsp-input{flex:1;min-width:150px;background:var(--code,#0d1117);border:1px solid var(--line,#30363d);color:var(--text,#e6edf3);border-radius:8px;padding:7px 9px;font-size:12px}"
   +".vbsp-btn{border:1px solid var(--line,#30363d);border-radius:8px;padding:6px 11px;font-size:12px;font-weight:600;color:var(--text,#e6edf3);background:var(--card,#161b22);cursor:pointer}"
   +".vbsp-btn:hover{border-color:var(--accent,#4493f8)}"
   +".vbsp-status{font-size:11px;color:var(--faint,#6e7681);padding:0 14px}"
   +".vbsp-code{margin:10px 14px 0;height:110px;resize:none;background:var(--code,#0d1117);color:var(--text,#e6edf3);border:1px solid var(--line,#30363d);border-radius:10px;padding:10px 12px;font:12px/1.5 ui-monospace,Menlo,Consolas,monospace;outline:none}"
   +".vbsp-list{margin:10px 14px 0;max-height:120px;overflow:auto;border:1px solid var(--line,#30363d);border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:6px}"
   +".vbsp-file{display:flex;gap:8px;align-items:center;font-size:12px}"
   +".vbsp-kind{font-size:9px;font-weight:700;border-radius:4px;padding:2px 6px;flex:none}"
   +".vbsp-kind.FILE{background:rgba(63,185,80,.15);color:#3fb950}"
   +".vbsp-kind.EDIT{background:rgba(210,153,34,.15);color:#d29922}"
   +".vbsp-kind.DELETE{background:rgba(248,81,73,.15);color:#f85149}"
   +".vbsp-path{font-family:ui-monospace,Menlo,Consolas,monospace;color:var(--accent,#4493f8);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}"
   +".vbsp-frame{flex:1;margin:10px 14px 14px;border:1px solid var(--line,#30363d);border-radius:10px;background:#fff;width:calc(100% - 28px)}"
   +"@media(max-width:860px){.vbsp-frame{min-height:280px}}";
  document.head.appendChild(st);
 }
 var panel=null,entryInp=null,baseInp=null,statusEl=null,listEl=null,frame=null,payloadTa=null,currentOps=[],objectURLs=[],renderCache={},lastHTML="";
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
 function pagesBase(){
  try{if(ensureConn())return "https://"+String(OWNER).toLowerCase()+".github.io/"+REPO+"/"}catch(e){}
  return "";
 }
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
  return "text/plain";
 }
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
 function siteOps(ops){
  return (ops||[]).filter(function(o){return /\.(html?|css|js|mjs|svg|json)$/i.test(o.path||"")});
 }
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
 function rewriteCssUrls(cssText,cssPath,map){
  return String(cssText).replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g,function(m,q,u){
   if(/^\s*(data:|blob:|http|#|\/\/)/i.test(u))return m;
   var p=normalizeRepoPath(cssPath,u);
   if(!p||p===cssPath||map[p]==null)return m;
   var b=blobForPath(p,map);
   return b?("url("+q+b+q+")"):m;
  });
 }
 function blobForPath(p,map){
  if(renderCache[p])return renderCache[p]==="pending"?null:renderCache[p];
  var c=map[p];
  if(c==null)return null;
  renderCache[p]="pending";
  if(/\.css$/i.test(p))c=rewriteCssUrls(c,p,map);
  var u=makeBlob(c,mimeOf(p));
  renderCache[p]=u;
  return u;
 }
 function rewriteHtml(html,entryPath,changedMap){
  var doc=new DOMParser().parseFromString(html,"text/html");
  var baseHref=state.baseUrl||autoBase(entryPath);
  if(baseHref){
   var baseEl=doc.querySelector("base");
   if(!baseEl){baseEl=doc.createElement("base");doc.head.insertBefore(baseEl,doc.head.firstChild)}
   baseEl.href=baseHref;
  }
  function swap(el,attr){
   var val=el.getAttribute(attr);
   if(!val)return;
   if(/^\s*(data:|blob:|http|#|mailto:|javascript:|\/\/)/i.test(val))return;
   var p=normalizeRepoPath(entryPath,val);
   if(!p||changedMap[p]==null)return;
   var b=blobForPath(p,changedMap);
   if(b)el.setAttribute(attr,b);
  }
  doc.querySelectorAll("link[rel='stylesheet'][href]").forEach(function(el){swap(el,"href")});
  doc.querySelectorAll("script[src]").forEach(function(el){swap(el,"src")});
  doc.querySelectorAll("img[src]").forEach(function(el){swap(el,"src")});
  doc.querySelectorAll("source[src]").forEach(function(el){swap(el,"src")});
  var hook=doc.createElement("script");
  hook.textContent="document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;if(!a)return;var h=a.getAttribute('href')||'';if(/^#|mailto:|javascript:|blob:|data:/i.test(h))return;if(/\\.html?$/i.test(h)||h.indexOf('/')>=0||h&&!/^[a-z]+:/i.test(h)){e.preventDefault();try{parent.postMessage({vbsitenav:h},'*')}catch(err){}}});window.onerror=function(m){try{parent.postMessage({vbsiteerr:String(m)},'*')}catch(e){}};";
  if(doc.body)doc.body.appendChild(hook);
  return "<!doctype html>\n"+doc.documentElement.outerHTML;
 }
 function status(m){if(statusEl)statusEl.textContent=m}
 function renderChangedList(map){
  if(!listEl)return;
  listEl.innerHTML="";
  var keys=Object.keys(map||{});
  if(!keys.length){listEl.appendChild(E("div","vbsp-status","no payload file overrides staged"));return}
  keys.forEach(function(p){
   var op=(currentOps||[]).filter(function(o){return o.path===p})[0]||{kind:"FILE"};
   var row=E("div","vbsp-file");
   row.appendChild(E("span","vbsp-kind "+op.kind,op.kind));
   row.appendChild(E("span","vbsp-path",p));
   row.appendChild(E("span","vbsp-status",map[p]==null?"deleted":"override"));
   listEl.appendChild(row);
  });
 }
 async function render(){
  if(!panel)build();
  if(entryInp)state.entry=entryInp.value.trim()||state.entry;
  if(baseInp)state.baseUrl=baseInp.value.trim();
  save();
  status("building virtual site…");
  objectURLs.forEach(function(u){try{URL.revokeObjectURL(u)}catch(e){}});
  objectURLs=[];renderCache={};lastHTML="";
  try{
   var ops=currentOps||[];
   var changedMap=await buildChangedMap(ops);
   var html=changedMap[state.entry];
   if(html===null)html='<body style="font:14px sans-serif;padding:24px">entry file deleted</body>';
   else if(html===undefined)html=await fetchText(state.entry);
   var finalHtml=rewriteHtml(html,state.entry,changedMap);
   lastHTML=finalHtml;
   if(frame)frame.srcdoc=finalHtml;
   renderChangedList(changedMap);
   status("previewing "+state.entry+" · "+Object.keys(changedMap).length+" payload override(s)");
  }catch(e){
   status("failed: "+e.message);
   lastHTML="<pre style='font:12px monospace;padding:16px;color:#b00'>"+String(e.message).replace(/</g,"&lt;")+"</pre>";
   if(frame)frame.srcdoc=lastHTML;
   renderChangedList({});
  }
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
  if(r&&r.ops&&r.ops.length){currentOps=r.ops;status("parsed "+r.ops.length+" ops");render()}
  else status("no ops parsed");
 }
 function useCurrentOps(){
  if(window.vbPendingOps&&window.vbPendingOps.length){currentOps=window.vbPendingOps;status("loaded current chat ops");render()}
  else status("no current chat ops");
 }
 function build(){
  panel=E("div","vbsp hidden");panel.id="vbsp";
  var top=E("div","vbsp-top");
  top.appendChild(E("span","vbsp-title","WEBSITE PREVIEW"));
  top.appendChild(E("span","vbsp-spacer"));
  var closeBtn=E("button","vbsp-btn","Close");closeBtn.onclick=close;
  top.appendChild(closeBtn);
  panel.appendChild(top);
  var row1=E("div","vbsp-row");
  entryInp=E("input","vbsp-input");entryInp.value=state.entry;entryInp.placeholder="docs/index.html";
  baseInp=E("input","vbsp-input");baseInp.value=state.baseUrl;baseInp.placeholder="base URL (auto)";
  var refresh=E("button","vbsp-btn","Refresh");refresh.onclick=render;
  var openTab=E("button","vbsp-btn","Open tab");
  openTab.onclick=function(){if(lastHTML)window.open(URL.createObjectURL(new Blob([lastHTML],{type:"text/html"})),"_blank")};
  entryInp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();render()}});
  baseInp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();render()}});
  row1.appendChild(entryInp);row1.appendChild(baseInp);row1.appendChild(refresh);row1.appendChild(openTab);
  panel.appendChild(row1);
  var row2=E("div","vbsp-row");
  var parseBtn=E("button","vbsp-btn","Parse payload");parseBtn.onclick=parseManual;
  var useBtn=E("button","vbsp-btn","Use current chat ops");useBtn.onclick=useCurrentOps;
  var clearBtn=E("button","vbsp-btn","Clear ops");clearBtn.onclick=function(){currentOps=[];renderChangedList({});status("ops cleared")};
  statusEl=E("span","vbsp-status");
  row2.appendChild(parseBtn);row2.appendChild(useBtn);row2.appendChild(clearBtn);row2.appendChild(statusEl);
  panel.appendChild(row2);
  payloadTa=E("textarea","vbsp-code");payloadTa.placeholder="Paste a bridge payload here, then Parse payload. Website files will preview before push.";
  panel.appendChild(payloadTa);
  listEl=E("div","vbsp-list");
  panel.appendChild(listEl);
  frame=E("iframe","vbsp-frame");
  frame.setAttribute("sandbox","allow-scripts allow-forms allow-modals allow-popups");
  panel.appendChild(frame);
  document.body.appendChild(panel);
 }
 function addEntries(){
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
   save();
   open();
   if(entryInp)entryInp.value=state.entry;
   render();
  }
 };
})();