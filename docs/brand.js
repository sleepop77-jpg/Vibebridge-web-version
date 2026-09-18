// Brand patcher: swaps OS menu-bar glyph + boot mark for logo.svg. Isolated, idempotent, best-effort.
(function(){
  if(window.__vbBrand)return;
  window.__vbBrand=true;
  var tries=0;
  var iv=setInterval(function(){
    tries++;
    var b=document.querySelector("#vbmenubar .vbbrand");
    if(b&&!b.dataset.logo){
      b.dataset.logo="1";
      b.innerHTML="<img src='logo.svg' alt='' style='height:18px;width:auto;border-radius:4px'> VibeBridge OS";
    }
    if(tries>60)clearInterval(iv);
  },300);
  var t2=0;
  var iv2=setInterval(function(){
    t2++;
    var s=document.querySelector("#vboot .vic");
    if(s){
      s.outerHTML="<img src='logo.svg' alt='' style='width:56px;height:auto;border-radius:8px'>";
      clearInterval(iv2);
    }else if(t2>25)clearInterval(iv2);
  },120);
})();