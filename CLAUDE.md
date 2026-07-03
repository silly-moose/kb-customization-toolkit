# KB Customization Toolkit — repo guide

You're in the **KB Customization Toolkit**: the shared, reusable how-to + assets for building custom KnowledgeOwl (KO) knowledge-base themes. This is the **source repo** (remote `silly-moose/kb-customization-toolkit`, a **live, public** git repo) — **not** a customer build.

> Building a *specific customer's* theme? That happens in a **duplicated `project-template/` folder elsewhere**, not here. In this folder you work **on the toolkit itself**.

## What a session opened here is usually for

- **Maintaining the toolkit** — editing the process docs / Minimalist defaults / reference CSS docs, or reviewing and applying the improvement log.
- **Building or polishing theme templates** — the subsystem lives in `process-docs/theme-templates/`; preview new templates against its `_reference-snapshots/`.

## Where to look (read these for detail — this file just points)

| For | Open |
|-----|------|
| Repo map + onboarding | `process-docs/00-README.md` |
| Rules governing customer builds | `project-template/CLAUDE-RULES.md` |
| Theme-template subsystem (build a new one + apply one) | `process-docs/theme-templates/README.md` |
| Suggestions / friction awaiting review | `improvement-log.md` *(local-only, git-ignored)* |

`project-template/` is what teammates **duplicate** per customer; its own `CLAUDE.md` bootstraps *those* copied sessions, not this one.

## Norms for working here

- **This is a live, public repo that customer sessions fetch from at build time** — anything pushed reaches the whole team on their next session. Change deliberately: **stage → verify → commit → push.**
- **Never commit internal or customer material** (prospect names, real KB content, subdomains, asset URLs, tokens). `improvement-log.md` is git-ignored for exactly this reason.
