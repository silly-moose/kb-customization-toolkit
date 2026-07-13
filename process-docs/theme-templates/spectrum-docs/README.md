# Spectrum-Docs Theme — reusable KnowledgeOwl template

A clean, **stock-adjacent** documentation theme for KnowledgeOwl, lifted with a **tri-color brand gradient** (accent → gradient-mid → cta). The gradient appears on a **"Getting Started" banner** border and animated **"see more" underlines**; the theme also adds **pill CTA buttons**, an **accent-bordered search**, **rounded accent category cards**, a cool-neutral TOC, and an optional **faint homepage watermark**. It's the lightest-touch of the templates — closest to stock Minimalist — so it's a good fit for brands that want polish without a dramatic re-theme. Built as a layer on the stock Minimalist baseline, with **every brand value tokenized**.

> **Provenance:** carved from a colleague's starter theme, then genericized for the toolkit — the customer name removed, a demo palette added (it shipped with color placeholders), tokens renamed to the `--brand-*`/`--ui-*` convention, the `rgba()` shadows completed through `-rgb` pairs, the Editor Readability Guard added, and rebuilt on the current stock Minimalist base. It already kept the KO Minimalist font-size baseline. Two small polish additions over the original: plain-`<table>` styling (KO only styles `.table-bordered`) and category-icon recoloring for cohesion.

> **Nav-agnostic:** unlike modern-docs (dark nav) and aurora-docs (light nav), spectrum-docs does **not** set a nav color in CSS — the nav follows your **Style Settings**. Pick a light nav (dark logo) or set the nav to the primary color (white logo); either works.

---

## What's in this folder

| File | Role |
|------|------|
| `custom-css.css` | **The template.** Stock KO Minimalist default CSS + the spectrum-docs theme layer (below the `SPECTRUM-DOCS THEME` banner) + the Editor Readability Guard. |
| `custom-html-5-homepage.html` | **Spectrum-specific** — adds the gradient "Getting Started" banner (with a Font Awesome icon default). |
| `custom-head.html` | Optional webfont placeholder (commented; the theme uses the system stack by default). |
| `custom-html-1…10-*.html` (the rest) | Stock KO **Minimalist defaults** (genericized). |
| `README.md` | This file. |
| `polish-prompt.md` | Handoff prompt for a focused later polish pass. |

---

## How to apply it to a prospect's KB

1. **Custom CSS** — paste `custom-css.css` into *Customize › Style (HTML & CSS) › Custom CSS* (replace the whole field).
2. **Homepage HTML** — paste `custom-html-5-homepage.html`, then set the banner's `href` (and optionally swap the Font Awesome icon for a custom `<img>` and edit the banner text). The other Custom HTML sections are stock defaults.
3. **Style Settings colors** — set them to mirror the brand tokens (table below), including the **nav** (this theme leaves the nav to Style Settings).
4. **Logo** — upload via *Customize › Style › Style Settings › Logo* (a dark logo for a light nav, or a white logo if you set the nav to the primary color).
5. **Optional watermark** — upload a large brand image to the **KB file library** and paste its URL into `--brand-watermark-image`. Until set, no watermark renders.
6. **Optional webfont** — uncomment the `<link>` in `custom-head.html` and add a `--brand-font` to `:root` if the brand has a distinctive typeface.

---

## The swap point — re-skinning

Everything derives from the **`--brand-*` tokens** in the `:root` block at the top of the theme layer. To re-skin, change **only** these:

