// DEVELOPER MENU v1: top-bar Developer menu + options. Hides old >_ DEV button and green state.
(function(){
 if(window.__vbDevMenu)return;
 window.__vbDevMenu=true;
 function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
 function say(m){if(window.toast)toast(m);else console.log(m)}
 var KEY="vb_devmenu";
 var state={hideSidebar:false,hideChat:false,pro:false};
 try{var s=JSON.parse(localStorage.getItem(KEY)||"null");if(s)Object.assign(state,s)}catch(e){}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
 function css(){
  if(document.getElementById("vbdevmenu-css"))return;
  var st=document.createElement("style");st.id="vbdevmenu-css";
  st.textContent="#devbtn{display:none!important}"
   +"body.vbdevmenu-hide-sidebar #sb{display:none!important}"
   +"body.vbdevmenu-hide-chat #chat,body.vbdevmenu-hide-chat #composerwrap,body.vbdevmenu-hide-chat .footnote,body.vbdevmenu-hide-chat #vtabnav,body.vbdevmenu-hide-chat #vactivity{display:none!important}"
   +"body.vbdevmenu-pro #vbdock,body.vbdevmenu-pro .bunnywrap,body.vbdevmenu-pro .wordmark,body.vbdevmenu-pro .tagline,body.vbdevmenu-pro #tip,body.vbdevmenu-pro #chips,body.vbdevmenu-pro .keystats,body.vbdevmenu-pro #confetti,body.vbdevmenu-pro .footnote{display:none!important}"
   +".devm-note{font-size:11px;color:var(--faint,#6e7681);margin:6px 0}";
  document.head.appendChild(st);
 }
 function apply(){
  document.body.classList.toggle("vbdevmenu-hide-sidebar",state.hideSidebar);
  document.body.classList.toggle("vbdevmenu-hide-chat",state.hideChat);
  document.body.classList.toggle("vbdevmenu-pro",state.pro);
 }
 function devChatOn(){return document.body.classList.contains("vbdev")}
 function toggleDevChat(){
  if(window.vbToggleDevChat)window.vbToggleDevChat();
  else{var b=document.getElementById("devbtn");if(b)b.click()}
 }
 var modal=null,devChatBox=null,hideSidebarBox=null,hideChatBox=null,proBox=null;
 function row(labelText,cb){var l=E("label","chk");l.appendChild(cb);l.appendChild(document.createTextNode(" "+labelText));return l}
 function buildModal(){
  var m=E("div","modal hidden");
  var card=E("div","modalcard");
  card.appendChild(E("h3","","Developer options"));
  card.appendChild(E("div","devm-note","Developer chat opens the payload workbench and hides the normal chat."));
  devChatBox=document.createElement("input");devChatBox.type="checkbox";
  devChatBox.onchange=function(){toggleDevChat();setTimeout(syncModal,120)};
  card.appendChild(row("developer chat",devChatBox));
  hideSidebarBox=document.createElement("input");hideSidebarBox.type="checkbox";
  hideSidebarBox.onchange=function(){state.hideSidebar=hideSidebarBox.checked;save();apply()};
  card.appendChild(row("hide sidebar",hideSidebarBox));
  hideChatBox=document.createElement("input");hideChatBox.type="checkbox";
  hideChatBox.onchange=function(){state.hideChat=hideChatBox.checked;save();apply()};
  card.appendChild(row("hide main chat",hideChatBox));
  proBox=document.createElement("input");proBox.type="checkbox";
  proBox.onchange=function(){state.pro=proBox.checked;save();apply()};
  card.appendChild(row("professional look",proBox));
  var close=E("button","green","Close");
  close.onclick=function(){m.classList.add("hidden")};
  close.style.marginTop="12px";
  card.appendChild(close);
  m.appendChild(card);
  m.onclick=function(e){if(e.target===m)m.classList.add("hidden")};
  document.body.appendChild(m);
  return m;
 }
 function syncModal(){
  if(devChatBox)devChatBox.checked=devChatOn();
  if(hideSidebarBox)hideSidebarBox.checked=state.hideSidebar;
  if(hideChatBox)hideChatBox.checked=state.hideChat;
  if(proBox)proBox.checked=state.pro;
 }
 function openOptions(){
  if(!modal)modal=buildModal();
  syncModal();
  modal.classList.remove("hidden");
 }
 function cleanOld(bar){
  var wraps=bar.querySelectorAll(".vwrap");
  Array.prototype.forEach.call(wraps,function(w){
   var label=w.querySelector(".vmenubtn");
   if(label&&(label.textContent||"").trim()==="View"){
    var items=w.querySelectorAll(".menu button");
    Array.prototype.forEach.call(items,function(it){
     if((it.textContent||"").trim()==="Developer options")it.remove();
    });
   }
  });
 }
 function buildMenu(){
  var bar=document.getElementById("vbmenubar");
  if(!bar)return false;
  if(document.getElementById("vbdevmenu"))return true;
  cleanOld(bar);
  var w=E("span","vwrap");w.id="vbdevmenu";
  var b=E("button","vmenubtn","Developer");
  var m=E("div","menu hidden");
  var opt=E("button","","Developer options");
  opt.onclick=function(e){e.stopPropagation();m.classList.add("hidden");openOptions()};
  var chat=E("button","","Developer chat");
  chat.onclick=function(e){e.stopPropagation();m.classList.add("hidden");toggleDevChat();say(devChatOn()?"developer chat on":"developer chat off")};
  m.appendChild(opt);m.appendChild(chat);
  b.onclick=function(e){e.stopPropagation();m.classList.toggle("hidden")};
  w.appendChild(b);w.appendChild(m);
  var right=bar.querySelector(".vb-right");
  bar.insertBefore(w,right||null);
  return true;
 }
 css();apply();
 var tries=0;
 var iv=setInterval(function(){tries++;if(buildMenu()||tries>200)clearInterval(iv)},200);
})();