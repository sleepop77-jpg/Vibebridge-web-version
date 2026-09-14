const $ = (s) => document.querySelector(s);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const BUNNY = [
  ".##....##.", ".##....##.", ".###..###.", ".########.",
  "##R####R##", "##########", "####PP####", ".########.",
  ".########.", "##########", "##########", "..##..##.."
];
const BUILTINS = [
  ["ANDROID CHAT", "add a chatgpt-style chat screen to my android app with compose"],
  ["FIX CI", "my github actions android build fails, diagnose and fix the gradle files"],
  ["NEW ICON", "design a new adaptive launcher icon set for my app"],
  ["DARK RESTYLE", "restyle my app with a pure black theme and green accents"]
];
const TIPS = [
  "type an idea — get a bridge prompt tuned for your target model",
  "paste any AI reply back here; FILE / EDIT / DELETE blocks parse themselves",
  "tap a file row to preview its diff before pushing",
  "CI red? FIX IT compiles the errors into a ready-to-copy fix prompt",
  "this whole app lives in docs/ — it can rebuild itself from a chat"
];
let pendingOps = null, model = "QWEN STUDIO", tipIx = 0;

function el(tag, cls, html) { const d = document.createElement(tag); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d; }
function scrollEnd() { const c = $("#chat"); c.scrollTop = c.scrollHeight; }
function drawBunny(cv, cell) {
  const g = cv.getContext("2d");
  cv.width = 10 * cell; cv.height = 12 * cell;
  BUNNY.forEach((row, y) => row.split("").forEach((ch, x) => {
    if (ch === "#") g.fillStyle = "#ececec";
    else if (ch === "R") g.fillStyle = "#ff4d4d";
    else if (ch === "P") g.fillStyle = "#ffb6c1";
    else return;
    g.fillRect(x * cell, y * cell, cell, cell);
  }));
}
function hideEmpty() { const e = $("#empty"); if (e) e.style.display = "none"; }
function addUser(text) { hideEmpty(); $("#flow").appendChild(el("div", "msg user", esc(text))); scrollEnd(); }
function addCode(text) {
  hideEmpty();
  const w = el("div", "msg user code");
  w.textContent = text.length > 400 ? text.slice(0, 400) + "…" : text;
  $("#flow").appendChild(w); scrollEnd();
}
function assistantRow() {
  hideEmpty();
  const row = el("div", "msg arow");
  const body = el("div", "abody");
  row.append(el("div", "avatar", "🐰"), body);
  $("#flow").appendChild(row); scrollEnd();
  return body;
}
function addNote(text, bad) { assistantRow().appendChild(el("div", bad ? "note bad" : "note", esc(text))); }
function addPrompt(text) {
  const body = assistantRow();
  body.appendChild(el("div", "alabel", "PROMPT • " + model));
  const pre = el("pre", "prompttext"); pre.textContent = text;
  body.appendChild(pre);
  const copy = el("button", "mini", "COPY");
  copy.onclick = () => { navigator.clipboard.writeText(text); copy.textContent = "COPIED"; setTimeout(() => copy.textContent = "COPY", 1200); };
  body.appendChild(copy);
  scrollEnd();
}
function compilePrompt(idea) {
  return "You are VibeBridge's code engine, target " + model + ".\nUser idea: " + idea +
    "\n\nReply ONLY with a bridge payload:\nfirst line ===VIBEBRIDGE=== v1 target=android\n" +
    "then ===== FILE: path ===== blocks with full content, or ===== EDIT: path ===== with --- FIND / --- REPLACE / --- END hunks.\nNo prose outside blocks.";
}
function previewFor(op) {
  if (op.kind === "FILE") {
    const a = op.content.split("\n");
    return a.slice(0, 6).map(l => "+ " + l).concat(a.length > 6 ? ["+ … " + (a.length - 6) + " more"] : []);
  }
  if (op.kind === "EDIT") {
    const out = [];
    op.hunks.slice(0, 2).forEach(h => {
      h.find.split("\n").slice(0, 3).forEach(l => out.push("- " + l));
      h.replace.split("\n").slice(0, 3).forEach(l => out.push("+ " + l));
    });
    return out;
  }
  return ["- (entire file removed)"];
}
function addParseCard(r) {
  const body = assistantRow();
  const head = el("div", "cardhead");
  head.appendChild(el("span", "alabel", "CHANGES"));
  const c = r.ops.filter(o => o.kind === "FILE").length;
  const e = r.ops.filter(o => o.kind === "EDIT").length;
  const d = r.ops.filter(o => o.kind === "DELETE").length;
  if (c) head.appendChild(el("span", "chip g", "CREATE " + c));
  if (e) head.appendChild(el("span", "chip", "EDIT " + e));
  if (d) head.appendChild(el("span", "chip r", "DELETE " + d));
  body.appendChild(head);
  r.warnings.forEach(w => body.appendChild(el("div", "warnline", "⚠ " + esc(w))));
  r.ops.forEach(op => {
    const det = op.kind === "FILE" ? op.content.split("\n").length + " lines" : op.kind === "EDIT" ? op.hunks.length + " hunks" : "remove file";
    const row = el("div", "frow");
    row.innerHTML = '<span class="fkind ' + (op.kind === "FILE" ? "g" : op.kind === "DELETE" ? "r" : "") + '">' + op.kind +
      '</span><span class="fpath">' + esc(op.path) + '</span><span class="fdet">' + det + "</span>";
    const prev = el("div", "preview");
    previewFor(op).forEach(l => prev.appendChild(el("div", l.startsWith("-") ? "pl m" : l.startsWith("+") ? "pl p" : "pl", esc(l))));
    row.onclick = () => { prev.style.display = prev.style.display === "block" ? "none" : "block"; };
    body.appendChild(row); body.appendChild(prev);
  });
  const btns = el("div", "cardbtns");
  const push = el("button", "green", "PUSH TO GITHUB");
  push.onclick = () => doPush(body, push);
  btns.appendChild(push);
  body.appendChild(btns);
  scrollEnd();
}
async function doPush(body, btn) {
  if (!OWNER || !PAT) { addNote("connect first — sidebar → CONNECT", true); return; }
  if (!pendingOps || !pendingOps.length) return;
  btn.disabled = true;
  const card = el("div", "pushcard");
  const st = el("div", "status", "committing blobs + tree…");
  const tail = el("div", "logtail");
  const btns = el("div", "cardbtns");
  card.append(st, tail, btns);
  body.appendChild(card); scrollEnd();
  try {
    const commit = await commitOps(pendingOps, "feat: web push (" + pendingOps.length + " ops)");
    pendingOps = null;
    st.textContent = "commit " + commit.sha.slice(0, 7) + " — polling CI…";
    let run = null;
    for (let i = 0; i < 30; i++) {
      await sleep(8000);
      run = await latestRun();
      if (!run) continue;
      if (run.status !== "completed") {
        st.textContent = "run " + run.status + ": " + run.name;
        try {
          const log = await runLog(run.id);
          tail.innerHTML = log.split("\n").filter(l => l.trim()).slice(-3)
            .map(l => '<div class="' + (/e: |error:|FAILURE:/.test(l) ? "lerr" : "") + '">' + esc(l.slice(0, 90)) + "</div>").join("");
        } catch (e) {}
        scrollEnd();
        continue;
      }
      break;
    }
    finalize(run, commit, btns, st);
  } catch (e) {
    st.textContent = "✗ " + e.message;
    st.className = "status bad";
    btn.disabled = false;
  }
}
function finalize(run, commit, btns, st) {
  const ok = run && run.conclusion === "success";
  st.textContent = ok ? "✓ CI PASSED — commit " + commit.sha.slice(0, 7)
    : "✗ CI " + ((run && run.conclusion) || "unknown") + " — commit " + commit.sha.slice(0, 7);
  st.className = "status " + (ok ? "good" : "bad");
  const open = el("button", "mini", "OPEN RUN");
  open.onclick = () => run && window.open(run.html_url);
  btns.appendChild(open);
  if (ok) {
    const dl = el("button", "mini", "DOWNLOAD APK ZIP");
    dl.onclick = async () => {
      const u = await artifactUrl(run.id);
      if (!u) return;
      const r = await fetch(u, { headers: { Authorization: "Bearer " + PAT } });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(await r.blob());
      a.download = "vibebridge-" + commit.sha.slice(0, 7) + ".zip";
      a.click();
    };
    btns.appendChild(dl);
  } else {
    const cp = el("button", "mini", "COPY ERRORS");
    cp.onclick = async () => {
      const log = await runLog(run.id);
      navigator.clipboard.writeText(extractErrors(log).join("\n") || log.slice(-20000));
    };
    const fx = el("button", "mini amber", "FIX IT");
    fx.onclick = async () => {
      const log = await runLog(run.id);
      const errs = extractErrors(log);
      addPrompt(compilePrompt("my CI build failed with these errors:\n" + (errs.slice(0, 25).join("\n") || log.slice(-3000)) + "\nfix every error in the exact files mentioned."));
    };
    const md = el("button", "mini", "SAVE .MD");
    md.onclick = async () => {
      const log = await runLog(run.id);
      const t = "# CI failure\ncommit " + commit.sha + "\n\n## errors\n```\n" + extractErrors(log).join("\n") +
        "\n```\n\n## tail\n```\n" + log.slice(-20000) + "\n```\n";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([t], { type: "text/markdown" }));
      a.download = "vibebridge-errors-" + commit.sha.slice(0, 7) + ".md";
      a.click();
    };
    btns.append(cp, fx, md);
  }
  scrollEnd();
}
function send() {
  const t = $("#input").value.trim();
  if (!t) return;
  $("#input").value = ""; autoGrow();
  const isPayload = /===VIBEBRIDGE===|===== (FILE|EDIT|DELETE):/.test(t);
  if (isPayload && $("#strict").checked && !t.includes("===VIBEBRIDGE===")) {
    addNote("strict mode: payload rejected — missing sentinel", true);
    return;
  }
  if (isPayload) {
    addCode(t);
    const r = parsePayload(t);
    pendingOps = r.ops;
    if (!r.ops.length) addNote("no bridge operations found in that paste", true);
    else addParseCard(r);
  } else {
    addUser(t);
    setTimeout(() => addPrompt(compiled = compilePrompt(t)), 400);
  }
}
function autoGrow() { const i = $("#input"); i.style.height = "auto"; i.style.height = Math.min(i.scrollHeight, 160) + "px"; }

