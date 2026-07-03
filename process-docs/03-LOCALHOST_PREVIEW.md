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

### Reproducing a Deployed Page to Diagnose It

The same snapshot mechanism doubles as a **diagnostic tool** when a deployed change looks wrong but you can't inspect the live page directly — e.g. the KB requires reader login, so a fresh browser tab hits the login wall instead of the page. Reproduce the deployed state locally and inspect it:

1. Copy a **fresh** HTML snapshot (captured after the change) to `preview/`.
2. Inject the *full* current code, not just a CSS `<link>`: insert the version folder's `custom-head.html` contents **and** the complete `custom-css.css` (wrapped in `<style>`) immediately before `</head>`, so the local copy matches what's actually deployed. For HTML/template changes, also swap the relevant DOM region of the snapshot for your resolved markup — resolve KO merge codes (e.g. `[template("large-search")]`, `[homepage("title")]`) to the HTML they render, which you can copy straight out of the snapshot itself.
3. Serve it (`python3 -m http.server`) and open it with a browser automation tool (Claude in Chrome, or the built-in preview) to inspect **computed styles** — run `getComputedStyle` on the suspect elements. This is how you find the real cause fast: *which* wrapper is actually painting white, whether an element is `visibility:hidden`, what its real width/height is, etc.

Because the snapshot loads KnowledgeOwl's real CDN CSS, the computed styles match production. This needs only the snapshot + a browser — **no KO codebase required, so it works for any teammate.**

Caveats: (a) the snapshot's embedded Style-Settings `<style>` reflects the KB's colors *when it was captured* — if you changed Style Settings since, that block may be stale, though most layout/visibility bugs aren't Style-Settings-driven. (b) Inspect computed styles on a **freshly loaded** page; don't trust readings taken after you've injected many ad-hoc test styles into the same tab (accumulated overrides and JS/layout races make the numbers noisy). If computed-style inspection stays inconclusive, confirm against KO's source CSS where available (see `CLAUDE-RULES.md`, "KnowledgeOwl Source CSS Lookup").

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

### Verify layout with measurements, not screenshots

For **geometry** — widths, positions, overlaps, whether something is centered — trust the DOM over the screenshot. `preview_screenshot` doesn't always render at the same viewport that `preview_resize` / `window.innerWidth` report, so a screenshot can look "off-center" or "too narrow" when the real layout is fine (and send you chasing non-bugs). Read element rects and computed styles via `preview_eval` instead — e.g. `document.querySelector(sel).getBoundingClientRect()` and `getComputedStyle(el)`. Use the screenshot for **look** (color, spacing, polish), not precise dimensions.

To find which element paints a hover/active style, hover it and inspect the hover chain: `[...document.querySelectorAll(':hover')].map(e => [e.className, getComputedStyle(e).backgroundColor])`. That's how you pin down, e.g., whether a TOC highlight lives on the link or the `<li>` (see `knowledgeowl-css-quirks.md` #24).

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

## Claude Code's Built-in Preview

Claude Code has its own in-app preview feature (powered by Claude Preview MCP tools) that can start a local server, take screenshots, inspect elements, and check console output — all without you opening a browser. Claude sometimes uses this automatically when it detects CSS changes that would benefit from visual verification. You can also ask Claude to use it at any time (e.g., "preview the homepage and show me a screenshot").

This is the same toolset referenced as "Option A" in Step-by-Step Setup above. The key difference from the manual workflow is that Claude handles the entire loop — starting the server, syncing CSS, taking screenshots, and inspecting styles — so you don't need a browser tab open or need to refresh manually.

---

## What This Does NOT Replace

Localhost preview is a **development-time tool** for faster iteration. It does not replace:

- **Final verification in KnowledgeOwl.** Always deploy to the KB and verify in the real environment before considering a change complete.
- **HTML snapshots for context.** Snapshots are still needed for Claude to understand the page structure.
- **The deploy-and-verify workflow.** When you're not doing heavy CSS iteration, the normal workflow (edit → deploy → verify) is simpler and perfectly fine.
