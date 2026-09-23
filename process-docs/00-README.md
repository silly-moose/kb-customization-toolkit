# Onboarding: Using Claude Code for KB Customizations

A quick guide for teammates getting started with our Claude Code workflow for KnowledgeOwl knowledge base customization projects.

---

## What This Is

We use Claude Code to write and iterate on HTML/CSS/JS customizations for customer knowledge bases. Instead of git, we use a **folder-based version control system** — each set of changes gets its own dated, numbered folder. Each teammate keeps their project folders locally (the master template lives in a shared GitHub repo).

---

## Quick Setup: New Project

Use this when you're starting work on a customer's knowledge base for the first time.

1. **Duplicate** the `project-template/` folder from your local copy of the repo
2. **Rename** the copy to the customer's name (e.g., `Acme`)
3. **Rename** the inner `TEMPLATE-no-changes` folder to today's date: `YYYY.MM.DD-no-changes` (e.g., `2026.02.06-no-changes`)
4. **Fill in** `.claude/rules/project.md` with the customer name and KB
5. **Drop reference materials** (e.g., screenshots, mockups, emails, Asana tasks, assets) into the `Reference/` folder
6. **Optional: Download the customer's marketing site** using the Save All Resources Chrome extension and add it to the `Reference/` folder. Claude can read the HTML/CSS to match their brand exactly
7. **Open Claude Code in the customer folder and paste:**
   ```
   Capture the baseline for [customer name]'s KB at [KB URL], then review Reference/ and let me know when you're ready to start.
   ```
8. **Sign in to KnowledgeOwl when Claude asks**, in the browser pane inside the Claude app. KO staff: use Super Admin "log in as" a user with Style admin rights, because every save is credited to whoever is signed in. Claude never types credentials.

Claude then captures the baseline itself: all 12 Customize > Style fields, the legacy homepage field, the Style Settings and HTML snapshots of the homepage and an article, each checked against the live KB. It also audits content-level CSS (Library > Snippets *and* a rendered article or two, because a `<style>` block in page content loads after Custom CSS and can override the theme), records the one-time facts under `# Baseline` in `.claude/rules/project.md`, asks once whether you want to add screenshots, and locks the folder. How it works: `05-BROWSER_CAPTURE_AND_DEPLOY.md`.

**No built-in browser?** In a terminal or IDE session, use the manual path: KnowledgeOwl teammates run the `ko-code-capture` bookmarklet (Silly Moose > Engineering > Dev) and unzip it into the no-changes folder; anyone else pastes each field into its file. `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` §2 has the file-to-KnowledgeOwl mapping table, the DevTools snapshot steps and a folder structure diagram.

---

## Quick Setup: Returning to an Existing Project

Use this when you're resuming work on a customer's knowledge base that you've worked on before.

1. **Open the customer's existing project folder.** Don't create a new one
2. **Update the `Reference/` folder**: remove outdated materials and add any new ones (e.g., screenshots, mockups, emails, Asana tasks, assets)
3. **Open Claude Code in the folder and paste:**
   ```
   I want to resume work on [customer name]. Check the live KB for changes, then let me know when you're ready to start.
   ```
4. **Sign in to KnowledgeOwl in the browser pane if Claude asks**

If more than a day has passed, Claude reads the live KB and compares it with the project's folders. If nothing changed outside the project, it says so and you carry on. If something did, it captures a `YYYY.MM.DD-current-state` folder, writes down what drifted, locks it, and builds the next version from it. Screenshots are optional; Claude asks once. The full walkthrough is the "Returning to an Existing Project After a Gap" section in `02-VERSION_CONTROL_PROCESS.md`; without the built-in browser you paste the fields as before (05's manual path).

---

## How the Work Actually Happens

