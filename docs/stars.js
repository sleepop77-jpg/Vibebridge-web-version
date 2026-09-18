// AMONG-US SKY: pixel starfield. Loading speed on new chat, slow while texting, black in light mode.
(function(){
  if(window.__vbStars)return;
  window.__vbStars=true;
  var cv=document.createElement("canvas");
  cv.id="vbstars";
  cv.style.cssText="position:fixed;inset:0;z-index:0;pointer-events:none;transition:opacity .6s;opacity:0";
  document.body.insertBefore(cv,document.body.firstChild);
  var st=document.createElement("style");
  st.textContent="#starA,#starB,#galaxy,.shot{display:none!important}";
  document.head.appendChild(st);
  var g=cv.getContext("2d"),W=0,H=0,stars=[],mode="off",alpha=0,theme="dark";
  function resize(){W=cv.width=innerWidth;H=cv.height=innerHeight}
  resize();addEventListener("resize",resize);
  function make(){
    stars=[];
    for(var i=0;i<110;i++){
      stars.push({x:Math.random()*W,y:Math.random()*H,z:Math.random()<.22?2.2:Math.random()<.5?1.5:1,s:Math.random()*1.6+.7,tw:Math.random()*6.283,ts:.5+Math.random()*1.6});
    }
  }
  make();
  function speedFor(m){return m==="loading"?42:m==="slow"?10:6}
  function readTheme(){theme=document.documentElement.getAttribute("data-theme")==="light"?"light":"dark"}
  readTheme();
  new MutationObserver(readTheme).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  function emptyVisible(){var e=document.getElementById("empty");return !!e&&e.style.display!=="none"&&e.offsetParent!==null}
  function typing(){var i=document.getElementById("input");return !!i&&(document.activeElement===i||i.value.length>0)}
  setInterval(function(){mode=typing()?"slow":(emptyVisible()?"loading":"off")},400);
  var last=performance.now();
  function frame(now){
    var dt=Math.min(.05,(now-last)/1000);last=now;
    var target=mode==="off"?0:1;
    alpha+=(target-alpha)*Math.min(1,dt*3);
    if(alpha<.02&&target===0){
      cv.style.opacity="0";
      requestAnimationFrame(frame);
      return;
    }
    cv.style.opacity=String(alpha*(theme==="light"?.55:.9));
    g.clearRect(0,0,W,H);
    var spd=speedFor(mode);
    var col=theme==="light"?"17,17,17":"236,228,246";
    for(var i=0;i<stars.length;i++){
      var s=stars[i];
      s.x-=spd*s.z*dt;
      if(s.x<-4){s.x=W+4;s.y=Math.random()*H}
      s.tw+=s.ts*dt;
      var a=.35+.55*Math.abs(Math.sin(s.tw));
      g.fillStyle="rgba("+col+","+a.toFixed(2)+")";
      var sz=s.s*s.z;
      g.fillRect(s.x,s.y,sz,sz);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();