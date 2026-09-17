// Delivery channel inside the VibeBridge tab: writes the composer DOM directly, clicks send, logs to inbox.
(function(){
  if(window.__vbHook)return;
  window.__vbHook=true;
  var seen=0;
  chrome.storage.local.get(["handoff"],function(r){seen=r.handoff?r.handoff.ts:0});
  function deliver(text,auto,ts){
    window.postMessage({source:"vibe-sentinel",text:text,auto:!!auto,ts:ts},"*");
    try{
      var i=document.querySelector("#input");
      if(i){
        i.value=text;
        i.dispatchEvent(new Event("input",{bubbles:true}));
        if(auto){
          setTimeout(function(){
            var s=document.querySelector("#send");
            if(s&&!s.disabled)s.click();
          },250);
        }
      }
    }catch(e){}
  }
  chrome.storage.onChanged.addListener(function(c){
    if(c.handoff&&c.handoff.newValue&&c.handoff.newValue.ts!==seen){
      seen=c.handoff.newValue.ts;
      deliver(c.handoff.newValue.text,c.handoff.newValue.auto,c.handoff.newValue.ts);
    }
  });
})();