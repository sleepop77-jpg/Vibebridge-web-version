// MAIN-world hook: intercepts the page's clipboard writes and rebroadcasts the full string.
(function(){
  if(window.__vbClipHook)return;
  window.__vbClipHook=true;
  var n=0;
  function stash(t){
    if(typeof t!=="string"||!t)return;
    n++;
    document.documentElement.setAttribute("data-vb-clip",t);
    document.documentElement.setAttribute("data-vb-clip-n",String(n));
    document.dispatchEvent(new CustomEvent("vb-clip",{detail:t}));
  }
  try{
    var origWrite=navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText.bind(navigator.clipboard):null;
    if(origWrite){
      navigator.clipboard.writeText=function(t){stash(t);return origWrite(t)};
    }
    var origExec=document.execCommand?document.execCommand.bind(document):null;
    if(origExec){
      document.execCommand=function(cmd){
        if(cmd&&String(cmd).toLowerCase()==="copy"){
          var ae=document.activeElement;
          stash(ae&&(ae.value||ae.innerText)||String(window.getSelection()));
        }
        return origExec.apply(document,arguments);
      };
    }
  }catch(e){}
})();