// Feature registry: every full-file replacement gets scanned against these signatures.
// Present = pre-ticked. Missing = red, unticked, and Push stays locked until acknowledged.
const FEATURES={
  "docs/app.js":[
    ["send message flow","function send("],
    ["payload parsing","parsePayload("],
    ["push engine","commitOps("],
    ["CI polling","latestRun("],
    ["live log tail","logtail"],
    ["fix-it prompt","Fix it"],
    ["copy errors","Copy errors"],
    ["save report","Save report"],
    ["download apk","Download APK"],
    ["chat history","localStorage"],
    ["push history","pushHistory"],
    ["toasts","toast("],
    ["confetti","confetti("],
    ["bunny sprite","BUNNY"],
    ["keyboard shortcuts","ctrlKey"],
    ["export chat","exportChat"],
    ["strict mode","strict"],
    ["clipboard paste","clipboard.readText"],
    ["null guards","if(!box)return"],
    ["checklist hook","attachChecklist"]
  ],
  "docs/style.css":[
    ["dark palette","--bg:"],
    ["accent color","--accent:"],
    ["message slide-in","msgIn"],
    ["bunny bob","bob"],
    ["toast fade","transition:opacity"],
    ["confetti fall","fall"],
    ["menu fade","fadeIn"],
    ["responsive sidebar","@media(max-width:860px)"],
    ["composer styling","#composer"],
    ["checklist styles",".cklist"],
    ["error report styles",".errrep"]
  ],
  "docs/index.html":[
    ["sidebar","id=\"sb\""],
    ["chat history list","id=\"chatlist\""],
    ["push log","id=\"pushlog\""],
    ["connect form","id=\"pat\""],
    ["model menu","id=\"modelmenu\""],
    ["templates menu","id=\"tplmenu\""],
    ["composer input","id=\"input\""],
    ["toast layer","id=\"toast\""],
    ["confetti layer","id=\"confetti\""],
    ["shortcuts modal","id=\"kbmodal\""],
    ["bunny canvas","id=\"bunny\""],
    ["checks script","checks.js"]
  ],
  "docs/github.js":[
    ["auth header","Authorization"],
    ["orphan commit support","parents"],
    ["blob upload","git/blobs"],
    ["ref create","git/refs"],
    ["runs polling","actions/runs"],
    ["job logs","/logs"],
    ["artifact url","artifacts"],
    ["error extraction","extractErrors"],
    ["payload parser","parsePayload"],
    ["hunk diagnostics","HUNK MISS REPORT"]
  ]
};
function checklistFor(ops){
  const out=[];
  ops.forEach(op=>{
    if(op.kind!=="FILE")return;
    const reg=FEATURES[op.path];
    if(!reg)return;
    reg.forEach(pair=>{
      out.push({path:op.path,name:pair[0],ok:op.content.includes(pair[1])});
    });
  });
  return out;
}
function attachChecklist(body,ops,btn){
  const items=checklistFor(ops);
  if(!items.length)return null;
  const wrap=el("div","cklist");
  wrap.appendChild(el("div","alabel","Feature checklist — verify before push"));
  const boxes=[];
  items.forEach(it=>{
    const row=el("label","ck"+(it.ok?"":" miss"));
    const cb=document.createElement("input");
    cb.type="checkbox";
    cb.checked=it.ok;
    boxes.push(cb);
    row.appendChild(cb);
    row.appendChild(el("span","",(it.ok?"present: ":"MISSING: ")+it.name+"  ("+it.path+")"));
    wrap.appendChild(row);
  });
  wrap.appendChild(el("div","cknote","Missing items are unticked on purpose. Tick them only if the removal is intentional. Push unlocks when every box is checked."));
  wrap.addEventListener("change",()=>{btn.disabled=!boxes.every(b=>b.checked);});
  body.appendChild(wrap);
  btn.disabled=!boxes.every(b=>b.checked);
  return boxes;
}
window.attachChecklist=attachChecklist;