# Onboarding: Using Claude Code for KB Customizations

A quick guide for teammates getting started with our Claude Code workflow for KnowledgeOwl knowledge base customization projects.

---

## What This Is

We use Claude Code to write and iterate on HTML/CSS/JS customizations for customer knowledge bases. Instead of git, we use a **folder-based version control system** — each set of changes gets its own dated, numbered folder. Each teammate keeps their project folders locally (the master template lives in a shared GitHub repo).

---

## Quick Setup: New Project

Use this when you're starting work on a customer's knowledge base for the first time.

1. **Duplicate** the `project-template/` folder from your local copy of the repo
2. **Rename** the copy to the customer's name (e.g., `BrightWork`)
3. **Rename** the inner `TEMPLATE-no-changes` folder to today's date: `YYYY.MM.DD-no-changes` (e.g., `2026.02.06-no-changes`)
4. **Fill in** `.claude/rules/project.md` with the customer name and KB
5. **Paste** the customer's current code into each file in the no-changes folder (one file per KnowledgeOwl Customize > Style section — plus the legacy `homepage-custom-content.html` if the KB has anything in Customize > Homepage > Custom content)
6. **Add screenshots** of the customer's current KB to the `Screenshots/` folder inside the no-changes folder
7. **Capture HTML snapshots** of the homepage and an article via Chrome DevTools and paste them into `full-html-snapshot-homepage.html` and `full-html-snapshot-article.html`
8. **Record the current Style Settings colors** (Customize > Style > Style Settings > Colors) — either screenshot each color swatch or paste the hex codes into `style-settings-colors.md` in the no-changes folder
9. **Drop reference materials** (e.g., screenshots, mockups, emails, Asana tasks, assets) into the `Reference/` folder
10. **Optional: Download the customer's marketing site** using the Save All Resources Chrome extension and add it to the `Reference/` folder — Claude can read the HTML/CSS to match their brand exactly

For the full walkthrough — including the file-to-KnowledgeOwl mapping table, the HTML snapshot steps, the marketing site download process, and a folder structure diagram — see `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` in the template repo (or ask Claude to fetch it).

**Once setup is complete**, open Claude Code in the customer folder and paste:
```
Review the no-changes folder and the reference materials in Reference/. Then let me know when you're ready to start.
```

**Or let Claude walk you through setup.** Open Claude Code in the customer folder and paste:
```
I'm starting a new project for [customer name]. Their KB is at [KB URL]. Walk me through the setup process.
```

---

## Quick Setup: Returning to an Existing Project

Use this when you're resuming work on a customer's knowledge base that you've worked on before.

