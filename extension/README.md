# Vibe Sentinel (browser extension)

Watches AI chat tabs (ChatGPT, Gemini, Claude, Qwen, DeepSeek, Grok), detects when
generation stops, fires a system notification, and stores the finished reply for
one-tap copy or handoff to the VibeBridge web app.

## Why five files
MV3 minimum: manifest.json (Chrome's entry), background.js (service worker),
content.js (injected into AI sites), popup.html + popup.js (MV3 CSP bans inline
scripts in extension pages). The folder is the package.

## Load it
1. Repo page -> Code -> Download ZIP -> unzip.
2. chrome://extensions -> Developer mode ON -> Load unpacked.
3. Select the `extension/` folder itself (the one containing manifest.json).
4. Pin from the puzzle icon.

## Update after edits
chrome://extensions -> circular-arrow reload on the Vibe Sentinel card.

## Detection layers
- Stop-button selectors per known site.
- Mutation-burst watcher (any site): streaming = DOM mutation spike.
- Silence threshold (popup slider, default 3.5s) after a burst = done.

## Privacy
Replies are stored only in chrome.storage.local on your machine.
No servers, no analytics, no exfiltration.