// Vibe Sentinel service worker: notify + store finished replies.
chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
  var tabId=sender.tab?sender.tab.id:null;
  if(msg.type==="done"){
    chrome.storage.local.set({last:{site:msg.site,text:msg.text,ts:Date.now(),tabId:tabId}});
    chrome.notifications.create("vibe-done-"+Date.now(),{
      type:"basic",
      title:"Vibe Sentinel — reply finished",
      message:(msg.site||"AI")+" stopped generating. Click to jump back and copy.",
      priority:2
    });
  }
  sendResponse&&sendResponse({ok:true});
});
chrome.notifications.onClicked.addListener(function(id){
  chrome.storage.local.get(["last"],function(r){
    if(r.last&&r.last.tabId!=null){
      chrome.tabs.get(r.last.tabId,function(t){
        if(t&&t.windowId!=null){
          chrome.windows.update(t.windowId,{focused:true});
          chrome.tabs.update(r.last.tabId,{active:true});
        }
      });
    }
    chrome.notifications.clear(id);
  });
});