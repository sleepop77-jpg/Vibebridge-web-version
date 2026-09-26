// STUDIO SHELL v2 (khaki redesign): 3-column workspace, top OS bar removed for good.
// Isolated + idempotent. Bunny studio.js is untouched (this file is studioshell.js).
(function(){
 if(window.__vbStudioShell)return;
 window.__vbStudioShell=true;
 function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
 function say(m){if(window.toast)toast(m);else console.log(m)}
 function killBar(){var b=document.getElementById("vbmenubar");if(b&&b.parentNode)b.parentNode.removeChild(b)}
 killBar();
 var css=document.createElement("style");
 css.id="vb-studioshell-css";
 css.textContent=""
  +":root{--sk-bg:#f1ead2;--sk-side:#e6ddbd;--sk-card:#faf6e8;--sk-line:#c8bb8e;--sk-ink:#33291a;--sk-dim:#6d6142;--sk-acc:#a8801f;--sk-olive:#6f7d33}"
  +"body{background:var(--sk-bg)!important;padding-top:0!important;overflow:hidden!important}"
  +"body::before{display:none!important}"
  +"#starA,#starB,#galaxy,#vbstars,.shot,#vbdock,#vbinbox-pill,#vbinbox,#sb,#empty,#vtabnav,#vactivity{display:none!important}"
  +"#vb-studio-shell{display:grid;grid-template-columns:250px minmax(0,1fr) 320px;height:100vh;width:100vw}"
  +".sk-left{background:var(--sk-side);border-right:1px solid var(--sk-line);display:flex;flex-direction:column;padding:14px 10px;overflow-y:auto}"
  +".sk-search{background:var(--sk-card);border:1px solid var(--sk-line);border-radius:8px;padding:8px 12px;font-size:12px;color:var(--sk-dim);margin-bottom:14px}"
  +".sk-folder{font-size:12px;font-weight:700;color:var(--sk-ink);margin:10px 4px 4px}"
  +".sk-file{display:flex;gap:8px;align-items:center;padding:5px 8px;border-radius:6px;font-size:11.5px;color:var(--sk-dim);cursor:pointer}"
  +".sk-file:hover{background:rgba(168,128,31,.12)}"
  +".sk-file.on{background:rgba(168,128,31,.2);color:var(--sk-ink);font-weight:600}"
  +".sk-dot{width:8px;height:10px;border-radius:2px;flex:none}"
  +".sk-menu{margin-top:auto;border-top:1px solid var(--sk-line);padding-top:8px;display:flex;flex-direction:column}"
  +".sk-menu button{text-align:left;padding:7px 10px;border-radius:6px;font-size:12.5px;font-weight:600;color:var(--sk-ink)}"
  +".sk-menu button:hover{background:rgba(168,128,31,.12)}"
  +".sk-legal{font-size:10px;color:var(--sk-dim);padding:8px 10px}"
  +".sk-center{display:flex;flex-direction:column;min-width:0;padding:14px 18px 0}"
  +".sk-tabs{display:flex}"
  +".sk-tab{padding:8px 26px;font-size:13px;font-weight:700;color:var(--sk-dim);background:var(--sk-side);border:1px solid var(--sk-line);border-bottom:none;border-radius:10px 10px 0 0;cursor:pointer}"
  +".sk-tab.on{background:var(--sk-card);color:var(--sk-acc)}"
  +".sk-body{flex:1;min-height:0;background:var(--sk-card);border:1px solid var(--sk-line);border-radius:0 12px 12px 12px;display:flex;flex-direction:column;overflow:hidden}"
  +"#main{flex:1!important;display:flex!important;flex-direction:column!important;min-height:0!important;position:relative!important;inset:auto!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;background:transparent!important;box-shadow:none!important;border:none!important;transform:none!important}"
  +"#main header{display:none!important}"
  +"#chat{flex:1!important;background:transparent!important;padding:18px 20px!important}"
  +"#flow{max-width:860px!important;margin:0 auto!important;padding:0!important}"
  +"#composerwrap{padding:10px 20px 14px!important;background:transparent!important}"
  +"#composer{max-width:860px!important;margin:0 auto!important;background:#fffdf6!important;border:1px solid var(--sk-line)!important;border-radius:14px!important;box-shadow:0 6px 18px rgba(51,41,26,.08)!important}"
  +"#composer textarea{color:var(--sk-ink)!important}"
  +".footnote{color:var(--sk-dim)!important}"
  +".msg.user{background:var(--sk-acc)!important;border-color:var(--sk-acc)!important;color:#fff!important}"
  +".msg.user.code{background:#fffdf6!important;color:var(--sk-ink)!important;border-color:var(--sk-line)!important}"
  +".msg.arow .avatar{background:var(--sk-olive)!important;color:#fff!important}"
  +".abody .prompttext,.abody .pushcard,.abody .preview,.abody .cklist,.abody .logtail{background:#fffdf6!important;border-color:var(--sk-line)!important;color:var(--sk-ink)!important}"
  +".abody .alabel,.abody .note,.abody .pl,.abody .fdet,.abody .fkind{color:var(--sk-dim)!important}"
  +".abody .fpath{color:var(--sk-acc)!important}"
  +".green,.sendbtn{background:var(--sk-acc)!important;border-color:var(--sk-acc)!important}"
  +".mini,.pill{background:#fffdf6!important;border-color:var(--sk-line)!important;color:var(--sk-ink)!important}"
  +".sk-right{background:var(--sk-bg);border-left:1px solid var(--sk-line);padding:16px 14px;overflow-y:auto;display:flex;flex-direction:column;gap:14px}"
  +".sk-card{background:var(--sk-card);border:1px solid var(--sk-line);border-radius:12px;padding:14px}"
  +".sk-card h4{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--sk-dim);margin-bottom:10px}"
  +".sk-prev{aspect-ratio:16/10;border:1px solid var(--sk-line);border-radius:8px;background:linear-gradient(180deg,#fffdf6 0%,#f4eeda 100%);position:relative;overflow:hidden}"
  +".sk-prev i{position:absolute;left:12%;right:12%;height:6px;border-radius:3px;background:var(--sk-line)}"
  +".sk-prev i:nth-child(1){top:18%;background:var(--sk-acc);opacity:.8}"
  +".sk-prev i:nth-child(2){top:34%}"
  +".sk-prev i:nth-child(3){top:46%;right:30%}"
  +".sk-prev b{position:absolute;left:12%;bottom:14%;width:34%;height:16%;border-radius:6px;background:var(--sk-olive)}"
  +".sk-row{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:12px;color:var(--sk-ink);margin:4px 0}"
  +".sk-val{font:11px ui-monospace,Menlo,Consolas,monospace;color:var(--sk-dim);background:var(--sk-side);border-radius:5px;padding:3px 7px;max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
  +".sk-btn{width:100%;margin-top:10px;padding:9px;border-radius:9px;border:1px solid var(--sk-line);background:#fffdf6;color:var(--sk-ink);font-size:12.5px;font-weight:700;cursor:pointer}"
  +".sk-btn:hover{border-color:var(--sk-acc)}"
  +".sk-btn.solid{background:var(--sk-acc);border-color:var(--sk-acc);color:#fff}"
  +".sk-steps{font-size:12px;line-height:1.7;color:var(--sk-dim)}"
  +".sk-steps b{color:var(--sk-ink)}"
  +"@media(max-width:980px){#vb-studio-shell{grid-template-columns:200px minmax(0,1fr) 260px}}"
  +"@media(max-width:760px){#vb-studio-shell{grid-template-columns:minmax(0,1fr)}.sk-left,.sk-right{display:none}}";
 document.head.appendChild(css);
 var shell=E("div");shell.id="vb-studio-shell";
 var left=E("div","sk-left");
 left.innerHTML='<div class="sk-search">Search project…</div>'
  +'<div class="sk-folder">▾ docs/</div>'
  +'<div class="sk-file on"><span class="sk-dot" style="background:#a8801f"></span>index.html</div>'
  +'<div class="sk-file"><span class="sk-dot" style="background:#6f7d33"></span>app.js</div>'
  +'<div class="sk-file"><span class="sk-dot" style="background:#4a6fa5"></span>style.css</div>'
  +'<div class="sk-file"><span class="sk-dot" style="background:#6f7d33"></span>github.js</div>'
  +'<div class="sk-folder">▸ extension/</div>'
  +'<div class="sk-folder">▸ desktop/</div>'
  +'<div class="sk-folder">▸ assets/</div>'
  +'<div class="sk-menu">'
  +'<button data-act="view">View</button>'
  +'<button data-act="edit">Edit</button>'
  +'<button data-act="options">Options</button>'
  +'<button data-act="backup">Backup repo</button>'
  +'</div>'
  +'<div class="sk-legal">Terms · Privacy</div>';
 var center=E("div","sk-center");
 center.innerHTML='<div class="sk-tabs"><div class="sk-tab on" data-tab="github">github</div><div class="sk-tab" data-tab="pc">this pc</div></div><div class="sk-body" id="sk-body"></div>';
 var right=E("div","sk-right");
 right.innerHTML='<div class="sk-card"><h4>Preview</h4><div class="sk-prev"><i></i><i></i><i></i><b></b></div><button class="sk-btn" id="sk-preview">Open live preview</button></div>'
  +'<div class="sk-card"><h4>GitHub credentials</h4><div class="sk-row"><span>Repo</span><span class="sk-val" id="sk-repo">—</span></div><div class="sk-row"><span>PAT</span><span class="sk-val" id="sk-pat">—</span></div><button class="sk-btn" id="sk-copy">Copy token</button></div>'
  +'<button class="sk-btn solid" id="sk-add">+ Add project</button>'
  +'<div class="sk-card"><h4>How to use</h4><div class="sk-steps"><b>1.</b> Connect your GitHub repo.<br><b>2.</b> Ask your AI for a VibeBridge payload.<br><b>3.</b> Paste it in the chat.<br><b>4.</b> Review the checklist and push.</div></div>';
 shell.appendChild(left);shell.appendChild(center);shell.appendChild(right);
 document.body.appendChild(shell);
 var main=document.getElementById("main");
 var skbody=document.getElementById("sk-body");
 if(main&&skbody)skbody.appendChild(main);
 function pat(){var p=(document.getElementById("pat")||{}).value||"";if(!p){try{p=JSON.parse(localStorage.getItem("vb")||"{}").p||""}catch(e){}}return p}
 function repo(){var r=(document.getElementById("repo")||{}).value||"";if(!r){try{r=JSON.parse(localStorage.getItem("vb")||"{}").r||""}catch(e){}}return r}
 function syncCred(){
  var r=repo(),p=pat();
  var er=document.getElementById("sk-repo");if(er)er.textContent=r||"not connected";
  var ep=document.getElementById("sk-pat");if(ep)ep.textContent=p?(p.slice(0,6)+"…"+p.slice(-4)):"—";
 }
 syncCred();
 setInterval(syncCred,1500);
 document.getElementById("sk-copy").onclick=function(){var p=pat();if(p){navigator.clipboard.writeText(p);say("token copied")}else say("no token stored")};
 document.getElementById("sk-add").onclick=function(){var g=document.getElementById("ob-side");if(g)g.click();else say("guided connect unavailable")};
 document.getElementById("sk-preview").onclick=function(){if(window.vbSitePreview&&window.vbSitePreview.open)window.vbSitePreview.open();else say("preview engine lands in phase 2")};
 Array.prototype.forEach.call(left.querySelectorAll(".sk-file"),function(f){
  f.onclick=function(){
   Array.prototype.forEach.call(left.querySelectorAll(".sk-file"),function(x){x.classList.remove("on")});
   f.classList.add("on");
   say("in-browser editor for "+(f.textContent||"").trim()+" lands in phase 2");
  };
 });
 Array.prototype.forEach.call(left.querySelectorAll(".sk-menu button"),function(b){
  b.onclick=function(){
   var a=b.getAttribute("data-act");
   if(a==="view"){var t=document.getElementById("themebtn");if(t)t.click()}
   else if(a==="edit"){var d=document.getElementById("devbtn");if(d)d.click();else say("dev workbench unavailable")}
   else if(a==="options"){var s=document.getElementById("skin-side");if(s)s.click();else say("customizer unavailable")}
   else if(a==="backup"){if(window.vbBackupFlow&&window.vbBackupFlow.addBackup)window.vbBackupFlow.addBackup();else say("backup flow not installed yet")}
  };
 });
 Array.prototype.forEach.call(center.querySelectorAll(".sk-tab"),function(t){
  t.onclick=function(){
   Array.prototype.forEach.call(center.querySelectorAll(".sk-tab"),function(x){x.classList.remove("on")});
   t.classList.add("on");
    /* mode switching is handled by studioedit.js — no stale toast */
  };
 });
})();