# Polish handoff prompt — modern-docs template

Paste this into a fresh Claude Code session to deeply polish the template. **Best opened in the toolkit repo** (`*kb-customization-toolkit`) — it has the KO CSS reference docs and the localhost-preview process doc — while you edit the template file at the path below.

---

I want to thoroughly polish a reusable KnowledgeOwl theme template — the **"modern-docs" template** — to make it as high-quality as possible.

**The template lives here (relative to the toolkit repo root):**
`process-docs/theme-templates/modern-docs/`
Start by reading its `README.md` (what it is, the `--brand-*` / `--ui-*` swap point, the build rules, and a list of known polish opportunities), then skim `custom-css.css` (the theme layer is below the `MODERN-DOCS THEME` banner).

**Reference + preview resources:**
- **Localhost preview** — follow `../../03-LOCALHOST_PREVIEW.md`, rendering the CSS against the bundled reference snapshots in `../_reference-snapshots/` (a genericized homepage + article — no live build needed).
- The KO CSS reference docs in `../../../project-template/Reference/` (`knowledgeowl-css-quirks.md`, `knowledgeowl-css-defaults.md`).

**Goal:** genuinely excellent. Assess improvement opportunities broadly and implement the ones that raise quality. Draw ideas from anywhere — **Mintlify** (feel free to inspect mintlify.com or their docs with Claude-in-Chrome), and other best-in-class docs sites (GitBook, Stripe docs, Notion, Linear), plus your own judgment.

**Please work in this order:**
1. **Assess first.** Audit the template across *every* page type (homepage, article, **category, search, login, reader-subscriptions, 404, restricted-access**), plus typography, spacing/rhythm, the glow/depth effects, the animated ambient, the TOC, responsive/mobile, dark-mode potential, and accessibility (color contrast, reduced-motion). Give me a **prioritized list of proposed improvements before writing code.**
2. **Then implement** the high-value ones, iterating with localhost preview against the KB snapshots and verifying each change visually + for console errors.
3. **Preserve the template's principles:** keep the `--brand-*` / `--ui-*` tokens as the single swap point (never hardcode brand values — brand colors used in effects go through the `-rgb` pairs); **never change font sizes** from the KO Minimalist baseline; keep the layout generic/brand-agnostic; keep the `prefers-reduced-motion` guard.
4. Keep it **self-contained and well-commented** so the next person can swap in a new brand (colors, fonts, imagery) in minutes.

Walk me through your assessment first, then let's polish it together.
