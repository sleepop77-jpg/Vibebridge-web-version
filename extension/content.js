// Vibe Sentinel content script v2: stability-confirmed completion, thinking-patience, capture modes, robust grab.
(function(){
  if(window.__vibeSentinel)return;
  window.__vibeSentinel=true;
  var SITE=location.hostname.replace(/^www\./,"");
  var CFG={
    "chatgpt.com":{stop:['button[aria-label="Stop streaming"]','button[data-testid="stop-button"]'],reply:['main [data-message-author-role="assistant"]','main article']},
    "gemini.google.com":{stop:['stop-button','button[aria-label="Stop response"]','.stop-button'],reply:['message-content','.response-content','model-response .markdown']},
    "claude.ai":{stop:['button[aria-label="Stop response"]','button[aria-label="Stop"]'],reply:['.font-claude-message','[data-testid="conversation-turn"] .whitespace-pre-wrap']},
    "chat.qwen.ai":{stop:['button[aria-label="Stop"]','button[class*="stop"]','.stop-btn'],reply:['.message-content','.markdown-body','[class*="messageContent"]','[class*="message-content"]','[class*="chat-message"]','[class*="answer"]']},
    "chat.deepseek.com":{stop:['button[class*="stop"]','.ds-icon-stop'],reply:['[class*="ds-markdown"]']}
  };
  var GENERIC=['[class*="message"]','[class*="answer"]','[class*="response"]','[class*="markdown"]','article'];
  var cfg=CFG[SITE]||{stop:['button[aria-label*="top"]','button[class*="stop"]'],reply:GENERIC};
  var state="idle",quietTimer=null,confirmTimer=null,burst=0,silenceMs=3500,cooldown=0,captureMode="full",emptyTries=0,baseText="";
  chrome.storage.local.get(["silenceMs","captureMode"],function(r){if(r.silenceMs)silenceMs=r.silenceMs;if(r.captureMode)captureMode=r.captureMode});
  chrome.storage.onChanged.addListener(function(c){if(c.captureMode)captureMode=c.captureMode.newValue;if(c.silenceMs)silenceMs=c.silenceMs.newValue});
  function q(s){try{return document.querySelector(s)}catch(e){return null}}
  function qa(s){try{return document.querySelectorAll(s)}catch(e){return []}}
  function stopVisible(){return cfg.stop.some(function(s){return !!q(s)})}
  function grabNode(){
    var lists=[cfg.reply,GENERIC];
    for(var L=0;L<lists.length;L++){
      for(var i=0;i<lists[L].length;i++){
        var n=qa(lists[L][i]);
        if(n.length)return n[n.length-1];
      }
    }
    return null;
  }
  function lastReply(){
    var node=grabNode();
    if(!node)return "";
    if(captureMode!=="full"){
      var pres=node.querySelectorAll("pre, [class*='code-block'], [class*='codeblock']");
      if(pres.length){
        if(captureMode==="lastcode")return (pres[pres.length-1].innerText||"").trim();
        var out=[];
        for(var j=0;j<pres.length;j++){var t2=(pres[j].innerText||"").trim();if(t2)out.push(t2)}
        if(out.length)return out.join("\n\n");
      }
    }
    return (node.innerText||"").trim();
  }
  function announce(text){
    var now=Date.now();
    if(now-cooldown<2500)return;
    cooldown=now;
    chrome.runtime.sendMessage({type:"done",site:SITE,text:(text||"").slice(0,20000)});
    state="idle";burst=0;emptyTries=0;
  }
  function armQuiet(){
    clearTimeout(quietTimer);
    quietTimer=setTimeout(onSilence,silenceMs);
  }
  function onSilence(){
    if(state!=="generating")return;
    if(stopVisible()){armQuiet();return}
    var t1=lastReply();
    if(!t1){
      emptyTries++;
      if(emptyTries<40)armQuiet();
      else announce("");
      return;
    }
    if(t1===baseText){state="idle";burst=0;return}
    clearTimeout(confirmTimer);
    confirmTimer=setTimeout(function(){
      if(state!=="generating")return;
      if(stopVisible()){armQuiet();return}
      var t2=lastReply();
      if(t2===t1)announce(t2);
      else armQuiet();
    },1500);
  }
  function enterGenerating(){
    if(state!=="idle")return;
    state="generating";emptyTries=0;baseText=lastReply();
    chrome.runtime.sendMessage({type:"state",site:SITE,state:"generating"});
    armQuiet();
  }
  var mo=new MutationObserver(function(muts){
    burst+=muts.length;
    if(state==="idle"&&(stopVisible()||burst>120))enterGenerating();
    else if(state==="generating"){clearTimeout(confirmTimer);armQuiet();}
  });
  mo.observe(document.body||document.documentElement,{childList:true,subtree:true,characterData:true});
  setInterval(function(){burst=0},800);
  setInterval(function(){if(stopVisible()&&state==="idle")enterGenerating()},700);
  chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
    if(msg.type==="ping")sendResponse({site:SITE,state:state});
    if(msg.type==="grab")sendResponse({text:lastReply()});
  });
})();