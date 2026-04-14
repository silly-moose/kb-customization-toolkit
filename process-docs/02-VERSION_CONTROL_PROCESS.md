# Version Control Process for Claude Code Projects

This document is the full reference for the version control process used in KnowledgeOwl customization projects. It includes detailed explanations, examples, and rollback procedures.

**Note:** Claude automatically reads `CLAUDE.md` at the start of every session, which fetches the latest `CLAUDE-RULES.md` from the GitHub repo. This file is for human reference and for understanding the "why" behind the conventions. Claude can fetch this doc on demand if you ask about the version control process.

---

## Core Principle

**Always create a new version folder when making substantial codebase updates.**

This preserves all previous versions for reference or rollback.

---

## Folder Naming Convention

Use the format: `YYYY.MM.DD-v#`

**Examples:**
- `2026.01.21-v1` — First version on January 21, 2026
- `2026.01.21-v2` — Second version on same day
- `2026.01.22-v3` — First version on next day (continues incrementing)

**Rules:**
- Date format: `YYYY.MM.DD` (year.month.day) — use the current date
- Version number: `v#` — starts at 1 and always increments for the life of the project, even across days
- Separator: Hyphen between date and version
- The date reflects when the version was created; the version number never resets
- **Why periods in dates?** Periods separate date components (`YYYY.MM.DD`), hyphens separate words and descriptors (`-v1`, `-no-changes`). These serve different semantic purposes, which makes folder names easier to read at a glance

---

## What Requires a New Version Folder

Create a new version folder when making:
- **Feature additions** — New functionality or sections
- **Design changes** — Color schemes, layouts, typography
- **Significant refactoring** — Structural code changes
- **Multiple file updates** — Changes affecting 2+ files
- **Bug fixes that modify multiple areas** — Complex fixes

Do **not** create a new version for:
- Typo fixes in documentation
- Single-line code corrections
- Comment updates
- Minor text changes

**Rule of thumb:** When in doubt, create a new version. The cost is low (just a folder copy) and the safety net is valuable.

---

## Step-by-Step Process

### 1. Create New Version Folder

Copy the entire previous version folder to create the new one:

```bash
cp -r 2026.01.21-v2 2026.01.22-v3
```

Place the new version folder at the same level as previous versions.

### 2. Make Changes in the New Folder Only

- Edit files only in the new version folder
- **Never** modify files in previous version folders
- **Never** modify the permanent backup folder (`YYYY.MM.DD-no-changes`)

### 3. Document Changes

Since you copied the entire previous version folder (step 1), a CHANGES file already exists in the new folder. Rename it to reflect the new version's baseline:

- **First version (v1):** The file is already named `CHANGES_FROM_no-changes.md` — keep that name, since v1 is based on the no-changes folder
- **Subsequent versions:** Rename the file to `CHANGES_FROM_v[previous].md` (e.g., in the v3 folder, rename it to `CHANGES_FROM_v2.md`)

Clear out the previous version's content and update the title, Date, and Based On fields. Then fill in each section. See the template for the required sections: summary, files modified, color palette, visible changes, manual steps, and deployment instructions.

### 4. Provide Deployment Instructions

In the CHANGES file, always specify:
- Exactly which file(s) need to be deployed
- Exactly where to deploy them in KnowledgeOwl
- What changed in this version
- Expected results after deployment
- Where to deploy (sandbox or live KB, based on the deployment target for this project)

**Example format:**
```markdown
## Manual Steps in KnowledgeOwl

### Update Style Settings Colors (do this BEFORE deploying code files)
Go to Customize > Style > Style Settings > Colors and update:

| Setting              | Current   | New       |
|----------------------|-----------|-----------|
| Highlights & accents | `#5b9bd5` | `#009d9c` |
| Icon color           | `#5b9bd5` | `#009d9c` |

## Files to Deploy

### Custom CSS — COPY THIS FILE
**Source**: `/2026.01.22-v3/custom-css.css`
**Destination**: KnowledgeOwl > Customize > Style (HTML & CSS) > Custom CSS
**Changes**: Updated brand colors, added card hover effects

