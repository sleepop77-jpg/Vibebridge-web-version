// VB PROMPT v4: contract + copy UI + parser tolerance + /format commands
// + ☢ WIPE ALL DATA (in-website warning modal, type-to-confirm, no browser dialogs).
(function(){
  if(window.__vbPrompt)return;
  window.__vbPrompt=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  var L=[];
  L.push("VIBEBRIDGE PAYLOAD CONTRACT v2 — you are a code-delivery engine.");
  L.push("Your reply MUST be a machine-parsable VibeBridge payload. Prose is forbidden except ONE optional first sentence.");
  L.push("");
  L.push("STRICT OUTPUT RULES:");
  L.push("1. First line exactly: ===VIBEBRIDGE=== v2");
  L.push("2. Then operation blocks. Only these three kinds exist:");
  L.push("   ===== FILE: <path> =====");
  L.push("   <the COMPLETE file content, verbatim, nothing omitted>");
  L.push("   ===== EDIT: <path> =====");
  L.push("   --- FIND");
  L.push("   <exact contiguous lines copied CHARACTER-FOR-CHARACTER from the current file>");
  L.push("   --- REPLACE");
  L.push("   <the replacement lines>");
  L.push("   --- END");
  L.push("   ===== DELETE: <path> =====");
  L.push("3. Every EDIT block MUST end with --- END. Never omit it.");
  L.push("4. Paths are repo-root-relative, slash-separated, no leading slash, no quotes, no spaces-around-colon.");
  L.push("5. NO markdown fences around or inside the payload, NO line numbers, NO smart quotes, NO trailing commentary, NO summaries after the last block.");
  L.push("6. FILE content must be COMPLETE. Forbidden tokens: \"...\", \"// rest unchanged\", \"[omitted]\", \"same as before\". If you cannot emit the whole file, use EDIT blocks instead.");
  L.push("7. EDIT FIND lines must be copied verbatim from the file content you were given, including exact indentation and blank lines. If you do not have the exact current lines, ASK for the file instead of guessing.");
  L.push("8. Keep each FIND small but UNIQUE (3-12 lines) and include at least one anchor line that cannot appear twice in the file.");
  L.push("9. Scattered changes = multiple EDIT blocks. Never one giant FIND spanning unrelated regions.");
  L.push("10. One block per concern; later blocks on the same path apply in order.");
  L.push("");
  L.push("SILENT SELF-CHECK before sending: sentinel present? every EDIT has FIND+REPLACE+END? every FILE complete? paths valid? zero prose inside blocks? zero fences?");
  L.push("");
  L.push("EXACT SHAPE EXAMPLE:");
  L.push("===VIBEBRIDGE=== v2");
  L.push("===== EDIT: docs/style.css =====");
  L.push("--- FIND");
  L.push(" #composerwrap{padding:0 20px 76px}");
  L.push("--- REPLACE");
  L.push(" #composerwrap{padding:0 20px 16px}");
  L.push("--- END");
  L.push("===== FILE: docs/hello.js =====");
  L.push("console.log(\"hi\");");
  L.push("===== DELETE: docs/old.js =====");
  L.push("");
  L.push("RECOVERY PROTOCOL: if the human pastes a HUNK MISS REPORT, reply ONLY with corrected ops whose FIND lines are verbatim copies of the file content they provide, or convert that path to a full FILE op using content they provided. Never re-guess.");
  var MASTER=L.join("\n");
  var SHORT="===VIBEBRIDGE=== v2 then ONLY operation blocks (===== FILE:/EDIT:/DELETE: with --- FIND/--- REPLACE/--- END for edits). Complete files, verbatim FIND lines, no fences, no prose, no truncation.";
  var TIPS={
    "claude":"Claude addendum: emit COMPLETE files; never elide or summarize; if a file is huge, split across multiple FILE ops only when explicitly asked.",
    "chatgpt":"ChatGPT addendum: do NOT wrap the payload in ``` code fences; emit the raw lines exactly.",
    "gemini":"Gemini addendum: FIND blocks must be verbatim copies; do not paraphrase, reindent, or 'clean' them.",
    "qwen-deepseek-grok":"Addendum: output ZERO explanatory sentences; payload only, starting at the sentinel line."
  };
  if(window.parsePayload&&!window.__vbPromptTol){
    window.__vbPromptTol=true;
    var origPP=window.parsePayload;
    window.parsePayload=function(text){
      var norm=String(text).split("\n").map(function(line){
        var stripped=line.replace(/^[\s>`*]+/,"");
        if(/^\s*={3,}\s*VIBEBRIDGE/i.test(stripped))return stripped;
        if(/^\s*={4,}\s*(FILE|EDIT|DELETE)\s*:/i.test(stripped))return stripped;
        if(/^\s*---\s*(FIND|REPLACE|END)\s*$/i.test(stripped))return stripped;
        return line;
      }).join("\n");
      return origPP(norm);
    };
  }
  function resolve(key){
    key=(key||"master").toLowerCase();
    if(key==="short"||key==="s")return SHORT;
    if(key==="claude")return MASTER+"\n\n"+TIPS["claude"];
    if(key==="gpt"||key==="chatgpt"||key==="openai")return MASTER+"\n\n"+TIPS["chatgpt"];
    if(key==="gemini")return MASTER+"\n\n"+TIPS["gemini"];
    if(key==="qwen"||key==="deepseek"||key==="grok")return MASTER+"\n\n"+TIPS["qwen-deepseek-grok"];
    return MASTER;
  }
  function hookComposer(){
    var inp=document.getElementById("input");
    if(!inp||inp.dataset.slashHooked)return;
    inp.dataset.slashHooked="1";
    inp.addEventListener("keydown",function(e){
      if(e.key!=="Enter"||e.shiftKey)return;
      var v=(inp.value||"").trim();
      var m=/^\/(format|prompt)(?:\s+([a-z-]+))?$/i.exec(v);
      if(m){
        e.preventDefault();e.stopPropagation();
        inp.value=resolve(m[2]);
        say("format contract loaded — copy it or send it");
        try{inp.select()}catch(err){}
        return;
      }
      if(/^\/copyformat$/i.test(v)){
        e.preventDefault();e.stopPropagation();
        navigator.clipboard.writeText(resolve("master"));
        say("format contract copied to clipboard");
        inp.value="";
        return;
      }
      if(/^\/help$/i.test(v)){
        e.preventDefault();e.stopPropagation();
        say("/format [short|claude|gpt|gemini|qwen] · /copyformat · /help");
        return;
      }
    },true);
  }
  var modal=null,taEl=null,selEl=null;
  function current(){return resolve(selEl?selEl.value:"master")}
  function copy(){
    navigator.clipboard.writeText(current());
    say("prompt copied — paste it at the top of your AI chat");
  }
  function open(){
    if(!modal){
      modal=E("div","modal hidden");
      modal.style.zIndex="1200";
      var card=E("div","modalcard");
      card.style.maxWidth="700px";
      card.appendChild(E("h3","","VibeBridge AI prompt"));
      card.appendChild(E("div","small dim","Paste this at the TOP of any AI chat (or set as custom instructions). In the composer: /format, /format short, /format claude… , /copyformat, /help."));
      selEl=document.createElement("select");
      selEl.style.cssText="margin:10px 0;background:var(--code,#0d1117);color:var(--text,#e6edf3);border:1px solid var(--line,#30363d);border-radius:6px;padding:5px 8px;font-size:12px";
      [["master","Master contract (recommended)"],["short","One-liner (tiny context windows)"],["claude","Master + Claude tuning"],["chatgpt","Master + ChatGPT tuning"],["gemini","Master + Gemini tuning"],["qwen-deepseek-grok","Master + Qwen/DeepSeek/Grok tuning"]].forEach(function(o){
        var op=document.createElement("option");op.value=o[0];op.textContent=o[1];selEl.appendChild(op);
      });
      selEl.onchange=function(){taEl.value=current()};
      card.appendChild(selEl);
      taEl=document.createElement("textarea");
      taEl.readOnly=true;
      taEl.style.cssText="width:100%;height:46vh;background:var(--code,#0d1117);color:var(--text,#e6edf3);border:1px solid var(--line,#30363d);border-radius:8px;padding:10px;font:11px/1.55 ui-monospace,Menlo,Consolas,monospace";
      taEl.value=MASTER;
      card.appendChild(taEl);
      var row=E("div","cardbtns");
      function btn(t,fn,cls){var b=E("button",cls||"mini",t);b.style.cssText="border-radius:2px;padding:3px 10px;font-size:10.5px";b.onclick=fn;return b}
      row.appendChild(btn("📋 Copy prompt",copy,"green"));
      row.appendChild(btn("Close",function(){modal.classList.add("hidden")}));
      card.appendChild(row);
      modal.appendChild(card);
      document.body.appendChild(modal);
    }
    modal.classList.remove("hidden");
  }
  function injectBtn(){
    var tb=document.querySelector(".sk-tree-toolbar");
    if(!tb)return;
    if(document.getElementById("vbp-btn"))return;
    var b=E("button","","📋 prompt");
    b.id="vbp-btn";
    b.onclick=function(){open()};
    tb.appendChild(b);
  }
  // ---------------- WIPE ALL DATA ----------------
  var wipeModal=null,wipeInput=null,wipeGo=null;
  function wipeList(){
    return [
      "saved PATs & connections (sidebar, multi-repo projects, backup flow)",
      "this-PC VFS projects & files (IndexedDB studio storage)",
      "staged github edits, studio tabs & project bindings",
      "push history & histdel deletion log",
      "chats, composer history & saved conversations",
      "skins, flags, caches & service workers"
    ];
  }
  function buildWipe(){
    wipeModal=E("div","modal hidden");
    wipeModal.style.zIndex="1300";
    var card=E("div","modalcard");
    card.style.maxWidth="540px";
    card.style.borderColor="#f85149";
    var h=E("h3","","☢ WIPE ALL DATA");
    h.style.color="#f85149";
    card.appendChild(h);
    card.appendChild(E("div","small dim","This erases EVERYTHING VibeBridge stored in this browser. Your GitHub repositories and their files are NOT touched — only local data. This cannot be undone."));
    var ul=E("div","");
    ul.style.cssText="margin:10px 0;font:11px/1.7 ui-monospace,Menlo,Consolas,monospace;color:var(--dim,#8b949e)";
    wipeList().forEach(function(x){ul.appendChild(E("div","","• "+x))});
    card.appendChild(ul);
    wipeInput=document.createElement("input");
    wipeInput.placeholder="type WIPE to confirm";
    wipeInput.style.cssText="width:100%;background:var(--code,#0d1117);color:var(--text,#e6edf3);border:1px solid #f85149;border-radius:6px;padding:8px;font:12px ui-monospace,Menlo,Consolas,monospace;margin-bottom:10px";
    wipeInput.oninput=function(){wipeGo.disabled=wipeInput.value.trim()!=="WIPE"};
    card.appendChild(wipeInput);
    var row=E("div","cardbtns");
    wipeGo=E("button","","☢ Wipe everything");
    wipeGo.style.cssText="background:#f85149;border:1px solid #f85149;color:#fff;border-radius:2px;padding:4px 12px;font-size:11px;font-weight:700;cursor:pointer";
    wipeGo.disabled=true;
    wipeGo.onclick=doWipe;
    var cancel=E("button","mini","Cancel");
    cancel.style.cssText="border-radius:2px;padding:4px 12px;font-size:11px";
    cancel.onclick=function(){wipeModal.classList.add("hidden")};
    row.appendChild(wipeGo);row.appendChild(cancel);
    card.appendChild(row);
    wipeModal.appendChild(card);
    document.body.appendChild(wipeModal);
  }
  function openWipe(){
    if(!wipeModal)buildWipe();
    wipeInput.value="";
    wipeGo.disabled=true;
    wipeModal.classList.remove("hidden");
    setTimeout(function(){wipeInput.focus()},60);
  }
  function doWipe(){
    try{localStorage.clear()}catch(e){}
    try{sessionStorage.clear()}catch(e){}
    function dropDBs(cb){
      if(window.indexedDB&&indexedDB.databases){
        indexedDB.databases().then(function(list){
          (list||[]).forEach(function(d){if(d&&d.name){try{indexedDB.deleteDatabase(d.name)}catch(e){}}});
          cb();
        }).catch(function(){try{indexedDB.deleteDatabase("vb_studio")}catch(e){}cb()});
      }else{
        try{indexedDB.deleteDatabase("vb_studio")}catch(e){}
        cb();
      }
    }
    dropDBs(function(){
      if(window.caches&&caches.keys){caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k)})}).catch(function(){})}
      if(navigator&&navigator.serviceWorker&&navigator.serviceWorker.getRegistrations){
        navigator.serviceWorker.getRegistrations().then(function(rs){(rs||[]).forEach(function(r){try{r.unregister()}catch(e){})})}).catch(function(){});
      }
      if(wipeModal)wipeModal.classList.add("hidden");
      say("all local data wiped — reloading…");
      setTimeout(function(){location.reload()},900);
    });
  }
  function injectWipe(){
    var menu=document.querySelector(".sk-menu");
    if(menu&&!document.getElementById("wipe-menu-btn")){
      var b=E("button","","☢ Wipe data");
      b.id="wipe-menu-btn";
      b.style.color="#b3402e";
      b.onclick=function(e){e.stopPropagation();openWipe()};
      menu.appendChild(b);
    }
    var opcard=document.getElementById("vbop-card");
    if(opcard&&!document.getElementById("wipe-op-btn")){
      var row=E("div","cardbtns");
      var b2=E("button","mini","☢ Wipe all data");
      b2.id="wipe-op-btn";
      b2.style.cssText="border-radius:2px;padding:2px 9px;font-size:10px;color:#b3402e;border-color:#b3402e";
      b2.onclick=function(e){e.stopPropagation();openWipe()};
      row.appendChild(b2);
      opcard.appendChild(row);
    }
    var sb=document.getElementById("sb");
    if(sb&&!menu&&!document.getElementById("wipe-sb-btn")){
      var b3=E("button","sidebtn","☢ Wipe data");
      b3.id="wipe-sb-btn";
      b3.style.color="#b3402e";
      b3.onclick=function(e){e.stopPropagation();openWipe()};
      var foot=sb.querySelector(".sbfoot");
      sb.insertBefore(b3,foot||null);
    }
  }
  var pend=null;
  function queue(){clearTimeout(pend);pend=setTimeout(function(){injectBtn();hookComposer();injectWipe()},120)}
  if(document.documentElement)new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
  var n=0;var iv=setInterval(function(){n++;injectBtn();hookComposer();injectWipe();if(n>600)clearInterval(iv)},1500);
  injectBtn();hookComposer();injectWipe();
  window.VB_PROMPT=MASTER;
  window.VB_PROMPT_SHORT=SHORT;
  window.vbPrompt={open:open,master:MASTER,short:SHORT,tips:TIPS,copy:copy,resolve:resolve};
  window.vbWipeData={open:openWipe,wipe:doWipe};
})();