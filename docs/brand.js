// Brand v4: favicon + menu-bar/boot mark only. NO bunny medallion; unwraps any old medallion.
(function(){
  if(window.__vbBrand4)return;
  window.__vbBrand4=true;
  window.__vbBrand=true;
  function favicon(){
    if(!document.querySelector('link[rel="icon"]')){
      var l=document.createElement("link");
      l.rel="icon";l.type="image/svg+xml";l.href="logo.svg";
      document.head.appendChild(l);
    }
  }
  function cleanStray(){
    var sb=document.querySelector(".sbhead");
    if(sb){
      var imgs=sb.querySelectorAll('img[src="logo.svg"]');
      for(var i=0;i<imgs.length;i++)imgs[i].parentNode.removeChild(imgs[i]);
    }
  }
  function unwrap(){
    var marks=document.querySelectorAll(".vbmark");
    for(var i=0;i<marks.length;i++){
      var m=marks[i],p=m.parentNode;
      if(!p)continue;
      while(m.firstChild)p.insertBefore(m.firstChild,m);
      p.removeChild(m);
    }
  }
  favicon();
  var tries=0;
  var iv=setInterval(function(){
    tries++;
    cleanStray();
    unwrap();
    var b=document.querySelector("#vbmenubar .vbbrand");
    if(b&&!b.dataset.logo){
      b.dataset.logo="1";
      b.innerHTML="<img src='logo.svg' alt='' style='height:20px;width:20px;border-radius:50%'> VibeBridge OS";
    }
    var s=document.querySelector("#vboot .vic");
    if(s)s.outerHTML="<img src='logo.svg' alt='' style='width:56px;height:56px;border-radius:50%'>";
    if(tries>80)clearInterval(iv);
  },300);
})();