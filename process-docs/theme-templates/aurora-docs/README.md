# Aurora-Docs Theme — reusable KnowledgeOwl template

A bright, airy documentation theme for KnowledgeOwl: a **light top nav**, a vibrant **multi-color gradient hero** (primary → action → accent), **rounded card categories** with a slide-in top-bar on hover, a **soft-tinted, fully-colored left TOC**, **dark code blocks**, and a **colored footer**. Built as a layer on top of KO's stock **Minimalist** theme, with **every brand value tokenized** so it re-skins from a handful of variables. Ships with the **Outfit** webfont (swappable).

> **Provenance:** carved from a colleague's starter theme, then genericized for the toolkit — customer names removed, tokens renamed to the `--brand-*`/`--ui-*` convention, `rgba()` effects completed through the `-rgb` pairs, the Editor Readability Guard added, and **font sizes conformed back to the KO Minimalist baseline** (the theme adjusts weight/color/spacing/radius/line-height only).

---

## What's in this folder

| File | Role |
|------|------|
| `custom-css.css` | **The template.** Stock KO Minimalist default CSS + the aurora-docs theme layer (below the `AURORA-DOCS THEME` banner) + the Editor Readability Guard. This is the only file that carries the design. |
| `custom-head.html` | **Aurora-specific** — loads the Outfit webfont. Swap the font here + in `--brand-font`. |
| `custom-html-5-homepage.html` | **Aurora-specific** — adds a hero **tagline** element (`.ko-hero-tagline`) the theme styles. |
| `custom-html-1…10-*.html` (the rest) | Stock KO **Minimalist defaults**, unchanged. |
| `README.md` | This file. |
| `polish-prompt.md` | Handoff prompt for a focused later polish pass. |

---

## How to apply it to a prospect's KB

1. **Custom CSS** — paste `custom-css.css` into *Customize › Style (HTML & CSS) › Custom CSS* (replace the whole field).
2. **Custom `<head>`** — paste `custom-head.html` (loads the webfont).
3. **Homepage HTML** — paste `custom-html-5-homepage.html` (the hero tagline). The other Custom HTML sections are stock Minimalist defaults — no change needed on a fresh Minimalist KB.
4. **Style Settings colors** — set them to mirror the brand tokens (table below).
5. **Logo** — upload the prospect's logo via *Customize › Style › Style Settings › Logo*. **Use a DARK logo — the nav is light.** (This is the opposite of a dark-nav theme.)
6. **Hero image** — upload the prospect's hero photo to the **KB file library**, then paste its KB-hosted URL into the `--brand-hero-image` token in `custom-css.css`. Until set, the hero shows the brand gradient alone.

---

## The swap point — re-skinning

Everything derives from the **`--brand-*` tokens** in the `:root` block at the top of the theme layer. To re-skin, change **only** these:

| Token | Role |
|-------|------|
| `--brand-primary` **+** `--brand-primary-rgb` | Dark brand color — headings, footer, table header, dark code blocks, TOC text, category icons; via `-rgb` it feeds the shadows and hero gradient. **Set both.** |
| `--brand-primary-dark` | Deeper primary. **Auto-derives** from `--brand-primary` via `color-mix()` (hex is a fallback) — leave it. |
| `--brand-action` **+** `--brand-action-rgb` | Interactive blue — links, buttons, focus rings, active states, search button; via `-rgb` it feeds focus glows + the hero gradient middle. **Set both.** Keep it **AA-contrast** on white (≥4.5:1) since it colors body links. |
| `--brand-action-dark` | Link/button hover. **Auto-derives** via `color-mix()` — leave it. |
| `--brand-accent` **+** `--brand-accent-rgb` | Accent (used sparingly) — checklist bullets, blockquote bar, image-caption links, hero gradient tail, category card top-bar. **Set both.** |
| `--brand-accent-dark` | Accent hover. **Auto-derives** — leave it. |
| `--brand-tint` | Pale surface tint — background washes (widgets, ratings, related, well, blockquote), TOC hover/active highlight, top-nav search field, text selection. Usually a very light wash of the action color. |
| `--brand-heading` / `--brand-body` / `--brand-muted` | Text colors. |
| `--brand-bg` / `--brand-surface` | Page background / card + nav surface. |
| `--brand-border` / `--brand-border-strong` | Hairlines / stronger borders. |
| `--brand-nav-text` | Text/icons on the (light) nav — a **dark** value. |
| `--brand-font` | Webfont family. Change here **and** in `custom-head.html`'s Google Fonts `<link>`. |
| `--brand-hero-image` | Homepage hero photo — a **KB file-library URL** (never a marketing-site hotlink). |

