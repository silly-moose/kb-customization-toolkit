# Reference snapshots — for localhost preview during template dev

Two rendered-HTML snapshots of a KnowledgeOwl KB — a **homepage** (`homepage.html`) and an **article** (`article.html`) — so you can run localhost preview of a template's CSS **without needing a live customer build**. Point the preview at these and layer a template's `custom-css.css` on top.

## What these are (and aren't)

- **Genericized fixtures.** They were derived from a real KB build and then **fully scrubbed**: the brand is a placeholder ("Acme"), categories are generic (Company / Guides / Reference), the article body is placeholder documentation content (headings, lists, a blockquote, a code block, a table — chosen to exercise article typography), and every prospect identifier is gone (KB name, subdomain, account/object IDs, logo/favicon/avatar assets, and an encrypted form token were all neutralized). Safe to publish.
- **All `<script>` blocks were stripped** — they aren't needed for CSS preview and were the main carrier of embedded identifiers. KO's base stylesheets still load via their `<link>` tags (public CDN), so the page renders with real KO structure + base styling.
- **Not a template.** These are support fixtures (hence the `_` prefix), not a theme.

## How to use (localhost preview)

Full process: [`../../03-LOCALHOST_PREVIEW.md`](../../03-LOCALHOST_PREVIEW.md). Quick recipe:

1. Copy the snapshots into your gitignored `preview/` folder as `preview/homepage.html` and `preview/article.html`.
2. In each, inject `<link rel="stylesheet" href="custom-css.css">` just before `</head>`.
3. Copy the template you're working on — e.g. [`../modern-docs/custom-css.css`](../modern-docs/custom-css.css) — to `preview/custom-css.css` (keep it in sync as you edit).
4. Serve `preview/` (e.g. `python3 -m http.server`) and open `homepage.html` / `article.html`. Use the Claude Preview MCP (`preview_screenshot` / `preview_inspect`) or a browser to verify — check that tokens resolve, effects render, and there are no console errors.

Because the injected `custom-css.css` loads **last**, the template's rules layer on top of the snapshot's baseline.

## Refreshing

If KnowledgeOwl changes its public-view markup, recapture from a current KB (Chrome DevTools → Elements → Copy outerHTML) and re-genericize before committing — **never commit a snapshot with a real prospect's name, subdomain, content, asset URLs, or form tokens.**