### Custom HTML > Homepage — COPY THIS FILE
**Source**: `/2026.01.22-v3/custom-html-5-homepage.html`
**Destination**: KnowledgeOwl > Customize > Style (HTML & CSS) > Custom HTML > Homepage
**Changes**: Updated link colors to brand palette
```

**Why Style Settings come first:** KnowledgeOwl's Style Settings color pickers generate dynamic theme CSS that loads *before* Custom CSS. If a version changes brand colors, the Style Settings should be updated first so the theme-level CSS and Custom CSS agree instead of competing.

---

## Permanent Backup Folder

The `YYYY.MM.DD-no-changes` folder is the permanent backup. It is created at project start and contains the customer's original code (or placeholder comments if a field was empty).

**Never modify files in this folder.** It serves as the emergency rollback point and the baseline reference for all changes.

---

## Folder Structure Example

```
Project/
├── 2026.01.20-no-changes/      # Permanent backup (never modify)
│   ├── custom-css.css
│   ├── custom-head.html
│   ├── custom-html-1-body.html
│   ├── ... (all 12 code files)
│   ├── full-html-snapshot-homepage.html
│   ├── full-html-snapshot-article.html
│   ├── style-settings-colors.md
│   ├── CHANGES_FROM_no-changes.md
│   └── Screenshots/
├── 2026.01.21-v1/               # First iteration (copied from no-changes)
│   ├── (all files from no-changes)
│   └── CHANGES_FROM_no-changes.md
├── 2026.01.21-v2/               # Second iteration (copied from v1)
│   ├── (all files from v1)
│   └── CHANGES_FROM_v1.md
└── 2026.01.22-v3/               # Third iteration (copied from v2, next day)
    ├── (all files from v2)
    └── CHANGES_FROM_v2.md
