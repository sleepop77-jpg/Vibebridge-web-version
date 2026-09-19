# Developer Options — phased plan

## Phase 1 — delivered in this payload
- New `docs/devoptions.js` panel.
- Sidebar button, header button, OS View menu entry, and `Ctrl+Alt+D` shortcut.
- Stage mode: hide sidebar and main chat completely.
- Professional look: hides decorative bunny/starfield/dock/empty-state art.
- Direct HTML sandbox with live iframe preview and a Find button.
- Local notepad for future ideas.
- Preview URL generator (method 1): open the app with current layout options applied.

## Phase 2 — code editing
- Repo file browser using GitHub Contents API.
- Open file in editor, Find/Replace, save as EDIT/FILE payload.
- Preview diffs before push.

## Phase 3 — multi-repo routing
- Multiple PAT/repo profiles.
- One payload can target backup + main.
- Push to backup first, parse/preview there, then promote to main.

## Phase 4 — visual preview
- Snapshot preview of app states.
- Compare before/after screenshots.
- Save preview presets.