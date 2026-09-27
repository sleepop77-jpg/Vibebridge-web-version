// VibeBridge If-Then Engine
const $ = s => document.querySelector(s);
const output = $('#output');
const input = $('#input');

// State
let rules = []; // Array of { condition: regex/string, action: string/payload }
let pendingOps = null;

// Core Loop
input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (!cmd) return;
        
        print(cmd, 'user');
        input.value = '';
        
        await processInput(cmd);
    }
});

function print(text, type = 'system') {
    const div = document.createElement('div');
    div.className = `line ${type}`;
    div.textContent = text;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
}

async function processInput(text) {
    // 1. Check for System Commands
    if (text === 'help') {
        print("Commands:");
        print("  help          - Show this message");
        print("  rules         - List loaded If-Then rules");
        print("  clear         - Clear terminal");
        print("  connect       - Connect to GitHub");
        print("  push          - Push staged changes");
        print("  [payload]     - Paste a VibeBridge payload to load rules");
        return;
    }

    if (text === 'clear') {
        output.innerHTML = '';
        return;
    }

    if (text === 'rules') {
        if (rules.length === 0) print("No rules loaded.");
        else rules.forEach((r, i) => print(`[${i}] IF "${r.condition}" THEN "${r.action.slice(0, 50)}..."`));
        return;
    }

    if (text === 'connect') {
        const pat = prompt("GitHub PAT:");
        const repo = prompt("Repo (owner/name):");
        if (pat && repo) {
            setConn(pat, repo, "main");
            try {
                const user = await validate();
                print(`Connected as ${user}`, 'system');
            } catch (e) {
                print(`Connection failed: ${e.message}`, 'error');
            }
        }
        return;
    }

    if (text === 'push') {
        if (!pendingOps) {
            print("Nothing to push.", 'error');
            return;
        }
        print("Pushing...", 'system');
        try {
            const c = await commitOps(pendingOps, "feat: update rules");
            print(`Pushed: ${c.sha.slice(0, 7)}`, 'system');
            pendingOps = null;
        } catch (e) {
            print(`Push failed: ${e.message}`, 'error');
        }
        return;
    }

    // 2. Check for Payload (Loading Rules)
    if (text.includes("===VIBEBRIDGE===")) {
        const ops = parsePayload(text);
        if (ops.length > 0) {
            pendingOps = ops;
            print(`Parsed ${ops.length} file operations. Ready to push.`, 'system');
            
            // Special handling: If the payload contains a 'rules.json' or similar, parse it
            const ruleFile = ops.find(o => o.path.includes('rules'));
            if (ruleFile) {
                try {
                    const newRules = JSON.parse(ruleFile.content);
                    rules = rules.concat(newRules);
                    print(`Loaded ${newRules.length} new If-Then rules. Total: ${rules.length}`, 'rule-match');
                } catch (e) {
                    print("Payload contained rules file but it was invalid JSON.", 'error');
                }
            }
        } else {
            print("No operations found in payload.", 'error');
        }
        return;
    }

    // 3. Check Against If-Then Rules
    let matched = false;
    for (const rule of rules) {
        // Simple string includes check for now (can be upgraded to Regex)
        if (text.toLowerCase().includes(rule.condition.toLowerCase())) {
            print(`Match found: ${rule.condition}`, 'rule-match');
            print(`Executing: ${rule.action}`, 'payload');
            
            // If the action is a payload, execute it recursively or just display it
            if (rule.action.includes("===VIBEBRIDGE===")) {
                print("(Action is a payload. In a full version, this would auto-execute.)", 'system');
            }
            matched = true;
            break; // Stop at first match
        }
    }

    if (!matched) {
        print("No matching rule found.", 'error');
    }
}

// Focus input on click anywhere
document.addEventListener('click', () => input.focus());