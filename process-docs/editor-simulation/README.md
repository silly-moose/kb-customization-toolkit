# Editor Simulation — check the Editor Readability Guard before you deploy

The **Editor Readability Guard** is mandatory in every build (`project-template/CLAUDE-RULES.md`), but until now the only way to confirm it actually worked was to deploy and look at a real article in the editor. This harness replaces that with a measurement you can run **before** anything is deployed to KnowledgeOwl.

## Why it works

The Froala editor renders the KB's compiled theme stylesheet (the generated Style-Settings rules plus your Custom CSS) in an iframe on a white canvas whose `<body>` carries no theme class, and it never loads the Custom `<head>`. That is why unscoped and `.documentation-article`-scoped theme colours leak in while theme-scoped ones don't. **Canonical spec of that cascade (exact body classes, what loads, why) is quirks-doc §28** — the single source of truth; this file doesn't restate it.

Because the cascade is fully specified, [`editor-simulation.html`](editor-simulation.html) recreates it exactly and measures the result. What it *doesn't* reproduce is Froala's own UI — irrelevant to readability.

## Use it

1. Copy `editor-simulation.html` into your gitignored `preview/` folder.
2. Replace `REPLACE-WITH-KO-BUNDLE-URL` with the exact `ko-*.css` URL from the KB's page `<head>` (an absolute CDN URL, so it loads from anywhere).
3. Copy the version folder's compiled `custom-css.css` next to it.
4. Serve the folder and open the page — see [`../03-LOCALHOST_PREVIEW.md`](../03-LOCALHOST_PREVIEW.md).

**Do not add the custom-head:** the editor never loads it, so leaving it out is what makes this faithful. The harness also leaves out the generated Style-Settings rules, which the editor *does* load (quirks §28). The guard restores KO's stock colours with `!important`, so the result holds for everything the guard covers; what this harness does not exercise is a body-level colour set only through Style Settings, which quirks §29 covers by scoping instead.

**Serve it; don't open it by `file://` in the Claude app's browser pane.** The pane renders a local file as a static snapshot, so the relative `custom-css.css` link never loads, the page measures KO's bundle alone, and every row reads STOCK: a clean result that tested nothing. If a stylesheet fails to load for any reason the same thing happens, which is why the report ends with that reminder.

## Run it with no local server

When the permission layer blocks `python3 -m http.server`, or you want the check inside the browser pane without a preview folder, build the page in memory and read the report. Run this in any tab that may fetch GitHub (a reader page of the KB works), after setting the two values at the top:

```js
(async () => {
  const BUNDLE = 'REPLACE: the ko-*.css URL from the KB page <head>';
  const CSS = 'REPLACE: the version folder\'s compiled custom-css.css, as one string';
  const src = await (await fetch('https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/process-docs/editor-simulation/editor-simulation.html')).text();
  const html = src.split('REPLACE-WITH-KO-BUNDLE-URL').join(BUNDLE)
    .replace('<link rel="stylesheet" href="custom-css.css">', '<style>' + CSS.replace(/<\/style/gi, '<\\/style') + '</style>');
  const f = document.createElement('iframe');
  f.style.cssText = 'position:fixed;left:-9999px;width:1000px;height:800px';
  f.srcdoc = html;
  document.body.appendChild(f);
  await new Promise(r => { f.onload = r; });
  const out = f.contentDocument.getElementById('ko-sim-report').innerText;
  f.remove();
  return out;
})()
```

Three things the snippet gets right that a quick version gets wrong:

- **It replaces every occurrence of the placeholder.** The first `REPLACE-WITH-KO-BUNDLE-URL` in the file is in the instructions comment, so a single `.replace()` leaves the real `<link>` broken and every row reads STOCK.
- **It inlines the CSS as a `<style>` block** instead of linking `custom-css.css`, which an in-memory page cannot resolve.
- **It loads the page as an off-screen `srcdoc` iframe** and reads `#ko-sim-report` after `load`, when the bundle has arrived and the script has run.

Where `CSS` comes from: the version folder's file, passed in chunks if it is too long for one call (`05-BROWSER_CAPTURE_AND_DEPLOY.md`, `koIO.put`), or, to check what is already live, the Style page's `textarea[name=custom-css]` fetched same-origin from an admin tab.

## Reading the result

| Verdict | Meaning |
|---|---|
| **STOCK** | The element is at KO's own editor colour — the guard restored it, or nothing touched it. Not a build regression, even where KO's own value is below AA. |
| **PASS** | Recoloured by the theme but still comfortably legible on the canvas. |
| **FAIL** | The theme made this unreadable in the editor. Fix it. |

Two kinds of FAIL, with **different** fixes — the report says which:

- **Heading or link FAIL** → the guard is missing or doesn't cover that element. Add or extend the canonical block from quirks-doc §28.
- **Body-level FAIL** (body text, blockquote, callout text) → **don't** extend the guard. It deliberately leaves body text alone so an author's own toolbar colours survive. The fix is to scope the theme rule that leaked in, live+PDF-only, with `.hg-article-body:not(.documentation-article)` (quirks-doc §29).

If a stylesheet fails to load, every row reads as stock — confirm both `<link>`s resolved before trusting a clean result.

## Known KO baseline quirk

KO's stock link colour `#3C80BA` measures **4.21:1** on white, below the WCAG AA floor of 4.5:1 (and lower still on tinted callout backgrounds — ~3.74:1). The harness reports these as **STOCK**, not FAIL, because the guard restoring them is correct behaviour and a build can't fix KO's default from the theme layer. It's called out as informational so the number isn't mistaken for something the build introduced.

## Verified

The harness was tested against three scenarios before shipping:

| Scenario | Expected | Got |
|---|---|---|
| Bad theme, no guard (light amber headings, pale links, pale body) | everything flagged | 12/12 FAIL |
| Guard added, body-text rule still leaking | headings/links clear, body flagged with the *scoping* remedy | 6 STOCK + 3 FAIL, correct remedy |
| Guard + body rule properly scoped per §29 | clean | "No regressions" |
