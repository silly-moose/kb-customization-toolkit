# Localhost Preview for CSS Iteration

An optional workflow for previewing CSS changes locally instead of deploying to KnowledgeOwl after every edit.

---

## When to Use This

Use localhost preview when a session involves significant CSS iteration — e.g., adjusting layout, spacing, colors, or typography across multiple rounds of feedback. It turns a 3-5 minute deploy-and-verify cycle into a 5-second copy-and-refresh cycle.

**Skip it** for quick fixes (one-line CSS changes, typo corrections) or work where the speed advantage is minimal. HTML changes *can* be previewed locally by editing the snapshot file directly, but there's no clean override mechanism like there is for CSS — so the time savings are smaller.

---

## Prerequisites

- **Python 3** — pre-installed on macOS. Verify with `python3 --version` in Terminal.
- **An HTML snapshot** — you should already have at least one `full-html-snapshot-*.html` file in the current version or current-state folder (captured during project setup).

---

## How It Works

The HTML snapshots captured from Chrome DevTools contain the full rendered page:

- Embedded `<style>` blocks with the KnowledgeOwl theme CSS and your custom CSS
- `<link>` tags pointing to external CDN assets (Bootstrap, Font Awesome, fonts)
- Image `src` attributes pointing to KnowledgeOwl's image CDN

Since all external assets use **absolute URLs**, a browser loading the snapshot from localhost fetches them from the CDN exactly like the live site. Pure CSS and static HTML render identically — the browser doesn't care whether content comes from localhost or a production server. The things that *won't* work locally are features that depend on KnowledgeOwl's backend: template variables, search, reader sessions, and JavaScript that calls KO APIs.

### The CSS Override Mechanism

The snapshot's `<style>` block contains the custom CSS embedded inline. To override it with a local file:

1. Copy the snapshot to a `preview/` folder
2. Insert `<link rel="stylesheet" href="custom-css.css">` immediately before `</head>`

Because both the embedded styles and the local file use `!important`, CSS cascade rules apply: **same specificity + later source order = local file wins**. The local `custom-css.css` overrides the embedded version without modifying the snapshot.

### What About HTML Changes?

HTML changes can also be previewed locally by editing the snapshot file directly — the browser renders local HTML the same way it would from a remote server. However, there's no clean override mechanism like the CSS link tag approach. You'd need to find and modify the relevant sections of the snapshot, which is more manual and error-prone. This workflow is optimized for CSS because that's where the override mechanism provides the biggest speed advantage.

---

## Step-by-Step Setup

### 1. Create the preview folder

```
mkdir -p preview
```

### 2. Prepare preview HTML files

For each `full-html-snapshot-*.html` in the current version folder:

1. Copy it to `preview/` with a short name:
   - `full-html-snapshot-homepage.html` → `preview/homepage.html`
   - `full-html-snapshot-article.html` → `preview/article.html`

2. Insert the CSS link tag before `</head>` in each copy. This can be done with a `sed` command or by having Claude do a targeted text replacement — replace `</head>` with `<link rel="stylesheet" href="custom-css.css"></head>`.

### 3. Copy the current CSS

```
cp [version-folder]/custom-css.css preview/custom-css.css
```

### 4. Start the server

**Option A — Claude Preview MCP tools (preferred when available):**

The project template includes `.claude/launch.json` with a preview server configuration. Claude runs `preview_start` with name `"preview"` to start the server. This also enables Claude to use `preview_screenshot` and `preview_inspect` for automated visual verification.

**Option B — Manual:**

From the project root:

```
python3 -m http.server 8080 -d preview
```

Leave this running in a terminal tab.

### 5. Open in your browser

- Homepage: `http://localhost:8080/homepage.html`
- Article: `http://localhost:8080/article.html`

---

## During a Session

Every time Claude edits `custom-css.css` in the version folder, Claude also copies it to the preview folder:

```
cp [version-folder]/custom-css.css preview/custom-css.css
```

Then either:
- **You** refresh the browser to see changes
- **Claude** uses `preview_screenshot` or `preview_inspect` (via Claude Preview MCP tools) to verify visually and share results

Claude should mention when the preview has been synced, and still provide deployment instructions for the final deploy to KnowledgeOwl.

---

## Teardown

When the session is done (or when you're ready to stop iterating and deploy):

```
rm -rf preview
```

The preview folder is ephemeral — it's never versioned, never preserved, and never deployed.

---

## Troubleshooting

### Port already in use

If port 8080 is occupied, use a different port:

```
python3 -m http.server 9090 -d preview
```

Or update `.claude/launch.json` to use the new port.

### Fonts or images not loading

External assets require an internet connection. If fonts or images don't load:
- Verify you're connected to the internet
- Check the browser console for CORS errors (rare with CDN-hosted assets)

### Preview doesn't match the live KB

The preview is only as current as the HTML snapshot. If changes were made directly in KnowledgeOwl since the snapshot was captured, re-capture the snapshot and rebuild the preview file.

### CSS changes not appearing

- Make sure Claude copied the updated CSS to `preview/custom-css.css` (not just the version folder)
- Hard-refresh the browser: **Cmd + Shift + R** (Mac) or **Ctrl + Shift + R** (Windows)

---

## Limitations

- **Optimized for CSS.** The override mechanism (linking a local CSS file) makes CSS iteration fast and clean. HTML changes require editing the snapshot directly, which works but is more manual — see "What About HTML Changes?" above.
- **No server-dependent features.** Anything that relies on KnowledgeOwl's backend won't work locally. This includes KO template variables, search, reader group logic, login/authentication, and JavaScript that calls KO APIs.
- **No KnowledgeOwl admin bar.** The snapshot may include the admin bar (if captured while logged in as an author), but it won't be functional.

---

## What This Does NOT Replace

Localhost preview is a **development-time tool** for faster iteration. It does not replace:

- **Final verification in KnowledgeOwl.** Always deploy to the KB and verify in the real environment before considering a change complete.
- **HTML snapshots for context.** Snapshots are still needed for Claude to understand the page structure.
- **The deploy-and-verify workflow.** When you're not doing heavy CSS iteration, the normal workflow (edit → deploy → verify) is simpler and perfectly fine.
