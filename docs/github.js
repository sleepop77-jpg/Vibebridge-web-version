// Minimal GitHub API Engine
let PAT = "", OWNER = "", REPO = "", BRANCH = "main";

function setConn(pat, repo, branch) {
    PAT = pat || "";
    BRANCH = branch || "main";
    const p = (repo || "").split("/");
    OWNER = p[0] || "";
    REPO = p[1] || "";
    return !!(OWNER && REPO);
}

async function api(method, path, body) {
    const r = await fetch("https://api.github.com" + path, {
        method,
        headers: Object.assign({
            "Authorization": "Bearer " + PAT,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }, body ? { "Content-Type": "application/json" } : {}),
        body: body ? JSON.stringify(body) : undefined
    });
    if (!r.ok) {
        const e = new Error("HTTP " + r.status);
        e.code = r.status;
        throw e;
    }
    const t = await r.text();
    return t ? JSON.parse(t) : {};
}

const b64 = s => btoa(unescape(encodeURIComponent(s)));
const unb64 = s => decodeURIComponent(escape(atob((s || "").replace(/\s/g, ""))));

async function validate() { return (await api("GET", "/user")).login; }

async function postBlob(c) {
    return (await api("POST", `/repos/${OWNER}/${REPO}/git/blobs`, { content: b64(c), encoding: "base64" })).sha;
}

async function commitOps(ops, message) {
    let refSha = null, baseTree = null;
    try {
        const ref = await api("GET", `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
        refSha = ref.object.sha;
        baseTree = (await api("GET", `/repos/${OWNER}/${REPO}/git/commits/${refSha}`)).tree.sha;
    } catch (e) {
        if (e.code !== 404) throw e;
        await api("GET", `/repos/${OWNER}/${REPO}`);
    }

    const entries = [];
    for (const op of ops) {
        if (op.kind === "FILE") {
            entries.push({ path: op.path, mode: "100644", type: "blob", sha: await postBlob(op.content) });
        } else if (op.kind === "DELETE") {
            entries.push({ path: op.path, mode: "100644", type: "blob", sha: null });
        }
    }

    const treeBody = { tree: entries };
    if (baseTree) treeBody.base_tree = baseTree;
    const tree = await api("POST", `/repos/${OWNER}/${REPO}/git/trees`, treeBody);
    const commit = await api("POST", `/repos/${OWNER}/${REPO}/git/commits`, { message, tree: tree.sha, parents: refSha ? [refSha] : [] });
    
    if (refSha) await api("PATCH", `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, { sha: commit.sha, force: false });
    else await api("POST", `/repos/${OWNER}/${REPO}/git/refs`, { ref: `refs/heads/${BRANCH}`, sha: commit.sha });
    
    return commit;
}

async function getFile(path) {
    try {
        const res = await api("GET", `/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`);
        return unb64(res.content);
    } catch (e) {
        return null;
    }
}

// Parser for VibeBridge payloads
function parsePayload(text) {
    const ops = [];
    const lines = text.split("\n");
    let i = 0;
    const clean = (l, t) => l.replace(t, "").replace(/=+\s*$/, "").trim();
    
    while (i < lines.length) {
        const l = lines[i].trim();
        if (l.startsWith("===== FILE:")) {
            const path = clean(l, "===== FILE:");
            const buf = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith("=====")) buf.push(lines[i++]);
            ops.push({ kind: "FILE", path, content: buf.join("\n") });
            continue;
        }
        if (l.startsWith("===== DELETE:")) ops.push({ kind: "DELETE", path: clean(l, "===== DELETE:") });
        i++;
    }
    return ops;
}
