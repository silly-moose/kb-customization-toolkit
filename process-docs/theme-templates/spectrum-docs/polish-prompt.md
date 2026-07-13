# Polish handoff prompt — spectrum-docs template

Paste this into a fresh Claude Code session to deeply polish the template. **Best opened in the toolkit repo** (`*kb-customization-toolkit`) — it has the KO CSS reference docs and the localhost-preview process doc — while you edit the template file at the path below.

---

I want to thoroughly polish a reusable KnowledgeOwl theme template — the **"spectrum-docs" template** — to make it as high-quality as possible.

**The template lives here (relative to the toolkit repo root):**
`process-docs/theme-templates/spectrum-docs/`
Start by reading its `README.md` (what it is, the `--brand-*` / `--ui-*` swap point, the nav-agnostic note, the build rules, and known polish opportunities), then skim `custom-css.css` (the theme layer is below the `SPECTRUM-DOCS THEME` banner; everything above it is stock KO Minimalist default CSS, and the file ends with the mandatory Editor Readability Guard).

**Reference + preview resources:**
- **Localhost preview** — follow `../../03-LOCALHOST_PREVIEW.md`, rendering the CSS against the bundled reference snapshots in `../_reference-snapshots/`. The reference homepage snapshot uses generic markup, so to see the **Getting Started banner** + a **CTA button** you'll need to inject that markup into the preview DOM (the banner lives in this template's `custom-html-5-homepage.html`).
- The KO CSS reference docs in `../../../project-template/Reference/` (`knowledgeowl-css-quirks.md`, `knowledgeowl-css-defaults.md`).

**Goal:** genuinely excellent. This is deliberately the **lightest-touch** template (closest to stock Minimalist) — its identity is the tri-color brand gradient (banner border, "see more" underlines) plus pill CTAs and a clean, cohesive palette. Polish it **without** turning it into modern-docs/aurora-docs; keep it distinct and restrained. Draw ideas from best-in-class docs sites where they fit the light-touch brief.

**Please work in this order:**
1. **Assess first.** Audit across *every* page type (homepage, article, **category, search, login, reader-subscriptions, 404, restricted-access**), plus the Getting Started banner, the watermark, the gradient accents, pill CTAs, the search, category cards, the neutral TOC, tables, the (near-stock) blockquotes + code blocks, responsive/mobile, dark-mode potential, and accessibility (**re-check `--brand-accent` and `--brand-link` hit AA ≥4.5:1 on white**, plus reduced-motion). Give me a **prioritized list of proposed improvements before writing code.**
2. **Then implement** the high-value ones, iterating with localhost preview and verifying each change visually + for console errors.
3. **Preserve the template's principles:** keep the `--brand-*` / `--ui-*` tokens as the single swap point (never hardcode brand values — brand colors used in gradients/shadows go through the `-rgb` pairs); **never change font sizes** from the KO Minimalist baseline; keep the layout generic/brand-agnostic and the nav Style-Settings-driven; keep the `prefers-reduced-motion` behavior; and **keep the Editor Readability Guard as the final block.**
4. Keep it **self-contained and well-commented** so the next person can swap in a new brand (colors, gradient, imagery) in minutes.

Walk me through your assessment first, then let's polish it together.
