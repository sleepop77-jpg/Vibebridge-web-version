// Vibe Sentinel: detect generation start/stop on AI chats, grab last reply.
(function(){
  if(window.__vibeSentinel)return;
  window.__vibeSentinel=true;
  var SITE=location.hostname.replace(/^www\./,"");
  var CFG={
    "chatgpt.com":{stop:['button[aria-label="Stop streaming"]','button[data-testid="stop-button"]'],reply:['main [data-message-author-role="assistant"]','main article']},
    "gemini.google.com":{stop:['stop-button','button[aria-label="Stop response"]','.stop-button'],reply:['message-content','.response-content','model-response .markdown']},
    "claude.ai":{stop:['button[aria-label="Stop response"]','button[aria-label="Stop"]'],reply:['.font-claude-message','[data-testid="conversation-turn"] .whitespace-pre-wrap']},
    "chat.qwen.ai":{stop:['button[aria-label="Stop"]','button[class*="stop"]','.stop-btn'],reply:['.message-content','.markdown-body','[class*="messageContent"]']},
    "chat.deepseek.com":{stop:['button[class*="stop"]','.ds-icon-stop'],reply:['[class*="ds-markdown"]']}
  };
  var cfg=CFG[SITE]||{stop:['button[aria-label*="top"]','button[class*="stop"]'],reply:['[class*="message"]','[class*="response"]','article']};
  var state="idle",quietTimer=null,burst=0,silenceMs=3500,cooldown=0;
  chrome.storage.local.get(["silenceMs"],function(r){if(r.silenceMs)silenceMs=r.silenceMs});
  function q(s){try{return document.querySelector(s)}catch(e){return null}}
  function qa(s){try{return document.querySelectorAll(s)}catch(e){return []}}
  function stopVisible(){return cfg.stop.some(function(s){return !!q(s)})}
  function lastReply(){
    for(var i=0;i<cfg.reply.length;i++){
      var n=qa(cfg.reply[i]);
      if(n.length){
        var t=(n[n.length-1].innerText||"").trim();
        if(t.length>40)return t;
      }
    }
    return "";
  }
  function announceDone(){
    var now=Date.now();
    if(now-cooldown<2500)return;
    cooldown=now;
    var text=lastReply();
    chrome.runtime.sendMessage({type:"done",site:SITE,text:text.slice(0,20000)});
    state="idle";burst=0;
    chrome.action.setBadgeText({text:"✓"}).catch(function(){});
  }
  function armQuiet(){
    clearTimeout(quietTimer);
    quietTimer=setTimeout(function(){
      if(state==="generating"&&!stopVisible())announceDone();
      else if(state==="generating")armQuiet();
    },silenceMs);
  }
  function enterGenerating(){
    if(state!=="idle")return;
    state="generating";
    chrome.runtime.sendMessage({type:"state",site:SITE,state:"generating"});
    chrome.action.setBadgeText({text:"…"}).catch(function(){});
    chrome.action.setBadgeBackgroundColor({color:"#7c6cf0"}).catch(function(){});
    armQuiet();
  }
  var mo=new MutationObserver(function(muts){
    burst+=muts.length;
    if(state==="idle"&&(stopVisible()||burst>120))enterGenerating();
    else if(state==="generating")armQuiet();
  });
  mo.observe(document.body||document.documentElement,{childList:true,subtree:true,characterData:true});
  setInterval(function(){burst=0},800);
  setInterval(function(){if(stopVisible()&&state==="idle")enterGenerating()},700);
  chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
    if(msg.type==="ping")sendResponse({site:SITE,state:state});
    if(msg.type==="grab")sendResponse({text:lastReply()});
  });
})();