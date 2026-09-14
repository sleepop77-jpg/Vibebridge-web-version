# VibeBridge — Web + Desktop Mission Control

Two bodies, one repo, one starfield.

## Web (GitHub Pages)
The `docs/` folder is served automatically at:
**<https://sleepop77-jpg.github.io/Vibebridge-web-version/>**

Open it in any browser. Paste a fine-grained PAT, point at your repo, push bridge payloads, watch CI logs.

## Desktop (JavaFX shell)
The `desktop/` folder is a thin JavaFX WebView wrapper that loads the same web app natively.

### Get the installer (no Java needed on the laptop)
CI builds a self-contained Windows app-image on every push to `desktop/**`:
**repo → Actions → "desktop" workflow → latest run → Artifacts → `VibeBridge-Desktop-Windows`**
Download, unzip, run `VibeBridge/VibeBridge.exe`. A private JRE is bundled inside.

### Run / build locally (needs JDK 17)