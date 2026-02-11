# Onboarding: Using Claude Code for KB Customizations

A quick guide for teammates getting started with our Claude Code workflow for KnowledgeOwl knowledge base customization projects.

---

## What This Is

We use Claude Code (Anthropic's CLI tool) to write and iterate on CSS/HTML customizations for customer knowledge bases. Instead of git, we use a **folder-based version control system** — each set of changes gets its own dated, numbered folder. Each teammate keeps their project folders locally (the master template lives in a shared GitHub repo).

---

## The Quick Setup (Per Customer)

1. **Duplicate** the `TEMPLATE-new-project` folder
2. **Rename** the copy to the customer's name (e.g., `Acme`)
3. **Rename** the inner `TEMPLATE-no-changes` folder to today's date: `YYYY.MM.DD-no-changes` (e.g., `2026.02.06-no-changes`)
4. **Paste** the customer's current code into each file in the no-changes folder (each file maps 1:1 to a KnowledgeOwl Customize > Style section)
5. **Add screenshots** of the customer's current KB to the `Screenshots/` folder inside the no-changes folder
6. **Capture an HTML snapshot** of the homepage via Chrome DevTools and paste it into `homepage-full-html-snapshot.html`
7. **Drop reference materials** (mockups, Asana exports, assets) into a `Reference/` folder at the project root
8. **Optional: Download the customer's marketing site** using the Save All Resources Chrome extension and add it to the `Reference/` folder — Claude can read the HTML/CSS to match their brand exactly

For the full walkthrough — including the file-to-KnowledgeOwl mapping table, the HTML snapshot steps, the marketing site download process, and a folder structure diagram — see `01-KB_CUSTOMIZATION_PROJECT_SETUP.md`.

---

## How the Work Actually Happens

1. **Open Claude Code** in the customer's project folder — Claude automatically reads `CLAUDE.md` and picks up the version control rules
2. **Tell Claude to review** the latest version folder and any relevant reference materials
3. **Describe the changes you need** — Claude writes the CSS/HTML for you
4. **Claude creates versioned folders** as it works. Each set of substantial changes gets a new folder like `2026.02.06-v1`, `2026.02.06-v2`, etc., copied from the previous version
5. **Each version folder includes a `CHANGES_FROM_*.md`** file documenting what changed, which files were modified, and deployment instructions
6. **You deploy** by copying the updated file contents into the corresponding KnowledgeOwl fields — either to a sandbox for testing first, or directly to the live KB

---

## Starting a New Claude Code Session

Claude Code has no memory between sessions, but it **automatically reads `CLAUDE.md`** at the start of every session. This file contains all the version control rules, so Claude picks up the conventions without you having to tell it. Claude will also ask you whether you're deploying to a sandbox or live KB, and what you want to work on.

All you need to do is paste the appropriate prompt to kick things off:

**First session on a new project** (only the `no-changes` folder exists):
```
Review the no-changes folder and the reference materials in Reference/. Then let me know when you're ready to start.
```

**Returning to an existing project** (version folders already exist):

Before starting a new session, copy the latest `CLAUDE.md` and other project docs from `TEMPLATE-new-project` into the customer folder, then create a fresh `YYYY.MM.DD-current-state` snapshot of the live KB code (see "Returning to an Existing Project After a Gap" in `02-VERSION_CONTROL_PROCESS.md` for full steps). Then:
```
Review the current-state folder and the reference materials in Reference/. Then let me know when you're ready to start.
```

---

## Version Control at a Glance

- **`YYYY.MM.DD-no-changes`** — The untouched backup of the customer's original code. Never modify this.
- **`YYYY.MM.DD-v1`, `v2`, `v3`...** — Each iteration of changes. Created by copying the previous version and editing only the new copy. Version numbers always increment (they never reset, even across days).
- **`CHANGES_FROM_*.md`** — Inside each version folder, documents what changed and includes deployment instructions. The first version's file is named `CHANGES_FROM_no-changes.md`; subsequent versions use `CHANGES_FROM_v[previous].md`.

**Rollback** is straightforward: just deploy files from an earlier version folder.

For full details on when to create new versions and naming rules, see `02-VERSION_CONTROL_PROCESS.md`.

---

## Deploying Changes

Claude's `CHANGES_FROM_*.md` notes tell you exactly what to do, but the pattern is always:

1. Open the file from the latest version folder in VS Code
2. Copy its contents
3. Paste into the matching KnowledgeOwl field (Customize > Style (HTML & CSS) > the relevant section)
4. Verify the changes look and work correctly
5. If deploying to a sandbox, move changes to production once the customer approves

---

## Finishing a Project

Use `03-PROJECT_HANDOFF_CHECKLIST.md` to make sure nothing is missed. It covers pre-deployment verification, production deployment, post-deployment testing, and feeding process improvements back into the master template.

---

## What's in the Template Folder

| File | Purpose |
|------|---------|
| `00-README.md` | This file — onboarding overview for new teammates |
| `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` | Detailed step-by-step setup with file mappings and folder structure |
| `02-VERSION_CONTROL_PROCESS.md` | Full version control process with examples and rollback procedures |
| `03-PROJECT_HANDOFF_CHECKLIST.md` | Checklist for deployment and project completion |
| `CLAUDE.md` | Auto-read by Claude Code at session start — contains the version control rules Claude follows |
| `Reference/` | KnowledgeOwl CSS quirks doc and space for customer-specific reference materials (mockups, assets, etc.) |
| `TEMPLATE-no-changes/` | Blank files for all KnowledgeOwl code sections, screenshots folder, and CHANGES template |
| `.claude/` | Claude Code project settings (auto-generated, no need to edit) |

---

## Prerequisites

Before getting started, make sure you have:

- **Visual Studio Code (VS Code)** — for opening code files and copying updated code into customers' KBs. Download at https://code.visualstudio.com
- **Claude desktop app** — Claude Code runs inside the desktop app (the web version at claude.ai isn't optimal for this workflow). Download at https://claude.ai/download
- **Claude Code** — Anthropic's CLI tool for writing and editing code. See your team lead for setup instructions.
- **Git** — for cloning and updating the template repo. Pre-installed on macOS (verify with `git --version` in Terminal).

---

## Getting the Template

This template lives in a shared GitHub repo: https://github.com/spongetimblin/TEMPLATE-new-project

**First time (one-time setup):**

You don't need to know git commands — just open Claude Code and paste this prompt:
```
Check if git is installed on my machine. If it is, clone https://github.com/spongetimblin/TEMPLATE-new-project.git into my current directory.
```
Claude will check for git and download the template folder for you.

Or if you prefer to run the command yourself:
```
git clone https://github.com/spongetimblin/TEMPLATE-new-project.git
```

**Before starting a new project** *(assumes you've already cloned the repo in the one-time setup above)*:

Paste this prompt into Claude Code to get the latest template updates:
```
Pull the latest updates from the TEMPLATE-new-project repo.
```

Or run the command yourself:
```
cd /path/to/TEMPLATE-new-project
git pull
```

This ensures you have the latest version of the process docs and templates before duplicating.

---

## Git Cheat Sheet

For Chad (template maintainer) — the commands for updating the template repo:

| What you want to do | Command | What it does |
|----------------------|---------|--------------|
| See what's changed | `git status` | Lists new, modified, and staged files |
| Stage specific files | `git add filename` | Marks files to include in the next commit |
| Stage everything | `git add -A` | Stages all new and changed files at once |
| Save a snapshot locally | `git commit -m "description"` | Bundles staged changes into a named commit on your machine |
| Send commits to GitHub | `git push` | Uploads your local commits so others can see them |

**The typical flow:** make changes → `git add` → `git commit` → `git push`.

You can also just ask Claude Code to "commit and push my changes" and it will handle the commands for you.

---

## Tips

- **The `no-changes` folder is your safety net.** If anything goes wrong, you can always roll back to the customer's original code.
- **Screenshots matter.** Claude can read images, so before/after screenshots help it understand what the KB looks like and what needs to change.
- **The HTML snapshot gives Claude context** about the full rendered page structure, including elements generated by KnowledgeOwl's templates that aren't visible in the Custom HTML fields alone.
- **If a customer has no existing custom code**, leave the placeholder comments in the no-changes files as-is. They serve as a record that the fields were empty at project start.
- **Mac tip: Enable the Finder path bar** (Finder > View > Show Path Bar). This adds a clickable path at the bottom of every Finder window. Right-click any segment to copy the full pathname, then paste it directly into Claude Code — e.g., "Review the files in `/Users/.../Acme/Reference/`". Much faster than typing paths manually.
