# Website Preview help

## Why HTML alone is not the whole website
HTML is only the structure of one page.

A full website also needs:

- CSS files
- JS files
- images
- fonts
- other HTML pages
- correct relative paths

If you preview only one HTML file, the browser cannot find the other files, so the page looks broken or unstyled.

## How this preview works

### Repo / payload mode
VibeBridge:

1. fetches files from the connected GitHub repo
2. applies payload FILE/EDIT changes in memory
3. uses the GitHub Pages/base URL for unchanged files
4. replaces changed files with safe blob previews
5. renders the final page in a sandboxed iframe

### Local folder / ZIP mode
VibeBridge:

1. reads your folder or ZIP into an in-browser virtual site
2. converts text and binary files into blob URLs
3. rewrites HTML/CSS references
4. renders the selected HTML entry in a sandboxed iframe

This lets you preview a site before pushing it anywhere.

## Resize the preview
You can:

- drag the bottom-right corner of the preview box
- use Phone / Tablet / Desktop / Full width presets
- enter a custom pixel width
- use Normal / Tall height buttons
- click Fullscreen for a complete preview

## Notes
- Local previews run in a sandboxed iframe.
- Large folders may take a moment to load.
- Module-heavy JS apps may need a real dev server for perfect preview.