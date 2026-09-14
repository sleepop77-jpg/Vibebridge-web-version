const $ = (s) => document.querySelector(s);
let PAT = "", OWNER = "", REPO = "", BRANCH = "main";

const cv = $("#stars"), cx = cv.getContext("2d");
let stars = [];
function resize() {
  cv.width = innerWidth; cv.height = innerHeight;
  stars = Array.from({ length: 90 }, () => ({
    x: Math.random() * cv.width, y: Math.random() * cv.height,
    r: Math.random() * 1.4 + 0.5, p: Math.random() * 6.28, s: 0.3 + Math.random() * 0.7
  }));
}
addEventListener("resize", resize); resize();
(function tick(t) {
  cx.clearRect(0, 0, cv.width, cv.height);
  for (const s of stars) {
    const a = 0.2 + 0.55 * Math.abs(Math.sin(s.p + t * 0.001 * s.s));
    cx.fillStyle = "rgba(255,255,255," + a + ")";
    cx.fillRect(s.x, s.y, s.r, s.r);
    s.y += s.s * 0.12; if (s.y > cv.height) s.y = 0;
  }
  requestAnimationFrame(tick);
})(0);

document.querySelectorAll(".tab").forEach(b => b.onclick = () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.remove("on"));
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("on"));
  b.classList.add("on");
  $("#panel-" + b.dataset.tab).classList.add("on");
});

function status(sel, msg, kind) {
  const el = $(sel);
  el.textContent = msg;
  el.style.color = kind === "good" ? "#3BA55D" : kind === "bad" ? "#FF5252" : "#777";
}

