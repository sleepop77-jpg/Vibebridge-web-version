// STUDIO PUSH v1 (Phase 3): diff-based push engine for "this pc" VFS projects.
(function(){
  if(window.__vbStudioPush)return;
  window.__vbStudioPush=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  var LSM="vb_studio_projmeta",LSH="vb_studio_pushes";
  function meta(){try{return JSON.parse(localStorage.getItem(LSM)||"{}")}catch(e){return {}}}
  function saveMeta(o){try{localStorage.setItem(LSM,JSON.stringify(o))}catch(e){}}
  function pushes(){try{return JSON.parse(localStorage.getItem(LSH)||"[]")}catch(e){return []}}
  function savePushes(a){try{localStorage.setItem(LSH,JSON.stringify(a.slice(-40)))}catch(e){}}
  function lsConn(){try{return JSON.parse(localStorage.getItem("vb")||"{}")}catch(e){return {}}}
  function mainConn(){
    var r=(document.getElementById("repo")||{}).value||lsConn().r||"";
    var p=(document.getElementById("pat")||{}).value||lsConn().p||"";
    var b=(document.getElementById("branch")||{}).value||lsConn().b||"main";
    return {repo:r,pat:p,branch:b||"main"};
  }
  function pid(){
    if(window.vbStudioEdit&&window.vbStudioEdit.getState)return window.vbStudioEdit.getState().projectId||null;
    return null;
  }
  function hash(s){var h=0x811c9dc5;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=(h*0x01000193)>>>0}return h.toString(16)}
  var CRC_T=(function(){var t=[];for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
  function crc32(u8){var c=0xFFFFFFFF;for(var i=0;i<u8.length;i++)c=CRC_T[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
  function zipStore(entries){
    var te=new TextEncoder(),chunks=[],central=[],offset=0;
    entries.forEach(function(en){
      var nb=te.encode(en.name),crc=crc32(en.u8);
      var lh=new DataView(new ArrayBuffer(30));
      lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(8,0,true);
      lh.setUint32(14,crc,true);lh.setUint32(18,en.u8.length,true);lh.setUint32(22,en.u8.length,true);
      lh.setUint16(26,nb.length,true);
      chunks.push(new Uint8Array(lh.buffer),nb,en.u8);
      central.push({nb:nb,crc:crc,size:en.u8.length,off:offset});
      offset+=30+nb.length+en.u8.length;
    });
    var cdSize=0;
    central.forEach(function(c){
      var ch=new DataView(new ArrayBuffer(46));
      ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);
      ch.setUint32(16,c.crc,true);ch.setUint32(20,c.size,true);ch.setUint32(24,c.size,true);
      ch.setUint16(28,c.nb.length,true);ch.setUint32(42,c.off,true);
      chunks.push(new Uint8Array(ch.buffer),c.nb);
      cdSize+=46+c.nb.length;
    });
    var eo=new DataView(new ArrayBuffer(22));
    eo.setUint32(0,0x06054b50,true);eo.setUint16(8,central.length,true);eo.setUint16(10,central.length,true);
    eo.setUint32(12,cdSize,true);eo.setUint32(16,offset,true);
    chunks.push(new Uint8Array(eo.buffer));
    return new Blob(chunks,{type:"application/zip"});
  }
  function withConn(repo,branch,fn){
    var m=mainConn();
    if(window.setConn)setConn(m.pat,repo,branch);
    function restore(){if(window.setConn&&m.repo)setConn(m.pat,m.repo,m.branch)}
    try{
      return Promise.resolve(fn()).then(function(v){restore();return v},function(e){restore();throw e});
    }catch(e){restore();throw e}
  }
  function computeDiff(){
    var id=pid();
    if(!id)return Promise.reject(new Error("no project"));
    return window.vfs.listFiles(id).then(function(files){
      var m=meta();var pm=m[id]||{};
      var manifest=pm.manifest||{};
      var cur={};
      files.forEach(function(f){if(f.type==="file")cur[f.path]=f.content||""});
      var ops=[],added=0,changed=0,deleted=0;
      Object.keys(cur).forEach(function(p){
        var h=hash(cur[p]);
        if(manifest[p]===undefined){added++;ops.push({kind:"FILE",path:p,content:cur[p]})}
        else if(manifest[p]!==h){changed++;ops.push({kind:"FILE",path:p,content:cur[p]})}
      });
      Object.keys(manifest).forEach(function(p){
        if(cur[p]===undefined){deleted++;ops.push({kind:"DELETE",path:p})}
      });
      var hashes={};
      Object.keys(cur).forEach(function(p){hashes[p]=hash(cur[p])});
      return {ops:ops,added:added,changed:changed,deleted:deleted,hashes:hashes,pm:pm};
    });
  }
  function push(){
    var id=pid();
    if(!id)return say("open a this-pc project first");
    var m=meta();var pm=m[id]||{};
    if(!pm.repo)return say("bind a repo first (⚙ bind)");
    var mc=mainConn();
    if(!mc.pat)return say("connect a PAT first");
    computeDiff().then(function(d){
      if(!d.ops.length)return say("nothing to push — project is in sync");
      var first=!pm.manifest;
      var msg="push "+d.ops.length+" file(s): +"+d.added+" ~"+d.changed+" -"+d.deleted;
      if(!confirm((first?"FIRST PUSH will commit "+d.ops.length+" files.\n":"")+msg+"\nto "+pm.repo+" @ "+(pm.branch||"main")+"?"))return;
      say("pushing "+d.ops.length+" ops…");
      withConn(pm.repo,pm.branch||"main",function(){
        return window.commitOps(d.ops,"studio: "+msg);
      }).then(function(cm){
        pm.manifest=d.hashes;pm.lastSha=cm.sha;pm.lastPush=Date.now();
        m[id]=pm;saveMeta(m);
        var rec={projectId:id,repo:pm.repo,branch:pm.branch||"main",sha:cm.sha,ts:Date.now(),added:d.added,changed:d.changed,deleted:d.deleted,ok:true,message:msg,conclusion:null};
        var arr=pushes();arr.push(rec);savePushes(arr);
        say("pushed "+String(cm.sha).slice(0,7));
        if(window.confetti)confetti();
        pollCi(pm,rec);
        renderBar();
      }).catch(function(e){
        var arr=pushes();
        arr.push({projectId:id,repo:pm.repo,branch:pm.branch||"main",sha:"",ts:Date.now(),added:d.added,changed:d.changed,deleted:d.deleted,ok:false,message:String(e.message)});
        savePushes(arr);
        say("push failed: "+e.message);
      });
    }).catch(function(e){say(e.message)});
  }
  function pollCi(pm,rec){
    var tries=0;
    var iv=setInterval(function(){
      tries++;
      withConn(pm.repo,pm.branch||"main",function(){
        return window.latestRun?window.latestRun():Promise.resolve(null);
      }).then(function(run){
        if(run&&run.status==="completed"){
          clearInterval(iv);
          rec.conclusion=run.conclusion;
          var arr=pushes();
          for(var i=arr.length-1;i>=0;i--){if(arr[i].sha===rec.sha){arr[i]=rec;break}}
          savePushes(arr);
          say(run.conclusion==="success"?"CI passed ✔":"CI "+run.conclusion+" — check Actions");
        }else if(tries>8){clearInterval(iv)}
      }).catch(function(){if(tries>8)clearInterval(iv)});
    },9000);
  }
  function bind(){
    var id=pid();
    if(!id)return say("open a this-pc project first");
    var m=meta();var pm=m[id]||{};
    var repo=prompt("Repo to bind (owner/name):",pm.repo||mainConn().repo||"");
    if(!repo)return;
    repo=repo.trim();
    if(!/^[^\/\s]+\/[^\/\s]+$/.test(repo))return say("bad repo format");
    var branch=prompt("Branch:",pm.branch||"main")||"main";
    pm.repo=repo;pm.branch=branch;
    m[id]=pm;saveMeta(m);
    renderBar();
    say("bound to "+repo+" @ "+branch);
  }
  function exportZip(){
    var id=pid();
    if(!id)return say("no project");
    window.vfs.listFiles(id).then(function(files){
      var te=new TextEncoder();
      var entries=files.filter(function(f){return f.type==="file"}).map(function(f){return {name:f.path,u8:te.encode(f.content||"")}});
      if(!entries.length)return say("nothing to export");
      var blob=zipStore(entries);
      var a=document.createElement("a");
      a.href=URL.createObjectURL(blob);
      a.download="project-"+Date.now()+".zip";
      a.click();
      say("exported "+entries.length+" files as zip");
    });
  }
  var histM=null;
  function historyModal(){
    if(histM)return histM;
    histM=E("div","modal hidden");
    var card=E("div","modalcard");
    card.style.maxWidth="560px";
    card.appendChild(E("h3","","Studio push history"));
    var list=E("div","");
    list.id="skp-list";
    list.style.cssText="max-height:50vh;overflow:auto;display:flex;flex-direction:column;gap:6px;margin:10px 0";
    card.appendChild(list);
    var row=E("div","cardbtns");
    var clr=E("button","mini","Clear");
    clr.onclick=function(){savePushes([]);renderHistory()};
    var cls=E("button","green","Close");
    cls.onclick=function(){histM.classList.add("hidden")};
    row.appendChild(clr);row.appendChild(cls);
    card.appendChild(row);
    histM.appendChild(card);
    document.body.appendChild(histM);
    return histM;
  }
  function renderHistory(){
    var list=document.getElementById("skp-list");
    if(!list)return;
    list.innerHTML="";
    var arr=pushes().slice().reverse();
    if(!arr.length){list.appendChild(E("div","dim small","no pushes yet"));return}
    arr.forEach(function(p){
      var d=new Date(p.ts);
      var line=E("div","");
      line.style.cssText="font:11px/1.6 ui-monospace,Menlo,Consolas,monospace;color:var(--dim,#8b949e);border:1px solid var(--line,#30363d);border-radius:8px;padding:6px 8px";
      line.textContent=(p.ok?"✔":"✘")+" "+(p.sha?String(p.sha).slice(0,7):"----")+"  "+p.repo+"@"+p.branch+"  +"+p.added+" ~"+p.changed+" -"+p.deleted+"  "+d.toLocaleString()+(p.conclusion?"  CI:"+p.conclusion:"");
      list.appendChild(line);
    });
  }
  function openHistory(){renderHistory();historyModal().classList.remove("hidden")}
  var bar=null;
  function buildBar(){
    if(bar&&bar.parentNode)return bar;
    var left=document.querySelector(".sk-left");
    if(!left)return null;
    var tb=left.querySelector(".sk-tree-toolbar");
    if(!tb)return null;
    bar=E("div","");
    bar.id="sk-pushbar";
    bar.style.cssText="display:flex;gap:4px;align-items:center;padding:0 4px 8px;flex-wrap:wrap";
    var chip=E("span","");
    chip.id="skp-chip";
    chip.style.cssText="flex:1;font:10px/1.4 ui-monospace,Menlo,Consolas,monospace;color:var(--sk-dim,#6d6142);overflow:hidden;text-overflow:ellipsis;white-space:nowrap";
    function btn(t,fn){var b=E("button","",t);b.style.cssText="padding:5px 8px;font-size:11px;border:1px solid var(--sk-line,#c8bb8e);border-radius:5px;background:var(--sk-card,#faf6e8);color:var(--sk-dim,#6d6142);cursor:pointer;font-weight:600";b.onclick=fn;return b}
    bar.appendChild(chip);
    bar.appendChild(btn("⚙ bind",bind));
    bar.appendChild(btn("⬆ push",push));
    bar.appendChild(btn("hist",openHistory));
    bar.appendChild(btn("zip",exportZip));
    tb.parentNode.insertBefore(bar,tb.nextSibling);
    return bar;
  }
  function renderBar(){
    if(!buildBar())return;
    var id=pid();
    var m=meta();var pm=(id&&m[id])||{};
    var chip=document.getElementById("skp-chip");
    if(chip)chip.textContent=pm.repo?("→ "+pm.repo+"@"+(pm.branch||"main")):"no repo bound";
    computeDiff().then(function(d){
      var pb=bar?bar.querySelectorAll("button")[1]:null;
      if(pb)pb.textContent="⬆ push"+(d.ops.length?" ("+d.ops.length+")":"");
    }).catch(function(){});
  }
  var st=document.createElement("style");
  st.textContent="#sk-pushbar button:hover{background:var(--sk-acc,#a8801f)!important;color:#fff!important}";
  document.head.appendChild(st);
  var n=0;
  var iv=setInterval(function(){
    n++;
    buildBar();
    var mode=null;
    if(window.vbStudioEdit&&window.vbStudioEdit.getState)mode=window.vbStudioEdit.getState().mode;
    if(bar)bar.style.display=(mode==="local"||!mode)?"flex":"none";
    if(n%3===0)renderBar();
    if(n>400)clearInterval(iv);
  },500);
  window.vbStudioPush={push:push,bind:bind,exportZip:exportZip,history:openHistory,diff:computeDiff};
})();
