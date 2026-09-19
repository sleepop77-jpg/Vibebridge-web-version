// ATTACH: "+" in composer for images / zip / md / svg. Inline chat rendering. Tools leave the sidebar.
(function(){
  if(window.__vbAttach)return;
  window.__vbAttach=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
  var P="vb_att_";
  function store(id,v){try{localStorage.setItem(P+id,v);return true}catch(e){say("storage full — attachment not saved");return false}}
  function getAtt(id){try{return localStorage.getItem(P+id)}catch(e){return null}}
  var CRC_T=(function(){var t=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c}return t})();
  function crc32(u8){var c=0xFFFFFFFF;for(var i=0;i<u8.length;i++)c=CRC_T[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
  var TEXTEXT=/\.(kt|kts|java|js|mjs|ts|css|html|htm|xml|json|yml|yaml|md|txt|gradle|properties|pro|cfg|toml|ini|sh|bat|py|rb|go|rs|c|h|cpp|hpp|sql|svg)$/i;
  function skipPath(n){return /(^|\/)(\.git|node_modules|\.gradle|\.idea|out|dist|build)\//.test(n)}
  function isText(e){if(skipPath(e.name))return false;if(!TEXTEXT.test(e.name))return false;if(e.bytes.length>400000)return false;for(var i=0;i<Math.min(2000,e.bytes.length);i++)if(e.bytes[i]===0)return false;return true}
  function langOf(n){var m=n.match(/\.([a-z0-9]+)$/i);return m?m[1].toLowerCase():"text"}
  function fenceFor(c){return c.indexOf("```")>=0?"````":"```"}
  async function readZip(buf){
    var dv=new DataView(buf),u8=new Uint8Array(buf),td=new TextDecoder();
    var eocd=-1;
    for(var i=buf.byteLength-22;i>=Math.max(0,buf.byteLength-65558);i--){if(dv.getUint32(i,true)===0x06054b50){eocd=i;break}}
    if(eocd<0)throw new Error("not a zip file");
    var count=dv.getUint16(eocd+10,true),p=dv.getUint32(eocd+16,true),out=[];
    for(var n=0;n<count;n++){
      if(dv.getUint32(p,true)!==0x02014b50)break;
      var method=dv.getUint16(p+10,true),csize=dv.getUint32(p+20,true);
      var nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true);
      var lo=dv.getUint32(p+42,true);
      var name=td.decode(u8.subarray(p+46,p+46+nl));
      var lnl=dv.getUint16(lo+26,true),lel=dv.getUint16(lo+28,true);
      var start=lo+30+lnl+lel;
      var raw=u8.subarray(start,start+csize);
      if(!/\/$/.test(name)){
        var bytes=null;
        if(method===0)bytes=raw;
        else if(method===8&&window.DecompressionStream){
          bytes=new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
        }
        if(bytes)out.push({name:name,bytes:bytes});
      }
      p+=46+nl+el+cl;
    }
    return out;
  }
  function buildBook(files,title){
    var out="# "+title+"\n\nAttached via VibeBridge • "+new Date().toISOString()+"\n\n"+files.length+" files\n\n";
    files.forEach(function(f){
      var fn=fenceFor(f.text);
      out+="## "+f.name+"\n\n"+fn+langOf(f.name)+"\n"+f.text+"\n"+fn+"\n\n";
    });
    return out;
  }
  function b64bytes(u8){var s="";for(var i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
  async function commitBinary(entries,message){
    var refSha=null,baseTree=null;
    try{
      var ref=await api("GET","/repos/"+OWNER+"/"+REPO+"/git/ref/heads/"+BRANCH);
      refSha=ref.object.sha;
      baseTree=(await api("GET","/repos/"+OWNER+"/"+REPO+"/git/commits/"+refSha)).tree.sha;
    }catch(e){if(e.code!==404)throw e}
    var tb={tree:entries};if(baseTree)tb.base_tree=baseTree;
    var tree=await api("POST","/repos/"+OWNER+"/"+REPO+"/git/trees",tb);
    var commit=await api("POST","/repos/"+OWNER+"/"+REPO+"/git/commits",{message:message,tree:tree.sha,parents:refSha?[refSha]:[]});
    if(refSha)await api("PATCH","/repos/"+OWNER+"/"+REPO+"/git/refs/heads/"+BRANCH,{sha:commit.sha,force:false});
    else await api("POST","/repos/"+OWNER+"/"+REPO+"/git/refs",{ref:"refs/heads/"+BRANCH,sha:commit.sha});
    return commit;
  }
  function miniBtn(label,fn){var b=E("button","mini",label);b.onclick=function(e){e.stopPropagation();fn()};return b}
  function imgWrap(src){var w=E("div","");w.style.cssText="margin:6px 0";var im=E("img");im.src=src;im.style.cssText="max-width:100%;border-radius:10px;border:1px solid var(--line,#333);display:block";w.appendChild(im);return w}
  function bookCard(meta){
    var card=E("div","pushcard");
    card.appendChild(E("div","status",meta.kind==="book"?"book.md · "+(meta.files||0)+" files":"markdown · "+(meta.name||"file")));
    var pre=E("div","logtail");pre.style.display="none";
    pre.textContent=(meta.text||"").split("\n").slice(0,60).join("\n");
    var row=E("div","cardbtns");
    row.appendChild(miniBtn("Copy",function(){navigator.clipboard.writeText(meta.text);say("copied")}));
    row.appendChild(miniBtn("Download",function(){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([meta.text],{type:"text/markdown"}));a.download=(meta.name||"book")+".md";a.click()}));
    row.appendChild(miniBtn("Push to repo",async function(){
      if(!window.api||!OWNER||!PAT){say("connect first");return}
      try{var c=await commitOps([{kind:"FILE",path:"docs/book.md",content:meta.text}],"docs: attach book via chat");say("pushed "+c.sha.slice(0,7))}catch(e){say("push failed: "+e.message)}
    }));
    row.appendChild(miniBtn("Expand",function(){pre.style.display=pre.style.display==="none"?"block":"none"}));
    card.appendChild(row);card.appendChild(pre);
    return card;
  }
  function hydrateBubble(b){
    if(b.dataset.vbatt)return;
    var txt=b.textContent||"";
    var mi=txt.match(/\[vb-img:([a-z0-9]+)\]\s*(.*)/);
    if(mi){
      b.dataset.vbatt="1";
      var src=getAtt(mi[1]);
      b.textContent="";
      if(src&&src.indexOf("data:image/")===0){
        b.appendChild(imgWrap(src));
        b.appendChild(miniBtn("Push to repo",async function(){
          if(!window.api||!OWNER||!PAT){say("connect first");return}
          try{
            var u8=Uint8Array.from(atob(src.split(",")[1]),function(c){return c.charCodeAt(0)});
            var bl=await api("POST","/repos/"+OWNER+"/"+REPO+"/git/blobs",{content:b64bytes(u8),encoding:"base64"});
            var c=await commitBinary([{path:"docs/assets/"+(mi[2]||"img.png").replace(/[^\w.\-]/g,"_"),mode:"100644",type:"blob",sha:bl.sha}],"assets: attach image via chat");
            say("pushed "+c.sha.slice(0,7));
          }catch(e){say("push failed: "+e.message)}
        }));
      }else b.appendChild(E("div","note","image data missing from storage"));
      return;
    }
    var mb=txt.match(/\[vb-book:([a-z0-9]+)\]\s*(.*)/);
    if(mb){
      b.dataset.vbatt="1";
      var raw=getAtt(mb[1]);
      b.textContent="";
      if(raw){
        try{b.appendChild(bookCard(JSON.parse(raw)))}catch(e){b.appendChild(E("div","note","book data corrupt"))}
      }else b.appendChild(E("div","note","book data missing from storage"));
      return;
    }
    if(/^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/.test(txt.trim())){
      b.dataset.vbatt="1";
      var d=txt.trim();
      b.textContent="";
      b.appendChild(imgWrap(d));
    }
  }
  function scan(root){
    if(!root||root.nodeType!==1)return;
    var list=[];
    if(root.classList&&root.classList.contains("msg")&&root.classList.contains("user"))list.push(root);
    if(root.querySelectorAll)Array.prototype.forEach.call(root.querySelectorAll(".msg.user"),function(x){list.push(x)});
    list.forEach(hydrateBubble);
  }
  function emit(tokenOrText,isCode){
    if(window.addUserBubble)addUserBubble(tokenOrText,isCode);
    if(window.pushMsg)pushMsg({type:"user",text:tokenOrText,isCode:isCode});
    var flow=document.getElementById("flow");
    if(flow&&flow.lastElementChild)scan(flow.lastElementChild);
  }
  function addPlus(){
    var crow=document.querySelector("#composer .crow");
    if(!crow||document.getElementById("vbplus"))return;
    var b=E("button","pill","+");b.id="vbplus";b.title="attach image / zip / md / svg";
    var menu=E("div","menu up hidden");menu.id="vbplusmenu";
    var specs=[["Image…","img"],["ZIP → book…","zip"],["Markdown…","md"],["SVG…","svg"]];
    var inputs={};
    specs.forEach(function(sp){
      var mi=E("button","",sp[0]);
      mi.onclick=function(e){e.stopPropagation();menu.classList.add("hidden");inputs[sp[1]].click()};
      menu.appendChild(mi);
      var fi=document.createElement("input");fi.type="file";fi.style.display="none";
      fi.accept=sp[1]==="img"?"image/*":sp[1]==="zip"?".zip,application/zip":sp[1]==="md"?".md,text/markdown":".svg,image/svg+xml";
      fi.onchange=function(){handle(sp[1],fi.files[0]);fi.value=""};
      inputs[sp[1]]=fi;menu.appendChild(fi);
    });
    b.onclick=function(e){
      e.stopPropagation();
      menu.classList.toggle("hidden");
      var r=b.getBoundingClientRect();
      menu.style.position="fixed";menu.style.left=Math.max(8,r.left)+"px";menu.style.bottom=(innerHeight-r.top+8)+"px";menu.style.top="auto";
    };
    crow.insertBefore(b,crow.firstChild);
    document.body.appendChild(menu);
    document.addEventListener("click",function(){menu.classList.add("hidden")});
  }
  function handle(kind,file){
    if(!file)return;
    if(kind==="img"){
      var fr=new FileReader();
      fr.onload=function(){
        var id=uid();
        store(id,String(fr.result));
        emit("[vb-img:"+id+"] "+file.name,false);
        say("image attached");
      };
      fr.readAsDataURL(file);
      return;
    }
    if(kind==="svg"){
      file.text().then(function(t){emit(t,true);say("svg attached — renders inline")});
      return;
    }
    if(kind==="md"){
      file.text().then(function(t){
        var id=uid();
        store(id,JSON.stringify({kind:"md",name:file.name,text:t}));
        emit("[vb-book:"+id+"] "+file.name,false);
        say("markdown attached");
      });
      return;
    }
    if(kind==="zip"){
      file.arrayBuffer().then(async function(buf){
        try{
          var td=new TextDecoder();
          var files=(await readZip(buf)).filter(isText).map(function(f){return {name:f.name,text:td.decode(f.bytes)}});
          if(!files.length){say("no text files in that zip");return}
          var book=buildBook(files,file.name.replace(/\.zip$/i,""));
          var id=uid();
          store(id,JSON.stringify({kind:"book",name:file.name,files:files.length,text:book}));
          emit("[vb-book:"+id+"] "+file.name,false);
          say("zip → book.md attached ("+files.length+" files)");
        }catch(e){say("zip failed: "+e.message)}
      });
    }
  }
   function strip(){
     // Keep sidebar/dock tools alive so OS dock and context menu stay functional.
   }
  var st=document.createElement("style");
  st.textContent="#vbplus{width:28px;height:28px;padding:0;font-size:16px;font-weight:700;line-height:1}";
  document.head.appendChild(st);
  strip();setTimeout(strip,600);setTimeout(strip,1500);
  addPlus();
  var flow=document.getElementById("flow");
  if(flow){
    new MutationObserver(function(muts){
      muts.forEach(function(mu){Array.prototype.forEach.call(mu.addedNodes,function(n){scan(n)})});
    }).observe(flow,{childList:true,subtree:true});
    scan(flow);
  }
})();