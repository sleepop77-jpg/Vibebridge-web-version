// Vibe Sentinel content v1.6: heartbeats only; lossless code capture (no DOM surgery).
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
  var captureMode="full",soundOn=true,lastTickSent=0,state="idle",burst=0;
  chrome.storage.local.get(["captureMode","soundOn"],function(r){if(r.captureMode)captureMode=r.captureMode;if(r.soundOn!==undefined)soundOn=r.soundOn});
  chrome.storage.onChanged.addListener(function(c){if(c.captureMode)captureMode=c.captureMode.newValue;if(c.soundOn)soundOn=c.soundOn.newValue});
  function q(s){try{return document.querySelector(s)}catch(e){return null}}
  function qa(s){try{return document.querySelectorAll(s)}catch(e){return []}}
  function stopVisible(){return cfg.stop.some(function(s){return !!q(s)})}
  function send(m){try{chrome.runtime.sendMessage(m)}catch(e){}}
  function cleanPre(pre){
    var code=pre.querySelector("code");
    var t=((code||pre).innerText||"").replace(/\u00a0/g," ");
    var lines=t.split("\n");
    var pure=lines.filter(function(l){return /^\d+$/.test(l.trim())});
    if(pure.length>=3){
      var prev=-1,keep=[];
      for(var i=0;i<lines.length;i++){
        var tr=lines[i].trim();
        if(/^\d+$/.test(tr)){
          var n=parseInt(tr,10);
          if(prev===-1||n===prev+1){prev=n;continue}
        }
        keep.push(lines[i]);
      }
      lines=keep;
    }
    return lines.join("\n").trim();
  }
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
  function blocksOf(node){
    if(!node)return [];
    var pres=node.querySelectorAll("pre"),raw=[];
    for(var j=0;j<pres.length;j++){var t=cleanPre(pres[j]);if(t&&t.length>20)raw.push(t)}
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
  function tick(){
    var n=Date.now();
    if(n-lastTickSent<400)return;
    lastTickSent=n;
    send({type:"tick",site:SITE});
  }
  var mo=new MutationObserver(function(muts){
    burst+=muts.length;
    if(state==="idle"&&(stopVisible()||burst>120)){state="generating";send({type:"state",site:SITE,state:"generating"})}
    if(state==="generating")tick();
  });
  mo.observe(document.body||document.documentElement,{childList:true,subtree:true,characterData:true});
  setInterval(function(){burst=0},800);
  setInterval(function(){if(stopVisible()&&state==="idle"){state="generating";send({type:"state",site:SITE,state:"generating"})}},700);
  chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
    if(msg.type==="ping")sendResponse({site:SITE,state:state});
    if(msg.type==="grab")sendResponse({text:lastReply(),blocks:blocksOf(grabNode()),stop:stopVisible()});
    if(msg.type==="ping-now"){ping();sendResponse({ok:true})}
    if(msg.type==="reset"){state="idle";burst=0;sendResponse({ok:true})}
  });
})();