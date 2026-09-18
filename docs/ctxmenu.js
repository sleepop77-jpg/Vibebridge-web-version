// VibeBridge context menu: right-click = our tools, not Chrome's. Isolated + self-styled.
(function(){
  if(window.__vbCtx)return;
  window.__vbCtx=true;
  function E(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d}
  var st=document.createElement("style");
  st.textContent="#vbctx{position:fixed;z-index:1002;min-width:230px;background:var(--card,rgba(22,27,34,.96));backdrop-filter:saturate(180%) blur(20px);-webkit-backdrop-filter:saturate(180%) blur(20px);border:1px solid var(--line,#30363d);border-radius:10px;padding:5px;box-shadow:0 12px 32px rgba(0,0,0,.45);animation:vbctxIn .1s ease-out}"
   +"@keyframes vbctxIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}"
   +".vbctx-item{display:block;width:100%;text-align:left;padding:6px 10px;border-radius:6px;font:inherit;font-size:12.5px;color:var(--text,#e6edf3);cursor:pointer;background:none;border:none}"
   +".vbctx-item:hover,.vbctx-item:focus{background:var(--accent,#4493f8);color:#fff;outline:none}"
   +".vbctx-sep{height:1px;background:var(--line,#30363d);margin:4px 6px}"
   +".vbctx-hint{font-size:9.5px;color:var(--faint,#6e7681);padding:4px 10px 2px;border-top:1px solid var(--line,#30363d);margin-top:4px}";
  document.head.appendChild(st);
  var menu=null;
  function sel(){return String(window.getSelection()||"").trim()}
  function codeFrom(t){
    var n=t;
    for(var i=0;i<6&&n;i++){
      var cl=n.classList;
      if((cl&&(cl.contains("prompttext")||cl.contains("preview")||cl.contains("logtail")||cl.contains("cklist")))||n.tagName==="PRE")return (n.innerText||"").trim();
      n=n.parentElement;
    }
    return "";
  }
  function fill(t){var i=document.querySelector("#input");if(!i)return false;i.value=t;if(window.autoGrow)autoGrow();i.focus();return true}
  function clickSel(s){var e=document.querySelector(s);if(e){e.click();return true}return false}
  function clickText(cls,txt){var bs=document.querySelectorAll(cls);for(var i=0;i<bs.length;i++){if((bs[i].textContent||"").trim()===txt){bs[i].click();return true}}return false}
  function buildItems(t){
    var out=[],s=sel(),code=codeFrom(t);
    if(s){
      out.push(["Copy selection",function(){navigator.clipboard.writeText(s)}]);
      out.push(["Send selection to composer",function(){fill(s)}]);
      out.push(["Ask AI about selection",function(){fill("explain this briefly:\n"+s)}]);
      out.push(null);
    }
    if(code){
      out.push(["Copy code block",function(){navigator.clipboard.writeText(code)}]);
      out.push(["Send code block to composer",function(){fill(code)}]);
      out.push(null);
    }
    if(t&&(t.id==="bunny"||t.id==="sbbunny")){
      out.push(["Open Bunny Studio",function(){t.click();setTimeout(function(){t.click()},80);setTimeout(function(){t.click()},160)}]);
      out.push(null);
    }
    out.push(["New chat",function(){clickSel("#newchat")}]);
    out.push(["Paste clipboard into composer",function(){clickSel("#paste")}]);
    out.push(["Toggle theme",function(){clickSel("#themebtn")}]);
    out.push(["ZIP to MD",function(){clickSel("#zmd-side")}]);
    out.push(["Images",function(){clickText(".sidebtn","Images")}]);
    out.push(["Sentinel inbox",function(){clickSel("#vbinbox-pill")}]);
    out.push(["Export chat",function(){clickSel("#exportbtn")}]);
    out.push(["Keyboard shortcuts",function(){clickSel("#kbshort")}]);
    return out;
  }
  function close(){if(menu){menu.remove();menu=null}}
  function open(x,y,t){
    close();
    menu=E("div");menu.id="vbctx";
    buildItems(t).forEach(function(it){
      if(!it){menu.appendChild(E("div","vbctx-sep"));return}
      var b=E("button","vbctx-item");b.textContent=it[0];
      b.onclick=function(e){e.stopPropagation();close();try{it[1]()}catch(err){}};
      menu.appendChild(b);
    });
    menu.appendChild(E("div","vbctx-hint","shift+right-click = browser menu"));
    document.body.appendChild(menu);
    var r=menu.getBoundingClientRect();
    menu.style.left=Math.max(4,Math.min(x,innerWidth-r.width-8))+"px";
    menu.style.top=Math.max(4,Math.min(y,innerHeight-r.height-8))+"px";
    var ix=-1;
    menu._keys=function(e){
      var list=menu.querySelectorAll(".vbctx-item");
      if(!list.length)return;
      if(e.key==="ArrowDown"){ix=(ix+1)%list.length;list[ix].focus();e.preventDefault()}
      else if(e.key==="ArrowUp"){ix=(ix-1+list.length)%list.length;list[ix].focus();e.preventDefault()}
    };
  }
  document.addEventListener("contextmenu",function(e){
    if(e.shiftKey)return;
    e.preventDefault();
    open(e.clientX,e.clientY,e.target);
  });
  document.addEventListener("click",function(e){if(menu&&!menu.contains(e.target))close()});
  document.addEventListener("keydown",function(e){
    if(!menu)return;
    if(e.key==="Escape"){close();return}
    if(menu._keys)menu._keys(e);
  });
  addEventListener("scroll",close,true);
  addEventListener("blur",close);
})();