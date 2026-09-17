// VibeBridge OS shell: menu bar, live clock, battery, wifi, bell counter, dock, tabs, boot. Isolated.
(function(){
  if(window.__vbOs)return;
  window.__vbOs=true;
  var $=function(s){return document.querySelector(s)};
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  var boot=E("div");boot.id="vboot";
  boot.innerHTML="<span class='vic ic-repo' style='width:42px;height:42px;color:var(--accent)'></span><div class='vbootbar'><i></i></div><div class='vboottxt'>VibeBridge OS</div>";
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
  menu("View",[["Toggle theme",click("#themebtn")],["Toggle dock",function(){var d=$("#vbdock");if(d)d.classList.toggle("hidden")}],["Toggle sidebar",click("#sbtoggle")]]);
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
      row.innerHTML="<span class='vadot' style='background:"+(p.ok?"var(--green2)":"var(--red)")+"'></span><span class='vasha'>"+String(p.sha||"").slice(0,7)+"</span><span>"+(p.ops||0)+" ops</span><span class='vats'>"+new Date(p.ts).toLocaleString()+"</span>";
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