1. **Open the customer's existing project folder** — don't create a new one
2. **Create a `YYYY.MM.DD-current-state` folder** (using today's date) if more than one day has passed since the last session (or sooner if you know changes were made directly in KnowledgeOwl)
3. **Pull fresh code** from the customer's live KB (copy from each Customize > Style section) into the `current-state` folder
4. **Add fresh screenshots** of the customer's current KB to the `Screenshots/` folder inside the `current-state` folder
5. **Capture fresh HTML snapshots** of the homepage and an article via Chrome DevTools and paste them into `full-html-snapshot-homepage.html` and `full-html-snapshot-article.html` in the `current-state` folder
6. **Update the `Reference/` folder** — remove outdated materials and add any new ones (e.g., screenshots, mockups, emails, Asana tasks, assets)

For the full walkthrough — including how Claude documents what changed since the last version, folder locking, and why refreshing supporting files matters — see the "Returning to an Existing Project After a Gap" section in `02-VERSION_CONTROL_PROCESS.md` (or ask Claude to fetch it).

**Once setup is complete**, open Claude Code in the customer folder and paste:
```
Review the current-state folder and the reference materials in Reference/. Then let me know when you're ready to start.
```

**Or let Claude walk you through setup.** Open Claude Code in the customer folder and paste:
```
I want to resume work on [customer name]. Walk me through the setup process so we can get started.
```

---

## How the Work Actually Happens

1. **Open Claude Code** in the customer's project folder — Claude automatically reads `CLAUDE.md` (which fetches the latest `CLAUDE-RULES.md` from GitHub) and `.claude/rules/project.md`, picking up the version control rules and project settings
2. **Tell Claude to review** the latest version folder and any relevant reference materials
3. **Describe the changes you need** — Claude writes the HTML/CSS/JS for you
4. **Claude creates versioned folders** as it works. Each set of substantial changes gets a new folder like `2026.02.06-v1`, `2026.02.06-v2`, etc., copied from the previous version
5. **Each version folder includes a `CHANGES_FROM_*.md`** file documenting what changed, which files were modified, and deployment instructions
6. **You deploy** by copying the updated file contents into the corresponding KnowledgeOwl fields — either to a sandbox for testing first, or directly to the live KB

---

## Starting a New Claude Code Session

Claude Code has no memory between sessions, but it **automatically reads `CLAUDE.md` and `.claude/rules/project.md`** at the start of every session. `CLAUDE.md` is a small bootstrap file that tells Claude to fetch the latest process rules (`CLAUDE-RULES.md`) from the GitHub repo. This ensures you always have the latest rules without any manual copying. `.claude/rules/project.md` contains customer-specific settings like the deployment target — if it's already set, Claude uses it automatically; otherwise it asks.

Claude also **syncs template files** at the start of each session — it fetches the latest KnowledgeOwl CSS reference docs from the repo and creates any missing project files (like `.claude/rules/project.md`) from the template. This means older customer projects automatically pick up new reference files without any manual copying.

Use the prompt templates from the Quick Setup checklists above to kick off each session.

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

Fill in the bracketed fields with your specific details. The more context you provide, the faster Claude can get back on track. If Claude had asked you for something specific (like an HTML snapshot), mention that too.

---

## Refreshing Process Rules Mid-Session

Claude fetches the latest `CLAUDE-RULES.md` from GitHub at the start of each session. If you know the rules were updated while a session is already in progress, you can ask Claude to re-fetch without starting a new session:

```
Fetch the latest CLAUDE-RULES.md from GitHub, save it locally, and follow the updated rules for the rest of this session.
```

---

## Version Control, Deployment, and Project Closeout

See `02-VERSION_CONTROL_PROCESS.md` for the full version control process, deployment instructions, rollback procedures, and project closeout checklist. Ask Claude to fetch it, or find it in the template repo. Claude handles versioning and deployment instructions automatically during sessions.

---

## Repo Structure

The template repo (https://github.com/silly-moose/kb-customization-toolkit) is organized into two folders:

| Folder | Purpose |
|--------|---------|
| `project-template/` | Duplicate this for each new customer project |
| `process-docs/` | Reference documentation — the single source of truth for all process docs. Claude fetches these directly from GitHub, so you never need a local copy. |

**What's in `project-template/`:**

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Auto-read by Claude Code at session start — bootstrap file that fetches the latest `CLAUDE-RULES.md` from GitHub |
| `CLAUDE-RULES.md` | Process rules fetched fresh from GitHub each session (local copy serves as fallback if fetch fails) |
| `.claude/rules/project.md` | Auto-read by Claude Code at session start — customer-specific settings (deployment target, project notes) |
| `Reference/` | KnowledgeOwl CSS reference docs (quirks + defaults) and space for customer-specific reference materials (e.g., screenshots, mockups, emails, Asana tasks, assets) |
| `TEMPLATE-no-changes/` | Blank files for all KnowledgeOwl code sections, HTML snapshots, screenshots folder, and CHANGES template |

**What's in `process-docs/`:**

| File | Purpose |
|------|---------|
| `00-README.md` | This file — onboarding overview for new teammates |
| `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` | Detailed step-by-step setup with file mappings and folder structure |
| `02-VERSION_CONTROL_PROCESS.md` | Full version control process with examples and rollback procedures |
| `03-LOCALHOST_PREVIEW.md` | Optional localhost preview for faster CSS iteration |

---

## Prerequisites

Before getting started, make sure you have:

- **Visual Studio Code (VS Code), or a comparable code editor** — for opening code files and copying updated code into customers' KBs. Download VS Code at https://code.visualstudio.com
- **Claude desktop app** — Claude Code runs inside the desktop app (the web version at claude.ai isn't optimal for this workflow). Download at https://claude.ai/download

---

## Getting the Project Template

The project template lives in a shared GitHub repo: https://github.com/silly-moose/kb-customization-toolkit

You need a copy of the `project-template/` folder so you can duplicate it for each new customer. There are two ways to get it: **manual download** (simplest) or **Git** (faster for repeat updates, if you have it installed). You don't need the `process-docs/` folder locally — Claude fetches those directly from GitHub whenever you ask about the process.

### Option A: Manual download from GitHub

1. Go to https://github.com/silly-moose/kb-customization-toolkit
2. Click the green **Code** button → **Download ZIP**
3. Unzip and use the `project-template/` folder inside

**Before starting a new project**, re-download the ZIP to make sure you have the latest template.

### Option B: Using Git (if you have it installed)

Git makes it easy to pull the latest template updates before each new project.

**First time (one-time setup):**

You don't need to know git commands — just open Claude Code and paste this prompt:
```
Check if git is installed on my machine. If it is, clone https://github.com/silly-moose/kb-customization-toolkit.git into my current directory.
```
Claude will check for git and download the repo for you.

Or if you prefer to run the command yourself:
```
git clone https://github.com/silly-moose/kb-customization-toolkit.git
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

---

## Tips

### Foundational

- **Use the most powerful Claude model available.** Coding tasks benefit from the strongest model — as of March 2026, that's **Opus 4.6**.
- **The `no-changes` folder is your safety net.** If anything goes wrong, you can always roll back to the customer's original code.

### Giving Claude context

- **Screenshots matter.** Claude can read images, so before/after screenshots help it understand what the KB looks like and what needs to change. Use full-page screenshots when possible (in Chrome: open DevTools, press **Cmd+Shift+P** / **Ctrl+Shift+P**, type `screenshot`, select **Capture full size screenshot**) — they capture content below the fold that regular screenshots miss.
- **The HTML snapshot gives Claude context** about the full rendered page structure, including elements generated by KnowledgeOwl's templates that aren't visible in the Custom HTML fields alone.
- **If a customer has no existing custom code**, leave the placeholder comments in the no-changes files as-is. They serve as a record that the fields were empty at project start.

### Working with Claude

- **Work on one request at a time.** Give Claude a single task, confirm the changes are correctly implemented, then move on to the next one. Stacking multiple requests in a single prompt increases the chance of errors or missed details.
- **Ask Claude about the process.** Process docs live in the GitHub repo (the single source of truth) and Claude fetches them directly on demand — no local copy needed. Just ask things like "what are the steps for returning to a project?" or "what's the project closeout process?"
- **Let Claude draft customer emails.** Once all changes are implemented, ask Claude to write a summary email for the customer. It can reference the CHANGES files to describe what was done.

### Workflow productivity

- **Mac tip: Copy any file or folder path instantly.** Select the item in Finder and press **Option+Command+C** — the full pathname is copied to your clipboard, ready to paste into Claude Code. Alternatively, enable the Finder path bar (View > Show Path Bar or **Command+Option+P**) for a clickable breadcrumb at the bottom of every Finder window; right-click any segment to copy its path. Either way, pasting paths directly beats typing them — e.g., "Review the files in `/Users/.../BrightWork/Reference/`".
- **`.claude/rules/project.md` is hidden by default in Finder and File Explorer.** Any file or folder starting with a dot (`.`) is hidden on macOS and Windows. To see it: on **Mac**, press **Command + Shift + .** in Finder; on **Windows**, go to **View > Show > Hidden items** in File Explorer. The easiest workaround: open the project folder in **VS Code**, which shows dotfiles without any toggling.
