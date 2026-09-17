// Storage->page bridge on the VibeBridge origin: forwards handoffs via postMessage.
(function(){
  if(window.__vbHook)return;
  window.__vbHook=true;
  var seen=0;
  chrome.storage.local.get(["handoff"],function(r){seen=r.handoff?r.handoff.ts:0});
  chrome.storage.onChanged.addListener(function(c){
    if(c.handoff&&c.handoff.newValue&&c.handoff.newValue.ts!==seen){
      seen=c.handoff.newValue.ts;
      window.postMessage({source:"vibe-sentinel",text:c.handoff.newValue.text,auto:!!c.handoff.newValue.auto},"*");
    }
  });
})();