// Theme toggle + cascade-proof light-mode fixes (injected last, wins over hardcoded darks).
(function(){
  var root=document.documentElement;
  var FIX=""
   +"[data-theme=\"light\"] body{text-shadow:none}"
   +"[data-theme=\"light\"] body::before{background:none}"
   +"[data-theme=\"light\"] #starA,[data-theme=\"light\"] #starB,[data-theme=\"light\"] #galaxy,[data-theme=\"light\"] .shot{display:none}"
   +"[data-theme=\"light\"] header{background:rgba(255,255,255,.85);border-bottom-color:rgba(60,40,90,.12)}"
   +"[data-theme=\"light\"] #sb{background:rgba(255,255,255,.9)}"
   +"[data-theme=\"light\"] #composer{background:rgba(255,255,255,.9)}"
   +"[data-theme=\"light\"] #composer textarea{color:#221a30}"
   +"[data-theme=\"light\"] #composer textarea::placeholder{color:#7d7590}"
   +"[data-theme=\"light\"] .charcount,[data-theme=\"light\"] .footnote{color:#7d7590}"
   +"[data-theme=\"light\"] .pushcard,[data-theme=\"light\"] .menu,[data-theme=\"light\"] .modalcard,[data-theme=\"light\"] .toast{background:rgba(255,255,255,.95)}"
   +"[data-theme=\"light\"] .msg.user{background:rgba(109,74,148,.1)}"
   +"[data-theme=\"light\"] .mini{background:rgba(255,255,255,.7)}"
   +"[data-theme=\"light\"] .pill,[data-theme=\"light\"] .chipbtn{background:rgba(255,255,255,.7);color:#4c4460}"
   +"[data-theme=\"light\"] .green,[data-theme=\"light\"] .sendbtn{background-image:linear-gradient(135deg,#7b5aa6,#5d3f85);color:#fff;border-color:rgba(60,40,90,.35);box-shadow:0 2px 8px rgba(93,63,133,.25)}"
   +"[data-theme=\"light\"] .wordmark,[data-theme=\"light\"] .sbhead span{color:#221a30}"
   +"[data-theme=\"light\"] .headbtn,[data-theme=\"light\"] .modelbtn{color:#4c4460}"
   +"[data-theme=\"light\"] .avatar{background:#6d4a94;color:#fff;border-color:rgba(60,40,90,.4)}"
   +"[data-theme=\"light\"] .prompttext,[data-theme=\"light\"] .logtail,[data-theme=\"light\"] .preview,[data-theme=\"light\"] .cklist{background:#efeaf7}"
   +"[data-theme=\"light\"] .pl,[data-theme=\"light\"] .logtail div{color:#4c4460}"
   +"[data-theme=\"light\"] .fpath{color:#221a30}"
   +"[data-theme=\"light\"] .status,[data-theme=\"light\"] .note,[data-theme=\"light\"] .chatitem,[data-theme=\"light\"] .pushitem,[data-theme=\"light\"] .chk{color:#4c4460}"
   +"[data-theme=\"light\"] .alabel,[data-theme=\"light\"] .sbsec,[data-theme=\"light\"] .sbfoot,[data-theme=\"light\"] .stats{color:#7d7590}"
   +"[data-theme=\"light\"] .studio h3,[data-theme=\"light\"] .zmd h3,[data-theme=\"light\"] .imgtool h3{color:#221a30}"
   +"[data-theme=\"light\"] .fbtn{color:#4c4460;border-color:rgba(60,40,90,.3)}"
   +"[data-theme=\"light\"] .stcanvas,[data-theme=\"light\"] .zmdprev{background:#efeaf7;border-color:rgba(60,40,90,.25)}"
   +"[data-theme=\"light\"] select{background:#efeaf7;color:#332a44;border-color:rgba(60,40,90,.3)}"
   +"[data-theme=\"light\"] *::-webkit-scrollbar-thumb{background:#c9bce0;border:2px solid rgba(255,255,255,.7)}"
   +"[data-theme=\"light\"] #sb,[data-theme=\"light\"] #chat,[data-theme=\"light\"] .chatlist,[data-theme=\"light\"] .pushlog{scrollbar-color:#c9bce0 transparent}"
   +"[data-theme=\"light\"] .orbit{border-color:rgba(109,74,148,.4)}"
   +"[data-theme=\"light\"] .orbit i{background:#6d4a94;box-shadow:0 0 10px rgba(109,74,148,.6)}"
   +"[data-theme=\"light\"] .bunnywrap::before{background:radial-gradient(closest-side,rgba(109,74,148,.18),transparent 70%)}"
   +"[data-theme=\"light\"] kbd{background:rgba(109,74,148,.1)}"
   +"[data-theme=\"light\"] .badge.off{background:rgba(194,47,77,.1);color:#c22f4d}"
   +"[data-theme=\"light\"] .badge.on{background:rgba(21,122,74,.1);color:#157a4a}"
   +"[data-theme=\"light\"] .ck.miss{color:#c22f4d}"
   +"[data-theme=\"light\"] .pushitem .sha,[data-theme=\"light\"] .chatitem.active,[data-theme=\"light\"] a{color:#6d4a94}";
  function ensureStyle(){
    if(!document.getElementById("theme-fix")){
      var st=document.createElement("style");
      st.id="theme-fix";
      st.textContent=FIX;
      document.head.appendChild(st);
    }
  }
  function current(){return root.getAttribute("data-theme")==="light"?"light":"dark"}
  function apply(t){
    if(t==="light")root.setAttribute("data-theme","light");
    else root.removeAttribute("data-theme");
    try{localStorage.setItem("vb_theme",t)}catch(e){}
    var b=document.getElementById("themebtn");
    if(b)b.textContent=(t==="light")?"Dark mode":"Light mode";
    ensureStyle();
  }
  var b=document.getElementById("themebtn");
  if(b)b.onclick=function(){apply(current()==="light"?"dark":"light")};
  apply(current());
})();