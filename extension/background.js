// Vibe Sentinel service worker v1.4: notify, badge, store, inject, storage-channel handoff.
var MATCHES=["https://chatgpt.com/*","https://gemini.google.com/*","https://claude.ai/*","https://chat.qwen.ai/*","https://qwen.ai/*","https://chat.deepseek.com/*","https://grok.com/*"];
var BRIDGE_BASE="https://sleepop77-jpg.github.io/Vibebridge-web-version";
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
function handoff(text,auto){
  chrome.storage.local.set({handoff:{text:text||"",auto:!!auto,ts:Date.now()}});
  chrome.tabs.query({url:BRIDGE_BASE+"/*"},function(tabs){
    if(tabs&&tabs.length){
      chrome.tabs.update(tabs[0].id,{active:true});
      if(tabs[0].windowId!=null)chrome.windows.update(tabs[0].windowId,{focused:true});
    }else{
      chrome.tabs.create({url:BRIDGE_BASE+"/#vbpayload="+encodeURIComponent(text||"")+(auto?"&auto=1":"")});
    }
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
      message:(msg.site||"AI")+" stopped generating. Handing off to VibeBridge.",
      priority:2
    });
    if(tabId!=null)chrome.action.setBadgeText({tabId:tabId,text:"✓"});
    chrome.storage.local.get(["autoSend"],function(r){
      if(r.autoSend!==false)handoff(msg.text,true);
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