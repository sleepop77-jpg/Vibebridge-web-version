// BUNNY STUDIO — isolated easter egg. Triple-click any bunny to open.
(function(){
  var DEF=[".............YY.............",".............AA.............",".............AA.............",".............HH.............",".........H........H.........",".......H............H.......","......H.##........##.H......",".....H..##........##..H.....","....H...##........##...H....","...H....##........##....H...","...H....##........##....H...","...H....###......###....H...","..H.....############.....H..","..H....##############....H..","..H...################...H..","..H...################...H..","..H...##RR########RR##...H..","..H...##RR########RR##...H..","..H...########PP######...H..","..H...########PP######...H..",".....H################H.....","......H##############H......",".......H............H.......",".........H........H.........","..........GGGGGGGGGG........","........SSSSSSSSSSSS........",".......SSSSSSSSSSSSSS.......","......SSSSSSSSSSSSSSSS......",".....SSSSSSSYYSSSSSSSS......",".....SSSSSSSYYSSSSSSSS......",".....SSSSSSSSSSSSSSSSS......",".....SSSSSSSSSSSSSSSSS......","......SSSSSSSSSSSSSSSS......",".......SSSSS....SSSSS.......",".......SSSSS....SSSSS.......",".......SSSSS....SSSSS......."];
  var PAL={"#":"#f2ecfa","R":"#ff4d6d","P":"#ffb6c1","H":"rgba(201,179,232,0.72)","G":"#fbbf24","S":"#d9c9ec","Y":"#fde047","A":"#9b8bab"};
  var DEFANIM="1: dy=0\n2: dy=-3\n3: dy=0\n4: dy=1";
  var PRESETS={"Bob":"1: dy=0\n2: dy=-3\n3: dy=0\n4: dy=1","Jump":"1: dy=0 sx=1.1 sy=0.9\n2: dy=-12 sx=0.95 sy=1.1\n3: dy=0 sx=1.05 sy=0.95\n4: dy=0","Wiggle":"1: rot=0\n2: rot=-7\n3: rot=0\n4: rot=7","Spin":"1: rot=0\n2: rot=90\n3: rot=180\n4: rot=270"};
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  var custom=null;
  try{custom=JSON.parse(localStorage.getItem("vb_bunny")||"null")}catch(e){}
  var frames=custom&&custom.frames?custom.frames:[DEF.slice()];
  var fps=custom&&custom.fps?custom.fps:6;
  var animSrc=custom&&custom.anim?custom.anim:DEFANIM;
  var fi=0,efi=0,tool="#",curKeys=[],modal=null,prevCv=null;
  function paint(cv,cell,grid){
    if(!cv||!grid)return;
    var g=cv.getContext("2d");
    cv.width=grid[0].length*cell;cv.height=grid.length*cell;
    grid.forEach(function(row,y){row.split("").forEach(function(ch,x){
      var col=PAL[ch];if(!col)return;
      g.fillStyle=col;g.fillRect(x*cell,y*cell,cell,cell);
    })});
  }
  function repaintMain(){
    paint(document.getElementById("bunny"),3,frames[fi%frames.length]);
    var sb=document.getElementById("sbbunny");
    paint(sb,1,frames[fi%frames.length]);
    if(sb){sb.style.width="42px";sb.style.height="54px";sb.style.imageRendering="pixelated";sb.style.cursor="pointer"}
  }
  function parseAnim(src,n){
    var keys=[];
    src.split(/[\n;]+/).forEach(function(line){
      var m=line.match(/^\s*(\d+)\s*:\s*(.*)$/);
      if(!m)return;
      var idx=parseInt(m[1],10)-1;
      var t={dy:0,rot:0,sx:1,sy:1};
      m[2].split(/\s+/).forEach(function(tok){
        var kv=tok.split("=");
        if(kv.length===2){
          var v=parseFloat(kv[1]);
          if(!isNaN(v)){
            if(kv[0]==="dy")t.dy=v;
            if(kv[0]==="rot")t.rot=v;
            if(kv[0]==="sx")t.sx=v;
            if(kv[0]==="sy")t.sy=v;
          }
        }
      });
      keys[idx]=t;
    });
    for(var i=0;i<n;i++)if(!keys[i])keys[i]={dy:0,rot:0,sx:1,sy:1};
    return keys;
  }
  function applyAnim(){
    curKeys=parseAnim(animSrc,Math.max(frames.length,1));
    var dur=Math.max(.3,curKeys.length/Math.max(1,fps));
    var css="@keyframes bunnyAnim{";
    curKeys.forEach(function(k,i){css+=Math.round(i/curKeys.length*100)+"%{transform:translateY("+k.dy+"px) rotate("+k.rot+"deg) scale("+k.sx+","+k.sy+")}"});
    var k0=curKeys[0];
    css+="100%{transform:translateY("+k0.dy+"px) rotate("+k0.rot+"deg) scale("+k0.sx+","+k0.sy+")}}";
    var st=document.getElementById("bunnyanim");
    if(!st){st=document.createElement("style");st.id="bunnyanim";document.head.appendChild(st)}
    st.textContent=css;
    var b=document.getElementById("bunny");
    if(b)b.style.animation="bunnyAnim "+dur+"s linear infinite";
  }
  setInterval(function(){
    if(frames.length>1){
      fi=(fi+1)%frames.length;
      repaintMain();
      if(modal&&!modal.classList.contains("hidden")&&prevCv){
        paint(prevCv,6,frames[fi]);
        var k=curKeys[fi%curKeys.length];
        if(k)prevCv.style.transform="translateY("+k.dy+"px) rotate("+k.rot+"deg) scale("+k.sx+","+k.sy+")";
      }
    }
  },Math.max(80,1000/fps));
  function build(){
    var m=E("div","modal");
    var st=document.createElement("style");
    st.textContent=".studio{max-width:600px;width:95%;max-height:90vh;overflow:auto;background:var(--card,#141414);border:1px solid var(--line,#333);border-radius:14px;padding:18px}"
      +".studio h3{color:#fff;font-size:14px;margin-bottom:4px}"
      +".studio .help{font-size:10.5px;color:#8a8a8a;margin-bottom:10px}"
      +".swrow{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}"
      +".sw{width:22px;height:22px;border-radius:6px;border:2px solid transparent;cursor:pointer}"
      +".sw.on{border-color:#fff}"
      +".strow{display:flex;gap:8px;align-items:center;margin:8px 0;flex-wrap:wrap}"
      +".stcanvas{border:1px solid var(--line,#333);border-radius:8px;image-rendering:pixelated;cursor:crosshair;background:#0e0616}"
      +".studio textarea{height:90px;font:11px/1.5 ui-monospace,Menlo,Consolas,monospace}"
      +".fbtn{border:1px solid var(--line,#333);border-radius:6px;padding:3px 9px;font-size:11px;color:#aaa}"
      +".fbtn.on{border-color:#a678d8;color:#fff}";
    m.appendChild(st);
    var card=E("div","studio");
    card.appendChild(E("h3","","BUNNY STUDIO"));
    card.appendChild(E("div","help","click / drag to paint • + frame adds motion • anim code: one line per frame, e.g.  2: dy=-4 rot=-5 sx=1.05"));
    var swrow=E("div","swrow");
    Object.keys(PAL).forEach(function(k){
      var s=E("div","sw"+(k===tool?" on":""));
      s.style.background=PAL[k];s.title="paint "+k;
      s.onclick=function(){tool=k;swrow.querySelectorAll(".sw").forEach(function(x){x.classList.remove("on")});s.classList.add("on")};
      swrow.appendChild(s);
    });
    var er=E("div","sw");
    er.style.background="repeating-conic-gradient(#3a3a3a 0% 25%, #141414 0% 50%) 0 0/8px 8px";
    er.title="erase";
    er.onclick=function(){tool=".";swrow.querySelectorAll(".sw").forEach(function(x){x.classList.remove("on")});er.classList.add("on")};
    swrow.appendChild(er);
    card.appendChild(swrow);
    var row=E("div","strow");
    var ec=document.createElement("canvas");ec.className="stcanvas";
    var pwrap=E("div","");
    prevCv=document.createElement("canvas");prevCv.style.imageRendering="pixelated";
    pwrap.appendChild(prevCv);
    row.appendChild(ec);row.appendChild(pwrap);
    card.appendChild(row);
    var frow=E("div","strow");
    card.appendChild(frow);
    var arow=E("div","strow");
    var fpsIn=document.createElement("input");fpsIn.type="number";fpsIn.min="1";fpsIn.max="24";fpsIn.style.width="64px";fpsIn.value=fps;
    arow.appendChild(E("span","","fps"));arow.appendChild(fpsIn);
    card.appendChild(arow);
    var ta=document.createElement("textarea");ta.value=animSrc;
    card.appendChild(ta);
    var prow=E("div","strow");
    Object.keys(PRESETS).forEach(function(n){
      var b=E("button","fbtn",n);
      b.onclick=function(){ta.value=PRESETS[n];animSrc=ta.value;applyAnim()};
      prow.appendChild(b);
    });
    var applyB=E("button","fbtn","Apply anim");
    applyB.onclick=function(){animSrc=ta.value;fps=Math.min(24,Math.max(1,parseInt(fpsIn.value||"6",10)));applyAnim()};
    prow.appendChild(applyB);
    card.appendChild(prow);
    var act=E("div","strow");
    var saveB=E("button","fbtn","Save bunny");
    saveB.style.borderColor="#a678d8";saveB.style.color="#fff";
    saveB.onclick=function(){localStorage.setItem("vb_bunny",JSON.stringify({frames:frames,fps:fps,anim:animSrc}));say("bunny saved — he is yours now")};
    var resetB=E("button","fbtn","Reset");
    resetB.onclick=function(){frames=[DEF.slice()];fi=0;efi=0;animSrc=DEFANIM;fps=6;ta.value=animSrc;fpsIn.value=6;localStorage.removeItem("vb_bunny");applyAnim();syncEditor();repaintMain()};
    var closeB=E("button","fbtn","Close");
    closeB.onclick=function(){m.classList.add("hidden")};
    act.appendChild(saveB);act.appendChild(resetB);act.appendChild(closeB);
    card.appendChild(act);
    m.appendChild(card);
    var drawing=false;
    function stroke(ev){
      var r=ec.getBoundingClientRect();
      var grid=frames[efi];
      var cw=r.width/grid[0].length,ch=r.height/grid.length;
      var x=Math.floor((ev.clientX-r.left)/cw),y=Math.floor((ev.clientY-r.top)/ch);
      if(y<0||y>=grid.length||x<0||x>=grid[0].length)return;
      grid[y]=grid[y].slice(0,x)+tool+grid[y].slice(x+1);
      paint(ec,10,grid);paint(prevCv,6,grid);repaintMain();
    }
    ec.addEventListener("mousedown",function(e){drawing=true;stroke(e)});
    ec.addEventListener("mousemove",function(e){if(drawing)stroke(e)});
    window.addEventListener("mouseup",function(){drawing=false});
    ec.addEventListener("touchstart",function(e){e.preventDefault();stroke(e.touches[0])},{passive:false});
    ec.addEventListener("touchmove",function(e){e.preventDefault();stroke(e.touches[0])},{passive:false});
    function syncFrames(){
      frow.innerHTML="";
      frames.forEach(function(_,i){
        var b=E("button","fbtn"+(i===efi?" on":""),"F"+(i+1));
        b.onclick=function(){efi=i;syncFrames();paint(ec,10,frames[efi]);paint(prevCv,6,frames[efi])};
        frow.appendChild(b);
      });
      var add=E("button","fbtn","+ frame");
      add.onclick=function(){frames.push(frames[efi].slice());efi=frames.length-1;syncFrames();paint(ec,10,frames[efi]);paint(prevCv,6,frames[efi]);applyAnim()};
      var del=E("button","fbtn","- frame");
      del.onclick=function(){if(frames.length>1){frames.splice(efi,1);efi=Math.min(efi,frames.length-1);syncFrames();paint(ec,10,frames[efi]);paint(prevCv,6,frames[efi]);applyAnim()}};
      frow.appendChild(add);frow.appendChild(del);
    }
    function syncEditor(){paint(ec,10,frames[efi]);paint(prevCv,6,frames[efi]);syncFrames();ta.value=animSrc;fpsIn.value=fps}
    m._sync=syncEditor;
    return m;
  }
  function openStudio(){
    if(!modal){modal=build();document.body.appendChild(modal)}
    modal.classList.remove("hidden");
    if(modal._sync)modal._sync();
  }
  var clicks=0,ct=0;
  function bump(){
    var n=Date.now();
    if(n-ct>2000)clicks=0;
    ct=n;clicks++;
    if(clicks>=3){clicks=0;openStudio();say("bunny studio unlocked")}
  }
  document.addEventListener("click",function(e){
    if(e.target&&(e.target.id==="bunny"||e.target.id==="sbbunny"))bump();
  });
  applyAnim();
  repaintMain();
})();