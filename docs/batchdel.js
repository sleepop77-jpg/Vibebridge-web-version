// BATCHDEL v1: introduces "====delete" into the payload protocol AND the Studio tool,
// plus a safe repo-cleanup scanner that only offers files that ACTUALLY exist.
(function(){
  if(window.__vbBatchDel)return;
  window.__vbBatchDel=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  // ---- 1) protocol alias: ====delete / ==== DELETE / =====delete etc. now parse ----
  if(window.parsePayload&&!window.__vbDelAlias){
    window.__vbDelAlias=true;
    var origPP=window.parsePayload;
    window.parsePayload=function(text){
      var norm=String(text).split("\n").map(function(l){
        var m=/^\s*={4,}\s*(delete|file|edit)\s*:\s*(.+?)\s*={0,}\s*$/i.exec(l);
        if(m)return "===== "+m[1].toUpperCase()+": "+m[2]+" =====";
        return l;
      }).join("\n");
      return origPP(norm);
    };
  }
  function conn(){
    var r=(document.getElementById("repo")||{}).value||"";
    var b=(document.getElementById("branch")||{}).value||"";
    var p=(document.getElementById("pat")||{}).value||"";
    if(!r||!p){try{var s=JSON.parse(localStorage.getItem("vb")||"{}");r=r||s.r||"";p=p||s.p||"";b=b||s.b||""}catch(e){}}
    var parts=String(r).split("/");
    return {repo:r,owner:parts[0]||"",name:parts[1]||"",branch:b||"main",pat:p};
  }
  function fetchTree(){
    var c=conn();
    return window.api("GET","/repos/"+c.owner+"/"+c.name+"/git/ref/heads/"+c.branch)
      .then(function(ref){return window.api("GET","/repos/"+c.owner+"/"+c.name+"/git/commits/"+ref.object.sha)})
      .then(function(com){return window.api("GET","/repos/"+c.owner+"/"+c.name+"/git/trees/"+com.tree.sha+"?recursive=1")})
      .then(function(tr){
        var out=[];
        (tr.tree||[]).forEach(function(e){if(e.type==="blob")out.push(e.path)});
        return out;
      });
  }
  function fetchIndex(){
    var c=conn();
    return window.api("GET","/repos/"+c.owner+"/"+c.name+"/contents/docs/index.html?ref="+c.branch).then(function(m){
      try{return decodeURIComponent(escape(atob(String(m.content).replace(/\s/g,""))))}catch(e){return atob(String(m.content).replace(/\s/g,""))}
    });
  }
  var SUPERSEDED={
    "studiooptions.js":"optpanel.js",
    "histdel.js":"ghdel.js"
  };
  var KEEP=["github.js","app.js","checks.js","os.js","theme.js","skin.js","stars.js","brand.js","svgchat.js","ctxmenu.js","onboard.js","apimode.js","attach.js","zipmd.js","imgpush.js","studio.js"];
  var modal=null,taEl=null,listEl=null,indexContent="";
  function scan(){
    var c=conn();
    if(!c.repo||!c.pat){say("connect first");return}
    listEl.innerHTML="";
    listEl.appendChild(E("div","small dim","scanning "+c.repo+"…"));
    Promise.all([fetchTree(),fetchIndex()]).then(function(res){
      var paths=res[0];indexContent=res[1];
      var referenced={};
      var re=/src="([^"?]+)(\?[^"]*)?"/g;var m;
      while((m=re.exec(indexContent)))referenced[m[1]]=1;
      var present={};paths.forEach(function(p){present[p]=1});
      var cands=[];
      paths.forEach(function(p){
        var name=p.replace(/^docs\//,"");
        if(/^docs\/[^/]+\.js$/.test(p)&&KEEP.indexOf(name)===-1&&!referenced[name]){
          cands.push({path:p,why:"script not referenced by index.html"});
        }
      });
      Object.keys(SUPERSEDED).forEach(function(oldName){
        var newer=SUPERSEDED[oldName];
        if(present["docs/"+oldName]&&present["docs/"+newer]&&!referenced[oldName]){
          cands.push({path:"docs/"+oldName,why:"superseded by "+newer});
        }else if(present["docs/"+oldName]&&present["docs/"+newer]){
          cands.push({path:"docs/"+oldName,why:"duplicate of "+newer+" (both loaded)"});
        }
      });
      paths.forEach(function(p){
        if(/^app\//.test(p))cands.push({path:p,why:"android relic (not used by web/desktop)"});
      });
      listEl.innerHTML="";
      if(!cands.length){listEl.appendChild(E("div","small dim","no useless files detected — repo looks clean"));return}
      cands.forEach(function(cd){
        var row=E("label","");
        row.style.cssText="display:flex;gap:8px;align-items:center;font:11px/1.5 ui-monospace,Menlo,Consolas,monospace;color:var(--dim,#8b949e);padding:4px 6px;border:1px solid var(--line,#30363d);border-radius:6px;margin-bottom:5px;cursor:pointer";
        var cb=document.createElement("input");cb.type="checkbox";cb.checked=true;cb.value=cd.path;
        row.appendChild(cb);
        var t=E("span","",cd.path);
        t.style.cssText="color:var(--accent,#4493f8);font-weight:700";
        row.appendChild(t);
        row.appendChild(E("span","","— "+cd.why));
        listEl.appendChild(row);
      });
    }).catch(function(e){
      listEl.innerHTML="";
      listEl.appendChild(E("div","small dim","scan failed: "+e.message));
    });
  }
  function runDelete(){
    var boxes=listEl?listEl.querySelectorAll("input[type=checkbox]"):[];
    var picked=[];
    Array.prototype.forEach.call(boxes,function(b){if(b.checked)picked.push(b.value)});
    var extra=(taEl.value||"").split("\n").map(function(l){
      var m=/^\s*={0,}\s*(====\s*delete\s*:?|delete\s*:?)\s*(.+?)\s*$/i.exec(l);
      if(m)return m[2].trim();
      var t=l.trim();
      return t&&t.indexOf(" ")===-1?t:"";
    }).filter(function(p){return p&&picked.indexOf(p)===-1});
    picked=picked.concat(extra);
    if(!picked.length){say("nothing selected");return}
    if(!confirm("⚠ DELETE "+picked.length+" FILE(S) FROM GITHUB\n\n"+picked.slice(0,10).join("\n")+(picked.length>10?("\n…+"+(picked.length-10)+" more"):"")+"\n\nTheir <script> tags will also be removed from index.html in the same commit.\nLogged in histdel.\n\nContinue?"))return;
    var ops=picked.map(function(p){return {kind:"DELETE",path:p}});
    var hunks=[];
    picked.forEach(function(p){
      var name=p.replace(/^docs\//,"");
      var idx=indexContent.indexOf('src="'+name+'"');
      if(idx>=0&&/^docs\//.test(p)){
        var ls=indexContent.lastIndexOf("\n",idx)+1;
        var le=indexContent.indexOf("\n",idx);
        if(le>ls)hunks.push({find:indexContent.slice(ls,le),replace:""});
      }
    });
    if(hunks.length)ops.push({kind:"EDIT",path:"docs/index.html",hunks:hunks});
    say("committing cleanup of "+picked.length+" file(s)…");
    window.commitOps(ops,"cleanup: remove "+picked.length+" unused file(s) via ====delete").then(function(cm){
      var a=[];try{a=JSON.parse(localStorage.getItem("vb_histdel")||"[]")}catch(e){}
      picked.forEach(function(p){a.unshift({path:p,repo:conn().repo,branch:conn().branch,sha:cm.sha,ts:Date.now(),content:null,restored:null,cleanup:true})});
      try{localStorage.setItem("vb_histdel",JSON.stringify(a.slice(0,60)))}catch(e){}
      say("cleaned "+picked.length+" file(s) → "+String(cm.sha).slice(0,7));
      if(window.vbStudioEdit&&window.vbStudioEdit.refreshTree)window.vbStudioEdit.refreshTree();
      if(modal)modal.classList.add("hidden");
    }).catch(function(e){say("cleanup failed: "+e.message)});
  }
  function open(){
    if(!modal){
      modal=E("div","modal hidden");
      modal.style.zIndex="1200";
      var card=E("div","modalcard");
      card.style.maxWidth="640px";
      card.appendChild(E("h3","","====delete — batch remove & repo cleanup"));
      card.appendChild(E("div","small dim","Paste lines like  ====delete docs/old.js  (or plain paths), and/or scan the repo for unreferenced scripts, duplicates and relics. Everything is confirmed before committing."));
      taEl=document.createElement("textarea");
      taEl.style.cssText="width:100%;height:90px;margin:10px 0;background:var(--code,#0d1117);color:var(--text,#e6edf3);border:1px solid var(--line,#30363d);border-radius:8px;padding:8px;font:11px/1.5 ui-monospace,Menlo,Consolas,monospace";
      taEl.placeholder="====delete docs/old-file.js\ndocs/another.js";
      card.appendChild(taEl);
      listEl=E("div","");
      listEl.style.cssText="max-height:40vh;overflow:auto;margin:0 0 10px";
      card.appendChild(listEl);
      var row=E("div","cardbtns");
      function btn(t,fn,cls){var b=E("button",cls||"mini",t);b.style.cssText="border-radius:2px;padding:3px 10px;font-size:10.5px";b.onclick=fn;return b}
      row.appendChild(btn("Scan repo for useless files",scan));
      row.appendChild(btn("Delete selected",runDelete,"green"));
      var cls2=E("button","mini","Close");
      cls2.style.cssText="border-radius:2px;padding:3px 10px;font-size:10.5px";
      cls2.onclick=function(){modal.classList.add("hidden")};
      row.appendChild(cls2);
      card.appendChild(row);
      modal.appendChild(card);
      document.body.appendChild(modal);
    }
    modal.classList.remove("hidden");
  }
  function injectBtn(){
    var tb=document.querySelector(".sk-tree-toolbar");
    if(!tb||!/Refresh/.test(tb.textContent||""))return;
    if(document.getElementById("bd-btn"))return;
    var b=E("button","","====delete");
    b.id="bd-btn";
    b.onclick=function(){open()};
    tb.appendChild(b);
  }
  var pend=null;
  function queue(){clearTimeout(pend);pend=setTimeout(injectBtn,120)}
  if(document.documentElement)new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
  var n=0;var iv=setInterval(function(){n++;injectBtn();if(n>600)clearInterval(iv)},1500);
  injectBtn();
  window.vbBatchDel={open:open,scan:scan};
})();