The `--ui-*` tokens (radius, spacing, shadows, motion, the fixed functional alert colors) and the entire layout/structure are **brand-agnostic — leave them.** Font sizes stay at the Minimalist baseline.

> **Why the `-rgb` pairs?** The shadows, focus glows, and hero gradient use `rgba(var(--brand-*-rgb), α)` so the same color drives both solid fills and translucent effects. If you change a hex, change its `-rgb` too, or the effects won't follow.

---

## From a prospect's brand → the token values

1. **Capture their exact colors** (their downloaded marketing site, or computed styles read with Claude-in-Chrome — see "Capturing Exact Brand Colors" in `../../../project-template/CLAUDE-RULES.md`).
2. **Map the three hues:**
   - `--brand-primary` = their **darkest/dominant** brand color (headings, footer, code, TOC). Set `--brand-primary-rgb`. `-dark` auto-derives.
   - `--brand-action` = their **link/CTA color** (a mid, saturated tone). Set `--brand-action-rgb`. **Check it hits AA (≥4.5:1) on white** — it colors body links. `-dark` auto-derives.
   - `--brand-accent` = a **secondary highlight** (used sparingly). Set `--brand-accent-rgb`. `-dark` auto-derives. If a brand has only two colors, reuse the action color or a tint.
   - `--brand-tint` = a very pale wash (often ~8–12% of the action color on white).
3. **Text + surfaces:** the `--brand-heading` / `--brand-body` / `--brand-muted` grays and `--brand-bg` / `--brand-surface` defaults usually work; nudge toward the brand if their site does.
4. **Nav text:** `--brand-nav-text` is **dark** (the nav is light).
5. **Font:** set `--brand-font` **and** the `custom-head.html` `<link>` to the same family (or drop the webfont and use a system stack).
6. **Hero + logo:** upload the hero to the KB file library → `--brand-hero-image`; upload a **dark** logo via Style Settings.

Then contrast-check: heading/body on white, **action color as a link on white (≥4.5:1)**, nav-text on the light nav.

---

## Style Settings — mirror the tokens

*Customize › Style › Style Settings › Colors.* KO shows one of two labels per swatch ("common / variant"); both are listed. The Custom CSS overrides these, but keeping them aligned avoids competing values:

| KO Style Setting (common / variant) | Mirrors token | (example) |
|------------------|---------------|---------------|
| Top navigation bar / Header background | `--brand-surface` | `#ffffff` |
| Top navigation text / Header text | `--brand-nav-text` | `#3a3a3a` |
| H1s, H2s, H3s, etc. / Header tags | `--brand-heading` | `#111111` |
| Table of contents / Column background | `--brand-bg` | `#f7fafd` |
| Table of contents text / Column text | `--brand-primary` | `#0a0063` |
| Highlights & Accents | `--brand-action` | `#1f5fd6` |
| Default category icon colors — Icon color | `--brand-primary` | `#0a0063` |
| Default category icon colors — Icon background | — (stays white) | `#ffffff` |

---

## Rules that keep the template healthy

- **Never change font sizes** — they stay at the KO Minimalist baseline (they come from the stock CSS above the banner). Adjust weight / color / spacing / radius / line-height / width / font-**family** only.
- **Only colors, fonts, and imagery change per prospect.** Layout and structure stay put.
- **Layer, don't wipe** — `custom-css.css` already includes the stock Minimalist CSS above the theme banner, and ends with the Editor Readability Guard. Keep both.

---

## Known polish opportunities (for a future polish pass)

Verified in localhost preview against the bundled reference snapshots (homepage + article). Candidates:

- **Homepage with the real tagline HTML** — the reference snapshot uses generic homepage markup, so verify the hero tagline + the (card-suppressed) homepage layout against a live aurora KB.
- **Other page types** — category, search, login/reader-subscriptions, 404, and restricted-access are token-styled but were not individually snapshot-verified; give them a dedicated pass with their own snapshots.
- **PDF parity** — dark code blocks + colored tables in PDF export haven't been verified.
- **Dark-mode variant** and finer TOC/nav interactions.
