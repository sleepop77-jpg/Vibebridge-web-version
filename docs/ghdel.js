// GHDEL v1 (cache-proof, new filename): GitHub delete + histdel history.
// Instead of depending on which studioedit version is live, this AUGMENTS the already
// rendered tree via MutationObserver: injects ✕ delete buttons on github-mode rows and
// a "histdel" button into the toolbar, on every re-render, forever.
(function(){
  if(window.__vbGhDel)return;
  window.__vbGhDel=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  function dec64(s){try{return decodeURIComponent(escape(atob(String(s).replace(/\s/g,""))))}catch(e){try{return atob(String(s).replace(/\s/g,""))}catch(e2){return ""}}}
  var LS="vb_histdel";
  function list(){try{return JSON.parse(localStorage.getItem(LS)||"[]")}catch(e){return []}}
  function save(a){try{localStorage.setItem(LS,JSON.stringify(a.slice(0,60)))}catch(e){}}
  function conn(){
    var r=(document.getElementById("repo")||{}).value||"";
    var b=(document.getElementById("branch")||{}).value||"";
    if(!r){try{var s=JSON.parse(localStorage.getItem("vb")||"{}");r=r||s.r||"";b=b||s.b||""}catch(e){}}
    return {repo:r,branch:b||"main"};
  }
  function refreshTree(){
    if(window.vbStudioEdit&&window.vbStudioEdit.refreshTree)window.vbStudioEdit.refreshTree();
  }
  function commit(ops,msg){
    if(!window.commitOps)return Promise.reject(new Error("commit engine missing"));
    return window.commitOps(ops,msg);
  }
  function record(ent){var a=list();a.unshift(ent);save(a)}
  function del(path){
    var c=conn();
    if(!c.repo){say("connect first");return}
    if(!confirm("⚠ DELETE FROM GITHUB\n\n"+c.repo+" @ "+c.branch+"\n"+path+"\n\nThis commits a DELETION to the remote repository right now.\nThe file will be removed from GitHub and logged in histdel.\n\nContinue?"))return;
    say("deleting "+path+"…");
    var snap=null;
    window.api("GET","/repos/"+c.repo+"/contents/"+path.split("/").map(encodeURIComponent).join("/")+"?ref="+c.branch)
      .then(function(m){snap=dec64(m.content);return snap})
      .catch(function(){return null})
      .then(function(){return commit([{kind:"DELETE",path:path}],"studio: delete "+path)})
      .then(function(cm){
        record({path:path,repo:c.repo,branch:c.branch,sha:cm.sha,ts:Date.now(),content:(snap&&snap.length<200000)?snap:null,restored:null});
        say("deleted "+path+" → "+String(cm.sha).slice(0,7));
        refreshTree();
      })
      .catch(function(e){say("delete failed: "+e.message)});
  }
  function delMany(folder,paths){
    var c=conn();
    if(!c.repo){say("connect first");return}
    if(!paths||!paths.length){say("folder looks empty");return}
    if(!confirm("⚠ DELETE FOLDER FROM GITHUB\n\n"+c.repo+" @ "+c.branch+"\n"+folder+"/\n\n"+paths.length+" file(s) will be deleted in ONE commit:\n"+paths.slice(0,8).join("\n")+(paths.length>8?("\n…+"+(paths.length-8)+" more"):"")+"\n\nLogged in histdel (no content snapshot for folders).\n\nContinue?"))return;
    say("deleting "+paths.length+" files…");
    commit(paths.map(function(p){return {kind:"DELETE",path:p}}),"studio: delete folder "+folder+" ("+paths.length+" files)")
      .then(function(cm){
        paths.forEach(function(p){record({path:p,repo:c.repo,branch:c.branch,sha:cm.sha,ts:Date.now(),content:null,restored:null,folder:folder})});
        say("deleted "+paths.length+" files → "+String(cm.sha).slice(0,7));
        refreshTree();
      })
      .catch(function(e){say("delete failed: "+e.message)});
  }
  function restore(ent){
    if(!ent||!ent.content){say("no snapshot stored for this entry");return}
    if(!confirm("Restore "+ent.path+" to "+ent.repo+" @ "+ent.branch+"?\nThis commits the saved snapshot back as a FILE."))return;
    commit([{kind:"FILE",path:ent.path,content:ent.content}],"studio: restore "+ent.path+" (histdel)")
      .then(function(cm){
        ent.restored=Date.now();
        var a=list();
        for(var i=0;i<a.length;i++){if(a[i].ts===ent.ts&&a[i].path===ent.path){a[i]=ent;break}}
        save(a);
        say("restored "+ent.path+" → "+String(cm.sha).slice(0,7));
        refreshTree();
        renderList();
      })
      .catch(function(e){say("restore failed: "+e.message)});
  }
  var modal=null,listEl=null;
  function renderList(){
    if(!listEl)return;
    listEl.innerHTML="";
    var a=list();
    if(!a.length){listEl.appendChild(E("div","small dim","nothing deleted yet"));return}
    a.forEach(function(ent){
      var row=E("div","");
      row.style.cssText="border:1px solid var(--line,#30363d);border-radius:8px;padding:7px 9px;margin-bottom:6px;font:11px/1.5 ui-monospace,Menlo,Consolas,monospace;color:var(--dim,#8b949e)";
      var top=E("div","");
      top.style.cssText="display:flex;gap:8px;align-items:center;flex-wrap:wrap";
      var p=E("span","",ent.path);
      p.style.cssText="color:var(--accent,#4493f8);font-weight:700;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap";
      top.appendChild(p);
      if(ent.restored){var rb=E("span","","restored");rb.style.cssText="color:#3fb950;font-size:9px;font-weight:800";top.appendChild(rb)}
      row.appendChild(top);
      row.appendChild(E("div","",ent.repo+"@"+ent.branch+"  "+String(ent.sha||"").slice(0,7)+"  "+new Date(ent.ts).toLocaleString()+(ent.content?"  ·snapshot":"")));
      var btns=E("div","");
      btns.style.cssText="display:flex;gap:6px;margin-top:6px";
      function b(t,fn){var x=E("button","mini",t);x.style.cssText="border-radius:2px;padding:2px 8px;font-size:10px";x.onclick=fn;return x}
      if(ent.content&&!ent.restored)btns.appendChild(b("restore",function(){restore(ent)}));
      btns.appendChild(b("copy path",function(){navigator.clipboard.writeText(ent.path);say("path copied")}));
      row.appendChild(btns);
      listEl.appendChild(row);
    });
  }
  function open(){
    if(!modal){
      modal=E("div","modal hidden");
      modal.style.zIndex="1200";
      var card=E("div","modalcard");
      card.style.maxWidth="620px";
      card.appendChild(E("h3","","histdel — deletion history"));
      listEl=E("div","");
      listEl.style.cssText="max-height:52vh;overflow:auto;margin:10px 0";
      card.appendChild(listEl);
      var row=E("div","cardbtns");
      var clr=E("button","mini","Clear history");
      clr.style.cssText="border-radius:2px;padding:2px 8px;font-size:10px";
      clr.onclick=function(){if(confirm("Clear the histdel log? (files on GitHub are NOT affected)")){save([]);renderList()}};
      var cls=E("button","green","Close");
      cls.onclick=function(){modal.classList.add("hidden")};
      row.appendChild(clr);row.appendChild(cls);
      card.appendChild(row);
      modal.appendChild(card);
      document.body.appendChild(modal);
    }
    renderList();
    modal.classList.remove("hidden");
  }
  function githubMode(){
    var tb=document.querySelector(".sk-tree-toolbar");
    return !!tb&&/Refresh/.test(tb.textContent||"");
  }
  function scanTree(){
    var tree=document.querySelector(".sk-tree");
    if(!tree)return;
    var tb=document.querySelector(".sk-tree-toolbar");
    if(tb&&githubMode()&&!document.getElementById("ghdel-btn")){
      var hb=E("button","","histdel");
      hb.id="ghdel-btn";
      hb.onclick=function(){open()};
      tb.appendChild(hb);
    }
    if(!githubMode())return;
    var items=tree.querySelectorAll(".sk-tree-item");
    var entries=[];
    var stack=[];
    Array.prototype.forEach.call(items,function(el){
      var pl=parseInt(el.style.paddingLeft||"8",10);
      var depth=Math.max(0,Math.round((pl-8)/12));
      var nameEl=el.querySelector(".name");
      var name=nameEl?(nameEl.textContent||"").trim():"";
      var isFolder=!!el.querySelector(".caret")&&((el.querySelector(".caret").textContent||"")!=="");
      stack.length=depth;
      var path=stack.slice(0,depth).concat([name]).join("/");
      if(isFolder)stack[depth]=name;
      entries.push({el:el,path:path,isFolder:isFolder,depth:depth});
    });
    entries.forEach(function(en,idx){
      if(en.el.querySelector(".del"))return;
      var kids=[];
      if(en.isFolder){
        for(var j=idx+1;j<entries.length;j++){
          if(entries[j].depth<=en.depth)break;
          if(!entries[j].isFolder)kids.push(entries[j].path);
        }
      }
      var d=E("span","del","✕");
      d.title=en.isFolder?"Delete folder from GitHub":"Delete from GitHub";
      d.onclick=function(e){
        e.stopPropagation();
        if(en.isFolder)delMany(en.path,kids);
        else del(en.path);
      };
      en.el.appendChild(d);
    });
  }
  var pend=null;
  function queueScan(){
    clearTimeout(pend);
    pend=setTimeout(scanTree,120);
  }
  if(document.documentElement){
    new MutationObserver(function(){queueScan()}).observe(document.documentElement,{childList:true,subtree:true});
  }
  var n=0;
  var iv=setInterval(function(){n++;scanTree();if(n>600)clearInterval(iv)},1500);
  scanTree();
  window.vbHistDel={open:open,del:del,delMany:delMany,restore:restore,list:list};
  window.vbGhDel=window.vbHistDel;
})();