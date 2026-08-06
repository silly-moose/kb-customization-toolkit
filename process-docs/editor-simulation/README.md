# Editor Simulation — check the Editor Readability Guard before you deploy

The **Editor Readability Guard** is mandatory in every build (`project-template/CLAUDE-RULES.md`), but until now the only way to confirm it actually worked was to deploy and look at a real article in the editor. This harness replaces that with a measurement you can run **before** anything is pasted into KnowledgeOwl.

## Why it works

The Froala editor renders your compiled Custom CSS in an iframe on a white canvas, and loads **neither** the Style-Settings colour block **nor** the Custom `<head>` — which is why unscoped and `.documentation-article`-scoped theme colours leak in while theme-scoped ones don't. **Canonical spec of that cascade (exact body classes, what loads, why) is quirks-doc §28** — the single source of truth; this file doesn't restate it.

Because the cascade is fully specified, [`editor-simulation.html`](editor-simulation.html) recreates it exactly and measures the result. What it *doesn't* reproduce is Froala's own UI — irrelevant to readability.

## Use it

1. Copy `editor-simulation.html` into your gitignored `preview/` folder.
2. Replace `REPLACE-WITH-KO-BUNDLE-URL` with the exact `ko-*.css` URL from the KB's page `<head>` (an absolute CDN URL, so it loads from anywhere).
3. Copy the version folder's compiled `custom-css.css` next to it.
4. Serve the folder and open the page — see [`../03-LOCALHOST_PREVIEW.md`](../03-LOCALHOST_PREVIEW.md).

**Do not add the Style-Settings block or the custom-head.** Their absence is what makes this faithful.

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
