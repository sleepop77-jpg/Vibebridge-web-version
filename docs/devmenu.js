// DEVELOPER MENU v3 — reliable Developer chat entry. Uses window.vbDevMode.
(function(){
 if(window.__vbDevMenuFix)return;
 window.__vbDevMenuFix=true;
 function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
 function say(m){if(window.toast)toast(m);else console.log(m)}
 var existingToggle=window.vbToggleDevChat;
 function isDevOn(){return window.vbDevMode&&window.vbDevMode.on?window.vbDevMode.on():document.body.classList.contains("vbdev")}
 function toggleDev(force){
  var target=(typeof force==="boolean")?force:!isDevOn();
  if(window.vbDevMode&&window.vbDevMode.toggle){window.vbDevMode.toggle(target);return}
  if(existingToggle&&existingToggle!==window.vbToggleDevChat){existingToggle(target);return}
  document.body.classList.toggle("vbdev",target);
 }
 window.vbToggleDevChat=function(force){toggleDev(force)};
 function closeMenu(el){try{var m=el.closest(".menu,.vbdevmenu");if(m)m.classList.add("hidden")}catch(e){}}
 function updateLabel(b,on){
  if(!b)return;
  b.title="Developer chat is "+(on?"on":"off");
  var t=b.querySelector(".t");
  if(t){t.textContent="Developer chat · "+(on?"on":"off");return}
  if(b.childNodes&&b.childNodes.length&&b.childNodes[0].nodeType===3){b.childNodes[0].nodeValue="Developer chat · "+(on?"on":"off");return}
  b.textContent="Developer chat · "+(on?"on":"off");
 }
 function makeChatBtn(b){
  if(!b)return b;
  b.dataset.vbfix="1";
  b.onclick=function(e){
   e.stopPropagation();
   closeMenu(b);
   var target=!isDevOn();
   toggleDev(target);
   setTimeout(function(){
    if(target&&!isDevOn()&&window.vbDevMode&&window.vbDevMode.open)window.vbDevMode.open();
    var on=isDevOn();
    updateLabel(b,on);
    say("developer chat "+(on?"on":"off"));
   },80);
  };
  updateLabel(b,isDevOn());
  return b;
 }
 function findDevMenus(){
  var out=[];
  var bar=document.getElementById("vbmenubar");
  if(!bar)return out;
  var wraps=bar.querySelectorAll(".vwrap,.vbdevwrap");
  Array.prototype.forEach.call(wraps,function(w){
   var label=w.querySelector(".vmenubtn,.vbdevbtn");
   if(label&&/developer/i.test(label.textContent||"")){
    var m=w.querySelector(".menu,.vbdevmenu");
    if(m)out.push(m);
   }
  });
  return out;
 }
 function patchMenus(){
  var menus=findDevMenus();
  if(!menus.length)return false;
  menus.forEach(function(m){
   var found=false;
   var btns=m.querySelectorAll("button");
   Array.prototype.forEach.call(btns,function(b){
    var txt=(b.textContent||"").replace(/\s+/g," ");
    if(b.dataset.vbfix==="1"||/developer chat/i.test(txt)){found=true;makeChatBtn(b)}
   });
   if(!found){
    var cls=m.classList.contains("vbdevmenu")?"vbdevitem":"";
    var nb=E("button",cls,"Developer chat");
    makeChatBtn(nb);
    m.appendChild(nb);
   }
  });
  return true;
 }
 function createMenu(){
  var bar=document.getElementById("vbmenubar");
  if(!bar||document.getElementById("vbdev-fix-wrap"))return false;
  var w=E("span","vwrap");w.id="vbdev-fix-wrap";
  var b=E("button","vmenubtn","Developer");
  var m=E("div","menu hidden");m.id="vbdev-fix-menu";
  var chat=E("button","","Developer chat");
  makeChatBtn(chat);
  m.appendChild(chat);
  b.onclick=function(e){e.stopPropagation();m.classList.toggle("hidden")};
  w.appendChild(b);w.appendChild(m);
  document.addEventListener("click",function(){m.classList.add("hidden")});
  var right=bar.querySelector(".vb-right");
  bar.insertBefore(w,right||null);
  return true;
 }
 var tries=0;
 var iv=setInterval(function(){tries++;if(patchMenus()||createMenu()||tries>200)clearInterval(iv)},250);
 window.vbDeveloperChat={toggle:toggleDev,on:isDevOn};
})();