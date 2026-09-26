// AUTO-RECONNECT v1: any GitHub call that returns 401 or 404 automatically re-applies
// the saved PAT/repo/branch and retries, so a dropped or stale connection self-heals.
// Patches the single choke point (window.api) that EVERY module uses, plus a watchdog.
(function(){
  if(window.__vbReconn)return;
  window.__vbReconn=true;
  function say(m){if(window.toast)toast(m);else console.log(m)}
  function dec(s){try{var x=decodeURIComponent(escape(atob(String(s))));return x.indexOf("vb1:")===0?x.slice(4):x}catch(e){return String(s)}}
  function bestConn(){
    var pi=document.getElementById("pat"),ri=document.getElementById("repo"),bi=document.getElementById("branch");
    var p=(pi&&pi.value.trim())||"",r=(ri&&ri.value.trim())||"",b=(bi&&bi.value.trim())||"";
    if(p&&r)return{p:p,r:r,b:b||"main"};
    try{
      var s=JSON.parse(localStorage.getItem("vb")||"{}");
      if(!p)p=s.p||"";
      if(!r)r=s.r||"";
      if(!b)b=s.b||"";
      if(p&&r)return{p:p,r:r,b:b||"main"};
    }catch(e){}
    try{
      var pr=JSON.parse(localStorage.getItem("vb_projects")||"null");
      if(pr&&pr.projects&&pr.projects.length){
        var act=null;
        pr.projects.forEach(function(x){if(x.id===pr.active)act=x});
        if(!act)act=pr.projects[0];
        if(act&&act.pat&&act.repo)return{p:dec(act.pat),r:act.repo,b:act.branch||"main"};
      }
    }catch(e){}
    return null;
  }
  function ensureConn(quiet){
    var c=bestConn();
    if(!c||!window.setConn)return false;
    setConn(c.p,c.r,c.b);
    if(!quiet)say("auto-reconnected "+c.r);
    return true;
  }
  var lastSay=0;
  function note(code){
    var now=Date.now();
    if(now-lastSay>20000){lastSay=now;say("HTTP "+code+" detected — auto-reconnecting with saved PAT")}
  }
  if(window.api&&!window.__vbApiPatched){
    window.__vbApiPatched=true;
    var orig=window.api;
    window.api=function(method,path,body){
      return orig(method,path,body).catch(function(e){
        var code=e&&e.code;
        if(code!==401&&code!==404)throw e;
        note(code);
        if(!ensureConn(true))throw e;
        return orig(method,path,body).catch(function(e2){
          var c2=e2&&e2.code;
          if(c2!==401&&c2!==404)throw e2;
          ensureConn(true);
          return orig(method,path,body);
        });
      });
    };
  }
  var n=0;
  var iv=setInterval(function(){
    n++;
    var badge=document.getElementById("connbadge");
    var on=badge&&badge.classList.contains("on");
    var c=bestConn();
    if(!on&&c&&window.setConn)setConn(c.p,c.r,c.b);
    if(n>600)clearInterval(iv);
  },4000);
  window.vbReconn={ensure:ensureConn,best:bestConn};
})();