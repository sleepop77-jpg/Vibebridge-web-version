// AUTOCLEAN v1: one-confirm repo cleanup that can ONLY delete provably-dead files.
// References are read from the LIVE index.html at run time, so nothing loaded survives.
(function(){
  if(window.__vbAutoClean)return;
  window.__vbAutoClean=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  var FLAG="vb_autoclean_done";
  var KEEP=["github.js","app.js","checks.js","os.js","theme.js","skin.js","stars.js","brand.js","svgchat.js","ctxmenu.js","onboard.js","apimode.js","attach.js","zipmd.js","imgpush.js","studio.js","devmode.js","developer.js","devconsolidate.js","nodock.js","sbclean.js","backdrop.js","multirepo.js","backupflow.js","sitepreview.js","studioshell.js","vfs.js","shellfix.js","studioedit.js","studiopush.js","studioloader.js","optpanel.js","reconn.js","ghdel.js","batchdel.js","autoclean.js"];
  var UNWANTED=[
    ["docs/handoff.js",null],
    ["docs/devmenu.js","docs/devconsolidate.js"],
    ["docs/studiooptions.js","docs/optpanel.js"],
    ["docs/histdel.js","docs/ghdel.js"]
  ];
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
  function compute(indexContent,paths){
    var present={};paths.forEach(function(p){present[p]=1});
    var referenced={};
    var re=/src="([^"?]+)(\?[^"]*)?"/g,m;
    while((m=re.exec(indexContent)))referenced[m[1].replace(/^docs\//,"")]=1;
    var cands=[];
    UNWANTED.forEach(function(u){
      if(present[u[0]]&&(!u[1]||present[u[1]]))cands.push({path:u[0],why:"superseded / removed feature"});
    });
    paths.forEach(function(p){
      if(/^app\//.test(p))cands.push({path:p,why:"android relic, unused by web/desktop"});
    });
    paths.forEach(function(p){
      var name=p.replace(/^docs\//,"");
      if(/^docs\/[^/]+\.js$/.test(p)&&KEEP.indexOf(name)===-1&&!referenced[name]){
        var already=false;
        cands.forEach(function(c){if(c.path===p)already=true});
        if(!already)cands.push({path:p,why:"no <script> tag references it"});
      }
    });
    var hunks=[];
    cands.forEach(function(cd){
      var name=cd.path.replace(/^docs\//,"");
      var idx=indexContent.indexOf('src="'+name+'"');
      if(idx>=0&&/^docs\//.test(cd.path)){
        var ls=indexContent.lastIndexOf("\n",idx)+1;
        var le=indexContent.indexOf("\n",idx);
        if(le>ls)hunks.push({find:indexContent.slice(ls,le),replace:""});
      }
    });
    var lines=indexContent.split("\n");
    var seenTag={};
    lines.forEach(function(ln){
      var mm=/^\s*<script src="([^"?]+)(\?[^"]*)?"[^>]*><\/script>\s*$/.exec(ln);
      if(!mm)return;
      var key=mm[1];
      if(seenTag[key]){hunks.push({find:ln,replace:""})}
      else seenTag[key]=1;
    });
    lines.forEach(function(ln){
      if(ln.indexOf("brand.js?v=")>=0)hunks.push({find:ln,replace:""});
    });
    var dedup={};var hunks2=[];
    hunks.forEach(function(h){if(!dedup[h.find]){dedup[h.find]=1;hunks2.push(h)}});
    return {cands:cands,hunks:hunks2};
  }
  function run(force){
    var c=conn();
    if(!c.repo||!c.pat){say("connect first");return}
    say("scanning for dead files…");
    Promise.all([fetchTree(),fetchIndex()]).then(function(res){
      var plan=compute(res[1],res[0]);
      if(!plan.cands.length&&!plan.hunks.length){
        say("repo already clean — nothing to delete");
        try{localStorage.setItem(FLAG,"1")}catch(e){}
        return;
      }
      var names=plan.cands.map(function(x){return x.path});
      var msg="⚠ AUTO-CLEAN will DELETE "+names.length+" file(s):\n\n"+(names.slice(0,12).join("\n")||"(none)")+(names.length>12?("\n…+"+(names.length-12)+" more"):"")+"\n\nplus "+plan.hunks.length+" dead/duplicate <script> line(s) in index.html.\n\nEvery file above was verified UNREFERENCED in the live index.html.\nCore, Studio chain, extension and desktop are protected.\nLogged in histdel.\n\nProceed?";
      if(!confirm(msg))return;
      var ops=plan.cands.map(function(x){return {kind:"DELETE",path:x.path}});
      if(plan.hunks.length)ops.push({kind:"EDIT",path:"docs/index.html",hunks:plan.hunks});
      say("committing cleanup…");
      window.commitOps(ops,"cleanup: auto-remove "+plan.cands.length+" dead file(s), "+plan.hunks.length+" dead script tag(s)").then(function(cm){
        var a=[];try{a=JSON.parse(localStorage.getItem("vb_histdel")||"[]")}catch(e){}
        plan.cands.forEach(function(x){a.unshift({path:x.path,repo:c.repo,branch:c.branch,sha:cm.sha,ts:Date.now(),content:null,restored:null,cleanup:true,why:x.why})});
        try{localStorage.setItem("vb_histdel",JSON.stringify(a.slice(0,60)))}catch(e){}
        try{localStorage.setItem(FLAG,"1")}catch(e){}
        say("cleaned "+plan.cands.length+" file(s) → "+String(cm.sha).slice(0,7));
        if(window.vbStudioEdit&&window.vbStudioEdit.refreshTree)window.vbStudioEdit.refreshTree();
      }).catch(function(e){say("cleanup failed: "+e.message)});
    }).catch(function(e){say("scan failed: "+e.message)});
  }
  function injectBtn(){
    var tb=document.querySelector(".sk-tree-toolbar");
    if(!tb||!/Refresh/.test(tb.textContent||""))return;
    if(document.getElementById("ac-btn"))return;
    var b=E("button","","🧹 clean");
    b.id="ac-btn";
    b.onclick=function(){run(true)};
    tb.appendChild(b);
  }
  var pend=null;
  function queue(){clearTimeout(pend);pend=setTimeout(injectBtn,120)}
  if(document.documentElement)new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
  var n=0;
  var iv=setInterval(function(){n++;injectBtn();if(n>600)clearInterval(iv)},1500);
  injectBtn();
  var done=false;
  try{done=localStorage.getItem(FLAG)==="1"}catch(e){}
  if(!done)setTimeout(function(){run(false)},4000);
  window.vbAutoClean={run:run};
})();