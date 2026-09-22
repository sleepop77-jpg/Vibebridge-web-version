// DEV CONSOLIDATE v1: merges duplicate Developer menus into ONE, de-dupes duplicate
// menu items, hides the stray roaming dev button, and injects "Add backup" into
// Developer options / workspace / workbench / Developer menu.
(function(){
 if(window.__vbDevConsolidate)return;
 window.__vbDevConsolidate=true;
 function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
 function say(m){if(window.toast)toast(m);else console.log(m)}
 function btnOf(w){return w.querySelector(".vmenubtn,.vbdevbtn")}
 function menuOf(w){return w.querySelector(".menu,.vbdevmenu")}
 function isDevWrap(w){var b=btnOf(w);return !!b&&/developer/i.test((b.textContent||"").trim())}
 function itemTexts(menu){
  var out=[];if(!menu)return out;
  var bs=menu.querySelectorAll("button");
  for(var i=0;i<bs.length;i++)out.push((bs[i].textContent||"").trim().toLowerCase());
  return out;
 }
 function openWorkbench(){
  if(window.vbDevMode&&window.vbDevMode.toggle){window.vbDevMode.toggle(true);return}
  var d=document.getElementById("devbtn");
  if(d){var ds=d.style.display;d.style.display="";d.click();d.style.display=ds||"none"}
 }
 function addBackup(){
  if(window.vbBackupFlow&&window.vbBackupFlow.addBackup){window.vbBackupFlow.addBackup();return}
  var badge=document.getElementById("connbadge");
  if(badge)badge.click();
  say("backup form: use the green repo badge if the panel did not open");
 }
 function dedupeItems(menu){
  if(!menu)return;
  var seen={},kill=[];
  var bs=menu.querySelectorAll("button");
  for(var i=0;i<bs.length;i++){
   var t=(bs[i].textContent||"").trim().toLowerCase();
   if(!t)continue;
   if(seen[t])kill.push(bs[i]);
   else seen[t]=1;
  }
  for(var k=0;k<kill.length;k++){
   if(kill[k].parentNode)kill[k].parentNode.removeChild(kill[k]);
  }
 }
 function dedupe(){
  var bar=document.getElementById("vbmenubar");
  if(!bar)return;
  var wraps=bar.querySelectorAll(".vwrap,.vbdevwrap");
  var devs=[];
  for(var i=0;i<wraps.length;i++)if(isDevWrap(wraps[i]))devs.push(wraps[i]);
  var keep=null;
  for(var j=0;j<devs.length;j++){
   var m0=menuOf(devs[j]);
   if(m0&&m0.querySelectorAll("button").length){keep=devs[j];break}
  }
  if(!keep&&devs.length)keep=devs[0];
  if(!keep)return;
  var keepMenu=menuOf(keep);
  for(var k=0;k<devs.length;k++){
   var w=devs[k];
   if(w===keep)continue;
   var m=menuOf(w);
   if(m&&keepMenu){
    var have=itemTexts(keepMenu);
    var bs=m.querySelectorAll("button");
    for(var b=0;b<bs.length;b++){
     var t=(bs[b].textContent||"").trim();
     if(t&&have.indexOf(t.toLowerCase())===-1)keepMenu.appendChild(bs[b]);
    }
   }
   if(w.parentNode)w.parentNode.removeChild(w);
  }
  if(!keepMenu)return;
  dedupeItems(keepMenu);
  var dev=document.getElementById("devbtn");
  if(dev&&keepMenu&&!(dev.closest&&dev.closest(".vwrap,.vbdevmenu,.menu"))){
   dev.style.display="none";
   if(!/workbench|developer chat|developer mode/.test(itemTexts(keepMenu).join("|"))){
    var wi=E("button","","Developer workbench");
    wi.onclick=function(e){e.stopPropagation();keepMenu.classList.add("hidden");openWorkbench()};
    keepMenu.appendChild(wi);
   }
  }
  if(!keepMenu.querySelector("[data-vb-bkmenu]")){
   var ab=E("button","","Add backup repo");
   ab.setAttribute("data-vb-bkmenu","1");
   ab.onclick=function(e){e.stopPropagation();keepMenu.classList.add("hidden");addBackup()};
   keepMenu.appendChild(ab);
  }
 }
 function injectPanelButtons(){
  var specs=[
   ["#vbdeveloper .vbd-actions,#vbdeveloper .vbd-head,#vbdeveloper .bkf-row","vbd-btn"],
   ["#vbo-page-layout","vbo-btn"],
   ["#vbwork .vwtop","vbtn"]
  ];
  for(var i=0;i<specs.length;i++){
   var host=document.querySelector(specs[i][0]);
   if(!host||host.dataset.vbBk)continue;
   host.dataset.vbBk="1";
   var b=E("button",specs[i][1],"Add backup");
   b.onclick=function(e){e.stopPropagation();addBackup()};
   host.appendChild(b);
  }
 }
 function tick(){dedupe();injectPanelButtons()}
 tick();
 var n=0;
 var iv=setInterval(function(){n++;tick();if(n>300)clearInterval(iv)},500);
 var last=0;
 new MutationObserver(function(){
  var now=Date.now();
  if(now-last<300)return;
  last=now;
  tick();
 }).observe(document.body,{childList:true,subtree:true});
})();