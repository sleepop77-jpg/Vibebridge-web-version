// ZIP -> MD v2: repo zip (or connected repo) -> AI-readable markdown. Self-registering, idempotent.
(function(){
  if(window.__vbZipMd)return;
  window.__vbZipMd=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
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
      var raw=u8.subarray(lo+30+lnl+lel,lo+30+lnl+lel+csize);
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
  async function pullRepo(){
    if(!window.api||!OWNER||!PAT)throw new Error("connect to github first");
    var ref=await api("GET","/repos/"+OWNER+"/"+REPO+"/git/ref/heads/"+BRANCH);
    var com=await api("GET","/repos/"+OWNER+"/"+REPO+"/git/commits/"+ref.object.sha);
    var tree=await api("GET","/repos/"+OWNER+"/"+REPO+"/git/trees/"+com.tree.sha+"?recursive=1");
    var files=[];
    for(var i=0;i<tree.tree.length;i++){
      var e=tree.tree[i];
      if(e.type!=="blob"||skipPath(e.path)||!TEXTEXT.test(e.path)||(e.size||0)>400000)continue;
      var b=await api("GET","/repos/"+OWNER+"/"+REPO+"/git/blobs/"+e.sha);
      files.push({name:e.path,bytes:Uint8Array.from(atob((b.content||"").replace(/\s/g,"")),function(c){return c.charCodeAt(0)})});
    }
    return files;
  }
  function toBook(files,title){
    var out="# "+title+"\n\nExported by VibeBridge • "+new Date().toISOString()+"\n\n"+files.length+" files\n\n";
    files.forEach(function(f){
      var fn=fenceFor(f.text);
      out+="## "+f.name+"\n\n"+fn+langOf(f.name)+"\n"+f.text+"\n"+fn+"\n\n";
    });
    return out;
  }
  function toMdFile(f){var fn=fenceFor(f.text);return "# "+f.name+"\n\n"+fn+langOf(f.name)+"\n"+f.text+"\n"+fn+"\n"}
  function dosTime(d){return ((d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1))&0xffff}
  function dosDate(d){return (((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate())&0xffff}
  function writeZip(entries){
    var enc=new TextEncoder(),chunks=[],cd=[],offset=0,d=new Date(),dt=dosTime(d),dd=dosDate(d);
    entries.forEach(function(e){
      var nb=enc.encode(e.name),data=e.bytes,crc=crc32(data);
      var lh=new Uint8Array(30+nb.length),v=new DataView(lh.buffer);
      v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(8,0,true);
      v.setUint16(10,dt,true);v.setUint16(12,dd,true);v.setUint32(14,crc,true);
      v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);
      v.setUint16(26,nb.length,true);
      lh.set(nb,30);
      chunks.push(lh,data);
      var ch=new Uint8Array(46+nb.length),cv=new DataView(ch.buffer);
      cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(10,0,true);
      cv.setUint16(12,dt,true);cv.setUint14?0:0;cv.setUint16(14,dd,true);cv.setUint32(16,crc,true);
      cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);
      cv.setUint16(28,nb.length,true);cv.setUint32(42,offset,true);
      ch.set(nb,46);
      cd.push(ch);
      offset+=lh.length+data.length;
    });
    var cdSize=cd.reduce(function(s,c){return s+c.length},0);
    var eo=new Uint8Array(22),ev=new DataView(eo.buffer);
    ev.setUint32(0,0x06054b50,true);ev.setUint16(8,entries.length,true);ev.setUint16(10,entries.length,true);
    ev.setUint32(12,cdSize,true);ev.setUint32(16,offset,true);
    return new Blob(chunks.concat(cd,[eo]),{type:"application/zip"});
  }
  function dl(blob,name){var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},4000)}
  var cur=[],title="repo",modal=null;
  function setFiles(files,src){
    var td=new TextDecoder();
    cur=files.filter(isText).map(function(f){return {name:f.name,text:td.decode(f.bytes)}});
    title=src;
    var st=document.querySelector("#zmd-status");
    if(st)st.textContent=cur.length+" text files ready from "+src;
    var prev=document.querySelector("#zmd-preview");
    if(prev){
      prev.innerHTML="";
      cur.slice(0,40).forEach(function(f){prev.appendChild(E("div","","• "+f.name))});
      if(cur.length>40)prev.appendChild(E("div","","… and "+(cur.length-40)+" more"));
    }
    ["#zmd-book","#zmd-zip","#zmd-copy"].forEach(function(id){var b=document.querySelector(id);if(b)b.disabled=!cur.length});
  }
  function book(){return toBook(cur,title)}
  function build(){
    var m=E("div","modal");
    var st=document.createElement("style");
    st.textContent=".zmd{max-width:520px;width:95%;max-height:90vh;overflow:auto;background:var(--card,#141414);border:1px solid var(--line,#333);border-radius:14px;padding:18px}"
      +".zmd h3{color:#fff;font-size:14px;margin-bottom:4px}"
      +".zmd .help{font-size:10.5px;color:#8a8a8a;margin-bottom:10px}"
      +".zmdrow{display:flex;gap:8px;align-items:center;margin:8px 0;flex-wrap:wrap}"
      +".zmdprev{max-height:160px;overflow:auto;background:#0e0616;border:1px solid #333;border-radius:8px;padding:8px 10px;font:11px/1.6 ui-monospace,Menlo,Consolas,monospace;color:#9a8fb0}"
      +".zmdbtn{border:1px solid #4a3a6a;border-radius:8px;padding:6px 12px;font-size:12px;color:#d9c6f2;background:#2a1b45;cursor:pointer}"
      +".zmdbtn:disabled{opacity:.35;cursor:default}";
    m.appendChild(st);
    var card=E("div","zmd");
    card.appendChild(E("h3","","ZIP to MD"));
    card.appendChild(E("div","help","upload a repo zip downloaded from github, or pull the connected repo. binaries and junk skipped. copy or download one AI-readable book.md, or a zip of per-file .md mirrors."));
    var r1=E("div","zmdrow");
    var fi=document.createElement("input");fi.type="file";fi.accept=".zip,application/zip";
    fi.onchange=async function(){
      var f=fi.files[0];if(!f)return;
      var s=document.querySelector("#zmd-status");if(s)s.textContent="unzipping…";
      try{setFiles(await readZip(await f.arrayBuffer()),f.name.replace(/\.zip$/i,""))}catch(e){var s2=document.querySelector("#zmd-status");if(s2)s2.textContent="failed: "+e.message}
    };
    var pull=E("button","zmdbtn","Pull connected repo");
    pull.onclick=async function(){
      var s=document.querySelector("#zmd-status");if(s)s.textContent="pulling tree and blobs…";
      try{setFiles(await pullRepo(),(window.REPO||"repo"))}catch(e){var s2=document.querySelector("#zmd-status");if(s2)s2.textContent="failed: "+e.message}
    };
    r1.appendChild(fi);r1.appendChild(pull);
    card.appendChild(r1);
    card.appendChild(E("div","zmdrow","<span id='zmd-status' style='font-size:11px;color:#8a8a8a'>no zip loaded</span>"));
    var prev=E("div","zmdprev");prev.id="zmd-preview";
    card.appendChild(prev);
    var r2=E("div","zmdrow");
    var copy=E("button","zmdbtn","Copy book.md");copy.id="zmd-copy";copy.disabled=true;
    copy.onclick=function(){navigator.clipboard.writeText(book()).then(function(){say("book.md copied — paste it into any AI chat")})};
    var bk=E("button","zmdbtn","Download book.md");bk.id="zmd-book";bk.disabled=true;
    bk.onclick=function(){dl(new Blob([book()],{type:"text/markdown"}),title+"-book.md");say("book.md downloaded")};
    var zp=E("button","zmdbtn","Download md zip");zp.id="zmd-zip";zp.disabled=true;
    zp.onclick=function(){
      var enc=new TextEncoder();
      dl(writeZip(cur.map(function(f){return {name:f.name+".md",bytes:enc.encode(toMdFile(f))}})),title+"-md.zip");
      say("md zip downloaded");
    };
    var close=E("button","zmdbtn","Close");
    close.onclick=function(){m.classList.add("hidden")};
    r2.appendChild(copy);r2.appendChild(bk);r2.appendChild(zp);r2.appendChild(close);
    card.appendChild(r2);
    m.appendChild(card);
    return m;
  }
  function openTool(){
    if(!modal){modal=build();document.body.appendChild(modal)}
    modal.classList.remove("hidden");
  }
  var sb=document.getElementById("sb");
  if(sb&&!document.getElementById("zmd-side")){
    var b=E("button","sidebtn","ZIP to MD");
    b.id="zmd-side";
    b.onclick=openTool;
    var foot=sb.querySelector(".sbfoot");
    sb.insertBefore(b,foot||null);
  }
})();