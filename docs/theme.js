(function(){
  var root=document.documentElement;
  function current(){return root.getAttribute("data-theme")==="light"?"light":"dark"}
  function apply(t){
    if(t==="light")root.setAttribute("data-theme","light");
    else root.removeAttribute("data-theme");
    try{localStorage.setItem("vb_theme",t)}catch(e){}
    var b=document.getElementById("themebtn");
    if(b)b.textContent=(t==="light")?"Dark mode":"Light mode";
  }
  var b=document.getElementById("themebtn");
  if(b)b.onclick=function(){apply(current()==="light"?"dark":"light")};
  apply(current());
})();