// API MODE v3: strict chat vs code modes, few-shot anchoring, no android relics. Isolated.
(function(){
  if(window.__vbApi)return;
  window.__vbApi=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  var KEY="vb_api";
  var cfg={provider:"openrouter",key:"",model:"",base:"",on:false,tg:"",tgchat:""};
  try{var s0=JSON.parse(localStorage.getItem(KEY)||"null");if(s0)Object.assign(cfg,s0)}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}}
  var PRESETS={
    openrouter:{base:"https://openrouter.ai/api/v1",m:"qwen/qwen-max",ph:"or-… or sk-or-…"},
    openai:{base:"https://api.openai.com/v1",m:"gpt-4o-mini",ph:"sk-…"},
    anthropic:{base:"https://api.anthropic.com",m:"claude-3-5-haiku-latest",ph:"sk-ant-…"},
    gemini:{base:"https://generativelanguage.googleapis.com",m:"gemini-1.5-flash",ph:"AIza…"},
    groq:{base:"https://api.groq.com/openai/v1",m:"llama-3.3-70b-versatile",ph:"gsk_…"},
    custom:{base:"",m:"model",ph:"key"}
  };
  var SYSTEM="You are VibeBridge's AI companion. You have two strict modes.\n\n"
   +"[CHAT MODE]\n"
   +"If the user greets you, asks a general question, brainstorms, or makes small talk, reply with normal, concise plain text. Do NOT generate code or payloads.\n"
   +"Example: User: 'yo' -> Assistant: 'Hey! What are we building today?'\n"
   +"Example: User: 'how are you?' -> Assistant: 'Doing great, ready to write some code. What do you need?'\n\n"
   +"[CODE MODE]\n"
   +"ONLY if the user explicitly asks for code, features, fixes, or file changes, reply with a bridge payload. No conversational text outside the payload.\n"
   +"Payload format:\n"
   +"===VIBEBRIDGE=== v1\n"
   +"===== FILE: path/to/file =====\n"
   +"(full file content)\n"
   +"OR\n"
   +"===== EDIT: path/to/file =====\n"
   +"--- FIND\n(exact lines)\n--- REPLACE\n(new lines)\n--- END\n\n"
   +"Context: The target repo is a static web app (docs/), chrome extension (extension/), and JavaFX desktop shell (desktop/). Do not hallucinate Android/iOS files unless specifically requested.";
  var hist=[];
  function connected(){return cfg.on&&!!cfg.key&&!!(cfg.base||PRESETS[cfg.provider].base)}
  function readSSE(resp,onData){
    return new Promise(function(res,rej){
      var rd=resp.body.getReader(),dec=new TextDecoder(),buf="";
      function pump(){
        rd.read().then(function(r){
          if(r.done){res();return}
          buf+=dec.decode(r.value,{stream:true});
          var lines=buf.split("\n");buf=lines.pop();
          lines.forEach(function(ln){
            ln=ln.trim();
            if(ln.indexOf("data:")!==0)return;
            onData(ln.slice(5).trim());
          });
          pump();
        }).catch(rej);
      }
      pump();
    });
  }
  function callStream(messages,onDelta){
    var p=PRESETS[cfg.provider]||PRESETS.custom;
    var base=(cfg.base||p.base).replace(/\/+$/,"");
    var model=cfg.model||p.m;
    if(cfg.provider==="anthropic"){
      return fetch(base+"/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":cfg.key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:model,max_tokens:8000,stream:true,system:SYSTEM,messages:messages})})
        .then(function(r){if(!r.ok)return r.text().then(function(t){throw new Error("HTTP "+r.status+" "+t.slice(0,200))});return readSSE(r,function(d){try{var j=JSON.parse(d);if(j.type==="content_block_delta")onDelta((j.delta&&j.delta.text)||"")}catch(e){}})});
    }
    if(cfg.provider==="gemini"){
      var gm=[{role:"user",parts:[{text:SYSTEM+"\n\n--- conversation ---\n"}]}];
      messages.forEach(function(m,i){gm.push({role:m.role==="assistant"?"model":"user",parts:[{text:m.content}]})});
      return fetch(base+"/v1beta/models/"+model+":streamGenerateContent?alt=sse&key="+encodeURIComponent(cfg.key),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({contents:gm})})
        .then(function(r){if(!r.ok)return r.text().then(function(t){throw new Error("HTTP "+r.status+" "+t.slice(0,200))});return readSSE(r,function(d){try{var j=JSON.parse(d);var c=j.candidates||[];(((c[0]||{}).content||{}).parts||[]).forEach(function(pp){onDelta(pp.text||"")})}catch(e){}})});
    }
    var hdrs={"content-type":"application/json","authorization":"Bearer "+cfg.key};
    if(cfg.provider==="openrouter"){hdrs["HTTP-Referer"]=location.origin;hdrs["X-Title"]="VibeBridge"}
    var msgs=[{role:"system",content:SYSTEM}].concat(messages);
    return fetch(base+"/chat/completions",{method:"POST",headers:hdrs,body:JSON.stringify({model:model,messages:msgs,stream:true})})
      .then(function(r){if(!r.ok)return r.text().then(function(t){throw new Error("HTTP "+r.status+" "+t.slice(0,200))});return readSSE(r,function(d){if(d==="[DONE]")return;try{var j=JSON.parse(d);var ch=(j.choices||[])[0];onDelta((ch&&ch.delta&&ch.delta.content)||"")}catch(e){}})});
  }
  var ISPAY=/===VIBEBRIDGE===|===== (FILE|EDIT|DELETE):/;
  function apiSend(){
    var i=document.querySelector("#input");if(!i)return;
    var t=i.value.trim();if(!t)return;
    i.value="";if(window.autoGrow)autoGrow();
    if(t==="/clear"){hist=[];if(window.addNoteBubble)addNoteBubble("conversation memory cleared",false);return}
    if(ISPAY.test(t)){if(window.send)send();return}
    if(window.addUserBubble)addUserBubble(t,false);
    if(window.pushMsg)pushMsg({type:"user",text:t,isCode:false});
    hist.push({role:"user",content:t});
    if(hist.length>16)hist=hist.slice(-16);
    var body=window.assistantRow?assistantRow():null;
    var pre=null;
    if(body){
      body.appendChild(el("div","alabel","API · "+(cfg.model||PRESETS[cfg.provider].m)));
      pre=el("pre","prompttext");pre.style.whiteSpace="pre-wrap";pre.textContent="…";body.appendChild(pre);
    }
    var full="";
    callStream(hist.slice(),function(d){
      full+=d;
      if(pre){pre.textContent=full;pre.scrollTop=pre.scrollHeight}
      if(window.scrollEnd)scrollEnd();
    }).then(function(){
      hist.push({role:"assistant",content:full});
      if(hist.length>16)hist=hist.slice(-16);
      if(ISPAY.test(full)){
        var inp=document.querySelector("#input");
        if(inp&&window.send){inp.value=full;send()}
      }else if(window.pushMsg){
        pushMsg({type:"note",text:full,bad:false});
      }
    }).catch(function(e){
      if(window.addNoteBubble)addNoteBubble("API error: "+e.message,true);
      if(window.pushMsg)pushMsg({type:"note",text:"API error: "+e.message,bad:true});
      say("API error: "+e.message);
    });
  }
  document.addEventListener("click",function(e){
    if(e.target&&e.target.id==="newchat"){hist=[];return}
    if(!connected())return;
    if(e.target&&e.target.id==="send"){e.stopPropagation();e.preventDefault();apiSend()}
  },true);
  document.addEventListener("keydown",function(e){
    if(!connected())return;
    if(e.key==="Enter"&&!e.shiftKey&&document.activeElement&&document.activeElement.id==="input"){e.stopPropagation();e.preventDefault();apiSend()}
  },true);
  function tgPing(text){
    if(!cfg.tg||!cfg.tgchat)return;
    try{
      fetch("https://api.telegram.org/bot"+cfg.tg+"/sendMessage",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:cfg.tgchat,text:"VibeBridge: "+text})}).catch(function(){});
    }catch(e){}
  }
  var flow=document.getElementById("flow");
  if(flow){
    new MutationObserver(function(muts){
      muts.forEach(function(mu){
        Array.prototype.forEach.call(mu.addedNodes,function(n){
          if(!n||n.nodeType!==1)return;
          var st=(n.classList&&n.classList.contains("status"))?n:(n.querySelector?n.querySelector(".status"):null);
          if(st&&/^(CI passed|CI )/.test(st.textContent||""))tgPing(st.textContent);
        });
      });
    }).observe(flow,{childList:true,subtree:true});
  }
  var modal=null;
  function build(){
    var m=E("div","modal");
    var st=document.createElement("style");
    st.textContent=".apim{max-width:460px;width:95%;max-height:90vh;overflow:auto;background:var(--card,#141414);border:1px solid var(--line,#333);border-radius:14px;padding:18px}"
     +".apim h3{color:var(--text,#fff);font-size:14px;margin-bottom:4px}"
     +".apim .help{font-size:10.5px;color:var(--faint,#8a8a8a);margin-bottom:10px}"
     +".apim label{display:block;font-size:10.5px;color:var(--faint,#8a8a8a);margin:8px 0 2px;letter-spacing:.04em;text-transform:uppercase}"
     +".apim select,.apim input{width:100%;background:var(--code,#0e0616);color:var(--text,#ccc);border:1px solid var(--line,#333);border-radius:8px;padding:7px 9px;font-size:12px}"
     +".apimrow{display:flex;gap:8px;align-items:center;margin:10px 0;flex-wrap:wrap}"
     +".apimbtn{border:1px solid var(--line,#333);border-radius:8px;padding:6px 14px;font-size:12px;font-weight:600;color:var(--dim,#aaa);background:var(--code,#111);cursor:pointer}"
     +".apimbtn:hover{color:var(--text,#fff);border-color:var(--accent,#a678d8)}"
     +".apimcheck{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--dim,#aaa);margin:10px 0}";
    m.appendChild(st);
    var card=E("div","apim");
    card.appendChild(E("h3","","AI API"));
    card.appendChild(E("div","help","talk normally — it chats back. ask for repo changes and it switches to payload mode by itself. /clear wipes memory."));
    card.appendChild(E("label","","provider"));
    var sel=document.createElement("select");
    Object.keys(PRESETS).forEach(function(k){var o=document.createElement("option");o.value=k;o.textContent=k;sel.appendChild(o)});
    sel.value=cfg.provider;
    sel.onchange=function(){cfg.provider=sel.value;save();sync()};
    card.appendChild(sel);
    card.appendChild(E("label","","api key"));
    var ki=document.createElement("input");ki.type="password";ki.value=cfg.key;
    ki.oninput=function(){cfg.key=ki.value.trim();save()};
    card.appendChild(ki);
    card.appendChild(E("label","","model"));
    var mi=document.createElement("input");mi.value=cfg.model;mi.placeholder=PRESETS[cfg.provider].m;
    mi.oninput=function(){cfg.model=mi.value.trim();save()};
    card.appendChild(mi);
    card.appendChild(E("label","","base url (leave blank for preset)"));
    var bi=document.createElement("input");bi.value=cfg.base;bi.placeholder=PRESETS[cfg.provider].base;
    bi.oninput=function(){cfg.base=bi.value.trim();save()};
    card.appendChild(bi);
    var chk=E("label","apimcheck");
    var cb=document.createElement("input");cb.type="checkbox";cb.checked=!!cfg.on;
    cb.onchange=function(){cfg.on=cb.checked;save();say(cfg.on?"API mode armed — sends route to "+cfg.provider:"API mode off — prompt-only flow")};
    chk.appendChild(cb);chk.appendChild(document.createTextNode("route sends through API"));
    card.appendChild(chk);
    card.appendChild(E("label","","telegram bot token (optional CI ping)"));
    var ti=document.createElement("input");ti.type="password";ti.value=cfg.tg;
    ti.oninput=function(){cfg.tg=ti.value.trim();save()};
    card.appendChild(ti);
    card.appendChild(E("label","","telegram chat id"));
    var ci=document.createElement("input");ci.value=cfg.tgchat;
    ci.oninput=function(){cfg.tgchat=ci.value.trim();save()};
    card.appendChild(ci);
    var row=E("div","apimrow");
    var test=E("button","apimbtn","Test call");
    test.onclick=function(){
      if(!connected()){say("fill key and arm the toggle first");return}
      test.textContent="calling…";
      callStream([{role:"user",content:"reply with the single word: pong"}],function(){}).then(function(){test.textContent="Test call";say("API reachable — pong")}).catch(function(e){test.textContent="Test call";say("test failed: "+e.message)});
    };
    var close=E("button","apimbtn","Close");
    close.onclick=function(){m.classList.add("hidden")};
    row.appendChild(test);row.appendChild(close);
    card.appendChild(row);
    m.appendChild(card);
    function sync(){mi.placeholder=PRESETS[cfg.provider].m;bi.placeholder=PRESETS[cfg.provider].base;ki.placeholder=PRESETS[cfg.provider].ph}
    sync();
    return m;
  }
  var sb=document.getElementById("sb");
  if(sb&&!document.getElementById("api-side")){
    var b=E("button","sidebtn","AI API");
    b.id="api-side";
    b.onclick=function(){
      if(!modal){modal=build();document.body.appendChild(modal)}
      modal.classList.remove("hidden");
    };
    var foot=sb.querySelector(".sbfoot");
    sb.insertBefore(b,foot||null);
  }
})();