// Vibe Sentinel content script v3: stable completion, ping sound, code-block extraction.
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
  var state="idle",quietTimer=null,confirmTimer=null,burst=0,silenceMs=3500,cooldown=0,captureMode="full",emptyTries=0,baseText="",soundOn=true;
  chrome.storage.local.get(["silenceMs","captureMode","soundOn"],function(r){
    if(r.silenceMs)silenceMs=r.silenceMs;
    if(r.captureMode)captureMode=r.captureMode;
    if(r.soundOn!==undefined)soundOn=r.soundOn;
  });
  chrome.storage.onChanged.addListener(function(c){
    if(c.captureMode)captureMode=c.captureMode.newValue;
    if(c.silenceMs)silenceMs=c.silenceMs.newValue;
    if(c.soundOn)soundOn=c.soundOn.newValue;
  });
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
  function cleanPre(pre){
    var clone=pre.cloneNode(true);
    var gut=clone.querySelectorAll("[class*='line-number'],[class*='lineno'],[class*='gutter'],[class*='index'],[class*='toolbar'],[class*='header'],[class*='copy'],button");
    for(var k=0;k<gut.length;k++){if(gut[k].parentNode)gut[k].parentNode.removeChild(gut[k])}
    var code=clone.querySelector("code");
    var t=((code||clone).innerText||"").replace(/\u00a0/g," ").trim();
    return t;
  }
  function blocksOf(node){
    if(!node)return [];
    var pres=node.querySelectorAll("pre");
    var raw=[];
    for(var j=0;j<pres.length;j++){
      var t=cleanPre(pres[j]);
      if(t&&t.length>20)raw.push(t);
    }
    var out=[];
    for(var a=0;a<raw.length;a++){
      var dup=false;
      for(var b=0;b<raw.length;b++){
        if(a!==b&&raw[b].length>raw[a].length&&raw[b].indexOf(raw[a].slice(0,120))>=0)dup=true;
      }
      if(!dup)out.push(raw[a]);
    }
    return out;
  }
  function lastReply(){
    var node=grabNode();
    if(!node)return "";
    if(captureMode!=="full"){
      var b=blocksOf(node);
      if(b.length)return captureMode==="lastcode"?b[b.length-1]:b.join("\n\n");
    }
    return (node.innerText||"").trim();
  }
  function ping(){
    if(!soundOn)return;
    try{
      var AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return;
      var ctx=ping._ctx||(ping._ctx=new AC());
      if(ctx.state==="suspended")ctx.resume();
      var t0=ctx.currentTime;
      [[880,0],[1318.5,0.12]].forEach(function(p){
        var o=ctx.createOscillator(),g=ctx.createGain();
        o.type="sine";o.frequency.value=p[0];
        g.gain.setValueAtTime(0.0001,t0+p[1]);
        g.gain.exponentialRampToValueAtTime(0.25,t0+p[1]+0.02);
        g.gain.exponentialRampToValueAtTime(0.0001,t0+p[1]+0.25);
        o.connect(g);g.connect(ctx.destination);
        o.start(t0+p[1]);o.stop(t0+p[1]+0.3);
      });
    }catch(e){}
  }
  function announce(text){
    var now=Date.now();
    if(now-cooldown<2500)return;
    cooldown=now;
    var node=grabNode();
    chrome.runtime.sendMessage({type:"done",site:SITE,text:(text||"").slice(0,20000),blocks:blocksOf(node)});
    ping();
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