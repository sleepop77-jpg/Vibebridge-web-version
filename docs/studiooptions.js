// STUDIO OPTIONS v1: restores "remember credentials" + adds credential management
// (copy / remove saved PAT / remove ALL stored tokens) under the Studio left-menu
// "Options" entry, which previously just opened the theme customizer.
(function(){
  if(window.__vbStudioOptions)return;
  window.__vbStudioOptions=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  var modal=null,remChk=null,patLine=null;
  function savedVB(){try{return JSON.parse(localStorage.getItem("vb")||"{}")}catch(e){return {}}}
  function currentPat(){
    var p=(document.getElementById("pat")||{}).value||"";
    if(!p)p=savedVB().p||"";
    return p;
  }
  function mask(p){
    p=String(p||"");
    if(!p)return "(none saved)";
    if(p.length<=10)return "••••••";
    return p.slice(0,6)+"…"+p.slice(-4);
  }
  function forgetPat(all){
    try{
      var vb=JSON.parse(localStorage.getItem("vb")||"{}");
      delete vb.p;
      localStorage.setItem("vb",JSON.stringify(vb));
    }catch(e){}
    var pi=document.getElementById("pat");
    if(pi)pi.value="";
    if(all){
      try{
        var pr=JSON.parse(localStorage.getItem("vb_projects")||"null");
        if(pr&&pr.projects){pr.projects.forEach(function(p){p.pat=""});localStorage.setItem("vb_projects",JSON.stringify(pr))}
      }catch(e){}
      try{
        var bf=JSON.parse(localStorage.getItem("vb_backupflow")||"null");
        if(bf&&bf.pat){bf.pat="";localStorage.setItem("vb_backupflow",JSON.stringify(bf))}
      }catch(e){}
      try{
        var se=JSON.parse(localStorage.getItem("vb_studio_projmeta")||"null");
        if(se){Object.keys(se).forEach(function(k){if(se[k])se[k].pat=""});localStorage.setItem("vb_studio_projmeta",JSON.stringify(se))}
      }catch(e){}
    }
    var ri=document.getElementById("repo"),bi=document.getElementById("branch");
    if(window.setConn&&ri&&ri.value)setConn("",ri.value,(bi&&bi.value)||"main");
    say(all?"all stored tokens removed":"saved PAT removed — reconnect to push");
    refresh();
  }
  function refresh(){
    if(patLine)patLine.textContent="stored token: "+mask(currentPat());
    var r=document.getElementById("remember");
    if(remChk)remChk.checked=r?r.checked:!!savedVB().p;
  }
  function build(){
    modal=E("div","modal hidden");
    var card=E("div","modalcard");
    card.style.maxWidth="480px";
    card.appendChild(E("h3","","Options & credentials"));
    var l=E("label","chk");
    remChk=document.createElement("input");
    remChk.type="checkbox";
    l.appendChild(remChk);
    l.appendChild(document.createTextNode(" remember credentials on this browser"));
    remChk.onchange=function(){
      var r=document.getElementById("remember");
      if(r)r.checked=remChk.checked;
      if(!remChk.checked){
        if(confirm("Stop remembering and delete saved credentials now?"))forgetPat(true);
      }else{
        var pi=document.getElementById("pat"),ri=document.getElementById("repo"),bi=document.getElementById("branch");
        if(pi&&ri&&pi.value&&ri.value){
          try{localStorage.setItem("vb",JSON.stringify({p:pi.value,r:ri.value,b:(bi&&bi.value)||"main"}))}catch(e){}
        }
      }
      refresh();
    };
    card.appendChild(l);
    patLine=E("div","small dim","");
    patLine.style.margin="8px 0";
    card.appendChild(patLine);
    function btn(t,fn){var b=E("button","mini",t);b.onclick=fn;return b}
    var row=E("div","cardbtns");
    row.appendChild(btn("Copy PAT",function(){
      var p=currentPat();
      if(p){navigator.clipboard.writeText(p);say("PAT copied")}else say("no PAT stored");
    }));
    row.appendChild(btn("Remove saved PAT",function(){forgetPat(false)}));
    row.appendChild(btn("Remove ALL tokens",function(){
      if(confirm("Remove sidebar PAT, project PATs and backup PAT?"))forgetPat(true);
    }));
    card.appendChild(row);
    var row2=E("div","cardbtns");
    row2.appendChild(btn("Customize theme…",function(){
      modal.classList.add("hidden");
      var s=document.getElementById("skin-side");
      if(s)s.click();
    }));
    var cls=E("button","green","Close");
    cls.onclick=function(){modal.classList.add("hidden")};
    row2.appendChild(cls);
    card.appendChild(row2);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }
  function open(){
    if(!modal)build();
    modal.classList.remove("hidden");
    refresh();
  }
  function wireOptionsButton(){
    var b=document.querySelector(".sk-menu button[data-act='options']");
    if(b&&!b.dataset.optHook){
      b.dataset.optHook="1";
      b.onclick=function(e){e.stopPropagation();open()};
    }
  }
  var n=0;
  var iv=setInterval(function(){
    n++;
    wireOptionsButton();
    if(n>200)clearInterval(iv);
  },500);
  window.vbStudioOptions={open:open,forget:forgetPat};
})();