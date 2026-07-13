# Polish handoff prompt — aurora-docs template

Paste this into a fresh Claude Code session to deeply polish the template. **Best opened in the toolkit repo** (`*kb-customization-toolkit`) — it has the KO CSS reference docs and the localhost-preview process doc — while you edit the template file at the path below.

---

I want to thoroughly polish a reusable KnowledgeOwl theme template — the **"aurora-docs" template** — to make it as high-quality as possible.

**The template lives here (relative to the toolkit repo root):**
`process-docs/theme-templates/aurora-docs/`
Start by reading its `README.md` (what it is, the `--brand-*` / `--ui-*` swap point, the build rules, and known polish opportunities), then skim `custom-css.css` (the theme layer is below the `AURORA-DOCS THEME` banner; everything above it is stock KO Minimalist default CSS, and the file ends with the mandatory Editor Readability Guard).

**Reference + preview resources:**
- **Localhost preview** — follow `../../03-LOCALHOST_PREVIEW.md`, rendering the CSS against the bundled reference snapshots in `../_reference-snapshots/` (a genericized homepage + article — no live build needed). This template ships a webfont (Outfit), so inject its Google Fonts `<link>` into the preview `<head>` too, or the type will fall back to the system stack.
- The KO CSS reference docs in `../../../project-template/Reference/` (`knowledgeowl-css-quirks.md`, `knowledgeowl-css-defaults.md`).

**Goal:** genuinely excellent. Assess broadly and implement the improvements that raise quality. Draw ideas from best-in-class docs sites (Mintlify, GitBook, Stripe, Notion, Linear) plus your own judgment — but keep aurora-docs **visually distinct** from the other templates in the library (e.g. modern-docs).

**Please work in this order:**
1. **Assess first.** Audit across *every* page type (homepage, article, **category, search, login, reader-subscriptions, 404, restricted-access**), plus the light nav, the gradient hero + tagline, the card categories, the colored TOC, dark code blocks, tables, alerts, the colored footer, responsive/mobile, dark-mode potential, and accessibility (**re-check the `--brand-action` link color hits AA ≥4.5:1 on white**, plus reduced-motion). Give me a **prioritized list of proposed improvements before writing code.**
2. **Then implement** the high-value ones, iterating with localhost preview and verifying each change visually + for console errors.
3. **Preserve the template's principles:** keep the `--brand-*` / `--ui-*` tokens as the single swap point (never hardcode brand values — brand colors used in effects go through the `-rgb` pairs); **never change font sizes** from the KO Minimalist baseline (weight/color/spacing/radius/line-height/family only); keep the layout generic/brand-agnostic; keep the `prefers-reduced-motion` guard; and **keep the Editor Readability Guard as the final block.**
4. Keep it **self-contained and well-commented** so the next person can swap in a new brand (colors, font, imagery) in minutes.

Walk me through your assessment first, then let's polish it together.
