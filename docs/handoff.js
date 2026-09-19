// Sentinel Inbox: visible delivery panel on the website + clipboard fallback. Idempotent.
(function(){
  if(window.__vbHandoff)return;
  window.__vbHandoff=true;
  var items=[];
  try{items=JSON.parse(localStorage.getItem("vb_inbox")||"[]")}catch(e){items=[]}
  function save(){try{localStorage.setItem("vb_inbox",JSON.stringify(items.slice(-10)))}catch(e){}}
  function css(){
    var st=document.createElement("style");
    st.textContent="#vbinbox-pill{position:fixed;right:16px;bottom:16px;z-index:998;background:linear-gradient(135deg,#7b5aa6,#5d3f85);color:#fff;border:none;border-radius:999px;padding:9px 16px;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(123,90,166,.45)}"
      +"#vbinbox{position:fixed;right:16px;bottom:60px;z-index:998;width:340px;max-height:60vh;overflow:auto;background:rgba(14,7,22,.97);border:1px solid rgba(123,90,166,.4);border-radius:14px;padding:12px;display:none}"
      +"#vbinbox.open{display:block}"
      +"#vbinbox h4{color:#c9b3e8;font-size:12px;letter-spacing:1px;margin-bottom:8px}"
      +".vbi{border:1px solid #2c2140;border-radius:10px;padding:8px;margin-bottom:8px;background:rgba(123,90,166,.06)}"
      +".vbi pre{max-height:90px;overflow:auto;white-space:pre-wrap;font:10.5px/1.4 ui-monospace,Menlo,Consolas,monospace;color:#9a8fb0;background:rgba(10,6,18,.7);border-radius:8px;padding:6px;margin:4px 0}"
      +".vbi .vr{display:flex;gap:6px;flex-wrap:wrap}"
      +".vbi button{border:1px solid rgba(123,90,166,.45);background:#2a1b45;color:#efe6ff;border-radius:7px;padding:4px 9px;font-size:10.5px;font-weight:600;cursor:pointer}"
      +"#vbinbox .top{display:flex;gap:6px;margin-bottom:8px}"
      +"#vbinbox .top button{border:1px solid rgba(123,90,166,.45);background:#2a1b45;color:#efe6ff;border-radius:7px;padding:5px 10px;font-size:11px;font-weight:600;cursor:pointer}";
    document.head.appendChild(st);
  }
  function fill(t){var i=document.querySelector("#input");if(!i)return false;i.value=t;if(window.autoGrow)autoGrow();return true}
  function doSend(t){if(fill(t)&&window.send)setTimeout(function(){window.send()},150)}
  function render(){
    var box=document.querySelector("#vbi-list");if(!box)return;
    box.innerHTML="";
    var pill=document.querySelector("#vbinbox-pill");
    if(pill)pill.textContent="Sentinel inbox"+(items.length?" ("+items.length+")":"");
    items.slice().reverse().forEach(function(it,ri){
      var idx=items.length-1-ri;
      var d=document.createElement("div");d.className="vbi";
      var meta=document.createElement("div");
      meta.style.cssText="font-size:9.5px;color:#8f7fa8";
      meta.textContent=new Date(it.ts).toLocaleTimeString()+(it.auto?" · auto-sent":" · waiting");
      var pre=document.createElement("pre");pre.textContent=(it.text||"").slice(0,500)+((it.text||"").length>500?"…":"");
      var row=document.createElement("div");row.className="vr";
      var b1=document.createElement("button");b1.textContent="Load";b1.onclick=function(){fill(it.text);if(window.toast)toast("loaded into composer")};
      var b2=document.createElement("button");b2.textContent="Send";b2.onclick=function(){doSend(it.text)};
      var b3=document.createElement("button");b3.textContent="Copy";b3.onclick=function(){navigator.clipboard.writeText(it.text)};
      var b4=document.createElement("button");b4.textContent="x";b4.onclick=function(){items.splice(idx,1);save();render()};
      row.appendChild(b1);row.appendChild(b2);row.appendChild(b3);row.appendChild(b4);
      d.appendChild(meta);d.appendChild(pre);d.appendChild(row);
      box.appendChild(d);
    });
  }
   function push(text,auto,ts){
     items.push({text:text,auto:!!auto,ts:ts||Date.now()});
     items=items.slice(-10);
     save();render();
    if(window.toast)toast("payload in Sentinel inbox");
  }
  function build(){
    css();
    var pill=document.createElement("button");
    pill.id="vbinbox-pill";pill.textContent="Sentinel inbox";
    var panel=document.createElement("div");panel.id="vbinbox";
    panel.innerHTML="<h4>SENTINEL INBOX</h4><div class='top'><button id='vbi-clip'>Paste clipboard</button><button id='vbi-clear'>Clear</button></div><div id='vbi-list'></div>";
    document.body.appendChild(pill);document.body.appendChild(panel);
    pill.onclick=function(){panel.classList.toggle("open");render()};
    panel.querySelector("#vbi-clip").onclick=function(){
      navigator.clipboard.readText().then(function(t){if(t)push(t,false)}).catch(function(){if(window.toast)toast("clipboard read denied")});
    };
    panel.querySelector("#vbi-clear").onclick=function(){items=[];save();render()};
  }
  addEventListener("message",function(e){
    if(e.data&&e.data.source==="vibe-sentinel"){
      push(e.data.text,!!e.data.auto,e.data.ts);
    }
  });
  function ingestHash(){
    var m=(location.hash||"").match(/vbpayload=([^&]*)/);
    if(!m)return;
    var t="";try{t=decodeURIComponent(m[1])}catch(e){t=m[1]}
    if(!t)return;
    push(t,/auto=1/.test(location.hash));
    try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}
  }
  addEventListener("hashchange",ingestHash);
  if(document.body)build();else addEventListener("DOMContentLoaded",build);
  ingestHash();
  render();
})();