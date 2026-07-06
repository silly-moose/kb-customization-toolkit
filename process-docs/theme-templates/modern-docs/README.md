# Modern-Docs Theme — reusable KnowledgeOwl template

A clean, professional "modern documentation" theme for KnowledgeOwl (Mintlify/Notion-adjacent): a branded top nav, a hero homepage with a photo + gradient wash, glow/depth polish, a whisper-subtle animated ambient background, and a docs-style article page with a left TOC. Built as a layer on top of KO's stock **Minimalist** theme, with **every brand value tokenized** so it re-skins from a handful of variables.

> **Provenance:** carved out of a finished prospect build (in the separate customer-builds project). Glow/depth effects adapted from an earlier internal theme; the animated ambient is a pure-CSS take on Mintlify's animated background.

---

## What's in this folder

| File | Role |
|------|------|
| `custom-css.css` | **The template.** Stock KO Minimalist default CSS + the modern-docs theme layer (below the `MODERN-DOCS THEME` banner). This is the only file that carries the design. |
| `custom-head.html`, `custom-html-1…10-*.html` | Stock KO **Minimalist defaults**, unchanged. Included so the template is self-contained; the theme styles this default markup via CSS. |
| `README.md` | This file. |
| `polish-prompt.md` | Handoff prompt for taking the template to high quality in a focused later session. |

---

## How to apply it to a prospect's KB

1. **Custom CSS** — paste `custom-css.css` into *Customize › Style (HTML & CSS) › Custom CSS* (replace the whole field).
2. **Style Settings colors** — set them to mirror the brand tokens (table below). Do this *before* the CSS ideally; they load first.
3. **Logo** — upload the prospect's logo via *Customize › Style › Style Settings › Logo* (a light/white version if the nav is dark). Not in code.
4. **Hero image** — upload the prospect's hero photo to the **KB file library**, then paste its KB-hosted URL into the `--brand-hero-image` token in `custom-css.css`.

The 10 Custom HTML sections and Custom `<head>` are stock Minimalist defaults — no change needed (they already ship with a fresh Minimalist KB; see `../../minimalist-theme-defaults/`).

---

## The swap point — re-skinning

Everything derives from the **`--brand-*` tokens** in the `:root` block at the top of the theme layer (`custom-css.css`). To re-skin, change **only** these:

| Token | Role |
|-------|------|
| `--brand-primary` **+** `--brand-primary-rgb` | Primary brand color — nav, headings, primary actions, and (via the `-rgb`) all primary-colored glows/tints/ambient. **Set both.** |
| `--brand-primary-hi` / `--brand-primary-lo` | Lighter / deeper primary. `-lo` drives nav depth/borders; `-hi` is reserved (unused by the theme so far). |
| `--brand-accent` **+** `--brand-accent-rgb` | Accent — links, icons, focus, highlights, active TOC item, and (via `-rgb`) the accent glows. **Set both.** |
| `--brand-accent-hi` / `--brand-accent-lo` | Lighter / darker accent. `-lo` drives hover/active states; `-hi` is reserved (unused by the theme so far). |
| `--brand-heading` / `--brand-body` / `--brand-muted` | Text colors. |
| `--brand-bg` / `--brand-bg-soft` | Page bg / soft section + sidebar bg. |
| `--brand-border` / `--brand-border-hi` | Hairlines / hover borders. |
| `--brand-nav-text` | Text/logo/icons on the primary nav (usually `#ffffff`). |
| `--brand-hero-image` | Homepage hero photo — a **KB file-library URL** (never a marketing-site hotlink). |

The `--ui-*` tokens (radius, shadows, glows) and the entire layout/structure are **brand-agnostic — leave them.** Font sizes stay at the Minimalist baseline.

> **Why the `-rgb` pairs?** The glows, tints, and ambient use `rgba(var(--brand-primary-rgb), α)` so the same color drives both solid fills and translucent effects. If you change a hex, change its `-rgb` too, or the effects won't follow.

---

