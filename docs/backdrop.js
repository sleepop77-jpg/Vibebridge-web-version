// BACKDROP CLOSE v1: clicking the dimmed area outside any popup window closes it.
// Works for EVERY modal in VibeBridge (shortcuts, AI API, ZIP to MD, Images, Bunny Studio,
// Customize, guided connect, projects, backup flow, developer panels…) because they all
// share the same ".modal" backdrop wrapper. Isolated + idempotent.
(function(){
  if(window.__vbBackdrop)return;
  window.__vbBackdrop=true;
  function isBackdrop(t){
    return !!t&&t.nodeType===1&&t.classList&&t.classList.contains("modal")&&!t.classList.contains("hidden");
  }
  document.addEventListener("click",function(e){
    var t=e.target;
    if(!isBackdrop(t))return;
    if(t.dataset&&t.dataset.nobackdrop!=null)return; // opt-out escape hatch
    t.classList.add("hidden");
  },true);
  // safety: also close when the backdrop is touched on touch devices
  document.addEventListener("touchstart",function(e){
    var t=e.target;
    if(!isBackdrop(t))return;
    if(t.dataset&&t.dataset.nobackdrop!=null)return;
    t.classList.add("hidden");
  },true);
})();