var $=function(s){return document.querySelector(s)};
chrome.storage.local.get(["last","silenceMs"],function(r){
  if(r.last){
    $("#preview").textContent=(r.last.text||"").slice(0,4000)||"(empty reply)";
    $("#state").textContent="last: "+r.last.site+" · "+new Date(r.last.ts).toLocaleTimeString();
  }
  if(r.silenceMs){$("#silence").value=r.silenceMs;$("#sv").textContent=(r.silenceMs/1000).toFixed(1)}
});
chrome.tabs.query({active:true,currentWindow:true},function(tabs){
  chrome.tabs.sendMessage(tabs[0].id,{type:"ping"},function(resp){
    if(chrome.runtime.lastError||!resp){$("#state").textContent="not watching this tab — open an AI chat site";return}
    $("#state").textContent="watching "+resp.site+" · "+resp.state;
  });
});
$("#copy").onclick=function(){
  chrome.storage.local.get(["last"],function(r){
    if(r.last&&r.last.text){navigator.clipboard.writeText(r.last.text);$("#copy").textContent="Copied"}
  });
};
$("#grab").onclick=function(){
  chrome.tabs.query({active:true,currentWindow:true},function(tabs){
    chrome.tabs.sendMessage(tabs[0].id,{type:"grab"},function(resp){
      if(resp&&resp.text){
        chrome.storage.local.set({last:{site:"manual",text:resp.text,ts:Date.now()}});
        $("#preview").textContent=resp.text.slice(0,4000);
      }
    });
  });
};
$("#bridge").onclick=function(){
  chrome.storage.local.get(["last"],function(r){
    var url="https://sleepop77-jpg.github.io/Vibebridge-web-version/#vbpayload="+encodeURIComponent((r.last&&r.last.text)||"");
    chrome.tabs.create({url:url});
  });
};
$("#silence").oninput=function(e){
  $("#sv").textContent=(e.target.value/1000).toFixed(1);
  chrome.storage.local.set({silenceMs:+e.target.value});
};