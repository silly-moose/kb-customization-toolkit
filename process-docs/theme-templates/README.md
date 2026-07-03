# Theme Templates — reusable, brand-swappable KB themes

Pre-built KnowledgeOwl theme templates, each layered on the stock **Minimalist** baseline with **every brand value tokenized** so it re-skins from a handful of CSS variables. A customer build starts from the best-fit template and swaps in the prospect's colors, fonts, and imagery — instead of designing every theme from scratch.

This folder is the **single home** for the template subsystem: the templates themselves, the process for building new ones, and this doc for applying them. Claude fetches a template's files from GitHub **raw URLs** at build time — the same fetch-and-apply-by-name mechanism the toolkit uses for the Minimalist defaults (see [`../04-MINIMALIST_THEME_DEFAULTS.md`](../04-MINIMALIST_THEME_DEFAULTS.md)).

---

## Available templates

| Template | What it is |
|----------|------------|
| [`modern-docs/`](modern-docs/) | A clean, professional "modern documentation" theme (Mintlify/Notion-adjacent): branded top nav, hero homepage with a photo + gradient wash, glow/depth polish, a whisper-subtle animated ambient, and a docs-style article page with a left TOC. See its [`README.md`](modern-docs/README.md) for the full swap point + Style Settings map. |

More templates get built directly here over time (see "Building a new template" below).

---

## When to use this

Use it when a prospect build should **start from a pre-built template** rather than a fully bespoke theme — the fast path for the "custom theme for a qualified trial" builds. The templates are generic in layout; **only colors, fonts, and imagery change per prospect.** If a build genuinely needs a one-off design, build it custom (and consider extracting it into a new template afterward).

---

## How to apply a template in a build

### The one-line ask

In a session opened in the **prospect's project folder**, paste (swap in the template name):

```
Apply the modern-docs theme template from the toolkit to this build: fetch its raw
files into my current version folder, then swap the --brand-* tokens to this prospect's
brand, reconcile the Style Settings, and set the logo + hero.
(process-docs/theme-templates/README.md)
```

### What Claude does

**1. Fetch the template's raw files** from GitHub straight into the build's **current version folder** (e.g. `2026.07.03-v1/`, *not* the `no-changes` baseline — that stays the customer's original). A `curl` of each raw file is byte-exact — it never round-trips through the model:

```bash
BASE="https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/process-docs/theme-templates/modern-docs"
DEST="/path/to/CustomerName/2026.07.03-v1"   # the build's current version folder

for f in custom-css.css custom-head.html \
  custom-html-1-body.html custom-html-2-top-navigation.html \
  custom-html-3-article.html custom-html-4-article-version.html \
  custom-html-5-homepage.html custom-html-6-login.html \
  custom-html-7-manage-reader-subs.html custom-html-8-404-page.html \
  custom-html-9-restricted-access-page.html custom-html-10-right-column.html; do
  curl -fsSL "$BASE/$f" -o "$DEST/$f"
done
```

The **design lives entirely in `custom-css.css`**; the Custom `<head>` and the 10 Custom HTML sections are stock Minimalist defaults (unchanged from a fresh KB — fetched so the version folder is complete). To apply a different template, point `BASE` at that template's folder and keep the same 12 filenames.

**2. Swap the brand.** Change only the `--brand-*` tokens (and their `-rgb` pairs) at the top of `custom-css.css` to the prospect's brand, and set `--brand-hero-image` to a KB-file-library URL. Leave the `--ui-*` tokens, layout, and font sizes. The template's own README has the token-by-token map and a "prospect's brand → token values" guide — see [`modern-docs/README.md`](modern-docs/README.md) — and the canonical tokenization policy is in [`../../project-template/CLAUDE-RULES.md`](../../project-template/CLAUDE-RULES.md) ("Brand Color Tokens").

**3. Reconcile Style Settings, logo, and hero.** Mirror the KO Style Settings colors to the tokens, upload the logo via KO's native Style Settings uploader, and upload the hero to the KB file library. These follow the toolkit's canonical policy — see `CLAUDE-RULES.md` ("Style Settings Colors" + "Logo & Brand Assets") — and the template README's Style Settings table. The color-change checkpoint in `CLAUDE-RULES.md` still applies.

**Timing note:** apply into a working version folder, then deploy per the normal version-control + deployment process (`../02-VERSION_CONTROL_PROCESS.md`). For faster visual iteration while adjusting the brand, use localhost preview (`../03-LOCALHOST_PREVIEW.md`).

---

## Building a new template

Templates are built **directly here in the toolkit** now (no more migrating from customer builds). To carve a new reusable template out of a finished prospect build, follow [`template-extraction-process.md`](template-extraction-process.md). Each template ships with its own `README.md` (swap point + Style Settings map) and a `polish-prompt.md` for a focused later polish pass. Preview a template under development with localhost preview against a real KB HTML snapshot (see [`../03-LOCALHOST_PREVIEW.md`](../03-LOCALHOST_PREVIEW.md)).

---

## Keeping this current (for Chad / template maintainers)

Each template is a point-in-time layer over KO's Minimalist baseline. If KnowledgeOwl ships theme changes, re-verify the template against a current stock KB and refresh as needed. Because builds fetch these raw files from GitHub at apply time, every teammate picks up refreshed templates automatically — no local sync needed.
