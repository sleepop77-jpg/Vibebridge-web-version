// OPTIONS PANEL v4 (new filename = cache-proof): credentials manager with Connect,
// thin edgy buttons, plus a ALWAYS-VISIBLE floating ⚙ Options button so it can never
// be "not visible" again (narrow screens hide the left rail; cached old JS hid the rest).
(function(){
  if(window.__vbOptPanel)return;
  window.__vbOptPanel=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  var modal=null,remChk=null,patLine=null,testLine=null;
  var bootPat="",userCleared=false;
  try{userCleared=sessionStorage.getItem("vb_pat_cleared")==="1"}catch(e){}
  function savedVB(){try{return JSON.parse(localStorage.getItem("vb")||"{}")}catch(e){return {}}}
  function writeVB(o){try{localStorage.setItem("vb",JSON.stringify(o))}catch(e){}}
  function currentPat(){
    var p=(document.getElementById("pat")||{}).value||"";
    if(!p)p=savedVB().p||"";
    if(!p)p=bootPat;
    return p;
  }
  function mask(p){p=String(p||"");if(!p)return "(none saved)";if(p.length<=10)return "••••••";return p.slice(0,6)+"…"+p.slice(-4)}
  function rehydrate(){
    var s=savedVB();
    var pi=document.getElementById("pat"),ri=document.getElementById("repo"),bi=document.getElementById("branch");
    if(!userCleared&&(s.p||bootPat)&&pi&&!pi.value)pi.value=s.p||bootPat;
    if(s.r&&ri&&!ri.value)ri.value=s.r;
    if(s.b&&bi&&!bi.value)bi.value=s.b;
  }
  function forgetPat(all){
    userCleared=true;bootPat="";
    try{sessionStorage.setItem("vb_pat_cleared","1")}catch(e){}
    try{var vb=savedVB();delete vb.p;writeVB(vb)}catch(e){}
    var pi=document.getElementById("pat");if(pi)pi.value="";
    if(all){
      try{var pr=JSON.parse(localStorage.getItem("vb_projects")||"null");if(pr&&pr.projects){pr.projects.forEach(function(p){p.pat=""});localStorage.setItem("vb_projects",JSON.stringify(pr))}}catch(e){}
      try{var bf=JSON.parse(localStorage.getItem("vb_backupflow")||"null");if(bf&&bf.pat){bf.pat="";localStorage.setItem("vb_backupflow",JSON.stringify(bf))}}catch(e){}
    }
    var ri=document.getElementById("repo"),bi=document.getElementById("branch");
    if(window.setConn&&ri&&ri.value)setConn("",ri.value,(bi&&bi.value)||"main");
    say(all?"all stored tokens removed":"saved PAT removed");
    refresh();
  }
  function refresh(){
    if(patLine)patLine.textContent="stored token: "+mask(currentPat());
    var r=document.getElementById("remember");
    if(remChk)remChk.checked=r?r.checked:!!(savedVB().p||bootPat);
  }
  function testConn(){
    if(!testLine)return;
    var p=currentPat();
    if(!p){testLine.textContent="no token stored — use ⚡ Connect first (401 = no valid credentials sent)";testLine.style.color="#d29922";return}
    testLine.textContent="testing…";testLine.style.color="";
    var ri=document.getElementById("repo");
    var repo=(ri&&ri.value)||savedVB().r||"";
    var parts=String(repo).split("/");
    var target=parts.length===2?("/repos/"+parts[0]+"/"+parts[1]):"/user";
    var pi=document.getElementById("pat");if(pi&&!pi.value)pi.value=p;
    window.api("GET",target).then(function(res){
      testLine.textContent="OK ✔ authenticated as "+(res.owner?res.owner.login:res.login);
      testLine.style.color="#3fb950";
    }).catch(function(e){
      var c=e&&e.code;
      testLine.textContent=c===401?"HTTP 401 = Bad credentials: token missing/expired/revoked. New PAT + ⚡ Connect.":c===403?"HTTP 403 = token valid but NOT allowed here (scope/repo access/SSO/rate limit).":c===404?"HTTP 404 = repo not visible to this token.":"failed: "+(e&&e.message?e.message:e);
      testLine.style.color="#f85149";
    });
  }
  function doConnect(){
    rehydrate();
    var pi=document.getElementById("pat"),ri=document.getElementById("repo"),bi=document.getElementById("branch");
    var p=(pi&&pi.value)||"",r=(ri&&ri.value)||"";
    if(!p){p=prompt("Paste your GitHub PAT:","")||"";if(pi)pi.value=p}
    if(!r){r=prompt("Repo (owner/name):","")||"";if(ri)ri.value=r}
    if(!p||!r){say("need PAT and repo to connect");return}
    if(bi&&!bi.value)bi.value="main";
    userCleared=false;bootPat=p;
    try{sessionStorage.removeItem("vb_pat_cleared")}catch(e){}
    var c=document.getElementById("connect");
    if(c)c.click();
    else if(window.setConn){setConn(p,r,(bi&&bi.value)||"main");writeVB({p:p,r:r,b:(bi&&bi.value)||"main"})}
    say("connecting…");
    setTimeout(testConn,700);
    refresh();
  }
  function build(){
    modal=E("div","modal hidden");
    modal.id="vbop-modal";
    modal.style.zIndex="1200";
    var card=E("div","modalcard");
    card.id="vbop-card";
    card.style.maxWidth="440px";
    card.appendChild(E("h3","","Options & credentials"));
    var l=E("label","chk");
    remChk=document.createElement("input");remChk.type="checkbox";
    l.appendChild(remChk);
    l.appendChild(document.createTextNode(" remember credentials on this browser"));
    remChk.onchange=function(){
      var r=document.getElementById("remember");if(r)r.checked=remChk.checked;
      if(!remChk.checked){if(confirm("Stop remembering and delete saved credentials now?"))forgetPat(true)}
      else{
        var pi=document.getElementById("pat"),ri=document.getElementById("repo"),bi=document.getElementById("branch");
        var ex=savedVB();
        var p=(pi&&pi.value)||ex.p||bootPat||"";
        if(p&&ri&&ri.value){
          writeVB({p:p,r:ri.value,b:(bi&&bi.value)||ex.b||"main"});
          userCleared=false;bootPat=p;
          try{sessionStorage.removeItem("vb_pat_cleared")}catch(e){}
          if(window.setConn)setConn(p,ri.value,(bi&&bi.value)||"main");
          say("credentials will be remembered");
        }else say("connect once first");
      }
      refresh();
    };
    card.appendChild(l);
    patLine=E("div","small dim","");patLine.style.margin="8px 0 4px";card.appendChild(patLine);
    testLine=E("div","small dim","");testLine.style.margin="0 0 8px";card.appendChild(testLine);
    function btn(t,fn){var b=E("button","mini",t);b.onclick=fn;return b}
    var row=E("div","cardbtns");
    row.appendChild(btn("Test connection",testConn));
    row.appendChild(btn("Copy PAT",function(){var p=currentPat();if(p){navigator.clipboard.writeText(p);say("PAT copied")}else say("no PAT stored")}));
    card.appendChild(row);
    var rowC=E("div","cardbtns");
    rowC.appendChild(btn("⚡ Connect",doConnect));
    card.appendChild(rowC);
    var row1=E("div","cardbtns");
    row1.appendChild(btn("Remove saved PAT",function(){forgetPat(false)}));
    row1.appendChild(btn("Remove ALL tokens",function(){if(confirm("Remove sidebar PAT, project PATs and backup PAT?"))forgetPat(true)}));
    card.appendChild(row1);
    var row2=E("div","cardbtns");
    row2.appendChild(btn("Customize theme…",function(){modal.classList.add("hidden");var s=document.getElementById("skin-side");if(s)s.click()}));
    var cls=E("button","green","Close");cls.onclick=function(){modal.classList.add("hidden")};
    row2.appendChild(cls);
    card.appendChild(row2);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }
  function open(){
    if(!modal)build();
    rehydrate();
    modal.classList.remove("hidden");
    refresh();
  }
  function wire(){
    var b=document.querySelector(".sk-menu button[data-act='options']");
    if(b&&!b.dataset.optHook2){b.dataset.optHook2="1";b.onclick=function(e){e.stopPropagation();open()}}
    if(!document.getElementById("vbop-fab")){
      var fab=E("button","","⚙");
      fab.id="vbop-fab";
      fab.title="Options & credentials";
      fab.style.cssText="position:fixed;left:10px;bottom:10px;z-index:1150;width:34px;height:34px;border-radius:3px;border:1px solid #c8bb8e;background:#faf6e8;color:#33291a;font-size:16px;cursor:pointer;box-shadow:0 4px 14px rgba(51,41,26,.25)";
      fab.onclick=function(e){e.stopPropagation();open()};
      document.body.appendChild(fab);
    }
  }
  var st=document.createElement("style");
  st.id="vb-optpanel-css";
  st.textContent=""
   +"#vbop-card button{border-radius:2px!important;padding:2px 9px!important;font-size:10px!important;font-weight:600!important;line-height:1.5!important;min-height:0!important;letter-spacing:.03em}"
   +"#vbop-card .cardbtns{gap:6px!important;margin-top:6px!important;flex-wrap:wrap}"
   +"#vbop-card h3{font-size:13px!important}"
   +"#vbop-card .chk{font-size:11.5px!important}";
  document.head.appendChild(st);
  bootPat=savedVB().p||"";
  rehydrate();
  var n=0;
  var iv=setInterval(function(){
    n++;
    wire();
    var s=savedVB();
    if(s.p){userCleared=false;bootPat=s.p}
    if(!userCleared){
      rehydrate();
      if(!s.p&&bootPat)writeVB({p:bootPat,r:s.r||((document.getElementById("repo")||{}).value)||"",b:s.b||"main"});
    }
    if(n>400)clearInterval(iv);
  },2500);
  window.vbOptPanel={open:open,forget:forgetPat,test:testConn,connect:doConnect};
  window.vbStudioOptions=window.vbOptPanel;
})();