drawBunny($("#bunny"), 6);
drawBunny($("#sbbunny"), 3);
BUILTINS.forEach(([n, idea]) => {
  const c = el("button", "chipbtn", n);
  c.onclick = () => { $("#input").value = idea; $("#input").focus(); autoGrow(); };
  $("#chips").appendChild(c);
  const m = el("button", "", n);
  m.onclick = () => { $("#input").value = idea; $("#tplmenu").classList.add("hidden"); $("#input").focus(); autoGrow(); };
  $("#tplmenu").appendChild(m);
});
$("#tip").textContent = "TIP // " + TIPS[0];
setInterval(() => { tipIx = (tipIx + 1) % TIPS.length; $("#tip").textContent = "TIP // " + TIPS[tipIx]; }, 6000);
$("#send").onclick = send;
$("#input").addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
$("#input").addEventListener("input", autoGrow);
$("#paste").onclick = async () => { try { $("#input").value = await navigator.clipboard.readText(); autoGrow(); } catch (e) {} };
$("#sbtoggle").onclick = () => document.body.classList.toggle("sbopen");
$("#newchat").onclick = () => { $("#flow").innerHTML = ""; $("#empty").style.display = ""; pendingOps = null; };
$("#modelbtn").onclick = e => { e.stopPropagation(); $("#modelmenu").classList.toggle("hidden"); };
$("#tplbtn").onclick = e => { e.stopPropagation(); $("#tplmenu").classList.toggle("hidden"); };
document.querySelectorAll("#modelmenu button").forEach(b => b.onclick = () => {
  model = b.dataset.m;
  $("#modelbtn").textContent = "VibeBridge • " + model + " ▾";
  $("#modelmenu").classList.add("hidden");
});
document.addEventListener("click", () => { $("#modelmenu").classList.add("hidden"); $("#tplmenu").classList.add("hidden"); });
$("#connect").onclick = async () => {
  const st = $("#connstatus");
  if (!setConn($("#pat").value.trim(), $("#repo").value.trim(), $("#branch").value.trim())) {
    st.textContent = "need pat + owner/repo"; st.className = "dim small bad"; return;
  }
  st.textContent = "validating…"; st.className = "dim small";
  try {
    const login = await validate();
    if ($("#remember").checked) localStorage.setItem("vb", JSON.stringify({ p: $("#pat").value, r: $("#repo").value, b: $("#branch").value }));
    st.textContent = "connected as " + login; st.className = "dim small good";
  } catch (e) { st.textContent = "failed: " + e.message; st.className = "dim small bad"; }
};
(function restore() {
  try {
    const s = JSON.parse(localStorage.getItem("vb") || "null");
    if (s) {
      $("#pat").value = s.p || ""; $("#repo").value = s.r || ""; $("#branch").value = s.b || "main";
      setConn(s.p, s.r, s.b);
      $("#connstatus").textContent = "saved connection loaded";
    }
  } catch (e) {}
})();