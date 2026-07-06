# How to extract a reusable template from a prospect build

The process for turning a finished, polished custom theme (built for one prospect) into a **reusable, brand-swappable template** — i.e. how `modern-docs/` was created from a finished prospect build (in the separate customer-builds project).

Do this **after** a build is finished and deployed, when the design has settled.

---

## Prerequisites

- A finished build whose entire theme lives in **`custom-css.css`** (layered over the KO Minimalist baseline), with brand values already in `--` tokens. (If the build hardcoded brand values inline, tokenize them first.)

---

## Steps

1. **Copy the code files** from the latest version folder into a new `process-docs/theme-templates/<template-name>/` folder (e.g. `modern-docs/`) — `custom-css.css` plus the Custom HTML sections + `custom-head.html` (stock Minimalist defaults, included so the template is self-contained).

2. **Inventory the prospect-specific bits.** Grep `custom-css.css` for the brand token prefix (e.g. `--acme-`) and for raw color literals (`rgb(`/`rgba(`) — you need to know every place a brand value appears, including inside glows/shadows/gradients.

3. **Rename tokens to generic, semantic names:**
   - `--brand-*` for the **swap values** (primary, accent, heading, body, muted, bg, border, nav-text, hero-image).
   - `--ui-*` for **derived/structural** values that shouldn't change per brand (radius, shadows, glows).

4. **Complete the swap point (important).** Convert brand color *literals* used in alpha effects to `rgba(var(--brand-*-rgb), α)`, and add the `--brand-*-rgb` component tokens. This makes a token change re-skin the glows/tints/ambient too — not just the solid fills. Verify **zero** raw brand literals remain.

5. **Reorganize `:root`** into two labeled groups: **"SWAP THESE per prospect"** (brand) and **"DERIVED — leave"** (ui). **Placeholder** the prospect-specific bits (hero image URL → `REPLACE-WITH-KB-FILE-LIBRARY-URL`).

6. **Clean the comments + names.** Strip the prospect's name and color-specific words (e.g. `navy → primary`, `blue → accent`, `"NYC skyline photo" → "hero photo"`), and rename any prospect-named keyframes/classes (e.g. `acme-ambient-drift → md-ambient-drift`). Update the banner to describe the template.

7. **Verify it still renders.** Point localhost preview at the template's `custom-css.css` against the bundled reference snapshots in [`_reference-snapshots/`](_reference-snapshots/README.md) (a genericized homepage + article — no customer material needed); confirm brace balance, that tokens resolve (`getComputedStyle`), that effects render, and that there are **no console errors**. It should look identical to the source build (minus the placeholdered hero).

8. **Write the template `README.md`** — what it is, the swap point + a "prospect's brand → token values" guide, the Style Settings mapping, the build rules (font sizes stay, only colors/fonts/imagery change), and known polish opportunities.

9. **Write a polish handoff prompt** (`polish-prompt.md`) so the template can be taken to high quality in a focused later session.

---

## Principles

- **Only colors, fonts, and imagery are prospect-specific.** Everything else — layout, structure, effects — stays generic. That's what makes it reusable.
- **Never change font sizes** from the KO Minimalist baseline.
- **Keep it self-contained and well-commented** so the next brand swap takes minutes.
- **Make each template visually distinct** from the others in the library.

---

## Where templates live / how they're applied

Templates live here in the toolkit, under `process-docs/theme-templates/` (alongside `process-docs/minimalist-theme-defaults/`). New templates are normally built directly here; extraction from a prospect build (this doc) is the exception, for when a bespoke design turns out to be template-worthy. A customer build **applies** a template by name via this folder's [`README.md`](README.md), which fetches the template's raw files from GitHub and swaps in the prospect's brand — the same mechanism the toolkit already uses for the Minimalist defaults.
