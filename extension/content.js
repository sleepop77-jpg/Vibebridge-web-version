// Vibe Sentinel content v1.10: observer frozen during grab; 1500ms spacing; retry on missed clip.
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
  var soundOn=true,lastTickSent=0,state="idle",burst=0,grabbing=false;
  chrome.storage.local.get(["soundOn"],function(r){if(r.soundOn!==undefined)soundOn=r.soundOn});
  chrome.storage.onChanged.addListener(function(c){if(c.soundOn)soundOn=c.soundOn.newValue});
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
  function findCopyBtn(pre){
    var scope=pre;
    for(var up=0;up<5&&scope;up++){
      var btns=scope.querySelectorAll?scope.querySelectorAll("button"):[];
      for(var b=0;b<btns.length;b++){
        var lab=(btns[b].getAttribute("aria-label")||"")+" "+(btns[b].getAttribute("title")||"")+" "+(btns[b].textContent||"");
        if(/copy|copied/i.test(lab))return btns[b];
      }
      scope=scope.parentElement;
    }
    return null;
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
  function dedupe(raw){
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
  function domBlocks(){
    var node=grabNode();
    if(!node)return [];
    var pres=node.querySelectorAll("pre"),raw=[];
    for(var j=0;j<pres.length;j++){var t=cleanPre(pres[j]);if(t&&t.length>20)raw.push(t)}
    return dedupe(raw);
  }
  function grabBlocksViaCopy(cb){
    grabbing=true;
    var node=grabNode();
    if(!node){grabbing=false;cb(domBlocks());return}
    var pres=node.querySelectorAll("pre");
    if(!pres.length){grabbing=false;cb(domBlocks());return}
    var results=[],idx=0;
    function next(){
      if(idx>=pres.length){
        grabbing=false;
        var clean=results.filter(function(t){return t&&t.length>20});
        cb(clean.length?dedupe(clean):domBlocks());
        return;
      }
      var pre=pres[idx++];
      var btn=findCopyBtn(pre);
      if(!btn){results.push(cleanPre(pre));setTimeout(next,200);return}
      var got=null,retries=0;
      function tryClick(){
        function onClip(e){got=e.detail}
        document.addEventListener("vb-clip",onClip);
        var before=document.documentElement.getAttribute("data-vb-clip-n")||"0";
        try{btn.click()}catch(e){}
        setTimeout(function(){
          document.removeEventListener("vb-clip",onClip);
          var after=document.documentElement.getAttribute("data-vb-clip-n")||"0";
          var txt=got!==null?got:(after!==before?document.documentElement.getAttribute("data-vb-clip"):null);
          if(txt&&txt.length>20){
            results.push(txt);
            setTimeout(next,1500);
          }else if(retries<2){
            retries++;
            setTimeout(tryClick,500);
          }else{
            results.push(cleanPre(pre));
            setTimeout(next,200);
          }
        },1500);
      }
      tryClick();
    }
    next();
  }
  function fullText(){
    var node=grabNode();
    return node?(node.innerText||"").trim():"";
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
    if(grabbing)return;
    burst+=muts.length;
    if(state==="idle"&&(stopVisible()||burst>120)){state="generating";send({type:"state",site:SITE,state:"generating"})}
    if(state==="generating")tick();
  });
  mo.observe(document.body||document.documentElement,{childList:true,subtree:true,characterData:true});
  setInterval(function(){burst=0},800);
  setInterval(function(){if(!grabbing&&stopVisible()&&state==="idle"){state="generating";send({type:"state",site:SITE,state:"generating"})}},700);
  chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
    if(msg.type==="ping")sendResponse({site:SITE,state:state});
    if(msg.type==="grab")sendResponse({text:fullText(),stop:stopVisible()});
    if(msg.type==="grabblocks"){
      grabBlocksViaCopy(function(blocks){sendResponse({blocks:blocks})});
      return true;
    }
    if(msg.type==="ping-now"){ping();sendResponse({ok:true})}
    if(msg.type==="reset"){state="idle";burst=0;sendResponse({ok:true})}
  });
})();