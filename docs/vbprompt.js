// VB PROMPT v2: the master AI-payload contract + copy UI + parser tolerance.
// One source of truth for "the prompt", tuned variants per model family, and a
// parse-tolerance wrapper so fence/quote/bullet-prefixed structural lines still parse.
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
  // ---- parser tolerance: structural lines may arrive fence/quote/bullet-prefixed ----
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
  var modal=null,taEl=null,selEl=null;
  function current(){
    var k=selEl?selEl.value:"master";
    if(k==="master")return MASTER;
    if(k==="short")return SHORT;
    return MASTER+"\n\n"+(TIPS[k]||"");
  }
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
      card.appendChild(E("div","small dim","Paste this at the TOP of any AI chat (or set it as custom instructions / project knowledge). It forces the exact payload grammar VibeBridge parses, with a recovery protocol for hunk-miss reports."));
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
  var pend=null;
  function queue(){clearTimeout(pend);pend=setTimeout(injectBtn,120)}
  if(document.documentElement)new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
  var n=0;var iv=setInterval(function(){n++;injectBtn();if(n>600)clearInterval(iv)},1500);
  injectBtn();
  window.VB_PROMPT=MASTER;
  window.VB_PROMPT_SHORT=SHORT;
  window.vbPrompt={open:open,master:MASTER,short:SHORT,tips:TIPS,copy:copy};
})();