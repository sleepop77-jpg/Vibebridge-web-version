// ONBOARD: guided connect + 3-step card + the one-time bootstrap prompt owner. Isolated.
(function(){
  if(window.__vbOnboard)return;
  window.__vbOnboard=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  var TOKEN_URL="https://github.com/settings/tokens/new?scopes=repo,workflow&description=VibeBridge";
  var modal=null;
  window.vbBootstrapPrompt=function(){
    var m=(document.getElementById("modelbtn")||{}).textContent||"your AI";
    return "You are my code engine for this project (target "+m+").\nRules: converse normally and briefly; when I ask for code, features, fixes or file changes, reply ONLY with a VibeBridge bridge payload: first line ===VIBEBRIDGE=== v1, then ===== FILE: path ===== blocks with FULL file content, or ===== EDIT: path ===== hunks with --- FIND / --- REPLACE / --- END where FIND quotes exact existing lines. No prose outside blocks.\nThis setup is pasted ONCE; afterwards we just talk and you emit payloads only when I ask for changes.";
  };
  function css(){
    var st=document.createElement("style");
    st.textContent=".obcard{max-width:520px;width:94%;margin:10px auto 4px;background:var(--card,rgba(14,7,22,.9));border:1px solid var(--line,#333);border-radius:12px;padding:14px 16px;text-align:left}"
     +".obcard h4{font-size:12px;letter-spacing:.06em;color:var(--accent,#a678d8);text-transform:uppercase;margin-bottom:8px}"
     +".obstep{display:flex;gap:10px;align-items:flex-start;padding:6px 0;font-size:12.5px;color:var(--dim,#b6a6c9)}"
     +".obstep .n{width:22px;height:22px;flex:none;border-radius:50%;border:1px solid var(--line,#333);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--faint,#77688c)}"
     +".obstep.done .n{background:var(--accent2,#7dd8a5);border-color:transparent;color:#04140b}"
     +".obstep button{border:1px solid var(--line,#333);background:var(--bubble,rgba(20,10,32,.6));color:var(--text,#ece4f6);border-radius:7px;padding:4px 10px;font-size:11.5px;font-weight:600;cursor:pointer;margin-left:auto;flex:none}"
     +".obtool{max-width:480px;width:95%;max-height:90vh;overflow:auto;background:var(--card,#141414);border:1px solid var(--line,#333);border-radius:14px;padding:18px}"
     +".obtool h3{color:var(--text,#fff);font-size:14px;margin-bottom:4px}"
     +".obtool .help{font-size:10.5px;color:var(--faint,#8a8a8a);margin-bottom:12px}"
     +".obrow{margin:10px 0;font-size:12.5px;color:var(--dim,#aaa)}"
     +".obbtn{border:1px solid var(--line,#333);border-radius:8px;padding:7px 14px;font-size:12px;font-weight:600;color:var(--text,#eee);background:var(--bubble,#21262d);cursor:pointer;margin:4px 6px 4px 0}"
     +".obbtn.pri{background:var(--accent,#6d4a94);border-color:transparent;color:#fff}"
     +".obtool input,.obtool select{width:100%;background:var(--code,#0e0616);color:var(--text,#ccc);border:1px solid var(--line,#333);border-radius:8px;padding:7px 9px;font-size:12px;margin:4px 0}";
    document.head.appendChild(st);
  }
  function connected(){var b=document.getElementById("connbadge");return !!b&&b.classList.contains("on")}
  function buildCard(){
    var empty=document.getElementById("empty");
    if(!empty||document.getElementById("obcard"))return;
    var card=E("div","obcard");card.id="obcard";
    card.appendChild(E("h4","","Start here — three steps"));
    var s1=E("div","obstep");s1.id="obs1";
    s1.appendChild(E("span","n","1"));
    s1.appendChild(E("span","","<b>Connect GitHub</b> — guided, no jargon: we open the exact token page for you"));
    var b1=E("button","","Connect");b1.onclick=openWizard;s1.appendChild(b1);
    var s2=E("div","obstep");s2.id="obs2";
    s2.appendChild(E("span","n","2"));
    s2.appendChild(E("span","","<b>Copy the setup prompt</b> — paste it into your AI chat once; after that just talk normally"));
    var b2=E("button","","Copy setup");
    b2.onclick=function(){
      navigator.clipboard.writeText(window.vbBootstrapPrompt()).then(function(){
        try{localStorage.setItem("vb_format_copied","1")}catch(e){}
        say("setup prompt copied — paste it once into your AI chat");syncCard();
      });
    };
    s2.appendChild(b2);
    var s3=E("div","obstep");s3.id="obs3";
    s3.appendChild(E("span","n","3"));
    s3.appendChild(E("span","","<b>Paste payloads back here</b> — when the AI replies with ===VIBEBRIDGE=== blocks, paste them and push"));
    card.appendChild(s1);card.appendChild(s2);card.appendChild(s3);
    var tag=empty.querySelector(".tagline");
    if(tag&&tag.parentNode)tag.parentNode.insertBefore(card,tag.nextSibling);
    syncCard();
  }
  function syncCard(){
    var s1=document.getElementById("obs1"),s2=document.getElementById("obs2");
    if(s1)s1.classList.toggle("done",connected());
    if(s2)s2.classList.toggle("done",!!localStorage.getItem("vb_format_copied"));
  }
  function buildWizard(){
    var m=E("div","modal");
    var card=E("div","obtool");
    card.appendChild(E("h3","","Connect GitHub — guided"));
    card.appendChild(E("div","help","three clicks. we open github's token page with the right scopes already ticked; you paste; you pick your repo from a list. no owner/repo typing, no scope guessing."));
    card.appendChild(E("div","obrow","<b>Step 1.</b> Create the token (opens in a new tab — scroll down and click Generate)"));
    var b1=E("button","obbtn pri","Open GitHub token page");
    b1.onclick=function(){window.open(TOKEN_URL,"_blank")};
    card.appendChild(b1);
    card.appendChild(E("div","obrow","<b>Step 2.</b> Paste the token (starts with ghp_ or github_pat_)"));
    var ti=document.createElement("input");ti.type="password";ti.placeholder="ghp_… / github_pat_…";
    card.appendChild(ti);
    card.appendChild(E("div","obrow","<b>Step 3.</b> Pick your repo"));
    var sel=document.createElement("select");sel.innerHTML="<option value=''>— connect token first to list repos —</option>";sel.disabled=true;
    card.appendChild(sel);
    var br=document.createElement("input");br.value="main";br.placeholder="branch (main)";
    card.appendChild(br);
    var st=E("div","obrow","");st.style.fontSize="11px";
    card.appendChild(st);
    var row=E("div","");
    var go=E("button","obbtn pri","Load my repos");
    go.onclick=async function(){
      var pat=ti.value.trim();
      if(!pat){st.textContent="paste the token first";return}
      st.textContent="validating…";
      if(!window.setConn(pat,"x/x",br.value.trim()||"main")){st.textContent="bad token format";return}
      try{
        var login=await validate();
        var repos=await api("GET","/user/repos?affiliation=owner&sort=updated&per_page=25");
        sel.innerHTML="";sel.disabled=false;
        (repos||[]).forEach(function(r){var o=document.createElement("option");o.value=r.full_name;o.textContent=r.full_name;sel.appendChild(o)});
        st.textContent="hi "+login+" — pick a repo below, then Connect";
        window._obPat=pat;
      }catch(e){st.textContent="failed: "+e.message;sel.disabled=true}
    };
    var cn=E("button","obbtn pri","Connect");
    cn.onclick=function(){
      var pat=window._obPat||ti.value.trim(),repo=sel.value;
      if(!pat||!repo){st.textContent="token + repo needed";return}
      if(window.setConn(pat,repo,br.value.trim()||"main")){
        var rem=document.getElementById("remember");
        if(rem&&rem.checked){try{localStorage.setItem("vb",JSON.stringify({p:pat,r:repo,b:br.value.trim()||"main"}))}catch(e){}}
        var p=document.getElementById("pat");if(p)p.value=pat;
        var r=document.getElementById("repo");if(r)r.value=repo;
        var bb=document.getElementById("connbadge");if(bb){bb.className="badge on";bb.textContent=repo}
        var cs=document.getElementById("connstatus");if(cs){cs.textContent="connected (guided)";cs.className="dim small good"}
        st.textContent="connected to "+repo;
        say("connected to "+repo);
        syncCard();
        m.classList.add("hidden");
      }
    };
    var cl=E("button","obbtn","Close");cl.onclick=function(){m.classList.add("hidden")};
    row.appendChild(go);row.appendChild(cn);row.appendChild(cl);
    card.appendChild(row);
    m.appendChild(card);
    return m;
  }
  function openWizard(){
    if(!modal){modal=buildWizard();document.body.appendChild(modal)}
    modal.classList.remove("hidden");
  }
  css();
  buildCard();
  var sb=document.getElementById("sb");
  if(sb&&!document.getElementById("ob-side")){
    var b=E("button","sidebtn glow","Connect GitHub (guided)");
    b.id="ob-side";
    b.onclick=openWizard;
    var nc=document.getElementById("newchat");
    if(nc&&nc.parentNode)nc.parentNode.insertBefore(b,nc.nextSibling);
  }
  try{
    if(!connected()&&!localStorage.getItem("vb_onboard_seen")){
      localStorage.setItem("vb_onboard_seen","1");
      setTimeout(openWizard,600);
    }
  }catch(e){}
  window.vbOnboardSync=syncCard;
})();