```

**Note:** Each version folder contains **all** project files (copied from the previous version), not just the ones that were modified. Only the CHANGES file is renamed.

---

## Rollback Process

If a version has issues:

1. **Identify the last working version** (e.g., v2 worked, v3 has issues)
2. **Deploy files from the working version** (copy from v2 folder to KnowledgeOwl)
3. **Document the rollback** (note in the project)
4. **Fix issues in a new version** (create v4 with fixes — do not modify v3)

The broken version remains preserved for debugging.

---

## Returning to an Existing Project After a Gap

When returning to a project after any gap — whether days, weeks, or months — continue working in the existing project folder. Do not create a new one. The version number picks up where it left off.

**Claude automatically syncs template files.** The toolkit evolves over time — new reference files get added, existing ones get updated. At the start of every session, Claude fetches the latest `Reference/knowledgeowl-css-quirks.md` and `Reference/knowledgeowl-css-defaults.md` from the GitHub repo and overwrites the local copies. It also checks for `.claude/rules/project.md` and creates it from the template if missing. This means older projects automatically pick up new reference files without any manual copying.

**Always create a fresh snapshot of the live KB code if more than one day has passed since the last session** (or sooner if you know that you or the customer made changes directly in KnowledgeOwl). The customer (or another teammate) may have made changes outside this system in the meantime. Rather than trying to figure out whether the code has drifted, just always capture the current state — it's quick and eliminates guesswork.

A current-state capture means copying all 12 code files from KnowledgeOwl's Customize > Style (HTML & CSS) sections into the `current-state` folder. The HTML snapshot files (`full-html-snapshot-*.html`) and `style-settings-colors.md` are also refreshed, but captured differently — not pulled from KnowledgeOwl's Customize > Style (HTML & CSS) sections, but captured from the browser's rendered DOM (for HTML snapshots) or the Style Settings UI (for color values).

### Steps

1. **Create a `YYYY.MM.DD-current-state` folder** (using today's date)
2. **Pull fresh code** from the customer's live KB (same process as the original setup — copy from each Customize > Style section) and populate the `current-state` folder with it. Also create placeholder copies of any `full-html-snapshot-*.html` files and `style-settings-colors.md` found in the most recent version folder. Ask the user to paste fresh HTML into each snapshot placeholder (captured via Chrome DevTools > Elements > right-click `<html>` > Copy outerHTML), and to update `style-settings-colors.md` only if the Style Settings colors may have changed (otherwise they can copy the values from the previous version's file).
3. **Document what changed since the last version** — see "CHANGES File in Current-State Folders" below.
4. **Lock the folder** — once all files are in place (code files, HTML snapshots, `style-settings-colors.md`, screenshots, and CHANGES file), run `chmod -R a-w YYYY.MM.DD-current-state/` to make it read-only.
5. **Create the next version folder** by copying from the `current-state` snapshot (not from the old last version)
6. **Refresh supporting files** — clean up outdated materials and add current ones (see details below)
7. **Note the new baseline** in your CHANGES file (e.g., "Based on `2026.03.15-current-state`")

### CHANGES File in Current-State Folders

The `current-state` folder should include a `CHANGES_FROM_v[last].md` file (e.g., `CHANGES_FROM_v4.md` if v4 was the last version before the gap). This documents any differences between the last version and the current live KB — changes that may have been made by the customer, another teammate, or directly in KnowledgeOwl outside this system.

Have Claude compare the `current-state` code files against the last version folder and note any differences. The CHANGES file should:
- List which files differ and summarize what changed
- Note that these changes were **not made through this system** — they were discovered during the current-state snapshot, and their origin (customer, teammate, direct KO edit) may be unknown
- Use the summary section to flag anything unexpected or potentially problematic

This preserves a record of what drifted between sessions. Without it, the gap between the last version and the next version is undocumented, and it becomes difficult to trace when and why specific changes appeared.

**Note:** Like all `current-state` folder contents, this CHANGES file becomes read-only once the folder is locked.

### Why Refreshing Supporting Files Matters

Claude reads what you put in front of it. Old screenshots and reference files aren't just clutter — they're **misleading context** that can cause Claude to make decisions based on a design or layout that no longer exists. Every irrelevant file dilutes Claude's attention and wastes context window on information that doesn't help the current task.

The goal: **the `current-state` folder and `Reference/` folder should reflect the truth _right now_ and the work _coming next_.** Old version folders already preserve the past — that's their job.

### What to Clean Up

**Screenshots (in `current-state/Screenshots/`):**
- Remove screenshots from previous work sessions — they show what the KB _used to_ look like
- Add fresh screenshots of the KB's current appearance (homepage, category page, article page, and any pages relevant to the upcoming work)

**Reference files (in `Reference/` at the project root):**
- Remove files no longer relevant to upcoming work (e.g., mockups for features already shipped, Asana exports for completed tasks)
- Add new reference files for whatever's next (new mockups, updated Asana exports, new assets)
- Keep files that are still accurate and relevant (e.g., a brand guide or marketing site download that hasn't changed)

### What NOT to Clean Up

- **Old version folders** — never touch these; their screenshots and contents stay as-is as a historical record
- **The `no-changes` folder** — never modify for any reason
- **`knowledgeowl-css-quirks.md` and `knowledgeowl-css-defaults.md`** — these are permanent references, always stay

**Note:** You no longer need to manually update process docs. `CLAUDE.md` fetches the latest `CLAUDE-RULES.md` from the GitHub repo at the start of each session, and process docs (`00-README.md`, `01-`, `02-`, `03-`) live in the repo only — they are never copied into customer folders.

### Example

```
Project/
├── 2026.01.20-no-changes/        # Original permanent backup (never modify)
├── 2026.01.21-v1/
├── 2026.01.21-v2/
├── 2026.01.28-v3/
├── 2026.01.28-v4/                # Last version from January work
├── 2026.03.15-current-state/     # Fresh snapshot of live KB before resuming
│   └── CHANGES_FROM_v4.md        # Documents drift between v4 and current live KB
├── 2026.03.15-v5/                # New work resumes here (copied from current-state)
│   └── CHANGES_FROM_current-state.md
└── 2026.03.16-v6/
    └── CHANGES_FROM_v5.md
```

**Key points:**
- The `no-changes` folder remains untouched — it's still the original baseline
- Always create a `current-state` snapshot if more than one day has passed since the last session (or sooner if changes were made)
- Version numbering continues incrementing as usual

---

## Project Closeout

Before closing out a project, review whether any process improvements were discovered during the work:

- [ ] Any new steps or tips to add to `01-KB_CUSTOMIZATION_PROJECT_SETUP.md`?
- [ ] Any new sections to add to the `CHANGES_FROM_no-changes.md` template?
- [ ] Any new template files needed in `TEMPLATE-no-changes`?
- [ ] Any improvements to the version control process (`02-VERSION_CONTROL_PROCESS.md`)?

**Chad (template maintainer):** Update the master template directly and push to the repo.

**Everyone else:** Submit suggestions to Chad. Always pull the latest version from the repo before starting a new project.
