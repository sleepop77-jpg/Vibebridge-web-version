// DEVELOPER OPTIONS v1 (Phase 1): stage layout, professional look, HTML preview, notepad.
(function(){
 if(window.__vbDevOptions)return;
 window.__vbDevOptions=true;
 var KEY="vb_devoptions";
 var state={hideSidebar:false,hideChat:false,pro:false,html:'<div style="font:16px/1.6 -apple-system,\'Segoe UI\',sans-serif;padding:24px;color:#111">\n  <h2>HTML preview</h2>\n  <p>Edit this code and the preview updates live.</p>\n</div>',notes:''};
 function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
 function load(){try{var s=JSON.parse(localStorage.getItem(KEY)||"null");if(s){state.hideSidebar=!!s.hideSidebar;state.hideChat=!!s.hideChat;state.pro=!!s.pro;if(typeof s.html==="string")state.html=s.html;if(typeof s.notes==="string")state.notes=s.notes}}catch(e){}}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
 function css(){if(document.getElementById("vbo-css"))return;var st=document.createElement("style");st.id="vbo-css";st.textContent=
 "#vbo{position:fixed;top:28px;left:0;right:0;bottom:0;z-index:997;background:var(--bg,#0d1117);display:flex;flex-direction:column}"
 +"#vbo.hidden{display:none!important}"
 +".vbo-top{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line,#30363d);background:var(--side,#161b22)}"
 +".vbo-title{font-size:13px;font-weight:700;letter-spacing:.04em}"
 +".vbo-tabs{display:flex;gap:6px;margin:0 10px}"
 +".vbo-tab{border:1px solid var(--line,#30363d);border-radius:8px;padding:5px 10px;font-size:12px;color:var(--dim,#8b949e);background:transparent}"
 +".vbo-tab.on{color:var(--text,#e6edf3);border-color:var(--accent,#4493f8);background:var(--bubble,rgba(128,128,128,.15))}"
 +".vbo-spacer{flex:1}"
 +".vbo-page{flex:1;min-height:0;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:10px}"
 +".vbo-grid{display:flex;gap:12px;flex:1;min-height:0}"
 +".vbo-col{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}"
 +".vbo-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}"
 +".vbo-input{flex:1;min-width:160px;background:var(--code,#0d1117);border:1px solid var(--line,#30363d);color:var(--text,#e6edf3);border-radius:8px;padding:7px 9px;font-size:12px}"
 +".vbo-btn{border:1px solid var(--line,#30363d);border-radius:8px;padding:6px 11px;font-size:12px;font-weight:600;color:var(--text,#e6edf3);background:var(--card,#161b22);cursor:pointer}"
 +".vbo-btn:hover{border-color:var(--accent,#4493f8)}"
 +".vbo-btn.primary{background:var(--green,#238636);border-color:transparent;color:#fff}"
 +".vbo-code{flex:1;resize:none;background:var(--code,#0d1117);color:var(--text,#e6edf3);border:1px solid var(--line,#30363d);border-radius:10px;padding:10px 12px;font:12px/1.5 ui-monospace,Menlo,Consolas,monospace;outline:none}"
 +".vbo-frame{flex:1;border:1px solid var(--line,#30363d);border-radius:10px;background:#fff}"
 +".vbo-check{display:flex;gap:8px;align-items:center;font-size:13px;color:var(--dim,#8b949e);margin:2px 0;cursor:pointer}"
 +".vbo-check input{width:auto;margin:0;accent-color:var(--accent,#4493f8)}"
 +".vbo-help{font-size:11px;color:var(--faint,#6e7681);margin:0}"
 +".vbo-status{font-size:11px;color:var(--faint,#6e7681)}"
 +".vbo-float{position:fixed;right:16px;top:40px;z-index:998;border:1px solid var(--line,#30363d);background:var(--card,#161b22);color:var(--text,#e6edf3);border-radius:999px;padding:7px 13px;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.3);display:none}"
 +"body.vbo-hide-sidebar #sb{display:none!important}"
 +"body.vbo-hide-chat #chat,body.vbo-hide-chat #composerwrap,body.vbo-hide-chat .footnote,body.vbo-hide-chat #vtabnav,body.vbo-hide-chat #vactivity{display:none!important}"
 +"body.vbo-pro::before{display:none}"
 +"body.vbo-pro #vbstars,body.vbo-pro #starA,body.vbo-pro #starB,body.vbo-pro #galaxy,body.vbo-pro #vbdock,body.vbo-pro #confetti,body.vbo-pro .bunnywrap,body.vbo-pro .wordmark,body.vbo-pro .tagline,body.vbo-pro #tip,body.vbo-pro #chips,body.vbo-pro .keystats,body.vbo-pro .footnote{display:none!important}"
 +"body.vbo-pro #empty{padding-top:18px}"
 +"body.vbo-pro .msg,body.vbo-pro .pushcard,body.vbo-pro #composer{border-radius:8px}"
 +"@media(max-width:860px){.vbo-grid{flex-direction:column}.vbo-frame{min-height:300px}}";
 document.head.appendChild(st)}
 var panel=null,floatBtn=null,urlBox=null,findStat=null,checks={};
 function previewUrl(){try{var u=new URL(location.href.split("#")[0]);u.searchParams.set("vbpreview","1");u.searchParams.set("sidebar",state.hideSidebar?"1":"0");u.searchParams.set("chat",state.hideChat?"1":"0");u.searchParams.set("pro",state.pro?"1":"0");return u.toString()}catch(e){return location.href}}
 function refreshUrl(){if(urlBox)urlBox.value=previewUrl()}
 function apply(){try{var b=document.body.classList;b.toggle("vbo-hide-sidebar",state.hideSidebar);b.toggle("vbo-hide-chat",state.hideChat);b.toggle("vbo-pro",state.pro)}catch(e){}refreshUrl();if(floatBtn)floatBtn.style.display=(state.hideChat&&panel&&panel.classList.contains("hidden"))?"flex":"none"}
 function readQuery(){try{var p=new URLSearchParams(location.search);if(!p.has("vbpreview"))return;if(p.has("sidebar"))state.hideSidebar=p.get("sidebar")==="1";if(p.has("chat"))state.hideChat=p.get("chat")==="1";if(p.has("pro"))state.pro=p.get("pro")==="1"}catch(e){}}
 load();readQuery();css();apply();
 if(window.self!==window.top)return;
 function makeCheck(label,key){var l=E("label","vbo-check");var cb=document.createElement("input");cb.type="checkbox";cb.checked=state[key];cb.onchange=function(){state[key]=cb.checked;save();apply()};l.appendChild(cb);l.appendChild(E("span","",label));checks[key]=cb;return l}
 function findNext(ta,q){if(!ta||!q){if(findStat)findStat.textContent="type to find";return}var v=ta.value,low=v.toLowerCase(),needle=q.toLowerCase();var start=ta.selectionEnd||0;var idx=low.indexOf(needle,start);var wrapped=false;if(idx<0){idx=low.indexOf(needle);wrapped=true}if(idx<0){if(findStat)findStat.textContent="not found";return}ta.focus();ta.setSelectionRange(idx,idx+q.length);var line=v.slice(0,idx).split("\n").length;try{ta.scrollTop=Math.max(0,(line-4)*18)}catch(e){}if(findStat)findStat.textContent=(wrapped?"wrapped · ":"")+"line "+line}
 function sync(){if(checks.hideSidebar)checks.hideSidebar.checked=state.hideSidebar;if(checks.hideChat)checks.hideChat.checked=state.hideChat;if(checks.pro)checks.pro.checked=state.pro}
 function open(){if(!panel)return;panel.classList.remove("hidden");sync();refreshUrl();apply()}
 function close(){if(!panel)return;panel.classList.add("hidden");apply()}
 function build(){
  panel=E("div","vbo hidden");panel.id="vbo";
  floatBtn=E("button","vbo-float","Dev options");floatBtn.id="vbo-float";floatBtn.title="Developer options";floatBtn.onclick=open;
  var top=E("div","vbo-top");
  top.appendChild(E("span","vbo-title","DEVELOPER OPTIONS"));
  var tabs=E("div","vbo-tabs");
  var spacer=E("span","vbo-spacer");
  var closeBtn=E("button","vbo-btn","Close");closeBtn.onclick=close;
  top.appendChild(tabs);top.appendChild(spacer);top.appendChild(closeBtn);
  panel.appendChild(top);
  var layout=E("div","vbo-page");layout.id="vbo-page-layout";
  var html=E("div","vbo-page hidden");html.id="vbo-page-html";
  var notes=E("div","vbo-page hidden");notes.id="vbo-page-notes";
  var pages={layout:layout,html:html,notes:notes};
  layout.appendChild(E("div","vbo-help","Phase 1: stage mode, professional look, live HTML sandbox, notepad. Ctrl+Alt+D toggles this panel."));
  layout.appendChild(makeCheck("Hide sidebar","hideSidebar"));
  layout.appendChild(makeCheck("Hide main chat","hideChat"));
  layout.appendChild(makeCheck("Professional look","pro"));
  var stageRow=E("div","vbo-row");
  var stageOn=E("button","vbo-btn primary","Stage mode: hide sidebar + chat");
  stageOn.onclick=function(){state.hideSidebar=true;state.hideChat=true;save();sync();apply()};
  var stageOff=E("button","vbo-btn","Restore chat + sidebar");
  stageOff.onclick=function(){state.hideSidebar=false;state.hideChat=false;save();sync();apply()};
  stageRow.appendChild(stageOn);stageRow.appendChild(stageOff);
  layout.appendChild(stageRow);
  layout.appendChild(E("div","vbo-help","Professional look hides decorative art, starfield, dock and empty-state extras so VibeBridge looks like a plain tool window."));
  layout.appendChild(E("div","vbo-help","App preview URL (method 1): opens this app with the current layout options applied."));
  var prevRow=E("div","vbo-row");
  var openPrev=E("button","vbo-btn","Open app preview");openPrev.onclick=function(){window.open(previewUrl(),"_blank")};
  var copyPrev=E("button","vbo-btn","Copy preview URL");copyPrev.onclick=function(){try{navigator.clipboard.writeText(previewUrl())}catch(e){}};
  prevRow.appendChild(openPrev);prevRow.appendChild(copyPrev);
  layout.appendChild(prevRow);
  urlBox=E("input","vbo-input");urlBox.readOnly=true;urlBox.value=previewUrl();
  layout.appendChild(urlBox);
  var ta=null,frame=null,renderTimer=null;
  function renderFrame(){if(frame){try{frame.srcdoc=state.html}catch(e){}}}
  var findRow=E("div","vbo-row");
  var findInp=E("input","vbo-input");findInp.placeholder="Find in HTML";findInp.style.maxWidth="240px";
  var findBtn=E("button","vbo-btn","Find");findBtn.onclick=function(){findNext(ta,findInp.value)};
  findInp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();findNext(ta,findInp.value)}});
  findStat=E("span","vbo-status");
  findRow.appendChild(findInp);findRow.appendChild(findBtn);findRow.appendChild(findStat);
  html.appendChild(E("div","vbo-help","Direct HTML preview. The sandbox allows scripts, forms and popups but not same-origin access."));
  html.appendChild(findRow);
  var grid=E("div","vbo-grid");
  var left=E("div","vbo-col");var right=E("div","vbo-col");
  ta=E("textarea","vbo-code");ta.spellcheck=false;ta.value=state.html;
  ta.oninput=function(){state.html=ta.value;save();clearTimeout(renderTimer);renderTimer=setTimeout(renderFrame,250)};
  frame=E("iframe","vbo-frame");frame.setAttribute("sandbox","allow-scripts allow-forms allow-modals allow-popups");
  left.appendChild(ta);right.appendChild(frame);grid.appendChild(left);grid.appendChild(right);html.appendChild(grid);
  renderFrame();
  var notesTa=E("textarea","vbo-code");notesTa.placeholder="Future ideas, bugs, next phases...";notesTa.value=state.notes;
  notesTa.oninput=function(){state.notes=notesTa.value;save()};
  var noteRow=E("div","vbo-row");
  var copyNotes=E("button","vbo-btn","Copy notes");copyNotes.onclick=function(){try{navigator.clipboard.writeText(state.notes)}catch(e){}};
  var clearNotes=E("button","vbo-btn","Clear notes");clearNotes.onclick=function(){state.notes="";save();notesTa.value=""};
  noteRow.appendChild(copyNotes);noteRow.appendChild(clearNotes);
  notes.appendChild(E("div","vbo-help","Scratchpad for future ideas. Saved locally."));
  notes.appendChild(noteRow);
  notes.appendChild(notesTa);
  function setTab(k){for(var p in pages)pages[p].classList.toggle("hidden",p!==k);var btns=tabs.querySelectorAll(".vbo-tab");for(var i=0;i<btns.length;i++)btns[i].classList.toggle("on",btns[i].dataset.k===k);if(k==="html")renderFrame()}
  function addTab(k,label){var b=E("button","vbo-tab"+(k==="layout"?" on":""),label);b.dataset.k=k;b.onclick=function(){setTab(k)};tabs.appendChild(b)}
  addTab("layout","Layout");addTab("html","HTML preview");addTab("notes","Notepad");
  panel.appendChild(layout);panel.appendChild(html);panel.appendChild(notes);
  document.body.appendChild(panel);document.body.appendChild(floatBtn);
  sync();refreshUrl();apply();
 }
 build();
 function ensureButtons(){
  var hdr=document.querySelector("#main header");
  if(hdr&&!document.getElementById("vbo-header")){
   var b=E("button","headbtn","Dev");b.id="vbo-header";b.title="Developer options (Ctrl+Alt+D)";b.onclick=open;
   var badge=document.getElementById("connbadge");if(badge&&badge.parentNode)hdr.insertBefore(b,badge);else hdr.appendChild(b);
  }
  var sb=document.getElementById("sb");
  if(sb&&!document.getElementById("vbo-side")){
   var s=E("button","sidebtn","Developer options");s.id="vbo-side";s.onclick=open;
   var foot=sb.querySelector(".sbfoot");sb.insertBefore(s,foot||null);
  }
  if(hdr&&sb)clearInterval(iv);
 }
 var iv=setInterval(ensureButtons,400);
 setTimeout(function(){clearInterval(iv)},20000);
 document.addEventListener("keydown",function(e){
  if(e.ctrlKey&&e.altKey&&(e.key==="d"||e.key==="D")){e.preventDefault();e.stopPropagation();if(panel&&panel.classList.contains("hidden"))open();else close();return}
  if(e.key==="Escape"&&panel&&!panel.classList.contains("hidden")){e.stopPropagation();close()}
 },true);
})();