async function api(method, path, body) {
  const r = await fetch("https://api.github.com" + path, {
    method,
    headers: Object.assign(
      { "Authorization": "Bearer " + PAT, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      body ? { "Content-Type": "application/json" } : {}
    ),
    body: body ? JSON.stringify(body) : undefined
  });
  if (!r.ok) throw new Error("HTTP " + r.status + " on " + path);
  const t = await r.text();
  return t ? JSON.parse(t) : {};
}
const b64 = (s) => btoa(unescape(encodeURIComponent(s)));
const unb64 = (s) => decodeURIComponent(escape(atob((s || "").replace(/\s/g, ""))));

(function restore() {
  try {
    const s = JSON.parse(localStorage.getItem("vb") || "null");
    if (s) { $("#pat").value = s.PAT || ""; $("#repo").value = s.repo || ""; $("#branch").value = s.branch || "main"; $("#remember").checked = true; }
  } catch (e) {}
})();

$("#btn-connect").onclick = async () => {
  PAT = $("#pat").value.trim();
  BRANCH = $("#branch").value.trim() || "main";
  const parts = $("#repo").value.trim().split("/");
  if (!PAT || parts.length !== 2) { status("#conn-status", "need pat + owner/repo", "bad"); return; }
  OWNER = parts[0]; REPO = parts[1];
  status("#conn-status", "validating…", "dim");
  try {
    const u = await api("GET", "/user");
    if ($("#remember").checked) localStorage.setItem("vb", JSON.stringify({ PAT, repo: $("#repo").value, branch: BRANCH }));
    else localStorage.removeItem("vb");
    status("#conn-status", "connected as " + u.login, "good");
  } catch (e) { status("#conn-status", "failed: " + e.message, "bad"); }
};

function parse(text) {
  const ops = [], warnings = [];
  if (!text.includes("===VIBEBRIDGE===")) warnings.push("no sentinel — lenient mode");
  const lines = text.split("\n"); let i = 0;
  const clean = (l, tag) => l.replace(tag, "").replace(/=+\s*$/, "").trim();
  while (i < lines.length) {
    const l = lines[i].trim();
    if (l.startsWith("===== FILE:")) {
      const path = clean(l, "===== FILE:"); const buf = []; i++;
      while (i < lines.length && !lines[i].trim().startsWith("=====")) { buf.push(lines[i]); i++; }
      ops.push({ kind: "FILE", path, content: buf.join("\n") }); continue;
    }
    if (l.startsWith("===== EDIT:")) {
      const path = clean(l, "===== EDIT:"); const hunks = []; i++;
      let f = [], r = [], mode = "";
      while (i < lines.length && !lines[i].trim().startsWith("=====")) {
        const t = lines[i].trim();
        if (t === "--- FIND") mode = "f";
        else if (t === "--- REPLACE") mode = "r";
        else if (t === "--- END") { if (f.length) hunks.push({ find: f.join("\n"), replace: r.join("\n") }); f = []; r = []; mode = ""; }
        else if (mode === "f") f.push(lines[i]);
        else if (mode === "r") r.push(lines[i]);
        i++;
      }
      ops.push({ kind: "EDIT", path, hunks }); continue;
    }
    if (l.startsWith("===== DELETE:")) ops.push({ kind: "DELETE", path: clean(l, "===== DELETE:") });
    i++;
  }
  return { ops, warnings };
}

const norm = (s) => s.split("\n").map(x => x.trim()).join("\n").trim();
function applyEdit(content, find, replace) {
  if (content.includes(find)) return content.replace(find, replace);
  const cf = norm(find).split("\n"), cl = content.split("\n");
  outer: for (let s = 0; s + cf.length <= cl.length; s++) {
    for (let j = 0; j < cf.length; j++) if (cl[s + j].trim() !== cf[j]) continue outer;
    return cl.slice(0, s).concat(replace.split("\n"), cl.slice(s + cf.length)).join("\n");
  }
  return null;
}

$("#btn-parse").onclick = () => {
  const { ops, warnings } = parse($("#payload").value);
  const box = $("#plan"); box.innerHTML = "";
  warnings.forEach(w => box.insertAdjacentHTML("beforeend", '<div class="warn">⚠ ' + w + "</div>"));
  ops.forEach(o => {
    const cls = o.kind === "FILE" ? "create" : o.kind === "EDIT" ? "edit" : "delete";
    const det = o.kind === "FILE" ? o.content.split("\n").length + " lines" : o.kind === "EDIT" ? o.hunks.length + " hunks" : "remove";
    box.insertAdjacentHTML("beforeend", '<div class="' + cls + '">' + o.kind + " " + o.path + " • " + det + "</div>");
  });
  status("#push-status", "parsed " + ops.length + " ops", "good");
};

$("#btn-push").onclick = async () => {
  const { ops } = parse($("#payload").value);
  if (!OWNER || !PAT) { status("#push-status", "connect first", "bad"); return; }
  if (!ops.length) { status("#push-status", "nothing parsed", "bad"); return; }
  status("#push-status", "pushing " + ops.length + " ops…", "dim");
  try {
    const ref = await api("GET", "/repos/" + OWNER + "/" + REPO + "/git/ref/heads/" + BRANCH);
    const base = await api("GET", "/repos/" + OWNER + "/" + REPO + "/git/commits/" + ref.object.sha);
    const entries = [];
    for (const op of ops) {
      if (op.kind === "FILE") {
        const b = await api("POST", "/repos/" + OWNER + "/" + REPO + "/git/blobs", { content: b64(op.content), encoding: "base64" });
        entries.push({ path: op.path, mode: "100644", type: "blob", sha: b.sha });
      } else if (op.kind === "DELETE") {
        entries.push({ path: op.path, mode: "100644", type: "blob", sha: null });
      } else {
        const cur = await api("GET", "/repos/" + OWNER + "/" + REPO + "/contents/" + op.path + "?ref=" + BRANCH);
        let content = unb64(cur.content);
        for (const h of op.hunks) {
          const next = applyEdit(content, h.find, h.replace);
          if (next == null) throw new Error("hunk miss in " + op.path);
          content = next;
        }
        const b = await api("POST", "/repos/" + OWNER + "/" + REPO + "/git/blobs", { content: b64(content), encoding: "base64" });
        entries.push({ path: op.path, mode: "100644", type: "blob", sha: b.sha });
      }
    }
    const tree = await api("POST", "/repos/" + OWNER + "/" + REPO + "/git/trees", { base_tree: base.tree.sha, tree: entries });
    const commit = await api("POST", "/repos/" + OWNER + "/" + REPO + "/git/commits",
      { message: "feat: web push (" + ops.length + " ops)", tree: tree.sha, parents: [ref.object.sha] });
    await api("PATCH", "/repos/" + OWNER + "/" + REPO + "/git/refs/heads/" + BRANCH, { sha: commit.sha, force: false });
    status("#push-status", "✓ pushed " + commit.sha.slice(0, 7), "good");
  } catch (e) { status("#push-status", "✗ " + e.message, "bad"); }
};

$("#btn-runs").onclick = async () => {
  const box = $("#runs"); box.innerHTML = "";
  try {
    const j = await api("GET", "/repos/" + OWNER + "/" + REPO + "/actions/runs?branch=" + BRANCH + "&per_page=6");
    (j.workflow_runs || []).forEach(r => {
      const b = document.createElement("button");
      b.className = "runrow " + (r.conclusion || "");
      b.textContent = r.name + " • " + r.status + (r.conclusion ? " • " + r.conclusion : "");
      b.onclick = () => openRun(r.id);
      box.appendChild(b);
    });
  } catch (e) { status("#push-status", "runs: " + e.message, "bad"); }
};

async function openRun(id) {
  const jobs = await api("GET", "/repos/" + OWNER + "/" + REPO + "/actions/runs/" + id + "/jobs");
  const list = jobs.jobs || [];
  const job = list.find(j => j.conclusion === "failure") || list[0];
  if (!job) return;
  const lr = await fetch("https://api.github.com/repos/" + OWNER + "/" + REPO + "/actions/jobs/" + job.id + "/logs",
    { headers: { "Authorization": "Bearer " + PAT, "Accept": "application/vnd.github+json" } });
  const text = await lr.text();
  const view = $("#logview"); view.innerHTML = "";
  const errs = [];
  text.split("\n").slice(-400).forEach(line => {
    const isErr = line.includes("e: ") || line.includes(" error:") || line.includes("FAILURE:") || line.includes("What went wrong");
    const isWarn = line.startsWith("w: ") || line.includes(" warning:");
    if (isErr) errs.push(line);
    const div = document.createElement("div");
    div.className = isErr ? "err" : isWarn ? "warn" : "";
    div.textContent = line;
    view.appendChild(div);
  });
  window.__errs = errs;
  view.scrollTop = view.scrollHeight;
}

$("#btn-copyerrs").onclick = () => {
  const errs = window.__errs || [];
  navigator.clipboard.writeText(errs.join("\n"));
  status("#push-status", "copied " + errs.length + " error lines", "good");
};
