// Brand v3: fat-stroke medallion; bunny shrunk so the shapes frame him instead of hiding them.
(function(){
  if(window.__vbBrand)return;
  window.__vbBrand=true;
  var st=document.createElement("style");
  st.textContent=".vbmark{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none}"
   +".vbmark-bg{position:absolute;inset:0;width:100%;height:100%;border-radius:50%;object-fit:cover;box-shadow:0 0 0 2px rgba(255,255,255,.14),0 2px 10px rgba(0,0,0,.35)}"
   +".vbmark canvas{position:relative;z-index:1}"
   +"#sb .vbmark canvas{width:30px!important;height:38px!important}"
   +"#empty .vbmark canvas{width:90px!important;height:108px!important}";
  document.head.appendChild(st);
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
  function wrap(sel,size){
    var cv=document.querySelector(sel);
    if(!cv||cv.dataset.medal)return;
    cv.dataset.medal="1";
    var mark=document.createElement("span");
    mark.className="vbmark";
    mark.style.width=size+"px";mark.style.height=size+"px";
    var img=document.createElement("img");
    img.src="logo.svg";img.alt="";img.className="vbmark-bg";
    cv.parentNode.insertBefore(mark,cv);
    mark.appendChild(img);
    mark.appendChild(cv);
  }
  favicon();
  var tries=0;
  var iv=setInterval(function(){
    tries++;
    cleanStray();
    wrap("#sbbunny",56);
    wrap("#bunny",190);
    var b=document.querySelector("#vbmenubar .vbbrand");
    if(b&&!b.dataset.logo){
      b.dataset.logo="1";
      b.innerHTML="<img src='logo.svg' alt='' style='height:20px;width:20px;border-radius:50%'> VibeBridge OS";
    }
    var s=document.querySelector("#vboot .vic");
    if(s)s.outerHTML="<img src='logo.svg' alt='' style='width:56px;height:56px;border-radius:50%'>";
    if(tries>60)clearInterval(iv);
  },300);
})();