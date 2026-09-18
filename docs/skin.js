// SKIN: full customizer — colours, resize, shift. Isolated, persisted, applied at boot.
(function(){
  if(window.__vbSkin)return;
  window.__vbSkin=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function say(m){if(window.toast)toast(m);else console.log(m)}
  var KEY="vb_skin";
  var VARS=["--bg","--side","--card","--line","--text","--dim","--faint","--accent","--accent2","--red","--amber","--code"];
  var PRESETS={
    "Default":{},
    "GitHub":{"--bg":"#0d1117","--side":"#161b22","--card":"#161b22","--line":"#30363d","--text":"#e6edf3","--dim":"#8b949e","--faint":"#6e7681","--accent":"#4493f8","--accent2":"#3fb950","--red":"#f85149","--amber":"#d29922","--code":"#0d1117"},
    "macOS":{"--bg":"#1c1c1e","--side":"#242426","--card":"#2c2c2e","--line":"#3a3a3c","--text":"#f5f5f7","--dim":"#d1d1d6","--faint":"#98989d","--accent":"#bf5af2","--accent2":"#30d158","--red":"#ff453a","--amber":"#ffd60a","--code":"#1c1c1e"},
    "Lime":{"--bg":"#101408","--side":"#161c0c","--card":"#161c0c","--line":"#3a4a1e","--text":"#eef6d8","--dim":"#b8c896","--faint":"#7d8a60","--accent":"#a3e112","--accent2":"#4ade80","--red":"#f87171","--amber":"#facc15","--code":"#0c1006"},
    "Mono":{"--bg":"#111111","--side":"#181818","--card":"#181818","--line":"#333333","--text":"#eeeeee","--dim":"#aaaaaa","--faint":"#777777","--accent":"#ffffff","--accent2":"#cccccc","--red":"#ff6666","--amber":"#ffcc66","--code":"#0d0d0d"},
    "Sunset":{"--bg":"#1a0f14","--side":"#241318","--card":"#241318","--line":"#4a2430","--text":"#f6e7ea","--dim":"#d3aeb8","--faint":"#8f6b76","--accent":"#fb7185","--accent2":"#fbbf24","--red":"#f43f5e","--amber":"#f59e0b","--code":"#160b10"}
  };
  var state={vars:{},zoom:1,sbw:260,cw:760,rad:12,shiftX:0,lift:0,sbright:false};
  try{var s0=JSON.parse(localStorage.getItem(KEY)||"null");if(s0)Object.assign(state,s0)}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
  function apply(){
    var r=document.documentElement;
    VARS.forEach(function(v){if(state.vars[v])r.style.setProperty(v,state.vars[v]);else r.style.removeProperty(v)});
    var st=document.getElementById("vbskincss");
    if(!st){st=document.createElement("style");st.id="vbskincss";document.head.appendChild(st)}
    st.textContent="body{zoom:"+state.zoom+"}"
      +"#sb{width:"+state.sbw+"px;min-width:"+state.sbw+"px}"
      +"#empty,#flow,#composer{max-width:"+state.cw+"px}"
      +"#composer,.msg.user,.menu,.modalcard,.pushcard,.prompttext{border-radius:"+state.rad+"px}"
      +"#main{transform:translateX("+state.shiftX+"px)}"
      +"#composerwrap{padding-bottom:"+(12+state.lift)+"px}"
      +(state.sbright?"body{flex-direction:row-reverse}":"");
  }
  function toHex(c){
    c=(c||"").trim();
    if(c.charAt(0)==="#")return c.length>7?c.slice(0,7):c;
    var m=c.match(/rgba?\(([^)]+)\)/);
    if(m){var p=m[1].split(",").map(parseFloat);return "#"+p.slice(0,3).map(function(n){return ("0"+Math.max(0,Math.min(255,n|0)).toString(16)).slice(-2)}).join("")}
    return "#888888";
  }
  var modal=null,inputs={};
  function syncInputs(){
    var cs=getComputedStyle(document.documentElement);
    VARS.forEach(function(v){if(inputs[v])inputs[v].value=toHex(state.vars[v]||cs.getPropertyValue(v))});
  }
  function slider(row,label,min,max,step,get,set){
    var wrap=E("div","sknrow");
    wrap.appendChild(E("span","sknlab",label));
    var inp=document.createElement("input");
    inp.type="range";inp.min=min;inp.max=max;inp.step=step;inp.value=get();
    inp.oninput=function(){set(parseFloat(inp.value));apply();save()};
    wrap.appendChild(inp);
    row.appendChild(wrap);
    return inp;
  }
  function build(){
    var m=E("div","modal");
    var st=document.createElement("style");
    st.textContent=".skn{max-width:560px;width:95%;max-height:90vh;overflow:auto;background:var(--card,#141414);border:1px solid var(--line,#333);border-radius:14px;padding:18px}"
     +".skn h3{color:var(--text,#fff);font-size:14px;margin-bottom:4px}"
     +".skn .help{font-size:10.5px;color:var(--faint,#8a8a8a);margin-bottom:10px}"
     +".sknsec{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--faint,#8a8a8a);margin:14px 0 6px;text-transform:uppercase}"
     +".skngrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}"
     +".skncol{display:flex;align-items:center;gap:6px;font:10.5px ui-monospace,Menlo,Consolas,monospace;color:var(--dim,#aaa)}"
     +".skncol input{width:34px;height:26px;padding:1px;border:1px solid var(--line,#333);border-radius:6px;background:var(--code,#0d0d11);cursor:pointer}"
     +".sknrow{display:flex;align-items:center;gap:10px;margin:6px 0}"
     +".sknlab{font-size:11px;color:var(--dim,#aaa);width:110px;flex:none}"
     +".sknrow input[type=range]{flex:1;accent-color:var(--accent,#a678d8)}"
     +".sknbtns{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}"
     +".sknbtn{border:1px solid var(--line,#333);border-radius:8px;padding:5px 12px;font-size:11.5px;font-weight:600;color:var(--dim,#aaa);background:var(--code,#111);cursor:pointer}"
     +".sknbtn:hover{color:var(--text,#fff);border-color:var(--accent,#a678d8)}"
     +".skncheck{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--dim,#aaa);margin:6px 0}";
    m.appendChild(st);
    var card=E("div","skn");
    card.appendChild(E("h3","","CUSTOMIZE"));
    card.appendChild(E("div","help","colours override both themes until reset. resize = zoom + widths + radius. shift = column offset, composer lift, sidebar side. everything persists."));
    card.appendChild(E("div","sknsec","Presets"));
    var pb=E("div","sknbtns");
    Object.keys(PRESETS).forEach(function(name){
      var b=E("button","sknbtn",name);
      b.onclick=function(){state.vars=Object.assign({},PRESETS[name]);apply();save();syncInputs();say("preset: "+name)};
      pb.appendChild(b);
    });
    var rb=E("button","sknbtn","Reset all");
    rb.onclick=function(){state={vars:{},zoom:1,sbw:260,cw:760,rad:12,shiftX:0,lift:0,sbright:false};try{localStorage.removeItem(KEY)}catch(e){};apply();save();syncInputs();syncControls();say("skin reset")};
    pb.appendChild(rb);
    card.appendChild(pb);
    card.appendChild(E("div","sknsec","Colours"));
    var grid=E("div","skngrid");
    VARS.forEach(function(v){
      var lab=E("label","skncol",v.replace("--",""));
      var inp=document.createElement("input");
      inp.type="color";
      inputs[v]=inp;
      inp.oninput=function(){state.vars[v]=inp.value;apply();save()};
      lab.appendChild(inp);
      grid.appendChild(lab);
    });
    card.appendChild(grid);
    card.appendChild(E("div","sknsec","Resize"));
    var rz=E("div","");
    slider(rz,"zoom",0.8,1.4,0.05,function(){return state.zoom},function(x){state.zoom=x});
    slider(rz,"sidebar width",200,420,10,function(){return state.sbw},function(x){state.sbw=x});
    slider(rz,"content width",560,1100,20,function(){return state.cw},function(x){state.cw=x});
    slider(rz,"corner radius",0,24,1,function(){return state.rad},function(x){state.rad=x});
    card.appendChild(rz);
    card.appendChild(E("div","sknsec","Shift"));
    var sh=E("div","");
    slider(sh,"column shift X",-240,240,10,function(){return state.shiftX},function(x){state.shiftX=x});
    slider(sh,"composer lift",0,140,10,function(){return state.lift},function(x){state.lift=x});
    var chk=E("label","skncheck");
    var cb=document.createElement("input");cb.type="checkbox";cb.checked=!!state.sbright;
    cb.onchange=function(){state.sbright=cb.checked;apply();save()};
    chk.appendChild(cb);chk.appendChild(document.createTextNode("sidebar on the right"));
    sh.appendChild(chk);
    card.appendChild(sh);
    var close=E("button","sknbtn","Close");
    close.onclick=function(){m.classList.add("hidden")};
    close.style.marginTop="12px";
    card.appendChild(close);
    m.appendChild(card);
    return m;
  }
  var ctrls=[];
  function syncControls(){
    if(!modal)return;
    var ranges=modal.querySelectorAll("input[type=range]");
    var vals=[state.zoom,state.sbw,state.cw,state.rad,state.shiftX,state.lift];
    for(var i=0;i<ranges.length&&i<vals.length;i++)ranges[i].value=vals[i];
    var cb=modal.querySelector(".skncheck input");
    if(cb)cb.checked=!!state.sbright;
  }
  function openTool(){
    if(!modal){modal=build();document.body.appendChild(modal)}
    modal.classList.remove("hidden");
    syncInputs();syncControls();
  }
  apply();
  var sb=document.getElementById("sb");
  if(sb&&!document.getElementById("skin-side")){
    var b=E("button","sidebtn","Customize");
    b.id="skin-side";
    b.onclick=openTool;
    var foot=sb.querySelector(".sbfoot");
    sb.insertBefore(b,foot||null);
  }
})();