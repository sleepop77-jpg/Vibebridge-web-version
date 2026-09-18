// SVG-IN-CHAT: any pasted svg (raw or in a payload) renders inline as an image. Isolated.
(function(){
  if(window.__vbSvgChat)return;
  window.__vbSvgChat=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  function css(){
    var st=document.createElement("style");
    st.textContent=".vbsvg-wrap{margin:8px 0;padding:10px;border:1px solid var(--line,#30363d);border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden}"
     +".vbsvg-wrap.bg-checker{background:conic-gradient(#80808026 0 25%,transparent 0 50%) 0 0/16px 16px,var(--code,#0d1117)}"
     +".vbsvg-wrap.bg-dark{background:#0d1117}"
     +".vbsvg-wrap.bg-light{background:#ffffff}"
     +".vbsvg-wrap svg{max-width:100%;max-height:240px;width:auto;height:auto}"
     +".vbsvg-bar{display:flex;gap:6px;margin-top:6px}"
     +".vbsvg-btn{border:1px solid var(--btnline,rgba(128,128,128,.35));background:var(--bubble,#21262d);color:var(--dim,#8b949e);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:600;cursor:pointer}"
     +".vbsvg-btn:hover{color:var(--text,#e6edf3)}"
     +".vbsvg-raw{display:none;max-height:110px;overflow:auto;white-space:pre-wrap;word-break:break-word;font:11px/1.4 ui-monospace,Menlo,Consolas,monospace;color:var(--dim,#8b949e);opacity:.85;margin-top:6px}"
     +".vbsvg-thumb{display:flex;align-items:center;justify-content:center;background:conic-gradient(#80808026 0 25%,transparent 0 50%) 0 0/12px 12px,var(--code,#0d1117);border:1px solid var(--line,#30363d);border-radius:6px;padding:6px;margin-bottom:8px}"
     +".vbsvg-thumb svg{max-width:140px;max-height:90px;width:auto;height:auto}";
    document.head.appendChild(st);
  }
  function sanitize(svg){
    var tmp=document.createElement("div");tmp.innerHTML=svg;
    var bad=tmp.querySelectorAll("script,foreignObject,iframe,object,embed,link,style");
    for(var i=0;i<bad.length;i++)bad[i].parentNode.removeChild(bad[i]);
    var all=tmp.querySelectorAll("*");
    for(var a=0;a<all.length;a++){
      var el=all[a];
      for(var j=el.attributes.length-1;j>=0;j--){
        var n=el.attributes[j].name.toLowerCase(),v=el.attributes[j].value||"";
        if(n.indexOf("on")===0)el.removeAttribute(el.attributes[j].name);
        else if((n==="href"||n==="xlink:href"||n==="src")&&/^\s*javascript:/i.test(v))el.removeAttribute(el.attributes[j].name);
      }
    }
    return tmp.innerHTML;
  }
  function extractSvgs(text){
    var out=[],re=/<svg[\s\S]*?<\/svg>/gi,m;
    while((m=re.exec(text))&&out.length<4)out.push(m[0]);
    return out;
  }
  function unescapeHtml(s){return s.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,"&")}
  function decorateBubble(b,svgStr){
    if(b.dataset.vbsvg)return;
    b.dataset.vbsvg="1";
    var raw=document.createElement("span");raw.className="vbsvg-raw";
    while(b.firstChild)raw.appendChild(b.firstChild);
    var wrap=E("div","vbsvg-wrap bg-checker");wrap.dataset.bg="checker";
    wrap.innerHTML=sanitize(svgStr);
    var bar=E("div","vbsvg-bar");
    var bt=E("button","vbsvg-btn","code");
    bt.onclick=function(e){e.stopPropagation();raw.style.display=raw.style.display==="block"?"none":"block"};
    var cp=E("button","vbsvg-btn","copy");
    cp.onclick=function(e){e.stopPropagation();navigator.clipboard.writeText(svgStr)};
    var sv=E("button","vbsvg-btn","save");
    sv.onclick=function(e){e.stopPropagation();var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([svgStr],{type:"image/svg+xml"}));a.download="vibe-svg.svg";a.click()};
    var bg=E("button","vbsvg-btn","bg");
    bg.onclick=function(e){e.stopPropagation();wrap.dataset.bg=wrap.dataset.bg==="checker"?"dark":wrap.dataset.bg==="dark"?"light":"checker";wrap.className="vbsvg-wrap bg-"+wrap.dataset.bg};
    bar.appendChild(bt);bar.appendChild(cp);bar.appendChild(sv);bar.appendChild(bg);
    b.appendChild(wrap);b.appendChild(bar);b.appendChild(raw);
  }
  function thumbPreview(p,svgStr){
    if(p.dataset.vbsvg)return;
    p.dataset.vbsvg="1";
    var t=E("div","vbsvg-thumb");t.innerHTML=sanitize(svgStr);
    p.insertBefore(t,p.firstChild);
  }
  function scan(root){
    if(!root||root.nodeType!==1)return;
    var bubbles=[];
    if(root.classList&&root.classList.contains("msg")&&root.classList.contains("user"))bubbles.push(root);
    if(root.querySelectorAll)Array.prototype.forEach.call(root.querySelectorAll(".msg.user"),function(x){bubbles.push(x)});
    bubbles.forEach(function(b){
      if(b.dataset.vbsvg)return;
      var svgs=extractSvgs(b.textContent||"");
      if(svgs.length)decorateBubble(b,svgs[0]);
    });
    var prevs=[];
    if(root.classList&&root.classList.contains("preview"))prevs.push(root);
    if(root.querySelectorAll)Array.prototype.forEach.call(root.querySelectorAll(".preview"),function(x){prevs.push(x)});
    prevs.forEach(function(p){
      if(p.dataset.vbsvg)return;
      var svgs=extractSvgs(unescapeHtml(p.textContent||""));
      if(svgs.length)thumbPreview(p,svgs[0]);
    });
  }
  css();
  var flow=document.getElementById("flow");
  if(flow){
    new MutationObserver(function(muts){
      muts.forEach(function(mu){
        Array.prototype.forEach.call(mu.addedNodes,function(n){scan(n)});
      });
    }).observe(flow,{childList:true,subtree:true});
    scan(flow);
  }
})();