1. **Open Claude Code** in the customer's project folder — Claude automatically reads `CLAUDE.md` (which fetches the latest `CLAUDE-RULES.md` from GitHub) and `.claude/rules/project.md`, picking up the version control rules and project settings
2. **Tell Claude to review** the latest version folder and any relevant reference materials
3. **Describe the changes you need** — Claude writes the HTML/CSS/JS for you
4. **Claude creates versioned folders** as it works. Each set of substantial changes gets a new folder like `2026.02.06-v1`, `2026.02.06-v2`, etc., copied from the previous version
5. **Each version folder includes a `CHANGES_FROM_*.md`** file documenting what changed, which files were modified, and what it deploys
6. **Claude deploys, after your yes.** It lists exactly what it will save to which KB (a sandbox first, or the live KB), waits for you to say yes, saves through the browser pane, checks that what KO stored matches the files, and records the save in `DEPLOYMENTS.md`. You upload any images (logo, favicon, hero), because the pane has no file picker. If Claude's click on Save is refused, you click Save in the pane; nobody pastes code

---

## Starting a New Claude Code Session

Claude Code has no memory between sessions, but it **automatically reads `CLAUDE.md` and `.claude/rules/project.md`** at the start of every session. `CLAUDE.md` is a small bootstrap file that tells Claude to fetch the latest process rules (`CLAUDE-RULES.md`) from the GitHub repo. This ensures you always have the latest rules without any manual copying. `.claude/rules/project.md` contains customer-specific settings like the deployment target — if it's already set, Claude uses it automatically; otherwise it asks.

Claude also **syncs template files** at the start of each session — it fetches the latest KnowledgeOwl CSS reference docs and the capture-and-deploy helpers (`.claude/kb-io/`) from the repo and creates any missing project files (like `.claude/rules/project.md`) from the template. This means older customer projects automatically pick up new reference files without any manual copying.

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

See `02-VERSION_CONTROL_PROCESS.md` for the full version control process, deployment, rollback procedures, and project closeout checklist, and `05-BROWSER_CAPTURE_AND_DEPLOY.md` for how Claude captures and deploys. Ask Claude to fetch them, or find them in the template repo. Claude handles versioning and deploys during sessions.

---

## Continuous Improvement (Reflect & Improve)

Every session, Claude adds any **suggest-only** improvement ideas — things that errored, stale references, wasted steps, or missing CSS gotchas — directly to the `AWAITING REVIEW` section of the central `improvement-log.md` in the toolkit, one tagged entry per idea. Claude never applies changes to the toolkit itself during a session.

At **project closeout**, Claude reviews and de-dupes `AWAITING REVIEW`. Chad reviews the items, applies the good ones to the toolkit (Claude can make the edits in a toolkit-repo session), moves each into `APPLIED` / `DECLINED` / `DEFERRED`, and pushes — and because `CLAUDE-RULES.md` and the CSS reference docs are re-fetched from GitHub every session, accepted changes reach the whole team automatically on their next session.

Teammates other than Chad don't have the central log; if their Claude hits friction, it just flags it and suggests they share the idea with Chad in Slack.

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
| `.claude/rules/project.md` | Auto-read by Claude Code at session start — customer-specific settings (deployment target, deploy targets, one-time baseline facts, project notes) |
| `.claude/launch.json` | Dev-server config for the optional localhost preview (see `03-LOCALHOST_PREVIEW.md`) |
| `DEPLOYMENTS.md` | One row per save and drift check: which version reached which KB, when, and whether the read-back passed. Claude writes it |
| `Reference/` | KnowledgeOwl CSS reference docs (quirks + defaults) and space for customer-specific reference materials (e.g., screenshots, mockups, emails, Asana tasks, assets) |
| `TEMPLATE-no-changes/` | Blank files for all KnowledgeOwl code sections, HTML snapshots, screenshots folder, `style-settings-colors.md`, and CHANGES template |

**What's in `process-docs/`:**

