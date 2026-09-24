// SIDEBAR CLEAN v1: removes duplicate tool buttons + push history, makes chat history
// visible, and replaces the static login block with a live per-project credentials card
// (masked PAT, drag-to-copy, reveal on click, syncs with the active repo).
(function(){
 if(window.__vbSbClean)return;
 window.__vbSbClean=true;
 function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
 function say(m){if(window.toast)toast(m);else console.log(m)}
 function mask(p){p=String(p||"");if(!p)return "(no pat)";if(p.length<=10)return "••••••";return p.slice(0,6)+"…"+p.slice(-4)}
 var revealed=false,patview=null;
 function css(){
  if(document.getElementById("sbclean-css"))return;
  var st=document.createElement("style");
  st.id="sbclean-css";
  st.textContent=""
   +"#chatlist{max-height:34vh}"
   +"#patview{display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;user-select:text;-webkit-user-select:text;cursor:text;font:11px ui-monospace,Menlo,Consolas,monospace;color:var(--accent2,#3fb950);background:var(--bubble);border:1px solid var(--line);border-radius:6px;padding:2px 8px}"
   +".vbconn{margin:6px 4px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--card);display:flex;flex-direction:column;gap:6px}"
   +".vbconn .t{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}"
   +".vbconn .r{font-size:12.5px;font-weight:700;color:var(--text);word-break:break-all}"
   +".vbconn .row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}"
   +".vbconn .br{font-size:10.5px;color:var(--dim)}"
   +".vbconn button{border:1px solid var(--line);border-radius:6px;padding:3px 9px;font-size:10.5px;font-weight:600;color:var(--dim);background:var(--bubble)}"
   +".vbconn button:hover{color:var(--text);border-color:var(--accent)}"
   +".vbconn .hint{font-size:9.5px;color:var(--faint)}";
  document.head.appendChild(st);
 }
 var DUP_TEXTS=["Images","ZIP to MD","Projects / Backup","Website Preview","HTML Preview","Developer options","Developer"];
 var DUP_IDS=["zmd-side","mrepo-side","vbsp-side"];
 function removeDupButtons(){
  var sb=document.getElementById("sb");if(!sb)return;
  DUP_IDS.forEach(function(id){var e=document.getElementById(id);if(e)e.remove()});
  var btns=sb.querySelectorAll(".sidebtn");
  Array.prototype.forEach.call(btns,function(b){
   var t=(b.textContent||"").trim();
   if(DUP_TEXTS.indexOf(t)>=0)b.remove();
  });
 }
 function removePushHistory(){
  var pl=document.getElementById("pushlog");
  if(pl){
   var prev=pl.previousElementSibling;
   if(prev&&prev.classList&&prev.classList.contains("sbsec")&&/push history/i.test(prev.textContent||""))prev.remove();
   pl.remove();
  }
  var secs=document.querySelectorAll("#sb .sbsec");
  Array.prototype.forEach.call(secs,function(s){
   if(/push history/i.test(s.textContent||"")&&(!s.nextElementSibling||s.nextElementSibling.id!=="pushlog"))s.remove();
  });
 }
 function activeConn(){
  if(window.vbMultiRepo&&window.vbMultiRepo.active){
   var p=window.vbMultiRepo.active();
   if(p&&p.repo)return{pat:p.pat||"",repo:p.repo,branch:p.branch||"main"};
  }
  try{
   var s=JSON.parse(localStorage.getItem("vb")||"null");
   if(s&&s.r)return{pat:s.p||"",repo:s.r,branch:s.b||"main"};
  }catch(e){}
  var ri=document.getElementById("repo");
  if(ri&&ri.value.trim())return{pat:(document.getElementById("pat")||{}).value||"",repo:ri.value.trim(),branch:(document.getElementById("branch")||{}).value||"main"};
  return null;
 }
 function buildCard(){
  if(document.getElementById("vbconncard"))return;
  var sb=document.getElementById("sb");if(!sb)return;
  var sec=null,secs=sb.querySelectorAll(".sbsec");
  for(var i=0;i<secs.length;i++){if(/connect/i.test(secs[i].textContent||"")){sec=secs[i];break}}
  var card=E("div","vbconn");card.id="vbconncard";
  card.innerHTML="<div class='t'>Active project</div><div class='r'>…</div><div class='row'><span class='br'>branch —</span></div><div class='row'><code id='patview'>—</code></div><div class='hint'>drag over the token to copy · click to reveal/hide</div><div class='row'></div>";
  var row=card.querySelectorAll(".row")[1];
  function btn(label,fn){var b=E("button","",label);b.onclick=function(e){e.stopPropagation();fn()};row.appendChild(b);return b}
  btn("Copy PAT",function(){var c=activeConn();if(c&&c.pat){navigator.clipboard.writeText(c.pat);say("PAT copied")}else say("no PAT stored")});
  btn("Manage",function(){if(window.vbMultiRepo&&window.vbMultiRepo.open)window.vbMultiRepo.open();else say("multi-repo not loaded")});
  btn("Guided",function(){var g=document.getElementById("ob-side");if(g)g.click();else say("guided wizard unavailable")});
  btn("Validate",function(){var c=document.getElementById("connect");if(c)c.click()});
  if(sec)sb.insertBefore(card,sec);else sb.appendChild(card);
  patview=document.getElementById("patview");
  patview.onclick=function(){revealed=!revealed;sync()};
 }
 function sync(){
  var c=activeConn();
  var card=document.getElementById("vbconncard");
  if(card){
   card.querySelector(".r").textContent=c?c.repo:"not connected";
   card.querySelector(".br").textContent=c?("branch "+c.branch):"branch —";
   if(patview)patview.textContent=c?(revealed?(c.pat||"(no pat)"):mask(c.pat)):"—";
  }
  if(!c)return;
  var ri=document.getElementById("repo"),bi=document.getElementById("branch"),pi=document.getElementById("pat");
  if(ri&&document.activeElement!==ri&&ri.value.trim()!==c.repo)ri.value=c.repo;
  if(bi&&document.activeElement!==bi&&bi.value.trim()!==c.branch)bi.value=c.branch;
  if(pi&&document.activeElement!==pi&&c.pat&&pi.value!==c.pat)pi.value=c.pat;
 }
 document.addEventListener("mouseup",function(){
  var sel=window.getSelection();
  if(!sel||sel.isCollapsed)return;
  var n=sel.anchorNode;
  var eln=n&&n.nodeType===1?n:(n?n.parentElement:null);
  if(eln&&eln.closest&&eln.closest("#patview")){
   var txt=sel.toString();
   if(txt){navigator.clipboard.writeText(txt);say("PAT selection copied")}
  }
 });
 css();
 removeDupButtons();
 removePushHistory();
 buildCard();
 sync();
 var sb=document.getElementById("sb");
 if(sb){
  new MutationObserver(function(){
   setTimeout(function(){removeDupButtons();removePushHistory();buildCard();sync()},60);
  }).observe(sb,{childList:true,subtree:true});
 }
 setInterval(function(){removeDupButtons();removePushHistory();buildCard();sync()},1000);
})();