## From a prospect's brand → the token values

A repeatable way to fill in the `--brand-*` tokens for a new prospect:

1. **Capture their exact colors** — prefer their downloaded marketing site; if that doesn't give confident values, read *computed* styles off their live site with Claude-in-Chrome (see "Capturing Exact Brand Colors" in `../../../project-template/CLAUDE-RULES.md`). Record them in the project (e.g. a `brand.md`).
2. **Map the two key colors:**
   - `--brand-primary` = their **dominant brand color** (anchors nav / headings / primary actions). Set `--brand-primary-rgb` to that color's R,G,B, and `--brand-primary-hi` / `-lo` to a slightly lighter / darker shade.
   - `--brand-accent` = their **link / CTA / highlight color** (often a brighter secondary). Set `--brand-accent-rgb`, plus `-hi` / `-lo` for hover / active.
   - If a brand really has just one color, use it for both (or a tint for the accent).
3. **Text + surfaces:** `--brand-heading` (near-black, lightly tinted toward the primary), `--brand-body` / `--brand-muted` (grays) — the defaults usually work; nudge toward their brand if their site does. Keep `--brand-bg` white and `--brand-bg-soft` / `--brand-border` light unless the brand is distinctly dark.
4. **Nav text:** `--brand-nav-text` is `#ffffff` for a dark nav; use a dark value only if the primary is very light.
5. **Hero:** upload their hero photo to the KB file library and set `--brand-hero-image` to that URL.
6. **Fonts:** the template keeps KO's system stack (fast, neutral). Only add a webfont if the brand has a distinctive typeface worth matching.
7. **Reconcile the Style Settings** (below) to the same values, and upload the logo.

Then contrast-check the result (heading/body on white, nav-text on primary, accent as a link).

---

## Style Settings — mirror the tokens

*Customize › Style › Style Settings › Colors.* Set each to match the corresponding token (the theme CSS these generate loads before Custom CSS, so keeping them aligned avoids competing values):

| KO Style Setting | Mirrors token | (example values) |
|------------------|---------------|---------------|
| Top navigation bar | `--brand-primary` | `#133253` |
| Top navigation text | `--brand-nav-text` | `#ffffff` |
| H1s, H2s, H3s, etc. | `--brand-heading` | `#1f2a3a` |
| Table of contents (background) | `--brand-bg-soft` | `#f5f8fc` |
| Table of contents text | `--brand-primary` | `#133253` |
| Highlights & Accents | `--brand-accent` | `#0170b9` |
| Icon color | `--brand-primary` | `#133253` |
| Icon background | `#ffffff` | `#ffffff` |

---

## Rules that keep the template healthy

- **Never change font sizes** — they stay at the KO Minimalist baseline. Adjust weight / color / spacing / radius / width only.
- **Only colors, fonts, and imagery change per prospect.** Layout and structure stay put — that's what makes it a template.
- **Layer, don't wipe** — `custom-css.css` already includes the stock Minimalist CSS above the theme banner; keep it.

---

## Known polish opportunities (for a future polish pass)

The theme was built and verified primarily on the **homepage** and an **article page**. Candidate improvements:

- **Derive `--brand-primary-hi/-lo` and `--brand-accent-hi/-lo`** from the base colors (e.g. `color-mix()`) so one swap updates them, instead of separate hex values.
- **Other page types** — give category pages, search results, login/reader-subscriptions, 404, and restricted-access a dedicated pass (built on defaults today).
- **Article page depth** — optional reading-column max-width (~760px); extend the ambient tastefully to article pages; code-block, table, and callout/alert styling.
- **Category icons** — the KO default icons aren't ideal for every brand; add guidance or a cleaner default set.
- **Typography** — an optional webfont token; verify the type scale/rhythm.
- **Accessibility** — contrast-check the palette; the `prefers-reduced-motion` guard is already in place.
- **Mintlify-inspired refinements** — spacing rhythm, a possible dark-mode variant, more refined TOC/nav interactions.
