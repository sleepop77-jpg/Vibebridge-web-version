// IMAGE PUSH: attach images (picker / drag / paste), rename inline, commit as blobs. Plus rename/move any repo file.
(function(){
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  function b64bytes(u8){var s="";for(var i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
  function slug(n){return n.replace(/\.[a-z0-9]+$/i,"").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")||"img"}
  function extOf(n){var m=n.match(/\.[a-z0-9]+$/i);return m?m[0]:".png"}
  function encPath(p){return p.split("/").map(function(s){return encodeURIComponent(s)}).join("/")}
  var PREFIXES=["app/src/main/res/drawable-nodpi/","docs/assets/","assets/",""];
  var items=[],modal=null,prefix=PREFIXES[0];
  async function commitEntries(entries,message){
    var refSha=null,baseTree=null;
    try{
      var ref=await api("GET","/repos/"+OWNER+"/"+REPO+"/git/ref/heads/"+BRANCH);
      refSha=ref.object.sha;
      var com=await api("GET","/repos/"+OWNER+"/"+REPO+"/git/commits/"+refSha);
      baseTree=com.tree.sha;
    }catch(e){
      if(e.code!==404)throw e;
      await api("GET","/repos/"+OWNER+"/"+REPO);
    }
    var tb={tree:entries};
    if(baseTree)tb.base_tree=baseTree;
    var tree=await api("POST","/repos/"+OWNER+"/"+REPO+"/git/trees",tb);
    var commit=await api("POST","/repos/"+OWNER+"/"+REPO+"/git/commits",{message:message,tree:tree.sha,parents:refSha?[refSha]:[]});
    if(refSha)await api("PATCH","/repos/"+OWNER+"/"+REPO+"/git/refs/heads/"+BRANCH,{sha:commit.sha,force:false});
    else await api("POST","/repos/"+OWNER+"/"+REPO+"/git/refs",{ref:"refs/heads/"+BRANCH,sha:commit.sha});
    return commit;
  }
  function addFiles(list){
    Array.prototype.forEach.call(list,function(f){
      if(!f.type||f.type.indexOf("image/")!==0){say("skipped non-image: "+f.name);return}
      if(f.size>5*1024*1024)say("warning: "+f.name+" is over 5MB");
      items.push({file:f,url:URL.createObjectURL(f),path:prefix+slug(f.name)+extOf(f.name)});
    });
    renderList();
  }
  function renderList(){
    var box=$("#img-list");if(!box)return;
    box.innerHTML="";
    items.forEach(function(it,idx){
      var row=E("div","imgrow");
      var th=E("img","imgth");th.src=it.url;
      var inp=document.createElement("input");inp.value=it.path;inp.className="imgpath";
      inp.oninput=function(){it.path=inp.value};
      var rm=E("button","fbtn","x");
      rm.onclick=function(){URL.revokeObjectURL(it.url);items.splice(idx,1);renderList()};
      row.appendChild(th);row.appendChild(inp);row.appendChild(rm);
      box.appendChild(row);
    });
    var st=$("#img-status");
    if(st)st.textContent=items.length?items.length+" image(s) staged":"no images staged";
    var pb=$("#img-push");if(pb)pb.disabled=!items.length;
  }
  async function pushImages(){
    if(!window.api||!OWNER||!PAT){say("connect to github first");return}
    var st=$("#img-status");st.textContent="uploading blobs…";
    try{
      var entries=[];
      for(var i=0;i<items.length;i++){
        var buf=await items[i].file.arrayBuffer();
        var b=await api("POST","/repos/"+OWNER+"/"+REPO+"/git/blobs",{content:b64bytes(new Uint8Array(buf)),encoding:"base64"});
        entries.push({path:items[i].path,mode:"100644",type:"blob",sha:b.sha});
      }
      st.textContent="committing…";
      var c=await commitEntries(entries,"assets: add "+entries.length+" image(s) via VibeBridge");
      items.forEach(function(it){URL.revokeObjectURL(it.url)});
      items=[];renderList();
      st.textContent="pushed commit "+c.sha.slice(0,7);
      say("images pushed to "+REPO);
    }catch(e){st.textContent="failed: "+e.message}
  }
  async function renameExisting(){
    if(!window.api||!OWNER||!PAT){say("connect to github first");return}
    var oldP=$("#rn-old").value.trim(),newP=$("#rn-new").value.trim();
    var st=$("#rn-status");
    if(!oldP||!newP){st.textContent="fill both paths";return}
    st.textContent="resolving…";
    try{
      var cur=await api("GET","/repos/"+OWNER+"/"+REPO+"/contents/"+encPath(oldP)+"?ref="+BRANCH);
      var entries=[
        {path:newP,mode:cur.mode||"100644",type:"blob",sha:cur.sha},
        {path:oldP,mode:cur.mode||"100644",type:"blob",sha:null}
      ];
      var c=await commitEntries(entries,"chore: rename "+oldP+" to "+newP);
      st.textContent="renamed in commit "+c.sha.slice(0,7);
    }catch(e){st.textContent="failed: "+e.message}
  }
  function build(){
    var m=E("div","modal");
    var st=document.createElement("style");
    st.textContent=".imgtool{max-width:560px;width:95%;max-height:90vh;overflow:auto;background:var(--card,#141414);border:1px solid var(--line,#333);border-radius:14px;padding:18px}"
      +".imgtool h3{color:#fff;font-size:14px;margin-bottom:4px}"
      +".imgtool .help{font-size:10.5px;color:#8a8a8a;margin-bottom:10px}"
      +".imgdrop{border:2px dashed #4a3a6a;border-radius:12px;padding:18px;text-align:center;color:#9a8fb0;font-size:12px;cursor:pointer;margin:8px 0}"
      +".imgdrop:hover{border-color:#a678d8;color:#d9c6f2}"
      +".imgrow{display:flex;gap:8px;align-items:center;margin:6px 0}"
      +".imgth{width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid #333}"
      +".imgpath{flex:1;font:11px ui-monospace,Menlo,Consolas,monospace}"
      +".imgrowbtns{display:flex;gap:8px;margin:8px 0;flex-wrap:wrap}"
      +".imgsec{font-size:11px;font-weight:600;color:#8a8a8a;margin:14px 0 4px;letter-spacing:.05em}";
    m.appendChild(st);
    var card=E("div","imgtool");
    card.appendChild(E("h3","","Images"));
    card.appendChild(E("div","help","pick, drag or ctrl+v images. rename each inline, choose the folder, push as one commit. no github web ui involved."));
    var sel=document.createElement("select");
    PREFIXES.forEach(function(p){var o=document.createElement("option");o.value=p;o.textContent=p||"(repo root)";sel.appendChild(o)});
    sel.onchange=function(){prefix=sel.value};
    sel.style.cssText="background:#0e0616;color:#ccc;border:1px solid #333;border-radius:8px;padding:6px;font-size:12px;margin:4px 0";
    card.appendChild(sel);
    var drop=E("div","imgdrop","drop images here • click to pick • or ctrl+v anywhere in this window");
    var fi=document.createElement("input");fi.type="file";fi.accept="image/*";fi.multiple=true;fi.style.display="none";
    fi.onchange=function(){addFiles(fi.files);fi.value=""};
    drop.onclick=function(){fi.click()};
    drop.addEventListener("dragover",function(e){e.preventDefault()});
    drop.addEventListener("drop",function(e){e.preventDefault();addFiles(e.dataTransfer.files)});
    card.appendChild(drop);card.appendChild(fi);
    var list=E("div","");list.id="img-list";
    card.appendChild(list);
    var r=E("div","imgrowbtns");
    var pb=E("button","fbtn","Push images");pb.id="img-push";pb.disabled=true;
    pb.onclick=pushImages;
    var cb=E("button","fbtn","Clear");
    cb.onclick=function(){items.forEach(function(it){URL.revokeObjectURL(it.url)});items=[];renderList()};
    r.appendChild(pb);r.appendChild(cb);
    card.appendChild(r);
    card.appendChild(E("div","","<span id='img-status' style='font-size:11px;color:#8a8a8a'>no images staged</span>"));
    card.appendChild(E("div","imgsec","RENAME / MOVE EXISTING FILE"));
    var ro=E("input","");ro.id="rn-old";ro.placeholder="old/path.png";
    var rn=E("input","");rn.id="rn-new";rn.placeholder="new/path.png";
    card.appendChild(ro);card.appendChild(rn);
    var rb=E("button","fbtn","Rename in repo");
    rb.onclick=renameExisting;
    card.appendChild(rb);
    card.appendChild(E("div","","<span id='rn-status' style='font-size:11px;color:#8a8a8a'></span>"));
    var close=E("button","fbtn","Close");
    close.onclick=function(){m.classList.add("hidden")};
    close.style.marginTop="12px";
    card.appendChild(close);
    m.appendChild(card);
    m.addEventListener("paste",function(e){
      var fs=[];
      Array.prototype.forEach.call(e.clipboardData.items,function(it){
        if(it.type&&it.type.indexOf("image/")===0){var f=it.getAsFile();if(f)fs.push(f)}
      });
      if(fs.length){e.preventDefault();addFiles(fs)}
    });
    return m;
  }
  function openTool(){
    if(!modal){modal=build();document.body.appendChild(modal)}
    modal.classList.remove("hidden");
    renderList();
  }
  var sb=document.getElementById("sb");
  if(sb){
    var b=E("button","sidebtn","Images");
    b.onclick=openTool;
    var foot=sb.querySelector(".sbfoot");
    sb.insertBefore(b,foot||null);
  }
})();