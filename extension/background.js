// Vibe Sentinel service worker: notify, badge, store replies, inject pre-opened tabs.
var MATCHES=["https://chatgpt.com/*","https://gemini.google.com/*","https://claude.ai/*","https://chat.qwen.ai/*","https://qwen.ai/*","https://chat.deepseek.com/*","https://grok.com/*"];
function matchPattern(p,url){
  var m=p.match(/^https:\/\/([^/]+)\/\*$/);
  if(!m)return false;
  try{var u=new URL(url);return u.hostname===m[1]||u.hostname.endsWith("."+m[1])}catch(e){return false}
}
function injectAll(){
  chrome.tabs.query({},function(tabs){
    (tabs||[]).forEach(function(t){
      if(t.id!=null&&t.url&&MATCHES.some(function(m){return matchPattern(m,t.url)})){
        chrome.scripting.executeScript({target:{tabId:t.id},files:["content.js"]},function(){void chrome.runtime.lastError});
      }
    });
  });
}
chrome.runtime.onInstalled.addListener(injectAll);
chrome.runtime.onStartup.addListener(injectAll);
chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
  var tabId=sender.tab?sender.tab.id:null;
  if(msg.type==="state"&&tabId!=null){
    chrome.action.setBadgeText({tabId:tabId,text:msg.state==="generating"?"…":""});
    chrome.action.setBadgeBackgroundColor({tabId:tabId,color:"#7c6cf0"});
  }
  if(msg.type==="done"){
    chrome.storage.local.set({last:{site:msg.site,text:msg.text,blocks:msg.blocks||[],ts:Date.now(),tabId:tabId}});
    chrome.notifications.create("vibe-done-"+Date.now(),{
      type:"basic",
      title:"Vibe Sentinel — reply finished",
      message:(msg.site||"AI")+" stopped generating. Click to jump back and copy.",
      priority:2
    });
    if(tabId!=null)chrome.action.setBadgeText({tabId:tabId,text:"✓"});
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