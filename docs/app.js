const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const BUNNY=[".............YY.............",".............AA.............",".............AA.............",".............HH.............",".........H........H.........",".......H............H.......","......H.##........##.H......",".....H..##........##..H.....","....H...##........##...H....","...H....##........##....H...","...H....##........##....H...","...H....###......###....H...","..H.....############.....H..","..H....##############....H..","..H...################...H..","..H...################...H..","..H...##RR########RR##...H..","..H...##RR########RR##...H..","..H...########PP######...H..","..H...########PP######...H..",".....H################H.....","......H##############H......",".......H............H.......",".........H........H.........","..........GGGGGGGGGG........","........SSSSSSSSSSSS........",".......SSSSSSSSSSSSSS.......","......SSSSSSSSSSSSSSSS......",".....SSSSSSSYYSSSSSSSS......",".....SSSSSSSYYSSSSSSSS......",".....SSSSSSSSSSSSSSSSS......",".....SSSSSSSSSSSSSSSSS......","......SSSSSSSSSSSSSSSS......",".......SSSSS....SSSSS.......",".......SSSSS....SSSSS.......",".......SSSSS....SSSSS......."];
const BUILTINS=[["Android chat","add a chatgpt-style chat screen to my android app with compose"],["Fix CI","my github actions android build fails, diagnose and fix the gradle files"],["Dark restyle","restyle my app with a pure black theme and green accents"],["New feature","add a settings screen with toggle switches for notifications and dark mode"]];
const TIPS=["type an idea — get a bridge prompt tuned for your target model","paste any AI reply back here; FILE / EDIT / DELETE blocks parse themselves","tap a file row to preview its diff before pushing","CI red? Fix it compiles the errors into a ready-to-copy fix prompt","this whole app lives in docs/ — it can rebuild itself from a chat","keyboard: Ctrl+K new chat, Ctrl+E export, Ctrl+Shift+V paste","full-file payloads now show a feature checklist before push"];
let model="QWEN STUDIO",tipIx=0,pendingOps=null;
let chats={},currentChat=null,pushHistory=[];
function saveChats(){try{localStorage.setItem("vb_chats",JSON.stringify(chats))}catch(e){}}
function savePushes(){try{localStorage.setItem("vb_pushes",JSON.stringify(pushHistory.slice(-50)))}catch(e){}}
function loadAll(){
  try{chats=JSON.parse(localStorage.getItem("vb_chats")||"{}");pushHistory=JSON.parse(localStorage.getItem("vb_pushes")||"[]")}catch(e){chats={};pushHistory=[]}
  try{const s=JSON.parse(localStorage.getItem("vb")||"null");if(s){$("#pat").value=s.p||"";$("#repo").value=s.r||"";$("#branch").value=s.b||"main";setConn(s.p,s.r,s.b);$("#connstatus").textContent="saved connection loaded";$("#connbadge").className="badge on";$("#connbadge").textContent=s.r}}catch(e){}
}
function toast(msg){const t=$("#toast");if(!t)return;t.textContent=msg;t.classList.remove("hidden");t.classList.add("show");setTimeout(()=>{t.classList.remove("show");setTimeout(()=>t.classList.add("hidden"),300)},2200)}
function confetti(){const c=$("#confetti");if(!c)return;const colors=["#311b4d","#6d4a94","#a678d8","#c9b3e8","#ece4f6","#7dd8a5"];for(let i=0;i<40;i++){const d=document.createElement("div");d.className="confetto";d.style.left=Math.random()*100+"vw";d.style.top="-10px";d.style.background=colors[i%colors.length];d.style.animationDelay=(Math.random()*.5)+"s";d.style.animationDuration=(.8+Math.random()*.6)+"s";c.appendChild(d)}setTimeout(()=>{c.innerHTML=""},2000)}
function drawBunny(cv,cell){
  const g=cv.getContext("2d");if(!cv)return;
  cv.width=BUNNY[0].length*cell;cv.height=BUNNY.length*cell;
  const PAL={"#":"#f2ecfa","R":"#ff4d6d","P":"#ffb6c1","H":"rgba(201,179,232,0.72)","G":"#fbbf24","S":"#d9c9ec","Y":"#fde047","A":"#9b8bab"};
  const GLOW={"R":"#ff4d6d","Y":"#fde047"};
  BUNNY.forEach((row,y)=>row.split("").forEach((ch,x)=>{
    const col=PAL[ch];if(!col)return;
    g.shadowBlur=GLOW[ch]?6:0;g.shadowColor=GLOW[ch]||"transparent";
    g.fillStyle=col;g.fillRect(x*cell,y*cell,cell,cell);
  }));
  g.shadowBlur=0;
}
function buildGalaxy(maxR){
  const S=Math.ceil(maxR*2.3);
  const c=document.createElement("canvas");c.width=S;c.height=S;
  const g=c.getContext("2d");
  const cx=S/2,cy=S/2;
  const rnd=n=>{const x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x)};
  const put=(x,y,s,col)=>{g.fillStyle=col;g.fillRect(x,y,s,s)};
  for(let i=0;i<140;i++){
    const r=maxR*Math.pow(rnd(i+3100),0.6);
    const th=6.283*rnd(i+3700);
    const a=0.10*(1-r/maxR)+0.03;
    put(cx+Math.cos(th)*r,cy+Math.sin(th)*r,1,"rgba(150,160,220,"+a+")");
  }
  const barA=0.9;
  for(let i=0;i<150;i++){
    const u=rnd(i+11)*2-1;
    const v=(rnd(i+501)*2-1)*0.16;
    const d=Math.abs(u);
    const x=u*maxR*0.20,y=v*maxR*0.20;
    const xr=cx+x*Math.cos(barA)-y*Math.sin(barA);
    const yr=cy+x*Math.sin(barA)+y*Math.cos(barA);
    const a=0.55*(1-d*0.75)+0.10;
    const warm=i%7===0?"rgba(255,214,160,":"rgba(246,232,205,";
    put(xr,yr,i%5===0?2:1.4,warm+a+")");
  }
  for(let i=0;i<110;i++){
    const r=maxR*0.17*Math.pow(rnd(i+907),0.6);
    const th=6.283*rnd(i+1301);
    const a=0.40*(1-r/(maxR*0.18))+0.08;
    put(cx+Math.cos(th)*r,cy+Math.sin(th)*r,1.3,"rgba(250,240,220,"+a+")");
  }
  for(let arm=0;arm<2;arm++){
    for(let i=0;i<230;i++){
      const f=i/230;
      const th=arm*Math.PI+i*0.052;
      const r=maxR*(0.14+0.86*f);
      const spread=(rnd(i+arm*7001)*2-1)*maxR*0.045*(0.35+f);
      const px=Math.cos(th)*r-Math.sin(th)*spread;
      const py=Math.sin(th)*r+Math.cos(th)*spread;
      const clump=i%17===0;
      const bright=i%9===0;
      const col=clump?"rgba(244,114,182,":bright?"rgba(236,228,246,":"rgba(166,170,235,";
      const a=(clump?0.5:bright?0.45:0.30)*(1-f*0.35)+0.05;
      put(cx+px,cy+py,clump?1.8:bright?1.5:1.1,col+a+")");
    }
  }
  put(cx-1,cy-1,2.4,"rgba(255,244,224,0.85)");
  return c;
}
function buildStarLayer(W,H,par){
  const c=document.createElement("canvas");c.width=W;c.height=H;
  const g=c.getContext("2d");
  const rnd=n=>{const x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x)};
  for(let i=par;i<140;i+=2){
    const s=.8+rnd(i+101)*1.4;
    g.fillStyle="rgba(236,228,246,"+(.5+rnd(i+151)*.5)+")";
    g.fillRect(rnd(i+1)*W,rnd(i+51)*H,s,s);
  }
  return c;
}
function initStars(){
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let rt=null;
  function render(){
    const a=$("#starA"),b=$("#starB"),gx=$("#galaxy");
    if(!a||!b||!gx)return;
    const W=innerWidth,H=innerHeight;
    a.width=W;a.height=H;b.width=W;b.height=H;
    a.getContext("2d").drawImage(buildStarLayer(W,H,0),0,0);
    b.getContext("2d").drawImage(buildStarLayer(W,H,1),0,0);
    const g=buildGalaxy(Math.min(W,H)*0.44);
    gx.width=g.width;gx.height=g.height;
    gx.getContext("2d").drawImage(g,0,0);
  }
  render();
  addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(render,150)});
  if(reduce)return;
  setInterval(()=>{
    if(document.hidden||document.documentElement.getAttribute("data-theme")==="light")return;
    const d=document.createElement("div");
    d.className="shot";
    d.style.left=Math.random()*70+"vw";
    d.style.top=Math.random()*30+"vh";
    document.body.appendChild(d);
    d.addEventListener("animationend",()=>d.remove());
  },7000);
}
function el(tag,cls,html){const d=document.createElement(tag);if(cls)d.className=cls;if(html!=null)d.innerHTML=html;return d}
function scrollEnd(){const c=$("#chat");if(!c)return;const l=c.lastElementChild;requestAnimationFrame(()=>{if(l&&l.scrollIntoView)l.scrollIntoView({block:"end"});else c.scrollTop=c.scrollHeight})}
function hideEmpty(){const e=$("#empty");if(e)e.style.display="none"}
function updateSendBtn(){const s=$("#send");if(s)s.disabled=!$("#input").value.trim()}
function autoGrow(){const i=$("#input");if(!i)return;i.style.height="auto";i.style.height=Math.min(i.scrollHeight,160)+"px";const cc=$("#charcount");if(cc)cc.textContent=i.value.length;updateSendBtn()}
function newChat(){const id=uid();chats[id]={id,title:"New chat",messages:[],created:Date.now()};saveChats();switchChat(id);renderChatList();return id}
function switchChat(id){
  currentChat=id;
  const flow=$("#flow");if(flow)flow.innerHTML="";
  const c=chats[id];
  if(!c)return;
  const em=$("#empty");
  if(c.messages.length===0){if(em)em.style.display="";}
  else{if(em)em.style.display="none";c.messages.forEach(m=>{if(m.type==="user")addUserBubble(m.text,m.isCode);else if(m.type==="prompt")addPromptBubble(m.text,m.model);else if(m.type==="note")addNoteBubble(m.text,m.bad);else if(m.type==="parse")addParseCardFromSaved(m);else if(m.type==="push")addPushCardFromSaved(m)});}
  renderChatList();scrollEnd();
}
function deleteChat(id){delete chats[id];saveChats();if(currentChat===id){const keys=Object.keys(chats);if(keys.length)switchChat(keys[keys.length-1]);else newChat()}renderChatList()}
function updateTitle(id,text){if(!chats[id])return;chats[id].title=text.slice(0,40)||chats[id].title;saveChats();renderChatList()}
function pushMsg(msg){if(!currentChat||!chats[currentChat])newChat();chats[currentChat].messages.push(msg);saveChats()}
function renderChatList(){
  const box=$("#chatlist");if(!box)return;box.innerHTML="";
  Object.values(chats).sort((a,b)=>b.created-a.created).forEach(c=>{
    const d=el("div","chatitem"+(c.id===currentChat?" active":""));
    d.innerHTML='<span class="ico"></span><span>'+esc(c.title)+'</span><button class="del" title="Delete chat">x</button>';
    d.querySelector(".del").onclick=e=>{e.stopPropagation();deleteChat(c.id)};
    d.onclick=()=>switchChat(c.id);
    box.appendChild(d);
  });
}
function renderPushLog(){
  const box=$("#pushlog");if(!box)return;box.innerHTML="";
  pushHistory.slice().reverse().slice(0,20).forEach(p=>{
    const d=el("div","pushitem "+(p.ok?"ok":"fail"));
    d.innerHTML='<span class="sha">'+p.sha.slice(0,7)+'</span> '+p.ops+' ops<span class="ts">'+new Date(p.ts).toLocaleTimeString()+'</span>';
    d.title=p.message;
    box.appendChild(d);
  });
}
function updateKeyStats(){
  const nc=Object.keys(chats).length,np=pushHistory.length,no=pushHistory.reduce((s,p)=>s+p.ops,0);
  const e1=$("#ks-chats");if(e1)e1.textContent=nc;
  const e2=$("#ks-pushes");if(e2)e2.textContent=np;
  const e3=$("#ks-ops");if(e3)e3.textContent=no;
  const e4=$("#stats");if(e4)e4.textContent=nc+" chats / "+np+" pushes / "+no+" ops total";
}
function addUserBubble(text,isCode){hideEmpty();const d=el("div","msg user"+(isCode?" code":""));d.textContent=isCode?(text.length>500?text.slice(0,500)+"…":text):text;$("#flow").appendChild(d);scrollEnd()}
function assistantRow(){hideEmpty();const row=el("div","msg arow");const body=el("div","abody");row.append(el("div","avatar","VB"),body);$("#flow").appendChild(row);scrollEnd();return body}
function addNoteBubble(text,bad){assistantRow().appendChild(el("div",bad?"note bad":"note",esc(text)))}
function addPromptBubble(text,mod){
  const body=assistantRow();
  body.appendChild(el("div","alabel","Prompt · "+(mod||model)));
  const pre=el("pre","prompttext");pre.textContent=text;body.appendChild(pre);
  const btns=el("div","cardbtns");
  const copy=el("button","mini","Copy");
  copy.onclick=()=>{navigator.clipboard.writeText(text);toast("prompt copied to clipboard")};
  btns.appendChild(copy);body.appendChild(btns);scrollEnd();
}
function compilePrompt(idea){return"You are VibeBridge's code engine, target "+model+".\nUser idea: "+idea+"\n\nReply ONLY with a bridge payload:\nfirst line ===VIBEBRIDGE=== v1 target=android\nthen ===== FILE: path ===== blocks with full content, or ===== EDIT: path ===== with --- FIND / --- REPLACE / --- END hunks.\nNo prose outside blocks."}
function previewFor(op){
  if(op.kind==="FILE"){const a=op.content.split("\n");return a.slice(0,8).map(l=>"+ "+l).concat(a.length>8?["+ … "+(a.length-8)+" more lines"]:[])}
  if(op.kind==="EDIT"){const out=[];op.hunks.slice(0,2).forEach(h=>{h.find.split("\n").slice(0,3).forEach(l=>out.push("- "+l));h.replace.split("\n").slice(0,3).forEach(l=>out.push("+ "+l))});return out}
  return["- (entire file removed)"];
}
function buildFileRows(body,ops){
  ops.forEach(op=>{
    const det=op.kind==="FILE"?op.content.split("\n").length+" lines":op.kind==="EDIT"?op.hunks.length+" hunks":"remove";
    const row=el("div","frow");
    row.innerHTML='<span class="fkind '+(op.kind==="FILE"?"g":op.kind==="DELETE"?"r":"")+'">'+op.kind+'</span><span class="fpath">'+esc(op.path)+'</span><span class="fdet">'+det+'</span>';
    const prev=el("div","preview");
    previewFor(op).forEach(l=>prev.appendChild(el("div",l.startsWith("-")?"pl m":l.startsWith("+")?"pl p":"pl",esc(l))));
    row.onclick=()=>prev.style.display=prev.style.display==="block"?"none":"block";
    body.appendChild(row);body.appendChild(prev);
  });
}
function addParseCard(r){
  const body=assistantRow();
  const head=el("div","cardhead");
  head.appendChild(el("span","alabel","Changes"));
  const c=r.ops.filter(o=>o.kind==="FILE").length;
  const e=r.ops.filter(o=>o.kind==="EDIT").length;
  const d=r.ops.filter(o=>o.kind==="DELETE").length;
  if(c)head.appendChild(el("span","chip g","Create "+c));
  if(e)head.appendChild(el("span","chip","Edit "+e));
  if(d)head.appendChild(el("span","chip r","Delete "+d));
  head.appendChild(el("span","chip a",r.ops.length+" ops"));
  body.appendChild(head);
  r.warnings.forEach(w=>body.appendChild(el("div","warnline","! "+esc(w))));
  buildFileRows(body,r.ops);
  const btns=el("div","cardbtns");
  const push=el("button","green","Push to GitHub");
  push.onclick=()=>doPush(body,push);
  btns.appendChild(push);
  body.appendChild(btns);
  if(window.attachChecklist)window.attachChecklist(body,r.ops,push);
  scrollEnd();
}
function addParseCardFromSaved(m){const body=assistantRow();const head=el("div","cardhead");head.appendChild(el("span","alabel","Changes"));head.appendChild(el("span","chip",m.count+" ops (saved)"));body.appendChild(head);scrollEnd()}
function addPushCardFromSaved(m){const body=assistantRow();const card=el("div","pushcard");card.appendChild(el("div","status "+(m.ok?"good":"bad"),m.ok?"CI passed — "+m.sha.slice(0,7):"CI failed — "+m.sha.slice(0,7)));body.appendChild(card);scrollEnd()}
async function doPush(body,btn){
  if(!OWNER||!PAT){addNoteBubble("connect first — sidebar, Connect section",true);return}
  if(!pendingOps||!pendingOps.length)return;
  btn.disabled=true;btn.textContent="Pushing…";
  const card=el("div","pushcard");
  const st=el("div","status","committing blobs and tree…");
  const tail=el("div","logtail");
  const btns=el("div","cardbtns");
  card.append(st,tail,btns);body.appendChild(card);scrollEnd();
  try{
    const commit=await commitOps(pendingOps,"feat: web push ("+pendingOps.length+" ops)");
    const opsCount=pendingOps.length;pendingOps=null;
    st.textContent="commit "+commit.sha.slice(0,7)+" — polling CI…";
    let run=null;
    for(let i=0;i<30;i++){
      await sleep(8000);run=await latestRun();if(!run)continue;
      if(run.status!=="completed"){
        st.textContent="run "+run.status+": "+run.name;
        try{const log=await runLog(run.id);tail.innerHTML=log.split("\n").filter(l=>l.trim()).slice(-4).map(l=>'<div class="'+(/e: |error:|FAILURE:/.test(l)?"lerr":"")+'">'+esc(l.slice(0,100))+"</div>").join("")}catch(e){}
        scrollEnd();continue;
      }
      break;
    }
    const ok=run&&run.conclusion==="success";
    pushHistory.push({sha:commit.sha,ts:Date.now(),ops:opsCount,ok,message:"web push ("+opsCount+" ops)"});
    savePushes();renderPushLog();updateKeyStats();
    pushMsg({type:"push",sha:commit.sha,ok});saveChats();
    if(ok)confetti();
    finalize(run,commit,btns,st);
  }catch(e){
    st.textContent="push aborted";
    st.className="status bad";
    tail.innerHTML=esc(e.message).split("\n").map(l=>'<div class="lerr">'+l+"</div>").join("");
    tail.classList.add("errrep");
    btn.disabled=false;btn.textContent="Push to GitHub";
    scrollEnd();
  }
}
function finalize(run,commit,btns,st){
  const ok=run&&run.conclusion==="success";
  st.textContent=ok?"CI passed — commit "+commit.sha.slice(0,7):"CI "+((run&&run.conclusion)||"unknown")+" — commit "+commit.sha.slice(0,7);
  st.className="status "+(ok?"good":"bad");
  const open=el("button","mini","Open run");open.onclick=()=>run&&window.open(run.html_url);btns.appendChild(open);
  if(ok){
    const dl=el("button","mini","Download APK");
    dl.onclick=async()=>{const u=await artifactUrl(run.id);if(!u)return;const r=await fetch(u,{headers:{Authorization:"Bearer "+PAT}});const a=document.createElement("a");a.href=URL.createObjectURL(await r.blob());a.download="vibebridge-"+commit.sha.slice(0,7)+".zip";a.click();toast("downloading APK zip")};
    btns.appendChild(dl);
  }else{
    const cp=el("button","mini","Copy errors");cp.onclick=async()=>{const log=await runLog(run.id);navigator.clipboard.writeText(extractErrors(log).join("\n")||log.slice(-20000));toast("errors copied")};
    const fx=el("button","mini amber","Fix it");fx.onclick=async()=>{const log=await runLog(run.id);const errs=extractErrors(log);const p=compilePrompt("my CI build failed with these errors:\n"+(errs.slice(0,25).join("\n")||log.slice(-3000))+"\nfix every error in the exact files mentioned.");addPromptBubble(p,model);pushMsg({type:"prompt",text:p,model});toast("fix prompt generated")};
    const md=el("button","mini","Save report");md.onclick=async()=>{const log=await runLog(run.id);const t="# CI failure\ncommit "+commit.sha+"\n\n## errors\n```\n"+extractErrors(log).join("\n")+"\n```\n\n## tail\n```\n"+log.slice(-20000)+"\n```\n";const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"text/markdown"}));a.download="vibebridge-errors-"+commit.sha.slice(0,7)+".md";a.click();toast("error report saved")};
    btns.append(cp,fx,md);
  }
  scrollEnd();
}
function send(){
  const t=$("#input").value.trim();if(!t)return;
  $("#input").value="";autoGrow();
  if(!currentChat)newChat();
  const isPayload=/===VIBEBRIDGE===|===== (FILE|EDIT|DELETE):/.test(t);
  if(isPayload&&$("#strict").checked&&!t.includes("===VIBEBRIDGE===")){addNoteBubble("strict mode: payload rejected — missing sentinel",true);pushMsg({type:"note",text:"strict reject",bad:true});return}
  if(isPayload){
    addUserBubble(t,true);pushMsg({type:"user",text:t,isCode:true});
    const r=parsePayload(t);pendingOps=r.ops;
    if(!r.ops.length){addNoteBubble("no bridge operations found in that paste",true);pushMsg({type:"note",text:"no ops found",bad:true})}
    else{addParseCard(r);pushMsg({type:"parse",count:r.ops.length});updateTitle(currentChat,r.ops[0].path.split("/").pop()+" +"+r.ops.length)}
  }else{
    addUserBubble(t,false);pushMsg({type:"user",text:t,isCode:false});
    updateTitle(currentChat,t);
    const p=compilePrompt(t);
    addPromptBubble(p,model);pushMsg({type:"prompt",text:p,model});
  }
}
function exportChat(){
  if(!currentChat||!chats[currentChat])return;
  const c=chats[currentChat];
  let md="# "+c.title+"\n\n";
  c.messages.forEach(m=>{
    if(m.type==="user")md+="**You:** "+m.text+"\n\n";
    else if(m.type==="prompt")md+="**VibeBridge ("+m.model+"):**\n```\n"+m.text+"\n```\n\n";
    else if(m.type==="note")md+="*Note: "+m.text+"*\n\n";
    else if(m.type==="push")md+="**Push:** "+(m.ok?"passed":"failed")+" "+m.sha+"\n\n";
  });
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([md],{type:"text/markdown"}));
  a.download=c.title.replace(/\W+/g,"-")+".md";a.click();
  toast("chat exported as markdown");
}
try{loadAll()}catch(e){}
try{initStars()}catch(e){}
try{drawBunny($("#bunny"),3);drawBunny($("#sbbunny"),1)}catch(e){}
BUILTINS.forEach(pair=>{
  const c=el("button","chipbtn",pair[0]);c.onclick=()=>{$("#input").value=pair[1];$("#input").focus();autoGrow()};
  $("#chips").appendChild(c);
  const m=el("button","",pair[0]+"<span>"+pair[1].slice(0,40)+"…</span>");m.onclick=()=>{$("#input").value=pair[1];$("#tplmenu").classList.add("hidden");$("#input").focus();autoGrow()};
  $("#tplmenu").appendChild(m);
});
const tipEl=$("#tip");if(tipEl)tipEl.textContent="Tip: "+TIPS[0];
setInterval(()=>{tipIx=(tipIx+1)%TIPS.length;const tp=$("#tip");if(tp)tp.textContent="Tip: "+TIPS[tipIx]},6000);
try{renderChatList()}catch(e){}
try{renderPushLog()}catch(e){}
try{updateKeyStats()}catch(e){}
try{if(!Object.keys(chats).length)newChat();else{const k=Object.keys(chats);switchChat(k[k.length-1])}}catch(e){}
$("#send").onclick=send;
$("#input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}});
$("#input").addEventListener("input",autoGrow);
$("#paste").onclick=async()=>{try{$("#input").value=await navigator.clipboard.readText();autoGrow();toast("pasted from clipboard")}catch(e){toast("clipboard access denied")}};
$("#sbtoggle").onclick=()=>document.body.classList.toggle("sbopen");
$("#newchat").onclick=()=>{newChat();toast("new chat started")};
$("#clearbtn").onclick=()=>{if(currentChat&&chats[currentChat]){chats[currentChat].messages=[];saveChats();switchChat(currentChat);toast("chat cleared")}};
$("#exportbtn").onclick=exportChat;
$("#modelbtn").onclick=e=>{e.stopPropagation();$("#modelmenu").classList.toggle("hidden")};
$("#tplbtn").onclick=e=>{e.stopPropagation();$("#tplmenu").classList.toggle("hidden")};
$$("#modelmenu button").forEach(b=>b.onclick=()=>{model=b.dataset.m;$("#modelbtn").textContent="VibeBridge · "+model+" ▾";$("#modelmenu").classList.add("hidden");toast("model: "+model)});
document.addEventListener("click",()=>{$("#modelmenu").classList.add("hidden");$("#tplmenu").classList.add("hidden")});
$("#connect").onclick=async()=>{
  const st=$("#connstatus");
  if(!setConn($("#pat").value.trim(),$("#repo").value.trim(),$("#branch").value.trim())){st.textContent="need pat and owner/repo";st.className="dim small bad";return}
  st.textContent="validating…";st.className="dim small";
  try{
    const login=await validate();
    if($("#remember").checked)localStorage.setItem("vb",JSON.stringify({p:$("#pat").value,r:$("#repo").value,b:$("#branch").value}));
    st.textContent="connected as "+login;st.className="dim small good";
    $("#connbadge").className="badge on";$("#connbadge").textContent=$("#repo").value;
    toast("connected as "+login);
  }catch(e){st.textContent="failed: "+e.message;st.className="dim small bad";$("#connbadge").className="badge off";$("#connbadge").textContent="Not connected"}
};
$("#kbshort").onclick=e=>{e.preventDefault();$("#kbmodal").classList.remove("hidden")};
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){$(".modal:not(.hidden)").forEach(m=>m.classList.add("hidden"));$(".menu:not(.hidden)").forEach(m=>m.classList.add("hidden"));document.body.classList.remove("sbopen")}
  if(e.ctrlKey&&e.key==="k"){e.preventDefault();newChat();toast("new chat")}
  if(e.ctrlKey&&e.key==="e"){e.preventDefault();exportChat()}
  if(e.ctrlKey&&e.shiftKey&&e.key==="V"){e.preventDefault();$("#paste").click()}
});
// ---- BUNNY STUDIO easter egg: triple-click the bunny to edit + animate him ----
(function(){
  const PAL={"#":"#f2ecfa","R":"#ff4d6d","P":"#ffb6c1","H":"rgba(201,179,232,0.72)","G":"#fbbf24","S":"#d9c9ec","Y":"#fde047","A":"#9b8bab"};
  const DEF=BUNNY.slice();
  const DEFANIM="1: dy=0\n2: dy=-3\n3: dy=0\n4: dy=1";
  const PRESETS={
    "Bob":"1: dy=0\n2: dy=-3\n3: dy=0\n4: dy=1",
    "Jump":"1: dy=0 sx=1.1 sy=0.9\n2: dy=-12 sx=0.95 sy=1.1\n3: dy=0 sx=1.05 sy=0.95\n4: dy=0",
    "Wiggle":"1: rot=0\n2: rot=-7\n3: rot=0\n4: rot=7",
    "Spin":"1: rot=0\n2: rot=90\n3: rot=180\n4: rot=270"
  };
  let custom=null;
  try{custom=JSON.parse(localStorage.getItem("vb_bunny")||"null")}catch(e){}
  let frames=custom&&custom.frames?custom.frames:[DEF.slice()];
  let fps=custom&&custom.fps?custom.fps:6;
  let animSrc=custom&&custom.anim?custom.anim:DEFANIM;
  let fi=0,efi=0,tool="#",curKeys=[],modal=null,prevCv=null;
  function paint(cv,cell,grid){
    const g=cv.getContext("2d");if(!cv||!grid)return;
    cv.width=grid[0].length*cell;cv.height=grid.length*cell;
    grid.forEach((row,y)=>row.split("").forEach((ch,x)=>{
      const col=PAL[ch];if(!col)return;
      g.fillStyle=col;g.fillRect(x*cell,y*cell,cell,cell);
    }));
  }
  drawBunny=function(cv,cell){paint(cv,cell,frames[fi%frames.length])};
  function repaintMain(){try{drawBunny($("#bunny"),3);drawBunny($("#sbbunny"),1)}catch(e){}}
  function parseAnim(src,n){
    const keys=[];
    src.split(/[\n;]+/).forEach(line=>{
      const m=line.match(/^\s*(\d+)\s*:\s*(.*)$/);
      if(!m)return;
      const idx=parseInt(m[1],10)-1;
      const t={dy:0,rot:0,sx:1,sy:1};
      m[2].split(/\s+/).forEach(tok=>{
        const kv=tok.split("=");
        if(kv.length===2){
          const v=parseFloat(kv[1]);
          if(!isNaN(v)){
            if(kv[0]==="dy")t.dy=v;
            if(kv[0]==="rot")t.rot=v;
            if(kv[0]==="sx")t.sx=v;
            if(kv[0]==="sy")t.sy=v;
          }
        }
      });
      keys[idx]=t;
    });
    for(let i=0;i<n;i++)if(!keys[i])keys[i]={dy:0,rot:0,sx:1,sy:1};
    return keys;
  }
  function applyAnim(){
    curKeys=parseAnim(animSrc,Math.max(frames.length,1));
    const dur=Math.max(.3,curKeys.length/Math.max(1,fps));
    let css="@keyframes bunnyAnim{";
    curKeys.forEach((k,i)=>{css+=Math.round(i/curKeys.length*100)+"%{transform:translateY("+k.dy+"px) rotate("+k.rot+"deg) scale("+k.sx+","+k.sy+")}"});
    const k0=curKeys[0];
    css+="100%{transform:translateY("+k0.dy+"px) rotate("+k0.rot+"deg) scale("+k0.sx+","+k0.sy+")}}";
    let st=$("#bunnyanim");
    if(!st){st=document.createElement("style");st.id="bunnyanim";document.head.appendChild(st)}
    st.textContent=css;
    const b=$("#bunny");
    if(b)b.style.animation="bunnyAnim "+dur+"s linear infinite";
  }
  setInterval(()=>{
    if(frames.length>1){
      fi=(fi+1)%frames.length;
      repaintMain();
      if(modal&&!modal.classList.contains("hidden")&&prevCv){
        paint(prevCv,6,frames[fi]);
        const k=curKeys[fi%curKeys.length];
        if(k)prevCv.style.transform="translateY("+k.dy+"px) rotate("+k.rot+"deg) scale("+k.sx+","+k.sy+")";
      }
    }
  },Math.max(80,1000/fps));
  function build(){
    const m=el("div","modal");
    const st=document.createElement("style");
    st.textContent=".studio{max-width:600px;width:95%;max-height:90vh;overflow:auto;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px}"
      +".studio h3{color:#fff;font-size:14px;margin-bottom:4px}"
      +".studio .help{font-size:10.5px;color:var(--faint);margin-bottom:10px}"
      +".swrow{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}"
      +".sw{width:22px;height:22px;border-radius:6px;border:2px solid transparent;cursor:pointer}"
      +".sw.on{border-color:#fff}"
      +".strow{display:flex;gap:8px;align-items:center;margin:8px 0;flex-wrap:wrap}"
      +".stcanvas{border:1px solid var(--line);border-radius:8px;image-rendering:pixelated;cursor:crosshair;background:#0e0616}"
      +".studio textarea{height:90px;font:11px/1.5 ui-monospace,Menlo,Consolas,monospace}"
      +".fbtn{border:1px solid var(--line);border-radius:6px;padding:3px 9px;font-size:11px;color:var(--dim)}"
      +".fbtn.on{border-color:var(--accent);color:#fff}";
    m.appendChild(st);
    const card=el("div","studio");
    card.appendChild(el("h3","","BUNNY STUDIO"));
    card.appendChild(el("div","help","click / drag to paint • frames add motion • anim code: one line per frame, e.g.  2: dy=-4 rot=-5 sx=1.05"));
    const swrow=el("div","swrow");
    Object.keys(PAL).forEach(k=>{
      const s=el("div","sw"+(k===tool?" on":""));
      s.style.background=PAL[k];s.title="paint "+k;
      s.onclick=()=>{tool=k;swrow.querySelectorAll(".sw").forEach(x=>x.classList.remove("on"));s.classList.add("on")};
      swrow.appendChild(s);
    });
    const er=el("div","sw");
    er.style.background="repeating-conic-gradient(#3a3a3a 0% 25%, #141414 0% 50%) 0 0/8px 8px";
    er.title="erase";
    er.onclick=()=>{tool=".";swrow.querySelectorAll(".sw").forEach(x=>x.classList.remove("on"));er.classList.add("on")};
    swrow.appendChild(er);
    card.appendChild(swrow);
    const row=el("div","strow");
    const ec=document.createElement("canvas");ec.className="stcanvas";
    const pwrap=el("div","");
    prevCv=document.createElement("canvas");prevCv.style.imageRendering="pixelated";
    pwrap.appendChild(prevCv);
    row.append(ec,pwrap);
    card.appendChild(row);
    const frow=el("div","strow");
    card.appendChild(frow);
    const arow=el("div","strow");
    const fpsIn=document.createElement("input");fpsIn.type="number";fpsIn.min="1";fpsIn.max="24";fpsIn.style.width="64px";fpsIn.value=fps;
    arow.appendChild(el("span","small dim","fps"));arow.appendChild(fpsIn);
    card.appendChild(arow);
    const ta=document.createElement("textarea");ta.value=animSrc;
    card.appendChild(ta);
    const prow=el("div","strow");
    Object.keys(PRESETS).forEach(n=>{
      const b=el("button","fbtn",n);
      b.onclick=()=>{ta.value=PRESETS[n];animSrc=ta.value;applyAnim()};
      prow.appendChild(b);
    });
    const applyB=el("button","fbtn","Apply anim");
    applyB.onclick=()=>{animSrc=ta.value;fps=Math.min(24,Math.max(1,parseInt(fpsIn.value||"6",10)));applyAnim()};
    prow.appendChild(applyB);
    card.appendChild(prow);
    const act=el("div","strow");
    const saveB=el("button","green","Save bunny");
    saveB.onclick=()=>{localStorage.setItem("vb_bunny",JSON.stringify({frames:frames,fps:fps,anim:animSrc}));toast("bunny saved — he is yours now")};
    const resetB=el("button","mini","Reset");
    resetB.onclick=()=>{frames=[DEF.slice()];fi=0;efi=0;animSrc=DEFANIM;fps=6;ta.value=animSrc;fpsIn.value=6;localStorage.removeItem("vb_bunny");applyAnim();syncEditor();repaintMain()};
    const closeB=el("button","mini","Close");
    closeB.onclick=()=>m.classList.add("hidden");
    act.append(saveB,resetB,closeB);
    card.appendChild(act);
    m.appendChild(card);
    let drawing=false;
    function stroke(e){
      const r=ec.getBoundingClientRect();
      const grid=frames[efi];
      const cw=r.width/grid[0].length,ch=r.height/grid.length;
      const x=Math.floor((e.clientX-r.left)/cw),y=Math.floor((e.clientY-r.top)/ch);
      if(y<0||y>=grid.length||x<0||x>=grid[0].length)return;
      grid[y]=grid[y].slice(0,x)+tool+grid[y].slice(x+1);
      paint(ec,10,grid);paint(prevCv,6,grid);repaintMain();
    }
    ec.addEventListener("mousedown",e=>{drawing=true;stroke(e)});
    ec.addEventListener("mousemove",e=>{if(drawing)stroke(e)});
    addEventListener("mouseup",()=>{drawing=false});
    ec.addEventListener("touchstart",e=>{e.preventDefault();stroke(e.touches[0])},{passive:false});
    ec.addEventListener("touchmove",e=>{e.preventDefault();stroke(e.touches[0])},{passive:false});
    function syncFrames(){
      frow.innerHTML="";
      frames.forEach((_,i)=>{
        const b=el("button","fbtn"+(i===efi?" on":""),"F"+(i+1));
        b.onclick=()=>{efi=i;syncFrames();paint(ec,10,frames[efi]);paint(prevCv,6,frames[efi])};
        frow.appendChild(b);
      });
      const add=el("button","fbtn","+ frame");
      add.onclick=()=>{frames.push(frames[efi].slice());efi=frames.length-1;syncFrames();paint(ec,10,frames[efi]);paint(prevCv,6,frames[efi]);applyAnim()};
      const del=el("button","fbtn","- frame");
      del.onclick=()=>{if(frames.length>1){frames.splice(efi,1);efi=Math.min(efi,frames.length-1);syncFrames();paint(ec,10,frames[efi]);paint(prevCv,6,frames[efi]);applyAnim()}};
      frow.append(add,del);
    }
    function syncEditor(){paint(ec,10,frames[efi]);paint(prevCv,6,frames[efi]);syncFrames();ta.value=animSrc;fpsIn.value=fps}
    m._sync=syncEditor;
    return m;
  }
  function openStudio(){
    if(!modal){modal=build();document.body.appendChild(modal)}
    modal.classList.remove("hidden");
    if(modal._sync)modal._sync();
  }
  let clicks=0,ct=0;
  function bump(){
    const n=Date.now();
    if(n-ct>2000)clicks=0;
    ct=n;clicks++;
    if(clicks>=3){clicks=0;openStudio();toast("bunny studio unlocked")}
  }
  document.addEventListener("click",e=>{
    if(e.target&&(e.target.id==="bunny"||e.target.id==="sbbunny"))bump();
  });
  applyAnim();
  repaintMain();
})();