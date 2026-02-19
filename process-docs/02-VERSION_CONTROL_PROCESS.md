# Version Control Process for Claude Code Projects

This document is the full reference for the version control process used in KnowledgeOwl customization projects. It includes detailed explanations, examples, and rollback procedures.

**Note:** Claude automatically reads `CLAUDE.md` at the start of every session (and auto-updates it from the GitHub repo). This file is for human reference and for understanding the "why" behind the conventions. Claude can fetch this doc on demand if you ask about the version control process.

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
│   ├── homepage-full-html-snapshot.html
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

**Always create a fresh snapshot of the live KB code if more than one day has passed since the last session** (or sooner if you know that you or the customer made changes directly in KnowledgeOwl). The customer (or another teammate) may have made changes outside this system in the meantime. Rather than trying to figure out whether the code has drifted, just always capture the current state — it's quick and eliminates guesswork.

A "snapshot" means copying all 12 code files from KnowledgeOwl's Customize > Style (HTML & CSS) sections into the `current-state` folder. This is distinct from the `homepage-full-html-snapshot.html` file, which is a supplementary rendered-HTML reference, not part of the core code snapshot.

### Steps

1. **Create a `YYYY.MM.DD-current-state` folder** (using today's date)
2. **Pull fresh code** from the customer's live KB (same process as the original setup — copy from each Customize > Style section) and populate the `current-state` folder with it
3. **Create the next version folder** by copying from the `current-state` snapshot (not from the old last version)
4. **Refresh supporting files** — clean up outdated materials and add current ones (see details below)
5. **Note the new baseline** in your CHANGES file (e.g., "Based on `2026.03.15-current-state`")

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
- **`knowledgeowl-css-quirks.md`** — this is a permanent reference, always stays

**Note:** You no longer need to manually update process docs. Claude auto-updates `CLAUDE.md` from the GitHub repo at the start of each session, and process docs (`00-README.md`, `01-`, `02-`, `03-`, `04-`) live in the repo only — they are never copied into customer folders.

### Example

```
Project/
├── 2026.01.20-no-changes/        # Original permanent backup (never modify)
├── 2026.01.21-v1/
├── 2026.01.21-v2/
├── 2026.01.28-v3/
├── 2026.01.28-v4/                # Last version from January work
├── 2026.03.15-current-state/     # Fresh snapshot of live KB before resuming
├── 2026.03.15-v5/                # New work resumes here (copied from current-state)
│   └── CHANGES_FROM_v4.md
└── 2026.03.16-v6/
    └── CHANGES_FROM_v5.md
```

**Key points:**
- The `no-changes` folder remains untouched — it's still the original baseline
- Always create a `current-state` snapshot if more than one day has passed since the last session (or sooner if changes were made)
- Version numbering continues incrementing as usual

---

## When Working with Claude

### Tell Claude:

"Please create a new version folder using the format YYYY.MM.DD-v# and make your changes there."

### Claude Should:

1. Create a new version folder (e.g., `2026.01.22-v3`)
2. Copy previous version contents as the starting point
3. Make all changes in the new version folder only
4. Create a properly named `CHANGES_FROM_*.md` documenting all updates
5. Provide clear deployment instructions specifying exact files and KnowledgeOwl destinations
6. Tailor deployment instructions to the deployment target (sandbox or live KB)

### Claude Should NOT:

1. Modify files in previous version folders
2. Modify the permanent backup folder (`no-changes`)
3. Assume the user knows which files to deploy — always spell it out
4. Skip change documentation
5. Use inconsistent version numbering

---

## Example Workflow

### Scenario: Adding a new feature

**Step 1: User Request**
```
"Please add a newsletter signup section to the homepage."
```

**Step 2: Claude Creates New Version**
```bash
# Claude creates: 2026.01.22-v3/
# Copies from: 2026.01.21-v2/
```

**Step 3: Claude Makes Changes**
- Edits `custom-html-5-homepage.html` in v3 folder
- Edits `custom-css.css` in v3 folder if needed

**Step 4: Claude Documents Changes**
- Creates `CHANGES_FROM_v2.md` in v3 folder
- Lists all modifications with line numbers
- Explains what changed and why

**Step 5: Claude Provides Deployment Instructions**
```markdown
## Files to Deploy

### Custom HTML > Homepage — COPY THIS FILE
**Source**: `/2026.01.22-v3/custom-html-5-homepage.html`
**Destination**: KnowledgeOwl > Customize > Style (HTML & CSS) > Custom HTML > Homepage
**Changes**: Added newsletter signup section with email capture form

### Custom CSS — COPY THIS FILE
**Source**: `/2026.01.22-v3/custom-css.css`
**Destination**: KnowledgeOwl > Customize > Style (HTML & CSS) > Custom CSS
**Changes**: Added newsletter signup form styling

Deploy to the target KB (sandbox or live). Verify changes after deployment.
```

**Step 6: User Deploys**
- Deploys to the target KB (sandbox or live)
- Verifies changes look and work correctly
- Gets customer approval
- If using a sandbox, deploys to production after approval
- If issues arise, rolls back to v2
