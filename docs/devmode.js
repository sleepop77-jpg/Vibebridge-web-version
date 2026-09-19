// DEV MODE v4: toggle lives in the OS menu bar, right after File/View/Help. Sidebar stays clean.
(function(){
  if(window.__vbDev)return;
  window.__vbDev=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  function repoParts(){
    var r=(document.getElementById("repo")||{}).value||"";
    if(!r){try{r=JSON.parse(localStorage.getItem("vb")||"{}").r||""}catch(e){}}
    var p=String(r).split("/");
    return p.length===2?p:null;
  }
  function branch(){try{return JSON.parse(localStorage.getItem("vb")||"{}").b||"main"}catch(e){return "main"}}
  function b64text(s){try{return decodeURIComponent(escape(atob(String(s).replace(/\s/g,""))))}catch(e){try{return atob(String(s).replace(/\s/g,""))}catch(e2){return ""}}}
  function css(){
    var st=document.createElement("style");
    st.textContent=".vbdevbtn{font:12px/1 -apple-system,'Segoe UI',Inter,sans-serif;font-weight:600;letter-spacing:.04em;padding:4px 10px;border-radius:6px;border:1px solid transparent;background:transparent;color:var(--faint,#8b949e);cursor:pointer;margin:0 2px;flex:none}"
     +".vbdevbtn:hover{background:rgba(177,186,196,.14);color:var(--text,#e6edf3)}"
     +".vbdevbtn.on{color:#3fb950;border-color:rgba(63,185,80,.55);background:rgba(63,185,80,.12);box-shadow:0 0 10px rgba(63,185,80,.25)}"
     +"body.vbdev #chat,body.vbdev #composerwrap,body.vbdev .footnote{display:none!important}"
     +"#vbwork{display:none;flex:1;min-height:0;flex-direction:column}"
     +"body.vbdev #vbwork{display:flex}"
     +".vwtop{display:flex;gap:8px;align-items:center;padding:8px 14px;border-bottom:1px solid var(--line,#30363d);background:var(--side,#161b22)}"
     +".vwtop .t{font-size:12px;font-weight:700;letter-spacing:.06em;color:var(--accent,#4493f8);text-transform:uppercase}"
     +".vwbody{flex:1;display:flex;min-height:0}"
     +".vleft{width:46%;min-width:220px;display:flex;flex-direction:column;min-height:0}"
     +".vleft textarea{flex:1;margin:0;border:none;border-radius:0;background:var(--code,#0e0616);color:var(--text,#ece4f6);font:12px/1.5 ui-monospace,Menlo,Consolas,monospace;padding:12px;resize:none;outline:none;white-space:pre;overflow:auto}"
     +".vdiv{width:6px;cursor:col-resize;background:var(--line,#333);flex:none}"
     +".vdiv:hover{background:var(--accent,#a678d8)}"
     +".vright{flex:1;min-width:260px;overflow:auto;padding:12px 14px}"
     +".vsec{font-size:10.5px;font-weight:700;letter-spacing:.08em;color:var(--faint,#77688c);text-transform:uppercase;margin:12px 0 6px}"
     +".vop{display:flex;gap:8px;align-items:center;padding:6px 8px;border:1px solid var(--line,#333);border-radius:6px;margin-bottom:5px;font-size:12px;background:var(--card,#141414)}"
     +".vop .k{font-size:9.5px;font-weight:700;border-radius:4px;padding:2px 6px;flex:none}"
     +".vop .k.FILE{background:rgba(63,185,80,.18);color:#3fb950}"
     +".vop .k.EDIT{background:rgba(210,153,34,.18);color:#d29922}"
     +".vop .k.DELETE{background:rgba(248,81,73,.18);color:#f85149}"
     +".vop .p{font-family:ui-monospace,Menlo,Consolas,monospace;color:var(--accent,#a678d8);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}"
     +".vop .v{margin-left:auto;font-size:10px;font-weight:700;flex:none}"
     +".vop .v.ok{color:#3fb950}.vop .v.miss{color:#f85149}.vop .v.wait{color:#77688c}"
     +".vwarn{font-size:11px;color:#d29922;border-left:2px solid #d29922;padding-left:8px;margin:4px 0}"
     +".vrow{display:flex;gap:8px;align-items:center;margin:6px 0;flex-wrap:wrap}"
     +".vrow input{flex:1;min-width:120px;background:var(--code,#0e0616);color:var(--text,#ece4f6);border:1px solid var(--line,#333);border-radius:6px;padding:6px 9px;font-size:12px}"
     +".vbtn{border:1px solid var(--line,#333);background:var(--bubble,#2a1b45);color:var(--text,#eee);border-radius:6px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer}"
     +".vbtn:hover{filter:brightness(1.2)}"
     +".vbtn.pri{background:#238636;border-color:transparent;color:#fff}"
     +".vbtn.pri:hover{background:#2ea043}"
     +".vbtn.danger{background:rgba(248,81,73,.15);color:#f85149;border-color:rgba(248,81,73,.4)}"
     +".vstatus{font:11px/1.6 ui-monospace,Menlo,Consolas,monospace;color:#8b949e;white-space:pre-wrap;margin-top:8px}";
    document.head.appendChild(st);
  }
  var work=null,ops=[],parseTimer=null,mounted=false;
  function build(){
    var w=E("div");w.id="vbwork";
    var top=E("div","vwtop");
    top.appendChild(E("span","t","Developer workbench"));
    var back=E("button","vbtn","← back to chat");
    back.onclick=function(){setDev(false)};
    top.appendChild(back);
    w.appendChild(top);
    var body=E("div","vwbody");
    var left=E("div","vleft");
    var ta=document.createElement("textarea");
    ta.id="vbpay";ta.placeholder="paste the ===VIBEBRIDGE=== payload the AI gave you…\nparses live · ctrl+enter pushes";
    ta.oninput=function(){clearTimeout(parseTimer);parseTimer=setTimeout(function(){doParse(ta.value)},400)};
    ta.addEventListener("keydown",function(e){if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();doPush()}});
    left.appendChild(ta);
    var div=E("div","vdiv");
    var right=E("div","vright");right.id="vbright";
    body.appendChild(left);body.appendChild(div);body.appendChild(right);
    w.appendChild(body);
    div.addEventListener("mousedown",function(e){
      e.preventDefault();
      function mv(ev){var r=body.getBoundingClientRect();var pct=((ev.clientX-r.left)/r.width)*100;left.style.width=Math.max(20,Math.min(75,pct))+"%"}
      function up(){removeEventListener("mousemove",mv);removeEventListener("mouseup",up)}
      addEventListener("mousemove",mv);addEventListener("mouseup",up);
    });
    return w;
  }
  function sec(t){return E("div","vsec",t)}
  function doParse(text){
    var right=document.getElementById("vbright");if(!right)return;
    right.innerHTML="";
    ops=[];
    if(!text||!/===VIBEBRIDGE===|===== (FILE|EDIT|DELETE):/.test(text)){
      right.appendChild(sec("waiting"));
      right.appendChild(E("div","vstatus","no payload detected yet.\nleft pane parses automatically."));
      return;
    }
    var r=window.parsePayload?parsePayload(text):null;
    if(!r||!r.ops||!r.ops.length){
      right.appendChild(sec("parse"));
      right.appendChild(E("div","vwarn","payload seen but no ops parsed — check block headers"));
      return;
    }
    ops=r.ops;
    right.appendChild(sec("parse · "+ops.length+" op(s)"));
    if(r.warning)right.appendChild(E("div","vwarn",r.warning));
    ops.forEach(function(op){
      var row=E("div","vop");
      row.appendChild(E("span","k "+op.kind,op.kind));
      row.appendChild(E("span","p",op.path));
      var v=E("span","v wait","…");
      row.appendChild(v);
      right.appendChild(row);
      preflightOp(op,v);
    });
    if(window.checklistFor){
      try{
        var items=checklistFor(ops);
        if(items&&items.length){
          right.appendChild(sec("feature checklist"));
          items.forEach(function(it){
            right.appendChild(E("div","vwarn",(it.name||"check")+" — "+(it.path||"")+(it.ok?"":" (MISSING)")));
          });
        }
      }catch(e){}
    }
    right.appendChild(sec("commit"));
    var row=E("div","vrow");
    var msg=document.createElement("input");msg.id="vbmsg";msg.value="feat: web push ("+ops.length+" ops)";
    var br=document.createElement("input");br.id="vbbranch";br.value=branch();br.style.maxWidth="120px";
    row.appendChild(msg);row.appendChild(br);
    right.appendChild(row);
    var row2=E("div","vrow");
    var push=E("button","vbtn pri","Push");push.onclick=doPush;
    var rev=E("button","vbtn danger","Revert last push");rev.onclick=doRevert;
    row2.appendChild(push);row2.appendChild(rev);
    right.appendChild(row2);
    var st=E("div","vstatus");st.id="vbstatus";st.textContent="preflight running…";
    right.appendChild(st);
  }
  async function preflightOp(op,vEl){
    var rp=repoParts();
    if(!rp||!window.api){vEl.textContent="no conn";vEl.className="v wait";return}
    if(op.kind==="FILE"){vEl.textContent="will write";vEl.className="v ok";return}
    try{
      var meta=await api("GET","/repos/"+rp[0]+"/"+rp[1]+"/contents/"+op.path);
      var content=b64text(meta.content);
      var h=op.hunks&&op.hunks[0];
      var res=h?applyEdit(content,h.find,h.replace):null;
      if(res!=null){vEl.textContent="will apply";vEl.className="v ok"}
      else{vEl.textContent="MISS";vEl.className="v miss"}
    }catch(e){
      if(e&&e.code===404){vEl.textContent="no file";vEl.className="v miss"}
      else{vEl.textContent="err";vEl.className="v miss"}
    }
    var st=document.getElementById("vbstatus");
    if(st)st.textContent="preflight done — green rows commit clean, red rows will abort the push.";
  }
  async function doPush(){
    var st=document.getElementById("vbstatus");
    if(!ops.length){say("nothing parsed to push");return}
    var missEls=document.querySelectorAll("#vbright .v.miss");
    if(missEls.length){say(missEls.length+" preflight miss(es) — fix or remove those ops");if(st)st.textContent="push blocked: "+missEls.length+" preflight miss(es).";return}
    if(!window.commitOps){say("commitOps missing");return}
    var msg=(document.getElementById("vbmsg")||{}).value||"feat: web push";
    var br=(document.getElementById("vbbranch")||{}).value||branch();
    if(br!==branch()){
      var pat=(document.getElementById("pat")||{}).value||"";
      if(!pat){try{pat=JSON.parse(localStorage.getItem("vb")||"{}").p||""}catch(e){}}
      var rp=repoParts();
      if(pat&&rp&&window.setConn)setConn(pat,rp[0]+"/"+rp[1],br);
    }
    if(st)st.textContent="pushing…";
    try{
      var c=await commitOps(ops,msg);
      if(st)st.textContent="pushed "+c.sha.slice(0,7)+" on "+br+"\npolling CI…";
      say("pushed "+c.sha.slice(0,7));
      pollCi(c.sha,st);
    }catch(e){
      if(st)st.textContent="push failed: "+e.message;
      say("push failed: "+e.message);
    }
  }
  async function pollCi(sha,st){
    var rp=repoParts();if(!rp||!window.latestRun)return;
    for(var i=0;i<6;i++){
      await new Promise(function(r){setTimeout(r,10000)});
      try{
        var run=await latestRun();
        if(run){
          if(st)st.textContent="pushed "+sha.slice(0,7)+"\nCI: "+run.status+" / "+(run.conclusion||"running");
          if(run.conclusion)return;
        }
      }catch(e){}
    }
  }
  async function doRevert(){
    var st=document.getElementById("vbstatus");
    var rp=repoParts();
    if(!rp||!window.api){say("connect first");return}
    if(!confirm("revert the last successful push?"))return;
    var hist=[];try{hist=JSON.parse(localStorage.getItem("vb_pushes")||"[]")}catch(e){}
    var last=null;
    for(var i=hist.length-1;i>=0;i--){if(hist[i].ok&&hist[i].sha){last=hist[i];break}}
    if(!last){say("no pushed sha in history");return}
    if(st)st.textContent="reverting "+last.sha.slice(0,7)+"…";
    try{
      var bad=await api("GET","/repos/"+rp[0]+"/"+rp[1]+"/git/commits/"+last.sha);
      var parentSha=bad.parents&&bad.parents[0]?bad.parents[0].sha:null;
      if(!parentSha){say("cannot revert root commit");return}
      var parent=await api("GET","/repos/"+rp[0]+"/"+rp[1]+"/git/commits/"+parentSha);
      var nc=await api("POST","/repos/"+rp[0]+"/"+rp[1]+"/git/commits",{message:"revert: "+last.sha.slice(0,7),tree:parent.tree.sha,parents:[last.sha]});
      await api("PATCH","/repos/"+rp[0]+"/"+rp[1]+"/git/refs/heads/"+branch(),{sha:nc.sha,force:false});
      if(st)st.textContent="reverted → "+nc.sha.slice(0,7);
      say("reverted to pre-"+last.sha.slice(0,7));
    }catch(e){if(st)st.textContent="revert failed: "+e.message}
  }
  function setDev(on){
    try{localStorage.setItem("vb_devmode",on?"1":"0")}catch(e){}
    document.body.classList.toggle("vbdev",on);
    var b=document.getElementById("devbtn");
    if(b){b.classList.toggle("on",on);b.textContent=on?"DEV ON":">_ DEV"}
    if(on&&!work){work=build();var main=document.getElementById("main");if(main)main.appendChild(work)}
    if(on)doParse((document.getElementById("vbpay")||{}).value||"");
  }
  function makeBtn(){
    var b=document.createElement("button");
    b.id="devbtn";b.className="vbdevbtn";b.textContent=">_ DEV";b.title="developer workbench";
    b.onclick=function(){setDev(!document.body.classList.contains("vbdev"))};
    if(document.body.classList.contains("vbdev")){b.classList.add("on");b.textContent="DEV ON"}
    return b;
  }
  function mountBar(){
    if(document.getElementById("devbtn"))return true;
    var old=document.getElementById("dev-side");if(old)old.remove();
    var bar=document.getElementById("vbmenubar");
    if(!bar)return false;
    var menus=bar.querySelectorAll(".mb, .vmenubtn");
    var ref=null;
    if(menus.length)ref=menus[menus.length-1].nextSibling;
    else{var brand=bar.querySelector(".vbbrand");ref=brand?brand.nextSibling:bar.firstChild}
    bar.insertBefore(makeBtn(),ref);
    return true;
  }
  function mountHeader(){
    if(document.getElementById("devbtn"))return true;
    var hdr=document.querySelector("#main header");
    if(!hdr)return false;
    var mw=hdr.querySelector(".modelwrap");
    hdr.insertBefore(makeBtn(),mw?mw.nextSibling:hdr.firstChild);
    return true;
  }
  css();
  var tries=0;
  var iv=setInterval(function(){
    tries++;
    if(mountBar()){mounted=true;clearInterval(iv)}
    else if(tries>40){mounted=mountHeader();clearInterval(iv)}
  },250);
  if(mountBar())mounted=true;
  try{if(localStorage.getItem("vb_devmode")==="1")setDev(true)}catch(e){}
})();