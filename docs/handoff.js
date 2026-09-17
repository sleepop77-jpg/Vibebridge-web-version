// Sentinel handoff reader (isolated): #vbpayload=... fills composer; auto=1 also sends.
(function(){
  function ingest(){
    var h=location.hash||"";
    var m=h.match(/vbpayload=([^&]*)/);
    if(!m)return;
    var t="";
    try{t=decodeURIComponent(m[1])}catch(e){t=m[1]}
    if(!t)return;
    var auto=/auto=1/.test(h);
    var i=document.querySelector("#input");
    if(!i)return;
    i.value=t;
    if(window.autoGrow)autoGrow();
    if(window.toast)toast("payload received from Sentinel");
    try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}
    if(auto&&window.send)setTimeout(function(){window.send()},200);
  }
  addEventListener("hashchange",ingest);
  ingest();
})();