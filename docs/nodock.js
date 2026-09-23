// NO DOCK v1: removes the OS dock for good and drops the chat/composer to the viewport
// bottom. Isolated override — does NOT depend on matching any old os.js/style.css lines.
(function(){
  if(window.__vbNoDock)return;
  window.__vbNoDock=true;
  var st=document.createElement("style");
  st.id="vbnodock-css";
  st.textContent="#vbdock{display:none!important}"
    +"#composerwrap{padding-bottom:16px!important}"
    +".toast{bottom:28px!important}";
  document.head.appendChild(st);
  function kill(){
    var d=document.getElementById("vbdock");
    if(d&&d.parentNode)d.parentNode.removeChild(d);
  }
  kill();
  var n=0;
  var iv=setInterval(function(){n++;kill();if(n>20)clearInterval(iv)},200);
  if(document.readyState!=="complete")addEventListener("DOMContentLoaded",kill);
  addEventListener("load",kill);
})();