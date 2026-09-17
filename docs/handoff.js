// Sentinel handoff reader v2: storage-channel postMessage primary, #vbpayload hash fallback.
(function(){
  function apply(t,auto){
    if(!t)return;
    var i=document.querySelector("#input");
    if(!i)return;
    i.value=t;
    if(window.autoGrow)autoGrow();
    if(window.toast)toast("payload received from Sentinel");
    if(auto&&window.send)setTimeout(function(){window.send()},200);
  }
  addEventListener("message",function(e){
    if(e.data&&e.data.source==="vibe-sentinel")apply(e.data.text,!!e.data.auto);
  });
  function ingestHash(){
    var m=(location.hash||"").match(/vbpayload=([^&]*)/);
    if(!m)return;
    var t="";
    try{t=decodeURIComponent(m[1])}catch(e){t=m[1]}
    var auto=/auto=1/.test(location.hash);
    if(!t)return;
    apply(t,auto);
    try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}
  }
  addEventListener("hashchange",ingestHash);
  ingestHash();
})();