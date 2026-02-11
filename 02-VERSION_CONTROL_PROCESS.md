# Version Control Process for Claude Code Projects

This document is the full reference for the version control process used in KnowledgeOwl customization projects. It includes detailed explanations, examples, and rollback procedures.

**Note:** Claude automatically reads the condensed rules in `CLAUDE.md` at the start of every session. This file is for human reference and for understanding the "why" behind the conventions.

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

Copy the `CHANGES_FROM_no-changes.md` template from the no-changes folder and rename it:

- **First version:** Name it `CHANGES_FROM_no-changes.md` (since it's based on the no-changes folder)
- **Subsequent versions:** Name it `CHANGES_FROM_v[previous].md` (e.g., `CHANGES_FROM_v2.md` in the v3 folder)

Update the title and fields inside the file to reflect the actual version. See the template for the required sections: summary, files modified, color palette, visible changes, manual steps, and deployment instructions.

### 4. Provide Deployment Instructions

In the CHANGES file, always specify:
- Exactly which file(s) need to be deployed
- Exactly where to deploy them in KnowledgeOwl
- What changed in this version
- Expected results after deployment
- Whether changes should be tested in the **sandbox** before deploying to production

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
├── 2026.01.21-v1/               # First iteration
│   ├── custom-css.css
│   ├── custom-html-5-homepage.html
│   └── CHANGES_FROM_no-changes.md
├── 2026.01.21-v2/               # Second iteration
│   ├── custom-css.css
│   ├── custom-html-5-homepage.html
│   └── CHANGES_FROM_v1.md
└── 2026.01.22-v3/               # Third iteration (next day, version continues)
    ├── custom-css.css
    ├── custom-html-5-homepage.html
    └── CHANGES_FROM_v2.md
```

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

When a customer comes back weeks or months later with new requests, continue working in their existing project folder — do not create a new one. The version number picks up where it left off.

**Before starting new work, always create a fresh snapshot of the live KB code.** The customer (or another teammate) may have made changes outside this system in the meantime. Rather than trying to figure out whether the code has drifted, just always capture the current state — it's quick and eliminates guesswork.

### Steps

1. **Pull fresh code** from the customer's live KB (same process as the original setup — copy from each Customize > Style section)
2. **Create a `YYYY.MM.DD-current-state` folder** (using today's date) and populate it with the fresh code
3. **Create the next version folder** by copying from the `current-state` snapshot (not from the old last version)
4. **Note the new baseline** in your CHANGES file (e.g., "Based on `2026.03.15-current-state`")

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
- Always create a `current-state` snapshot when returning to a project, even if you believe nothing has changed
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
6. Note that changes should be tested in the sandbox before production deployment

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

Deploy to sandbox first. Once verified, deploy to production.
```

**Step 6: User Deploys**
- Deploys to sandbox and tests changes
- Gets customer approval
- Deploys to production
- If issues arise, rolls back to v2
