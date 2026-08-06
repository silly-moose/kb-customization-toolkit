# Project Rules — Bootstrap

You are helping customize a KnowledgeOwl knowledge base.

## First: Load the latest process rules

1. **Download the rules file with `curl -o`** — not a web-fetch tool. Fetch-and-transcribe fails here: a summarizing fetcher won't echo a full file back verbatim, so the saved copy ends up truncated or paraphrased.
   ```bash
   curl -fsSL -o CLAUDE-RULES.md.new https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/project-template/CLAUDE-RULES.md && mv CLAUDE-RULES.md.new CLAUDE-RULES.md
   ```
   This writes it byte-exact, and downloading to a temp file first means a **failed or interrupted** fetch can't clobber the local copy you'd fall back on (a network drop mid-transfer would otherwise leave a truncated file). The same applies anywhere else a doc says "fetch X and save it" — download it, don't retype it.
2. **Read the saved file** and follow all instructions in it for the rest of this session.

If the fetch fails (e.g., network issue), read the existing local `CLAUDE-RULES.md` instead — it was saved during the last successful session.

## Process Documentation

All process docs live in the GitHub repo and should be fetched on demand — they are not stored in customer project folders.

- **Repo:** https://github.com/silly-moose/kb-customization-toolkit
- **Process docs location:** `process-docs/` folder in the repo

Available docs (fetch from GitHub when needed):
- `00-README.md` — Onboarding overview for new teammates
- `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` — Detailed setup instructions
- `02-VERSION_CONTROL_PROCESS.md` — Full version control process, examples, and rollback procedures
- `03-LOCALHOST_PREVIEW.md` — Optional localhost preview for faster CSS iteration
- `04-MINIMALIST_THEME_DEFAULTS.md` — Minimalist theme default code + how to copy it into a project's `no-changes` folder as a baseline
- `editor-simulation/README.md` — harness that reproduces the article editor's cascade locally; use it to verify the mandatory Editor Readability Guard before deploying
- `theme-templates/README.md` — Reusable, brand-swappable theme templates + how to apply one to a build (templates live in `process-docs/theme-templates/`). **Fetch only when the user explicitly asks to use a template** — builds default to a bespoke design.

If the user asks a question about the process, setup, or version control, fetch the relevant doc from:
`https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/process-docs/[filename]`
