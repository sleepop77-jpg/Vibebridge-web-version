// SHELL FIX v1: stops the Studio column from growing past the viewport.
// Root cause: #vb-studio-shell is a CSS grid with an implicit auto-height row, so the
// row stretched to fit the growing chat and everything below the fold got clipped by
// body{overflow:hidden}. This constrains the row and restores the min-height:0 chain
// so #chat scrolls INSIDE the page instead of pushing the page taller.
// Also aliases #sk-body -> #sk-center-body so the editor tabs/pane mount correctly.
(function(){
  if(window.__vbShellFix)return;
  window.__vbShellFix=true;
  var st=document.createElement("style");
  st.id="vb-shellfix-css";
  st.textContent=""
   +"#vb-studio-shell{grid-template-rows:minmax(0,1fr)!important;height:100vh!important;overflow:hidden!important}"
   +"#vb-studio-shell>.sk-left,#vb-studio-shell>.sk-center,#vb-studio-shell>.sk-right{min-height:0!important}"
   +".sk-center{min-height:0!important;overflow:hidden!important}"
   +".sk-body,#sk-center-body{min-height:0!important;flex:1 1 0!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}"
   +".sk-body #main,#sk-center-body #main{min-height:0!important;flex:1 1 0!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}"
   +".sk-body #chat,#sk-center-body #chat{min-height:0!important;flex:1 1 0!important;overflow-y:auto!important}"
   +".sk-body #composerwrap,#sk-center-body #composerwrap{flex:0 0 auto!important}"
   +".sk-body .sk-editor-tabs,#sk-center-body .sk-editor-tabs{flex:0 0 auto!important}"
   +".sk-body .sk-editor-pane,#sk-center-body .sk-editor-pane{min-height:0!important;flex:1 1 0!important}"
   +".sk-left{overflow-y:auto!important}"
   +".sk-right{overflow-y:auto!important}";
  document.head.appendChild(st);
  function fix(){
    var b=document.getElementById("sk-body");
    if(b&&!document.getElementById("sk-center-body"))b.id="sk-center-body";
  }
  fix();
  var n=0;
  var iv=setInterval(function(){n++;fix();if(n>160)clearInterval(iv)},250);
  if(document.documentElement){
    new MutationObserver(function(){fix()}).observe(document.documentElement,{childList:true,subtree:true});
  }
})();