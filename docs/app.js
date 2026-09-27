// VibeBridge Rule Engine
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// State
let rules = []; // Array of { trigger: string, response: string }

// DOM
const flow = $('#flow');
const input = $('#input');
const sendBtn = $('#send');
const btnConnect = $('#btn-connect');
const statusEl = $('#status');
const ruleListEl = $('#rule-list');
const payloadInput = $('#payload-input');
const btnParse = $('#btn-parse');

// Init
function init() {
    const saved = JSON.parse(localStorage.getItem('vb_rules') || 'null');
    if (saved) {
        $('#pat').value = saved.pat;
        $('#repo').value = saved.repo;
    }

    btnConnect.onclick = handleConnect;
    sendBtn.onclick = handleSend;
    btnParse.onclick = handlePayload;
    
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    $('#btn-wipe').onclick = () => {
        localStorage.clear();
        location.reload();
    };
}

function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.textContent = text;
    flow.appendChild(div);
    flow.scrollTop = flow.scrollHeight;
}

async function handleConnect() {
    const pat = $('#pat').value.trim();
    const repo = $('#repo').value.trim();
    if (!pat || !repo) return alert("Fill in PAT and Repo");

    try {
        setConn(pat, repo, "main");
        const login = await validate();
        localStorage.setItem('vb_rules', JSON.stringify({ pat, repo }));
        statusEl.textContent = `Connected as ${login}`;
        statusEl.style.color = "var(--sk-olive)";
        addMessage('ai', `Connected. Loading rules.txt...`);
        await loadRules();
    } catch (e) {
        statusEl.textContent = "Error: " + e.message;
        statusEl.style.color = "var(--sk-red)";
    }
}

async function loadRules() {
    const content = await getFile("docs/rules.txt");
    if (!content) {
        addMessage('ai', "No rules.txt found in repo. Create one or paste a payload to make one.");
        rules = [];
        renderRules();
        return;
    }

    // Parse rules.txt format: "trigger -> response"
    rules = [];
    const lines = content.split('\n');
    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const parts = trimmed.split('->');
        if (parts.length === 2) {
            rules.push({
                trigger: parts[0].trim().toLowerCase(),
                response: parts[1].trim()
            });
        }
    });

    addMessage('ai', `Loaded ${rules.length} rules.`);
    renderRules();
}

function renderRules() {
    ruleListEl.innerHTML = '';
    if (rules.length === 0) {
        ruleListEl.innerHTML = '<div class="sk-empty">No rules loaded.</div>';
        return;
    }
    rules.forEach(r => {
        const div = document.createElement('div');
        div.className = 'sk-rule-item';
        div.innerHTML = `<b>${r.trigger}</b> → ${r.response}`;
        ruleListEl.appendChild(div);
    });
}

function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    addMessage('user', text);
    input.value = '';

    // Check rules
    const lowerText = text.toLowerCase();
    let matched = false;

    for (const rule of rules) {
        if (lowerText.includes(rule.trigger)) {
            setTimeout(() => {
                addMessage('ai', rule.response);
            }, 300);
            matched = true;
            break; // Stop at first match
        }
    }

    if (!matched) {
        setTimeout(() => {
            addMessage('ai', "I don't have a rule for that. Ask your AI to add one!");
        }, 300);
    }
}

function handlePayload() {
    const text = payloadInput.value.trim();
    if (!text.includes("===VIBEBRIDGE===")) {
        alert("Invalid payload format");
        return;
    }

    const ops = parsePayload(text);
    const ruleOp = ops.find(o => o.path.includes('rules.txt'));
    
    if (ruleOp) {
        if (!PAT || !OWNER) {
            alert("Connect to GitHub first to save rules.");
            return;
        }

        addMessage('ai', "Pushing new rules to GitHub...");
        commitOps([{ kind: 'FILE', path: 'docs/rules.txt', content: ruleOp.content }], "feat: update rules via VibeBridge")
            .then(() => {
                addMessage('ai', "Rules updated on GitHub. Reloading...");
                payloadInput.value = '';
                setTimeout(loadRules, 1000);
            })
            .catch(e => {
                addMessage('ai', "Push failed: " + e.message);
            });
    } else {
        alert("Payload doesn't contain rules.txt");
    }
}

init();
