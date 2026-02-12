# Onboarding: Using Claude Code for KB Customizations

A quick guide for teammates getting started with our Claude Code workflow for KnowledgeOwl knowledge base customization projects.

---

## What This Is

We use Claude Code (Anthropic's CLI tool) to write and iterate on CSS/HTML customizations for customer knowledge bases. Instead of git, we use a **folder-based version control system** — each set of changes gets its own dated, numbered folder. Each teammate keeps their project folders locally (the master template lives in a shared GitHub repo).

---

## The Quick Setup (Per Customer)

1. **Duplicate** the `project-template/` folder from your local copy of the repo
2. **Rename** the copy to the customer's name (e.g., `Acme`)
3. **Rename** the inner `TEMPLATE-no-changes` folder to today's date: `YYYY.MM.DD-no-changes` (e.g., `2026.02.06-no-changes`)
4. **Fill in** `.claude/rules/project.md` with the customer name and KB
5. **Paste** the customer's current code into each file in the no-changes folder (each file maps 1:1 to a KnowledgeOwl Customize > Style section)
6. **Add screenshots** of the customer's current KB to the `Screenshots/` folder inside the no-changes folder
7. **Capture an HTML snapshot** of the homepage via Chrome DevTools and paste it into `homepage-full-html-snapshot.html`
8. **Drop reference materials** (mockups, Asana exports, assets) into the `Reference/` folder
9. **Optional: Download the customer's marketing site** using the Save All Resources Chrome extension and add it to the `Reference/` folder — Claude can read the HTML/CSS to match their brand exactly

For the full walkthrough — including the file-to-KnowledgeOwl mapping table, the HTML snapshot steps, the marketing site download process, and a folder structure diagram — see `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` in the template repo (or ask Claude to fetch it).

---

## How the Work Actually Happens

1. **Open Claude Code** in the customer's project folder — Claude automatically reads `CLAUDE.md` and `.claude/rules/project.md` and picks up the version control rules and project settings
2. **Tell Claude to review** the latest version folder and any relevant reference materials
3. **Describe the changes you need** — Claude writes the CSS/HTML for you
4. **Claude creates versioned folders** as it works. Each set of substantial changes gets a new folder like `2026.02.06-v1`, `2026.02.06-v2`, etc., copied from the previous version
5. **Each version folder includes a `CHANGES_FROM_*.md`** file documenting what changed, which files were modified, and deployment instructions
6. **You deploy** by copying the updated file contents into the corresponding KnowledgeOwl fields — either to a sandbox for testing first, or directly to the live KB

---

## Starting a New Claude Code Session

Claude Code has no memory between sessions, but it **automatically reads `CLAUDE.md` and `.claude/rules/project.md`** at the start of every session. `CLAUDE.md` contains the universal version control rules; `.claude/rules/project.md` contains customer-specific settings like the deployment target. If the deployment target is already set in the project file, Claude uses it automatically — otherwise it asks.

Claude also **auto-updates `CLAUDE.md`** from the GitHub repo at the start of each session, so you always have the latest process rules without any manual copying.

All you need to do is paste the appropriate prompt to kick things off:

**First session on a new project** (only the `no-changes` folder exists):
```
Review the no-changes folder and the reference materials in Reference/. Then let me know when you're ready to start.
```

**Returning to an existing project** (version folders already exist):
```
Review the current-state folder and the reference materials in Reference/. Then let me know when you're ready to start.
```

(Before pasting this prompt, you'll need to create a `current-state` snapshot — see "Returning to an Existing Project After a Gap" in the version control process doc, or ask Claude about the steps.)

---

## Resuming After a Session Interruption

Sometimes Claude Code hits an error or context limit mid-task, forcing you to start a new session. When this happens, you need to give Claude enough context to pick up where you left off. Use this prompt template:

```
My previous Claude Code session was interrupted. Here's where I left off:

- **Working in:** [path to the version folder you were editing, e.g., /Users/myname/Documents/CustomerName/2026.02.12-v7]
- **Task:** [what you were working on, e.g., "Increase spacing above category titles on the blog-style layout"]
- **Reference:** [path to any relevant reference files, e.g., mockups or screenshots]

Review the latest version folder and the CHANGES file, then let me know when you're ready to continue.
```

Fill in the bracketed fields with your specific details. The more context you provide, the faster Claude can get back on track. If you were waiting on something specific (like providing an HTML snapshot), mention that too.

---

## Version Control at a Glance

- **`YYYY.MM.DD-no-changes`** — The untouched backup of the customer's original code. Never modify this.
- **`YYYY.MM.DD-v1`, `v2`, `v3`...** — Each iteration of changes. Created by copying the previous version and editing only the new copy. Version numbers always increment (they never reset, even across days).
- **`CHANGES_FROM_*.md`** — Inside each version folder, documents what changed and includes deployment instructions. The first version's file is named `CHANGES_FROM_no-changes.md`; subsequent versions use `CHANGES_FROM_v[previous].md`.

**Rollback** is straightforward: just deploy files from an earlier version folder.

For full details on when to create new versions and naming rules, ask Claude to fetch `02-VERSION_CONTROL_PROCESS.md` from the template repo.

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

Use `03-PROJECT_HANDOFF_CHECKLIST.md` (in the template repo) to make sure nothing is missed. It covers pre-deployment verification, production deployment, post-deployment testing, and feeding process improvements back into the master template. You can ask Claude to fetch it during a session.

---

## Repo Structure

The template repo (https://github.com/spongetimblin/kb-customization-toolkit) is organized into two folders:

| Folder | Purpose |
|--------|---------|
| `project-template/` | Duplicate this for each new customer project |
| `process-docs/` | Reference documentation — the single source of truth for all process docs. Claude fetches these directly from GitHub, so you never need a local copy. |

**What's in `project-template/`:**

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Auto-read by Claude Code at session start — universal process rules (auto-updated from GitHub) |
| `.claude/rules/project.md` | Auto-read by Claude Code at session start — customer-specific settings (deployment target, project notes) |
| `Reference/` | KnowledgeOwl CSS quirks doc and space for customer-specific reference materials (mockups, assets, etc.) |
| `TEMPLATE-no-changes/` | Blank files for all KnowledgeOwl code sections, screenshots folder, and CHANGES template |

**What's in `process-docs/`:**

| File | Purpose |
|------|---------|
| `00-README.md` | This file — onboarding overview for new teammates |
| `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` | Detailed step-by-step setup with file mappings and folder structure |
| `02-VERSION_CONTROL_PROCESS.md` | Full version control process with examples and rollback procedures |
| `03-PROJECT_HANDOFF_CHECKLIST.md` | Checklist for deployment and project completion |

---

## Prerequisites

Before getting started, make sure you have:

- **Visual Studio Code (VS Code)** — for opening code files and copying updated code into customers' KBs. Download at https://code.visualstudio.com
- **Claude desktop app** — Claude Code runs inside the desktop app (the web version at claude.ai isn't optimal for this workflow). Download at https://claude.ai/download
- **Claude Code** — Anthropic's CLI tool for writing and editing code. See your team lead for setup instructions.
- **Git** *(optional but recommended)* — for cloning and updating the project template repo. Not required — you can also download the template manually from GitHub (see "Getting the Project Template" below). Pre-installed on macOS (verify with `git --version` in Terminal). On Windows, download and install from https://git-scm.com/downloads/win — use the default settings during installation.

---

## Getting the Project Template

The project template lives in a shared GitHub repo: https://github.com/spongetimblin/kb-customization-toolkit

You need a copy of the `project-template/` folder so you can duplicate it for each new customer. There are two ways to get it: **Git** (recommended) or **manual download**. You don't need the `process-docs/` folder locally — Claude fetches those directly from GitHub whenever you ask about the process.

### Option A: Using Git (recommended)

Git makes it easy to pull the latest template updates before each new project.

**First time (one-time setup):**

You don't need to know git commands — just open Claude Code and paste this prompt:
```
Check if git is installed on my machine. If it is, clone https://github.com/spongetimblin/kb-customization-toolkit.git into my current directory.
```
Claude will check for git and download the repo for you.

Or if you prefer to run the command yourself:
```
git clone https://github.com/spongetimblin/kb-customization-toolkit.git
```

**Before starting a new project** *(assumes you've already cloned the repo in the one-time setup above)*:

Paste this prompt into Claude Code to get the latest template updates:
```
Pull the latest updates from the kb-customization-toolkit repo. It's in [path to your local copy, e.g., /Users/myname/Documents/kb-customization-toolkit].
```

Or run the command yourself:
```
cd /path/to/kb-customization-toolkit
git pull
```

### Option B: Manual download from GitHub

If you don't have Git installed, you can download the template directly:

1. Go to https://github.com/spongetimblin/kb-customization-toolkit
2. Click the green **Code** button → **Download ZIP**
3. Unzip and use the `project-template/` folder inside

**Before starting a new project**, re-download the ZIP to make sure you have the latest template.

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
- **Ask Claude about the process.** Process docs live in the GitHub repo (the single source of truth) and Claude fetches them directly on demand — no local copy needed. Just ask things like "what are the steps for returning to a project?" or "show me the handoff checklist."
- **Mac tip: Enable the Finder path bar** (Finder > View > Show Path Bar). This adds a clickable path at the bottom of every Finder window. Right-click any segment to copy the full pathname, then paste it directly into Claude Code — e.g., "Review the files in `/Users/.../Acme/Reference/`". Much faster than typing paths manually.
- **Work on one request at a time.** Give Claude a single task, confirm the changes are correctly implemented, then move on to the next one. Stacking multiple requests in a single prompt increases the chance of errors or missed details.
- **Let Claude draft customer emails.** Once all changes are implemented, ask Claude to write a summary email for the customer. It can reference the CHANGES files to describe what was done.