| Token | Role |
|-------|------|
| `--brand-primary` **+** `--brand-primary-rgb` | Darkest brand color — headings, table headers, image captions, right-panel headings; via `-rgb` it feeds the banner-hover shadow. **Set both.** |
| `--brand-link` | Default body hyperlink color. **Keep AA (≥4.5:1 on white).** |
| `--brand-secondary` | Secondary accent — image-caption hover links, search-pager hover. |
| `--brand-accent` **+** `--brand-accent-rgb` | Main accent — homepage title, search border, category titles, gradient **start**. **Keep AA (≥4.5:1)** since it colors accent text; **set both.** |
| `--brand-gradient-mid` | Mid-stop of the brand gradient (a lighter tone between accent and cta). Decorative only. |
| `--brand-cta` **+** `--brand-cta-rgb` | CTA button fill, search-focus border, gradient **end**. Light enough for the dark CTA ink; via `-rgb` it feeds the CTA + search-focus shadows. **Set both.** |
| `--brand-cta-hover` | CTA hover. **Auto-derives** from `--brand-cta` via `color-mix()` (hex is a fallback) — leave it. |
| `--brand-watermark-image` | Optional homepage watermark — a **KB file-library URL**. |

The `--ui-cta-ink` (dark text on the light CTA) and the entire layout/structure are **brand-agnostic — leave them.** Font sizes stay at the Minimalist baseline.

> **Why the `-rgb` pairs?** The gradient shadows use `rgba(var(--brand-*-rgb), α)` so the same color drives both solid fills and translucent effects. If you change a hex, change its `-rgb` too, or the effects won't follow.

---

## From a prospect's brand → the token values

1. **Capture their exact colors** (their marketing site, or computed styles via Claude-in-Chrome — see `../../../project-template/CLAUDE-RULES.md`).
2. **Map the gradient:** `--brand-accent` (start), `--brand-gradient-mid` (middle), `--brand-cta` (end) form the tri-color gradient — pick three colors that read well left-to-right. Set the `-rgb` for accent + cta.
3. **AA-check the text colors:** `--brand-accent` (colors category titles + banner text) and `--brand-link` must hit **≥4.5:1 on white**. Darken if needed — a too-light brand green/blue will fail.
4. **CTA:** `--brand-cta` should be light enough that the dark `--ui-cta-ink` text reads on it (or change the ink).
5. **Primary + secondary:** `--brand-primary` = the darkest brand color (headings/tables); `--brand-secondary` = a warm secondary for caption links.
6. **Nav + logo:** decide the nav in Style Settings (light or primary), and upload a matching logo.

---

## Style Settings — mirror the tokens

*Customize › Style › Style Settings › Colors.* KO shows one of two labels per swatch ("common / variant"). This theme leaves the nav to Style Settings, so set it here too:

| KO Style Setting (common / variant) | Set to | (example) |
|------------------|---------------|---------------|
| Top navigation bar / Header background | your choice — light or primary | `#ffffff` |
| Top navigation text / Header text | dark on a light nav (or white on primary) | `#0f3d35` |
| H1s, H2s, H3s, etc. / Header tags | `--brand-primary` | `#0f3d35` |
| Table of contents / Column background | (matches the CSS TOC) | `#f7f8f9` |
| Table of contents text / Column text | `--brand-primary` | `#0f3d35` |
| Highlights & Accents | `--brand-accent` | `#0a7d50` |
| Default category icon colors — Icon color | `--brand-primary` | `#0f3d35` |
| Default category icon colors — Icon background | — (stays white) | `#ffffff` |

---

## Rules that keep the template healthy

- **Never change font sizes** — they stay at the KO Minimalist baseline (they come from the stock CSS above the banner). Adjust weight / color / spacing / radius / line-height / width only.
- **Only colors, fonts, and imagery change per prospect.** Layout and structure stay put.
- **Layer, don't wipe** — `custom-css.css` includes the stock Minimalist CSS above the theme banner and ends with the Editor Readability Guard. Keep both.

---

## Known polish opportunities (for a future polish pass)

Verified in localhost preview against the bundled reference snapshots (homepage + article; the banner + a CTA were injected to verify them, since the generic snapshot lacks them). Candidates:

- **Homepage banner + watermark on a live KB** — verify against the real homepage HTML (the reference snapshot uses generic markup).
- **Other page types** — category, search, login/reader-subscriptions, 404, restricted-access are token-styled but not individually snapshot-verified.
- **Blockquotes + code blocks** are intentionally left near-stock (the light-touch identity) — a future pass could add a subtle callout / refined code block if desired.
- **PDF parity** and a **dark-mode variant**.
