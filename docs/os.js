// VibeBridge OS shell v2: self-styled (injects own CSS). Menu bar, clock, battery, wifi, bell, dock, tabs, boot.
(function(){
  if(window.__vbOs)return;
  window.__vbOs=true;
  var $=function(s){return document.querySelector(s)};
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  var st=document.createElement("style");
  st.textContent=""
   +".vic{width:16px;height:16px;flex:none;display:inline-block;vertical-align:-3px;background-color:currentColor;-webkit-mask:var(--ic) center/100% 100% no-repeat;mask:var(--ic) center/100% 100% no-repeat}"
   +".ic-repo{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z'/%3E%3C/svg%3E\")}"
   +".ic-code{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.72 3.22a.75.75 0 0 1 0 1.06L1.06 8l3.66 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Zm6.56 0a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L14.94 8 11.28 4.28a.75.75 0 0 1 0-1.06Z'/%3E%3C/svg%3E\")}"
   +".ic-bell{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M8 1.5a4 4 0 0 0-4 4v2.6l-1.2 2.1c-.2.35.05.8.46.8h9.48c.41 0 .66-.45.46-.8L12 8.1V5.5a4 4 0 0 0-4-4Zm-1.5 11a1.5 1.5 0 0 0 3 0Z'/%3E%3C/svg%3E\")}"
   +".ic-sun{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M7.25 0h1.5v2.5h-1.5Zm0 13.5h1.5V16h-1.5ZM0 7.25h2.5v1.5H0Zm13.5 0H16v1.5h-2.5ZM8 4.5A3.5 3.5 0 1 0 8 11.5 3.5 3.5 0 0 0 8 4.5ZM2.9 2.9l1.06-1.06 1.77 1.77-1.06 1.06Zm9.37 9.37 1.06-1.06 1.77 1.77-1.06 1.06Zm0-10.43 1.77-1.77 1.06 1.06-1.77 1.77ZM2.9 13.1l1.77-1.77 1.06 1.06-1.77 1.77Z'/%3E%3C/svg%3E\")}"
   +".ic-moon{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M13.5 8.5a5.5 5.5 0 1 1-6-6 4.5 4.5 0 0 0 6 6Z'/%3E%3C/svg%3E\")}"
   +".ic-wifi{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M8 12.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm-3.2-3.2a4.5 4.5 0 0 1 6.4 0l-1.06 1.06a3 3 0 0 0-4.28 0Zm-2.1-2.1a7.5 7.5 0 0 1 10.6 0l-1.06 1.06a6 6 0 0 0-8.48 0Z'/%3E%3C/svg%3E\")}"
   +".ic-comment{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M1 3.25C1 2.56 1.56 2 2.25 2h11.5c.69 0 1.25.56 1.25 1.25v7.5c0 .69-.56 1.25-1.25 1.25H6l-2.9 2.42c-.33.28-.85.04-.85-.4V12H2.25A1.25 1.25 0 0 1 1 10.75Z'/%3E%3C/svg%3E\")}"
   +".ic-image{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.75 1h12.5c.41 0 .75.34.75.75v12.5c0 .41-.34.75-.75.75H1.75a.75.75 0 0 1-.75-.75V1.75c0-.41.34-.75.75-.75Zm.75 1.5v7.9l3.2-3.2a.75.75 0 0 1 1.06 0l2.72 2.72 2.02-2.02a.75.75 0 0 1 1.06 0l1.94 1.94V2.5Zm3 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z'/%3E%3C/svg%3E\")}"
   +".ic-inbox{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.75 1h12.5c.41 0 .75.34.75.75v12.5c0 .41-.34.75-.75.75H1.75a.75.75 0 0 1-.75-.75V1.75c0-.41.34-.75.75-.75Zm.75 1.5V9h2.75l.75 2h4l.75-2h2.75V2.5Z'/%3E%3C/svg%3E\")}"
   +".ic-zip{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M3.5 0h9A1.5 1.5 0 0 1 14 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-13A1.5 1.5 0 0 1 3.5 0Zm3.75 2v1.5h1.5V2Zm1.5 1.5v1.5h1.5V3.5Zm-1.5 1.5v1.5h1.5V5Zm1.5 1.5v1.5h1.5V6.5Zm-1.5 1.5V10a1.5 1.5 0 0 0 3 0V8.5Z'/%3E%3C/svg%3E\")}"
   +"body{padding-top:28px}"
   +"#composerwrap{padding-bottom:76px}"
   +"#vbmenubar{position:fixed;top:0;left:0;right:0;height:28px;z-index:995;display:flex;align-items:center;gap:6px;padding:0 12px;background:rgba(22,27,34,.86);backdrop-filter:saturate(180%) blur(14px);-webkit-backdrop-filter:saturate(180%) blur(14px);border-bottom:1px solid rgba(255,255,255,.08);font-size:12px}"
   +":root[data-theme='light'] #vbmenubar{background:rgba(246,248,250,.88);border-bottom-color:rgba(31,35,40,.1)}"
   +".vbbrand{display:flex;align-items:center;gap:6px;font-weight:700;margin-right:6px}"
   +".vwrap{position:relative}"
   +".vmenubtn{padding:3px 9px;border-radius:6px;font-size:12px;font-weight:500;opacity:.85}"
   +".vmenubtn:hover{background:rgba(128,128,128,.18);opacity:1}"
   +".vb-right{margin-left:auto;display:flex;gap:12px;align-items:center;font-size:11px;font-variant-numeric:tabular-nums;opacity:.85}"
   +".vbellwrap{position:relative;cursor:pointer;display:flex}"
   +".vbelln{position:absolute;top:-5px;right:-8px;background:#f85149;color:#fff;font-size:9px;font-weight:700;border-radius:999px;padding:0 4px;min-width:13px;text-align:center;line-height:13px}"
   +".vic.off{opacity:.35}"
   +".vbatt{width:22px;height:11px;border:1px solid currentColor;border-radius:3px;position:relative;display:inline-block;opacity:.8}"
   +".vbatt::after{content:'';position:absolute;right:-4px;top:2.5px;width:2px;height:5px;background:currentColor;border-radius:0 1px 1px 0}"
   +".vbatt i{position:absolute;top:1px;bottom:1px;left:1px;background:currentColor;border-radius:1px;width:60%}"
   +".vbatt.chg i{background:#3fb950}"
   +"#vboot{position:fixed;inset:0;z-index:1001;background:#0d1117;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;transition:opacity .4s}"
   +".vbootbar{width:180px;height:4px;border-radius:2px;background:#21262d;overflow:hidden}"
   +".vbootbar i{display:block;height:100%;width:0;background:#4493f8;border-radius:2px;animation:vboot .7s cubic-bezier(.3,.7,.3,1) forwards}"
   +"@keyframes vboot{from{width:0}to{width:100%}}"
   +".vboottxt{font-size:11px;color:#6e7681;letter-spacing:.08em;text-transform:uppercase}"
   +"#vbdock{position:fixed;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:10px;align-items:flex-end;padding:8px 10px;background:rgba(22,27,34,.78);backdrop-filter:saturate(180%) blur(16px);-webkit-backdrop-filter:saturate(180%) blur(16px);border:1px solid rgba(255,255,255,.08);border-radius:16px;z-index:996;box-shadow:0 8px 24px rgba(1,4,9,.5)}"
   +":root[data-theme='light'] #vbdock{background:rgba(255,255,255,.8);border-color:rgba(31,35,40,.1);box-shadow:0 8px 24px rgba(140,149,159,.25)}"
   +".vdockbtn{position:relative;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(128,128,128,.16);opacity:.85;transition:transform .16s cubic-bezier(.3,.7,.3,1),background .16s}"
   +".vdockbtn .vic{width:20px;height:20px}"
   +".vdockbtn:hover{transform:translateY(-8px) scale(1.18);background:rgba(128,128,128,.28);opacity:1}"
   +".vdockbtn::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);background:#24292f;color:#fff;font-size:10px;font-weight:600;padding:3px 8px;border-radius:6px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s}"
   +".vdockbtn:hover::after{opacity:1}"
   +"#vtabnav{max-width:760px;margin:0 auto;padding:10px 20px 0;display:flex;gap:18px;border-bottom:1px solid rgba(128,128,128,.25)}"
   +".vtab{padding:6px 2px 8px;font-size:13px;opacity:.7;border-bottom:2px solid transparent;cursor:pointer}"
   +".vtab:hover{opacity:1}"
   +".vtab.on{opacity:1;font-weight:600;border-bottom-color:#f78104}"
   +"#vactivity{max-width:760px;margin:0 auto;padding:16px 20px;overflow:auto}"
   +".varow{display:flex;gap:10px;align-items:center;padding:8px 12px;border:1px solid rgba(128,128,128,.35);border-radius:6px;margin-bottom:6px;font-size:12px;opacity:.85}"
   +".vadot{width:8px;height:8px;border-radius:50%;flex:none}"
   +".vasha{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#4493f8;font-weight:600}"
   +":root[data-theme='light'] .vasha{color:#0969da}"
   +".vats{margin-left:auto;opacity:.7;font-size:11px}"
   +".vanote{opacity:.6;font-size:12px;padding:12px}";
  document.head.appendChild(st);
  var boot=E("div");boot.id="vboot";
  boot.innerHTML="<span class='vic ic-repo' style='width:42px;height:42px;color:#4493f8'></span><div class='vbootbar'><i></i></div><div class='vboottxt'>VibeBridge OS</div>";
  document.body.appendChild(boot);
  setTimeout(function(){boot.style.opacity="0";setTimeout(function(){boot.remove()},450)},750);
  var bar=E("div");bar.id="vbmenubar";
  var brand=E("span","vbbrand");brand.innerHTML="<span class='vic ic-repo'></span> VibeBridge OS";
  bar.appendChild(brand);
  var click=function(sel){return function(){var e=$(sel);if(e)e.click()}};
  function menu(label,items){
    var w=E("span","vwrap");
    var b=E("button","vmenubtn",label);
    var m=E("div","menu hidden");
    items.forEach(function(it){
      var mi=E("button","",it[0]);
      mi.onclick=function(e){e.stopPropagation();m.classList.add("hidden");it[1]()};
      m.appendChild(mi);
    });
    b.onclick=function(e){e.stopPropagation();m.classList.toggle("hidden")};
    w.appendChild(b);w.appendChild(m);bar.appendChild(w);
  }
  menu("File",[["New chat",click("#newchat")],["Export chat",click("#exportbtn")],["Clear chat",click("#clearbtn")]]);
   menu("View",[["Toggle theme",click("#themebtn")],["Toggle dock",function(){var d=$("#vbdock");if(d)d.classList.toggle("hidden")}],["Toggle sidebar",click("#sbtoggle")],["Developer options",function(){var b=document.getElementById("vbo-header")||document.getElementById("vbo-side");if(b)b.click();else if(window.toast)toast("Developer options not loaded")}]]);
  menu("Help",[["Keyboard shortcuts",click("#kbshort")],["About VibeBridge OS",function(){if(window.toast)toast("VibeBridge OS · github-flavored desktop")}] ]);
  var right=E("span","vb-right");
  var bell=E("span","vbellwrap");bell.title="notifications";
  bell.innerHTML="<span class='vic ic-bell'></span><span class='vbelln hidden' id='vbelln'>0</span>";
  bell.onclick=function(){var p=$("#vbinbox-pill");if(p)p.click()};
  var wifi=E("span","vic ic-wifi");wifi.id="vwifi";wifi.title="online";
  var batt=E("span","vbatt");batt.innerHTML="<i></i>";batt.title="battery";
  var clock=E("span");clock.id="vbclock";
  right.appendChild(bell);right.appendChild(wifi);right.appendChild(batt);right.appendChild(clock);
  bar.appendChild(right);
  document.body.insertBefore(bar,document.body.firstChild);
  document.addEventListener("click",function(){bar.querySelectorAll(".menu").forEach(function(m){m.classList.add("hidden")})});
  function tickClock(){var d=new Date();clock.textContent=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")}
  tickClock();setInterval(tickClock,10000);
  function setNet(){var on=navigator.onLine;wifi.classList.toggle("off",!on);wifi.title=on?"online":"offline"}
  setNet();addEventListener("online",setNet);addEventListener("offline",setNet);
  if(navigator.getBattery)navigator.getBattery().then(function(b){
    function up(){var f=Math.round(b.level*100);var i=batt.querySelector("i");if(i)i.style.width=Math.max(8,f)+"%";batt.classList.toggle("chg",b.charging);batt.title=f+"%"+(b.charging?" charging":"")}
    up();b.addEventListener("levelchange",up);b.addEventListener("chargingchange",up);
  }).catch(function(){});
  var count=0,toastEl=$("#toast");
  if(toastEl){
    new MutationObserver(function(){
      if(toastEl.classList.contains("show")){
        count++;
        var n=$("#vbelln");
        if(n){n.textContent=count>99?"99+":String(count);n.classList.remove("hidden")}
      }
    }).observe(toastEl,{attributes:true,attributeFilter:["class"]});
  }
  var dock=E("div");dock.id="vbdock";
  function dbtn(ic,tip,fn){
    var b=E("button","vdockbtn");b.setAttribute("data-tip",tip);
    b.innerHTML="<span class='vic "+ic+"'></span>";
    b.onclick=fn;dock.appendChild(b);
  }
  dbtn("ic-comment","Chats",function(){var c=$("#chat");if(c)c.scrollTop=0;var i=$("#input");if(i)i.focus()});
  dbtn("ic-code","Bunny Studio",function(){var b=$("#bunny");if(b){b.click();setTimeout(function(){b.click()},80);setTimeout(function(){b.click()},160)}});
  dbtn("ic-zip","ZIP to MD",function(){var z=document.getElementById("zmd-side");if(z)z.click()});
  dbtn("ic-image","Images",function(){var bs=document.querySelectorAll(".sidebtn");for(var i=0;i<bs.length;i++){if(bs[i].textContent.trim()==="Images"){bs[i].click();return}}});
  dbtn("ic-inbox","Sentinel inbox",function(){var p=$("#vbinbox-pill");if(p)p.click()});
  dbtn("ic-moon","Theme",click("#themebtn"));
  document.body.appendChild(dock);
  var tabs=E("div");tabs.id="vtabnav";
  var t1=E("button","vtab on","Conversations");
  var t2=E("button","vtab","Activity");
  tabs.appendChild(t1);tabs.appendChild(t2);
  var act=E("div");act.id="vactivity";act.style.display="none";
  function renderActivity(){
    act.innerHTML="";
    var ps=[];try{ps=JSON.parse(localStorage.getItem("vb_pushes")||"[]")}catch(e){}
    if(!ps.length)act.appendChild(E("div","vanote","no pushes recorded yet — push a payload and come back"));
    ps.slice().reverse().forEach(function(p){
      var row=E("div","varow");
      row.innerHTML="<span class='vadot' style='background:"+(p.ok?"#3fb950":"#f85149")+"'></span><span class='vasha'>"+String(p.sha||"").slice(0,7)+"</span><span>"+(p.ops||0)+" ops</span><span class='vats'>"+new Date(p.ts).toLocaleString()+"</span>";
      row.title=p.message||"";
      act.appendChild(row);
    });
  }
  t1.onclick=function(){t1.classList.add("on");t2.classList.remove("on");act.style.display="none";var c=$("#chat");if(c)c.style.display="";var w=$("#composerwrap");if(w)w.style.display=""};
  t2.onclick=function(){t2.classList.add("on");t1.classList.remove("on");renderActivity();act.style.display="";var c=$("#chat");if(c)c.style.display="none";var w=$("#composerwrap");if(w)w.style.display="none"};
  var main=$("#main"),hdr=main?main.querySelector("header"):null;
  if(hdr&&hdr.parentNode)hdr.parentNode.insertBefore(tabs,hdr.nextSibling);
  var cw=$("#composerwrap");
  if(cw&&cw.parentNode)cw.parentNode.insertBefore(act,cw);
})();