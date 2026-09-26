// STUDIO EDIT v3: mode-aware tree + GitHub delete (with warning) + histdel button.
(function(){
  if(window.__vbStudioEdit)return;
  window.__vbStudioEdit=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  function dec64(s){try{return decodeURIComponent(escape(atob(String(s).replace(/\s/g,""))))}catch(e){try{return atob(String(s).replace(/\s/g,""))}catch(e2){return ""}}}
  var LS="vb_studio_edit_state",LSS="vb_studio_staged";
  var state={projectId:null,openTabs:[],activeTab:"__chat__",collapsed:{},mode:"github"};
  function save(){try{localStorage.setItem(LS,JSON.stringify(state))}catch(e){}}
  function load(){
    try{
      var s=JSON.parse(localStorage.getItem(LS)||"null");
      if(s){
        state.projectId=s.projectId||null;
        state.openTabs=(s.openTabs||[]).map(function(t){return typeof t==="string"?{src:"local",path:t}:t});
        state.activeTab=s.activeTab||"__chat__";
        state.collapsed=s.collapsed||{};
        state.mode=s.mode||"github";
      }
    }catch(e){}
  }
  function stagedAll(){try{return JSON.parse(localStorage.getItem(LSS)||"{}")}catch(e){return {}}}
  function saveStaged(o){try{localStorage.setItem(LSS,JSON.stringify(o))}catch(e){say("staging storage full")}}
  function connInfo(){
    var repo=(document.getElementById("repo")||{}).value||"";
    var pat=(document.getElementById("pat")||{}).value||"";
    var branch=(document.getElementById("branch")||{}).value||"";
    if(!repo||!pat){try{var s=JSON.parse(localStorage.getItem("vb")||"{}");repo=repo||s.r||"";pat=pat||s.p||"";branch=branch||s.b||""}catch(e){}}
    branch=branch||"main";
    var parts=String(repo).split("/");
    return {ok:!!(repo&&pat&&window.api),owner:parts[0]||"",name:parts[1]||"",repo:repo,branch:branch,pat:pat};
  }
  function repoKey(){var c=connInfo();return c.repo+"@"+c.branch}
  function stagedHas(p){var o=stagedAll();var k=repoKey();return !!(o[k]&&o[k][p]!==undefined)}
  function stagedSet(p,content){var o=stagedAll();var k=repoKey();if(!o[k])o[k]={};o[k][p]=content;saveStaged(o)}
  function stagedCount(){var o=stagedAll();var k=repoKey();return Object.keys(o[k]||{}).length}
  var style=document.createElement("style");
  style.id="vb-studioedit-css";
  style.textContent=""
   +".sk-left{display:flex;flex-direction:column;min-height:0}"
   +".sk-tree{flex:1;overflow-y:auto;min-height:100px}"
   +".sk-tree-toolbar{display:flex;gap:4px;padding:0 4px 8px;flex-wrap:wrap}"
   +".sk-tree-toolbar button{flex:1;padding:5px;font-size:11px;border:1px solid var(--sk-line);border-radius:5px;background:var(--sk-card);color:var(--sk-dim);cursor:pointer;font-weight:600;white-space:nowrap}"
   +".sk-tree-toolbar button:hover{background:var(--sk-acc);color:#fff;border-color:var(--sk-acc)}"
   +".sk-tree-toolbar button:disabled{opacity:.4;cursor:default}"
   +".sk-tree-item{display:flex;gap:6px;align-items:center;padding:5px 8px;border-radius:5px;font-size:12px;color:var(--sk-dim);cursor:pointer;user-select:none}"
   +".sk-tree-item:hover{background:rgba(168,128,31,.12)}"
   +".sk-tree-item.active{background:rgba(168,128,31,.2);color:var(--sk-ink);font-weight:600}"
   +".sk-tree-item .caret{width:10px;font-size:9px;color:var(--sk-dim);flex:none;text-align:center}"
   +".sk-tree-item .ico{width:10px;height:12px;flex:none;border-radius:2px}"
   +".sk-tree-item .name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
   +".sk-tree-item .dot{flex:none;font-size:12px;color:var(--sk-acc);font-weight:900}"
   +".sk-tree-item .del{opacity:0;font-size:10px;color:var(--sk-dim);padding:0 4px;flex:none;cursor:pointer}"
   +".sk-tree-item:hover .del{opacity:1}"
   +".sk-tree-item .del:hover{color:#c23616}"
   +".sk-tree-empty{padding:20px 10px;text-align:center;color:var(--sk-dim);font-size:11px}"
   +".sk-editor-tabs{display:flex;background:var(--sk-side);border-bottom:1px solid var(--sk-line);overflow-x:auto;min-height:36px;flex:none}"
   +".sk-editor-tab{padding:8px 14px;font-size:12px;color:var(--sk-dim);border-right:1px solid var(--sk-line);cursor:pointer;display:flex;gap:8px;align-items:center;white-space:nowrap;flex:none}"
   +".sk-editor-tab:hover{background:var(--sk-card)}"
   +".sk-editor-tab.active{background:var(--sk-card);color:var(--sk-acc);font-weight:600}"
   +".sk-editor-tab .x{opacity:.5;font-size:10px;padding:0 2px}"
   +".sk-editor-tab .x:hover{opacity:1;color:#c23616}"
   +".sk-editor-pane{flex:1;min-height:0;position:relative;display:none}"
   +".sk-code{width:100%;height:100%;background:var(--sk-card);color:var(--sk-ink);border:none;padding:16px;font:13px/1.6 ui-monospace,Menlo,Consolas,monospace;resize:none;outline:none}"
   +"#sk-center-body{display:flex;flex-direction:column;min-height:0;flex:1}"
   +"#sk-center-body[data-view='chat'] .sk-editor-pane{display:none!important}"
   +"#sk-center-body[data-view='chat'] #main{display:flex!important;flex:1;min-height:0}"
   +"#sk-center-body[data-view='editor'] .sk-editor-pane{display:flex!important;flex:1;min-height:0}"
   +"#sk-center-body[data-view='editor'] #main{display:none!important}";
  document.head.appendChild(style);
  function colorFor(path){
    var ext=(path.split(".").pop()||"").toLowerCase();
    if(ext==="html"||ext==="htm")return "#a8801f";
    if(ext==="js"||ext==="mjs")return "#6f7d33";
    if(ext==="css")return "#4a6fa5";
    if(ext==="json")return "#c9a227";
    if(ext==="md")return "#555";
    return "#888";
  }
  var ghCache={key:"",entries:null,ts:0};
  function fetchTree(force){
    var c=connInfo();
    if(!c.ok)return Promise.reject(new Error("not connected"));
    var k=c.repo+"@"+c.branch;
    if(!force&&ghCache.key===k&&ghCache.entries&&Date.now()-ghCache.ts<60000)return Promise.resolve(ghCache.entries);
    return window.api("GET","/repos/"+c.owner+"/"+c.name+"/git/ref/heads/"+c.branch)
      .then(function(ref){return window.api("GET","/repos/"+c.owner+"/"+c.name+"/git/commits/"+ref.object.sha)})
      .then(function(com){return window.api("GET","/repos/"+c.owner+"/"+c.name+"/git/trees/"+com.tree.sha+"?recursive=1")})
      .then(function(tr){
        var out=[];
        (tr.tree||[]).forEach(function(e){
          if(e.type!=="blob")return;
          if(/(^|\/)(\.git|node_modules|dist|build)\//.test(e.path))return;
          out.push({path:e.path,size:e.size||0});
        });
        ghCache={key:k,entries:out,ts:Date.now()};
        return out;
      });
  }
  function isActive(path,src){
    return state.activeTab&&state.activeTab!=="__chat__"&&state.activeTab.src===src&&state.activeTab.path===path;
  }
  function buildToolbar(tb){
    if(!tb)return;
    tb.innerHTML="";
    if(state.mode==="github"){
      var rf=E("button","","⟳ Refresh");
      rf.onclick=function(){fetchTree(true).then(function(){renderTree()},function(e){say(e.message)})};
      var ps=E("button","","Push staged ("+stagedCount()+")");
      ps.disabled=!stagedCount();
      ps.onclick=function(){if(window.vbStudioPush)window.vbStudioPush.push();else say("push engine not loaded")};
      var im=E("button","","Import → PC");
      im.onclick=importRepo;
      var hd=E("button","","histdel");
      hd.onclick=function(){if(window.vbHistDel)window.vbHistDel.open();else say("histdel not loaded")};
      tb.appendChild(rf);tb.appendChild(ps);tb.appendChild(im);tb.appendChild(hd);
      return;
    }
    var nf=E("button","","+ File");
    nf.onclick=function(){
      var path=prompt("File path (e.g. src/main.js):");
      if(!path)return;
      path=path.trim().replace(/^\/+/,"");
      if(!path)return;
      window.vfs.ensureParents(state.projectId,path)
        .then(function(){return window.vfs.writeFile(state.projectId,path,"")})
        .then(function(){openFile("local",path)});
    };
    var nfo=E("button","","+ Folder");
    nfo.onclick=function(){
      var path=prompt("Folder path (e.g. src/components):");
      if(!path)return;
      path=path.trim().replace(/^\/+|\/+$/g,"");
      if(!path)return;
      window.vfs.createFolder(state.projectId,path).then(function(){delete state.collapsed[path];save();renderTree()});
    };
    tb.appendChild(nf);tb.appendChild(nfo);
  }
  function renderTree(){
    var treeEl=document.querySelector(".sk-tree");
    if(!treeEl)return;
    var tb=document.querySelector(".sk-tree-toolbar");
    buildToolbar(tb);
    treeEl.innerHTML="";
    if(state.mode==="github"){
      var c=connInfo();
      if(!c.ok){treeEl.appendChild(E("div","sk-tree-empty","Connect a repo first (⚡ Connect under GitHub credentials)."));return}
      treeEl.appendChild(E("div","sk-tree-empty","loading "+c.repo+" @ "+c.branch+"…"));
      fetchTree(false).then(function(entries){
        treeEl.innerHTML="";
        if(!entries.length){treeEl.appendChild(E("div","sk-tree-empty","repo looks empty"));return}
        var kids={};
        entries.forEach(function(e){
          var parts=e.path.split("/");
          var parent="";
          for(var i=0;i<parts.length-1;i++){
            var p=parts.slice(0,i+1).join("/");
            if(!kids[parent])kids[parent]={};
            kids[parent][parts[i]]={folder:true,path:p};
            parent=p;
          }
          if(!kids[parent])kids[parent]={};
          kids[parent][parts[parts.length-1]]={folder:false,path:e.path};
        });
        (function renderLevel(pp,depth){
          var map=kids[pp]||{};
          var names=Object.keys(map).sort(function(a,b){
            var fa=map[a].folder,fb=map[b].folder;
            if(fa!==fb)return fa?-1:1;
            return a.localeCompare(b);
          });
          names.forEach(function(nm){
            var node=map[nm],isF=node.folder;
            var item=E("div","sk-tree-item");
            item.style.paddingLeft=(8+depth*12)+"px";
            if(!isF&&isActive(node.path,"github"))item.classList.add("active");
            item.appendChild(E("span","caret",isF?(state.collapsed[node.path]?"▸":"▾"):""));
            var ico=E("span","ico");ico.style.background=isF?"#a8801f":colorFor(nm);
            item.appendChild(ico);
            item.appendChild(E("span","name",nm));
            if(!isF&&stagedHas(node.path))item.appendChild(E("span","dot","•"));
            var del=E("span","del","✕");
            del.title=isF?"Delete folder from GitHub":"Delete from GitHub";
            del.onclick=function(e){
              e.stopPropagation();
              if(isF){
                var paths=[];
                entries.forEach(function(en){if(en.path.indexOf(node.path+"/")===0)paths.push(en.path)});
                if(window.vbHistDel)window.vbHistDel.delMany(node.path,paths);
                else say("histdel not loaded");
              }else{
                if(window.vbHistDel)window.vbHistDel.del(node.path);
                else say("histdel not loaded");
              }
            };
            item.appendChild(del);
            item.onclick=function(){
              if(isF){state.collapsed[node.path]=!state.collapsed[node.path];save();renderTree()}
              else openFile("github",node.path);
            };
            treeEl.appendChild(item);
            if(isF&&!state.collapsed[node.path])renderLevel(node.path,depth+1);
          });
        })("",0);
      }).catch(function(e){
        treeEl.innerHTML="";
        treeEl.appendChild(E("div","sk-tree-empty","failed: "+e.message));
      });
      return;
    }
    if(!state.projectId)return;
    window.vfs.listFiles(state.projectId).then(function(files){
      if(!files.length){treeEl.appendChild(E("div","sk-tree-empty","Empty project. Use \"+ File\" to start."));return}
      var children={};
      files.forEach(function(f){
        var parts=f.path.split("/");
        var parent=parts.length>1?parts.slice(0,-1).join("/"):"";
        if(!children[parent])children[parent]=[];
        children[parent].push(f);
      });
      Object.keys(children).forEach(function(k){
        children[k].sort(function(a,b){
          if(a.type!==b.type)return a.type==="folder"?-1:1;
          return a.path.localeCompare(b.path);
        });
      });
      (function renderLevel(parentPath,depth){
        (children[parentPath]||[]).forEach(function(f){
          var isFolder=f.type==="folder";
          var name=f.path.split("/").pop();
          var item=E("div","sk-tree-item");
          item.style.paddingLeft=(8+depth*12)+"px";
          if(isActive(f.path,"local"))item.classList.add("active");
          item.appendChild(E("span","caret",isFolder?(state.collapsed[f.path]?"▸":"▾"):""));
          var ico=E("span","ico");ico.style.background=isFolder?"#a8801f":colorFor(f.path);
          item.appendChild(ico);
          item.appendChild(E("span","name",name));
          var del=E("span","del","✕");
          del.onclick=function(e){
            e.stopPropagation();
            if(!confirm("Delete "+f.path+"?"))return;
            var toDelete=[f.path];
            if(isFolder)files.forEach(function(o){if(o.path.indexOf(f.path+"/")===0)toDelete.push(o.path)});
            Promise.all(toDelete.map(function(p){return window.vfs.deleteFile(state.projectId,p)})).then(function(){
              state.openTabs=state.openTabs.filter(function(t){return toDelete.indexOf(t.path)===-1});
              if(state.activeTab&&state.activeTab.src==="local"&&toDelete.indexOf(state.activeTab.path)!==-1)state.activeTab="__chat__";
              save();renderAll();
            });
          };
          item.appendChild(del);
          item.onclick=function(){
            if(isFolder){state.collapsed[f.path]=!state.collapsed[f.path];save();renderTree()}
            else openFile("local",f.path);
          };
          treeEl.appendChild(item);
          if(isFolder&&!state.collapsed[f.path])renderLevel(f.path,depth+1);
        });
      })("",0);
    });
  }
  function openFile(src,path){
    var found=null;
    state.openTabs.forEach(function(t){if(t.src===src&&t.path===path)found=t});
    if(!found){found={src:src,path:path};state.openTabs.push(found)}
    state.activeTab=found;
    save();renderTabs();renderEditor();renderTree();
  }
  function closeTab(tab){
    state.openTabs=state.openTabs.filter(function(t){return !(t.src===tab.src&&t.path===tab.path)});
    if(state.activeTab&&state.activeTab.src===tab.src&&state.activeTab.path===tab.path){
      state.activeTab=state.openTabs.length?state.openTabs[state.openTabs.length-1]:"__chat__";
    }
    save();renderTabs();renderEditor();renderTree();
  }
  function renderTabs(){
    var tabsEl=document.querySelector(".sk-editor-tabs");
    if(!tabsEl)return;
    tabsEl.innerHTML="";
    var chatTab=E("div","sk-editor-tab"+(state.activeTab==="__chat__"?" active":""));
    chatTab.appendChild(E("span","","💬 Chat"));
    chatTab.onclick=function(){state.activeTab="__chat__";save();renderTabs();renderEditor();renderTree()};
    tabsEl.appendChild(chatTab);
    state.openTabs.forEach(function(tab){
      var name=tab.path.split("/").pop();
      var t=E("div","sk-editor-tab"+(state.activeTab&&state.activeTab.src===tab.src&&state.activeTab.path===tab.path?" active":""));
      t.title=(tab.src==="github"?"github: ":"this pc: ")+tab.path;
      t.appendChild(E("span","",(tab.src==="github"?"☁ ":"⌂ ")+name+(tab.src==="github"&&stagedHas(tab.path)?" •":"")));
      var x=E("span","x","✕");
      x.onclick=function(e){e.stopPropagation();closeTab(tab)};
      t.appendChild(x);
      t.onclick=function(){state.activeTab=tab;save();renderTabs();renderEditor();renderTree()};
      tabsEl.appendChild(t);
    });
    var body=document.getElementById("sk-center-body")||document.getElementById("sk-body");
    if(body)body.setAttribute("data-view",state.activeTab==="__chat__"?"chat":"editor");
  }
  function loadContent(tab){
    if(tab.src==="local")return window.vfs.readFile(state.projectId,tab.path).then(function(f){return f?(f.content||""):""});
    var o=stagedAll();var k=repoKey();
    if(o[k]&&o[k][tab.path]!==undefined)return Promise.resolve(o[k][tab.path]);
    var c=connInfo();
    return window.api("GET","/repos/"+c.owner+"/"+c.name+"/contents/"+tab.path.split("/").map(encodeURIComponent).join("/")+"?ref="+c.branch)
      .then(function(m){return dec64(m.content)});
  }
  function renderEditor(){
    var pane=document.querySelector(".sk-editor-pane");
    if(!pane)return;
    pane.innerHTML="";
    if(state.activeTab==="__chat__")return;
    var tab=state.activeTab;
    loadContent(tab).then(function(text){
      var ta=document.createElement("textarea");
      ta.className="sk-code";
      ta.value=text;
      ta.spellcheck=false;
      var timer=null;
      ta.oninput=function(){
        clearTimeout(timer);
        timer=setTimeout(function(){
          if(tab.src==="local"){window.vfs.writeFile(state.projectId,tab.path,ta.value)}
          else{stagedSet(tab.path,ta.value);say("staged "+tab.path+" — Push staged from the tree toolbar");renderTabs();renderTree();var tb=document.querySelector(".sk-tree-toolbar");buildToolbar(tb)}
        },400);
      };
      pane.appendChild(ta);
    }).catch(function(e){
      pane.appendChild(E("div","sk-tree-empty","cannot load: "+e.message));
    });
  }
  function importRepo(){
    var c=connInfo();
    if(!c.ok)return say("connect first");
    fetchTree(false).then(function(entries){
      var texts=entries.filter(function(e){return /\.(html?|css|js|mjs|json|md|txt|svg|yml|yaml)$/i.test(e.path)&&e.size<400000}).slice(0,80);
      if(!texts.length)return say("no importable text files");
      say("importing "+texts.length+" files into this PC…");
      var done=0;
      function next(){
        if(done>=texts.length){say("imported "+done+" files into this PC project");renderTree();return}
        var e=texts[done++];
        window.api("GET","/repos/"+c.owner+"/"+c.name+"/contents/"+e.path.split("/").map(encodeURIComponent).join("/")+"?ref="+c.branch)
          .then(function(m){return window.vfs.ensureParents(state.projectId,e.path).then(function(){return window.vfs.writeFile(state.projectId,e.path,dec64(m.content))})})
          .then(next,next);
      }
      next();
    }).catch(function(e){say(e.message)});
  }
  function renderAll(){renderTree();renderTabs();renderEditor()}
  function patchLayout(){
    var b=document.getElementById("sk-body");
    if(b&&!document.getElementById("sk-center-body"))b.id="sk-center-body";
    var body=document.getElementById("sk-center-body");
    if(!body||body.dataset.editorPatched)return false;
    var mainEl=document.getElementById("main");
    if(!mainEl||mainEl.parentNode!==body)return false;
    body.dataset.editorPatched="1";
    body.removeChild(mainEl);
    body.appendChild(E("div","sk-editor-tabs"));
    body.appendChild(mainEl);
    body.appendChild(E("div","sk-editor-pane"));
    return true;
  }
  function patchSidebar(){
    var left=document.querySelector(".sk-left");
    if(!left||left.dataset.treePatched)return false;
    var staticFolder=left.querySelector(".sk-folder");
    if(!staticFolder)return false;
    left.dataset.treePatched="1";
    Array.prototype.forEach.call(left.querySelectorAll(".sk-folder, .sk-file"),function(el){el.remove()});
    var toolbar=E("div","sk-tree-toolbar");
    var treeEl=E("div","sk-tree");
    var searchEl=left.querySelector(".sk-search");
    if(searchEl&&searchEl.nextSibling){
      left.insertBefore(toolbar,searchEl.nextSibling);
      left.insertBefore(treeEl,toolbar.nextSibling);
    }else{
      left.appendChild(toolbar);left.appendChild(treeEl);
    }
    return true;
  }
  document.addEventListener("click",function(e){
    var t=e.target&&e.target.closest?e.target.closest(".sk-tab"):null;
    if(!t)return;
    state.mode=(t.getAttribute("data-tab")==="pc")?"local":"github";
    save();
    renderTree();
  },true);
  async function init(){
    load();
    try{await window.vfs.open()}catch(e){console.error("vfs open failed",e);return}
    var projects=await window.vfs.listProjects();
    var def=projects.find(function(p){return p.name==="Local project"});
    if(!def){def=await window.vfs.createProject("Local project","local");await window.vfs.seed(def.id)}
    if(!state.projectId||!projects.find(function(p){return p.id===state.projectId})){state.projectId=def.id;save()}
    var tries=0;
    var iv=setInterval(function(){
      tries++;
      var a=patchLayout(),b=patchSidebar();
      if(a&&b){renderAll();clearInterval(iv)}
      if(tries>100)clearInterval(iv);
    },200);
  }
  init();
  window.vbStudioEdit={openFile:openFile,renderAll:renderAll,refreshTree:function(){ghCache.ts=0;fetchTree(true).then(renderTree)},getState:function(){return state}};
})();