// STUDIO LOADER v1: self-healing script chain. Injects any missing studio script
// (shell / vfs / editor / push / shellfix) so a partially-applied push can never
// leave the Studio half-installed again.
(function(){
  if(window.__vbStudioLoader)return;
  window.__vbStudioLoader=true;
  var NEED=[
    ["studioshell.js","__vbStudioShell"],
    ["vfs.js","__vbVfs"],
    ["shellfix.js","__vbShellFix"],
    ["studioedit.js","__vbStudioEdit"],
    ["studiopush.js","__vbStudioPush"]
  ];
  function load(src,cb){
    var s=document.createElement("script");
    s.src=src;
    s.onload=cb;
    s.onerror=cb;
    document.head.appendChild(s);
  }
  function step(i){
    if(i>=NEED.length)return;
    var n=NEED[i];
    if(window[n[1]]){step(i+1);return}
    load(n[0],function(){setTimeout(function(){step(i+1)},30)});
  }
  function start(){setTimeout(function(){step(0)},60)}
  if(document.readyState==="loading")addEventListener("DOMContentLoaded",start);
  else start();
})();
