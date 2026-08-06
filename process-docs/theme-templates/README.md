# Theme Templates — reusable, brand-swappable KB themes

Pre-built KnowledgeOwl theme templates, each layered on the stock **Minimalist** baseline with **every brand value tokenized** so it re-skins from a handful of CSS variables. When a build is asked to start from one, it takes the best-fit template and swaps in the prospect's colors, fonts, and imagery.

> **Opt-in only.** Builds default to a **bespoke** design. Claude won't start a build from a template — or even propose one — unless you explicitly ask for it, so an existing template's limits never cap what gets designed. See "Using a Pre-Built Template — Only on Explicit Request" in [`../../project-template/CLAUDE-RULES.md`](../../project-template/CLAUDE-RULES.md).

This folder is the **single home** for the template subsystem: the templates themselves, the process for building new ones, and this doc for applying them. Claude fetches a template's files from GitHub **raw URLs** at build time — the same fetch-and-apply-by-name mechanism the toolkit uses for the Minimalist defaults (see [`../04-MINIMALIST_THEME_DEFAULTS.md`](../04-MINIMALIST_THEME_DEFAULTS.md)).

---

## Available templates

| Template | What it is |
|----------|------------|
| [`modern-docs/`](modern-docs/) | A clean, professional "modern documentation" theme (Mintlify/Notion-adjacent): branded **dark** top nav, hero homepage with a photo + gradient wash, glow/depth polish, a whisper-subtle animated ambient, and a docs-style article page with a left TOC. See its [`README.md`](modern-docs/README.md) for the full swap point + Style Settings map. |
| [`aurora-docs/`](aurora-docs/) | A bright, airy docs theme: a **light** top nav, a vibrant multi-color gradient hero (primary → action → accent) with a tagline, rounded card categories, a soft-tinted fully-colored left TOC, dark code blocks, and a colored footer. Ships with the Outfit webfont (swappable). See its [`README.md`](aurora-docs/README.md) for the swap point + Style Settings map. |
| [`spectrum-docs/`](spectrum-docs/) | The lightest-touch theme — **stock-adjacent** but lifted with a tri-color brand gradient (a "Getting Started" banner border + animated "see more" underlines), pill CTA buttons, an accent-bordered search, rounded accent category cards, a cool-neutral TOC, and an optional homepage watermark. **Nav-agnostic** (follows Style Settings). See its [`README.md`](spectrum-docs/README.md) for the swap point + Style Settings map. |

More templates get built directly here over time (see "Building a new template" below).

---

## When to use this

**Only when you explicitly ask for it.** Bespoke is the default for every build. These templates are generic in layout by construction — **only colors, fonts, and imagery change per prospect** — so starting from one trades design range for speed. That's a call worth making deliberately, which is why Claude leaves it to you rather than reaching for a template on its own.

When you *do* ask, this is the fast path for "custom theme for a qualified trial" builds. And when a bespoke build turns out to be template-worthy, consider extracting it into a new template afterward (see "Building a new template" below).

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

New templates are normally built **directly here in the toolkit**. The exception: when a finished bespoke prospect build turns out to be template-worthy, carve it into a reusable template by following [`template-extraction-process.md`](template-extraction-process.md). Either way, each template ships with its own `README.md` (swap point + Style Settings map) and a `polish-prompt.md` for a focused later polish pass. Preview a template under development with localhost preview against the bundled [`_reference-snapshots/`](_reference-snapshots/) (a genericized homepage + article — no live build needed; see [`../03-LOCALHOST_PREVIEW.md`](../03-LOCALHOST_PREVIEW.md)).

**Every template's `custom-css.css` must end with the Editor Readability Guard block** (canonical source: `../../project-template/Reference/knowledgeowl-css-quirks.md` §28). A template re-colors headings/links/text, so without the guard those colors leak into the white article editor and become unreadable — the guard is editor-only and safe on the live site. Keep it as the final block so a template consumer inherits it automatically.

**Templates fix KO's missing-comma focus bug; the Minimalist mirror deliberately does not.** KO's seeded Custom CSS omits a trailing comma at ~line 817 of its `:focus-visible` list, merging two selectors into one that can never match. **This is a latent defect, not a live regression** — both orphaned elements are still covered by more general selectors in the same rule (`.form-control:focus-visible` and `.btn-success:focus-visible`), so nothing currently loses its focus outline. Templates repair it for correctness and because a template that narrows either of those general selectors would turn it into a real keyboard-accessibility bug. `../minimalist-theme-defaults/custom-css.css` keeps the bug so it stays a byte-exact mirror of a stock KB — expect a one-line diff there, and don't "reconcile" it away. See the fidelity notes in `../04-MINIMALIST_THEME_DEFAULTS.md`.

**Link TEXT gets its own token in every template: `--brand-link`.** A brand colour picked for buttons, icons or glows frequently fails WCAG AA as body-link text (a brand orange measures ~3:1), so all three templates route link text through a dedicated AA-checked `--brand-link` while the broader brand colour keeps the decorative and fill roles. In modern-docs it defaults to `--brand-accent`; in aurora-docs to `--brand-action`; spectrum-docs sets it outright. Defaulting means nothing changes until a prospect's colour actually fails, and then only the link role moves.

The reason it must be separate is that the two roles pull in **opposite** directions: link text needs enough contrast against a white page, while a colour that fills a button needs to stay dark enough for the white label on top. One token can serve both only while it happens to be mid-tone. Any new template should follow the same split — and where the link colour also drives a translucent effect (e.g. an underline), give it a `-rgb` pair too, or an override will only half-apply.

---

## Keeping this current (for Chad / template maintainers)

Each template is a point-in-time layer over KO's Minimalist baseline. If KnowledgeOwl ships theme changes, re-verify the template against a current stock KB and refresh as needed. Because builds fetch these raw files from GitHub at apply time, every teammate picks up refreshed templates automatically — no local sync needed.
