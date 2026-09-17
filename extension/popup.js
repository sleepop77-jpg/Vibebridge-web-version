var $=function(s){return document.querySelector(s)};
var BRIDGE_BASE="https://sleepop77-jpg.github.io/Vibebridge-web-version";
function handoff(text,auto){
  chrome.storage.local.set({handoff:{text:text||"",auto:!!auto,ts:Date.now()}});
  chrome.tabs.query({url:BRIDGE_BASE+"/*"},function(tabs){
    if(tabs&&tabs.length){
      chrome.tabs.update(tabs[0].id,{active:true});
      if(tabs[0].windowId!=null)chrome.windows.update(tabs[0].windowId,{focused:true});
    }else{
      chrome.tabs.create({url:BRIDGE_BASE+"/#vbpayload="+encodeURIComponent(text||"")+(auto?"&auto=1":"")});
    }
  });
}
function copyAndHandoff(text,btn){
  navigator.clipboard.writeText(text);
  if(btn){var old=btn.textContent;btn.textContent="Copied";setTimeout(function(){btn.textContent=old},1200)}
  handoff(text,false);
  $("#state").textContent="copied + handed to VibeBridge (no auto-send)";
}
function renderBlocks(blocks){
  var box=$("#blocks");box.innerHTML="";
  (blocks||[]).forEach(function(b,i){
    var d=document.createElement("div");d.className="blk";
    var t=document.createElement("div");t.className="bt";t.textContent="code block "+(i+1);
    var pre=document.createElement("pre");pre.textContent=b.slice(0,600)+(b.length>600?"…":"");
    var btn=document.createElement("button");btn.textContent="Copy block "+(i+1);
    btn.onclick=function(){copyAndHandoff(b,btn)};
    d.appendChild(t);d.appendChild(pre);d.appendChild(btn);
    box.appendChild(d);
  });
}
chrome.storage.local.get(["last","silenceMs","captureMode","soundOn","autoSend"],function(r){
  if(r.last){
    $("#preview").textContent=(r.last.text||"").slice(0,3000)||"(empty reply)";
    $("#state").textContent="last: "+r.last.site+" · "+new Date(r.last.ts).toLocaleTimeString();
    renderBlocks(r.last.blocks);
  }
  if(r.silenceMs){$("#silence").value=r.silenceMs;$("#sv").textContent=(r.silenceMs/1000).toFixed(1)}
  if(r.captureMode)$("#mode").value=r.captureMode;
  if(r.soundOn!==undefined)$("#sound").checked=r.soundOn;
  if(r.autoSend!==undefined)$("#autosend").checked=r.autoSend;
});
chrome.tabs.query({active:true,currentWindow:true},function(tabs){
  chrome.tabs.sendMessage(tabs[0].id,{type:"ping"},function(resp){
    if(chrome.runtime.lastError||!resp){$("#state").textContent="not watching — click 'Watch this tab now'";return}
    $("#state").textContent="watching "+resp.site+" · "+resp.state;
  });
});
$("#copy").onclick=function(){
  chrome.storage.local.get(["last"],function(r){
    if(r.last&&r.last.text)copyAndHandoff(r.last.text,$("#copy"));
  });
};
$("#bridge").onclick=function(){
  chrome.storage.local.get(["last"],function(r){
    if(r.last&&r.last.text)handoff(r.last.text,true);
  });
};
$("#grab").onclick=function(){
  chrome.tabs.query({active:true,currentWindow:true},function(tabs){
    chrome.tabs.sendMessage(tabs[0].id,{type:"grab"},function(resp){
      if(resp&&resp.text){
        chrome.storage.local.set({last:{site:"manual",text:resp.text,blocks:[],ts:Date.now()}});
        $("#preview").textContent=resp.text.slice(0,3000);
      }
    });
  });
};
$("#inject").onclick=function(){
  chrome.tabs.query({active:true,currentWindow:true},function(tabs){
    chrome.scripting.executeScript({target:{tabId:tabs[0].id},files:["content.js"]},function(){
      void chrome.runtime.lastError;
      $("#state").textContent="injected — watching this tab now";
    });
  });
};
$("#mode").onchange=function(e){chrome.storage.local.set({captureMode:e.target.value})};
$("#sound").onchange=function(e){chrome.storage.local.set({soundOn:e.target.checked})};
$("#autosend").onchange=function(e){chrome.storage.local.set({autoSend:e.target.checked})};
$("#silence").oninput=function(e){
  $("#sv").textContent=(e.target.value/1000).toFixed(1);
  chrome.storage.local.set({silenceMs:+e.target.value});
};