| File | Purpose |
|------|---------|
| `00-README.md` | This file — onboarding overview for new teammates |
| `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` | Detailed step-by-step setup with file mappings and folder structure |
| `02-VERSION_CONTROL_PROCESS.md` | Full version control process with examples and rollback procedures |
| `03-LOCALHOST_PREVIEW.md` | Optional localhost preview for faster CSS iteration |
| `04-MINIMALIST_THEME_DEFAULTS.md` | The Minimalist theme's stock default code (Custom CSS/HTML/`<head>`) + how to copy it into a project's `no-changes` folder as a baseline |
| `05-BROWSER_CAPTURE_AND_DEPLOY.md` | How Claude captures a KB and deploys versions through the built-in browser: sign-in, the yes before each save, the save gate and read-back, uploads, and the manual path. The helpers it uses are in `kb-io/` |
| `editor-simulation/` | A ready-made harness that reproduces the article editor's CSS cascade locally, so the mandatory Editor Readability Guard can be verified **before** deploying instead of eyeballed after. Start at its `README.md`. |
| `theme-templates/` | Reusable, brand-swappable theme templates (each a subfolder) + how to apply one in a build and how to build new ones. Start at `theme-templates/README.md`. **Opt-in:** a build starts from a template only if you ask — otherwise Claude designs bespoke. |

---

## Prerequisites

Before getting started, make sure you have:

- **Claude desktop app**: Claude Code runs inside the desktop app, and its built-in browser pane is what lets Claude capture and deploy KB code for you. In a terminal or IDE session there is no pane, so you fall back to pasting (05's manual path). Download at https://claude.ai/download
- **Optional: Visual Studio Code (VS Code), or a comparable code editor**, for reading the project's files. You no longer copy code into KB fields by hand. Download VS Code at https://code.visualstudio.com

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

- **Use the most powerful Claude model available.** Coding tasks benefit from the strongest model — pick the most capable option in Claude Code's model picker (model names change; "most capable" doesn't).
- **The `no-changes` folder is your safety net.** If anything goes wrong, you can always roll back to the customer's original code.

### Giving Claude context

- **Screenshots matter.** Claude can read images, so before/after screenshots help it understand what the KB looks like and what needs to change. Use full-page screenshots when possible (in Chrome: open DevTools, press **Cmd+Shift+P** / **Ctrl+Shift+P**, type `screenshot`, select **Capture full size screenshot**) — they capture content below the fold that regular screenshots miss.
- **The HTML snapshot gives Claude context** about the full rendered page structure, including elements generated by KnowledgeOwl's templates that aren't visible in the Custom HTML fields alone.
- **Placeholders mean "not captured".** When Claude captures a KB, an empty field becomes an empty file and every other field holds exactly what KO has. A file that still contains only its template comment ("Paste customer's ...") was never captured, and Claude never deploys it.

### Working with Claude

- **Work on one request at a time.** Give Claude a single task, confirm the changes are correctly implemented, then move on to the next one. Stacking multiple requests in a single prompt increases the chance of errors or missed details.
- **Ask Claude about the process.** Process docs live in the GitHub repo (the single source of truth) and Claude fetches them directly on demand — no local copy needed. Just ask things like "what are the steps for returning to a project?" or "what's the project closeout process?"
- **Let Claude draft customer emails.** Once all changes are implemented, ask Claude to write a summary email for the customer. It can reference the CHANGES files to describe what was done.

### Workflow productivity

- **Mac tip: Copy any file or folder path instantly.** Select the item in Finder and press **Option+Command+C** — the full pathname is copied to your clipboard, ready to paste into Claude Code. Alternatively, enable the Finder path bar (View > Show Path Bar or **Command+Option+P**) for a clickable breadcrumb at the bottom of every Finder window; right-click any segment to copy its path. Either way, pasting paths directly beats typing them — e.g., "Review the files in `/Users/.../Acme/Reference/`".
- **`.claude/rules/project.md` is hidden by default in Finder and File Explorer.** Any file or folder starting with a dot (`.`) is hidden on macOS and Windows. To see it: on **Mac**, press **Command + Shift + .** in Finder; on **Windows**, go to **View > Show > Hidden items** in File Explorer. The easiest workaround: open the project folder in **VS Code**, which shows dotfiles without any toggling.
