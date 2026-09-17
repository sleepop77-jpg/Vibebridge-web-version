// Vibe Sentinel worker v1.6: throttle-proof clocks, session registry, handoff.
var MATCHES=["https://chatgpt.com/*","https://gemini.google.com/*","https://claude.ai/*","https://chat.qwen.ai/*","https://qwen.ai/*","https://chat.deepseek.com/*","https://grok.com/*"];
var BRIDGE_BASE="https://sleepop77-jpg.github.io/Vibebridge-web-version";
var SILENCE=3500;
var sessions={};
chrome.storage.local.get(["silenceMs"],function(r){if(r.silenceMs)SILENCE=r.silenceMs});
chrome.storage.onChanged.addListener(function(c){if(c.silenceMs)SILENCE=c.silenceMs.newValue});
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
function badge(tabId,t){chrome.action.setBadgeText({tabId:tabId,text:t},function(){void chrome.runtime.lastError})}
function persistSessions(){
  var out={};
  Object.keys(sessions).forEach(function(k){out[k]={site:sessions[k].site,state:sessions[k].state,ts:Date.now()}});
  chrome.storage.local.set({sessions:out});
}
function schedule(tabId,ms){
  var s=sessions[tabId];if(!s)return;
  clearTimeout(s.timer);clearTimeout(s.confirm);
  s.timer=setTimeout(function(){check(tabId)},ms);
}
function check(tabId){
  var s=sessions[tabId];if(!s||s.state!=="generating")return;
  chrome.tabs.sendMessage(tabId,{type:"grab"},function(r1){
    if(chrome.runtime.lastError||!r1){delete sessions[tabId];badge(tabId,"");persistSessions();return}
    if(r1.stop){schedule(tabId,1500);return}
    if(!r1.text){
      s.emptyTries=(s.emptyTries||0)+1;
      if(s.emptyTries<40)schedule(tabId,SILENCE);
      else finish(tabId,r1);
      return;
    }
    s.t1=r1;
    s.confirm=setTimeout(function(){
      chrome.tabs.sendMessage(tabId,{type:"grab"},function(r2){
        if(chrome.runtime.lastError||!r2){schedule(tabId,1500);return}
        if(r2.stop){schedule(tabId,1500);return}
        if(r2.text===s.t1.text)finish(tabId,r2);
        else schedule(tabId,SILENCE);
      });
    },1500);
  });
}
function finish(tabId,r){
  var s=sessions[tabId]||{};
  s.state="idle";
  chrome.tabs.sendMessage(tabId,{type:"reset"},function(){void chrome.runtime.lastError});
  chrome.tabs.sendMessage(tabId,{type:"ping-now"},function(){void chrome.runtime.lastError});
  badge(tabId,"✓");
  chrome.storage.local.set({last:{site:s.site||"AI",text:r.text,blocks:r.blocks||[],ts:Date.now(),tabId:tabId}});
  chrome.notifications.create("vibe-done-"+Date.now(),{
    type:"basic",
    title:"Vibe Sentinel — reply finished",
    message:(s.site||"AI")+" stopped generating. Delivering to VibeBridge inbox.",
    priority:2
  });
  persistSessions();
  chrome.storage.local.get(["autoSend"],function(rr){if(rr.autoSend!==false)handoff(r.text,true)});
}
function handoff(text,auto){
  chrome.storage.local.set({handoff:{text:text||"",auto:!!auto,ts:Date.now()}});
  chrome.tabs.query({url:BRIDGE_BASE+"/*"},function(tabs){
    if(tabs&&tabs.length){
      chrome.tabs.update(tabs[0].id,{active:true});
      if(tabs[0].windowId!=null)chrome.windows.update(tabs[0].windowId,{focused:true});
    }else{
      chrome.tabs.create({url:BRIDGE_BASE+"/"});
    }
  });
}
chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
  var tabId=sender.tab?sender.tab.id:null;
  if(tabId==null)return sendResponse&&sendResponse({ok:true});
  var s=sessions[tabId]||(sessions[tabId]={site:msg.site,state:"idle",emptyTries:0});
  if(msg.type==="state"||msg.type==="tick"){
    s.site=msg.site;s.state="generating";s.emptyTries=0;
    badge(tabId,"…");
    schedule(tabId,SILENCE);
    persistSessions();
  }
  sendResponse&&sendResponse({ok:true});
});
chrome.tabs.onRemoved.addListener(function(tabId){
  if(sessions[tabId]){delete sessions[tabId];persistSessions()}
});
chrome.runtime.onInstalled.addListener(injectAll);
chrome.runtime.onStartup.addListener(injectAll);
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