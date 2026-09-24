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

Clear out the previous version's content and update the title, Date, and Based On fields. Then fill in each section. See the template for the required sections: summary, files modified, color palette, visible changes, Style Settings, manual steps, and files to deploy.

### 4. Deploy

In the CHANGES file, always specify:
- Exactly which file(s) the version deploys, and where each goes in KnowledgeOwl
- Any Style Settings it changes (the table below); set the same values in the version's `style-settings-colors.md`, which is what the deploy sets
- What changed in this version
- Expected results after deployment
- Where it deploys (sandbox or live KB, based on the deployment target for this project)

Claude then deploys it through the built-in browser (`05-BROWSER_CAPTURE_AND_DEPLOY.md`): it plans the deploy against a fresh read of the live KB, shows the list of what it will save where, waits for your yes, saves, reads the result back, and records it in `DEPLOYMENTS.md`. On the manual path, the same list is what you paste.

**Color-Change Checkpoint:** If this version changed any color in Custom CSS, reconcile it against the Style Settings and surface a `Setting | Current | New | Why` table **in the conversation** (not only in the CHANGES file), listing Style Settings changes first. If colors changed but no Style Setting is affected, say so explicitly. The authoritative definition lives under "Style Settings Colors → Color-Change Checkpoint" in `CLAUDE-RULES.md`.

**Example format:**
```markdown
## Style Settings

| Style Setting        | Current   | New       | Why          |
|----------------------|-----------|-----------|--------------|
| Highlights & accents | `#5b9bd5` | `#009d9c` | Brand accent |
| Icon color           | `#5b9bd5` | `#009d9c` | Brand accent |

## Files to Deploy

### Custom CSS
**Source**: `/2026.01.22-v3/custom-css.css`
**Destination**: KnowledgeOwl > Customize > Style (HTML & CSS) > Custom CSS
**Changes**: Updated brand colors, added card hover effects

### Custom HTML > Homepage
**Source**: `/2026.01.22-v3/custom-html-5-homepage.html`
**Destination**: KnowledgeOwl > Customize > Style (HTML & CSS) > Custom HTML > Homepage
**Changes**: Updated link colors to brand palette
```

**Why Style Settings matter to the order:** KnowledgeOwl's Style Settings color pickers generate dynamic theme CSS that loads *before* Custom CSS, so the two should agree instead of competing. Claude's deploy sets both in one save. On the manual path, update the Style Settings first, then paste the code files.

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
│   ├── homepage-custom-content.html   # legacy Homepage Custom content (older KBs only)
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
2. **Redeploy the working version.** Claude plans a deploy of the v2 folder against the live KB, which moves every field v3 changed back to v2, and saves it after your yes (`05-BROWSER_CAPTURE_AND_DEPLOY.md`). On the manual path, paste the v2 files.
3. **Document the rollback.** The deploy adds its row to `DEPLOYMENTS.md`; add a line to `.claude/rules/project.md` saying why.
4. **Fix issues in a new version** (create v4 with fixes; do not modify v3)

The broken version remains preserved for debugging.

**KnowledgeOwl's own Revert is the emergency control.** Customize > Style keeps the last 10 whole-theme saves, and "Revert to previous save" restores one of them in one step, including the colors, fonts and logo. Use it when the live KB is broken and there's no time to plan a deploy. Claude never uses it without an explicit request, because it changes the live theme immediately. Afterwards, run the drift check so the project files catch up with what's live.

---

## Returning to an Existing Project After a Gap

When returning to a project after any gap — whether days, weeks, or months — continue working in the existing project folder. Do not create a new one. The version number picks up where it left off.

**Claude automatically syncs template files.** The toolkit evolves over time — new reference files get added, existing ones get updated. At the start of every session, Claude fetches the latest `Reference/knowledgeowl-css-quirks.md` and `Reference/knowledgeowl-css-defaults.md` from the GitHub repo and overwrites the local copies. It also checks for `.claude/rules/project.md` and creates it from the template if missing. This means older projects automatically pick up new reference files without any manual copying.

**Check the live KB for drift if more than one day has passed since the last session** (or sooner if you know that you or the customer made changes directly in KnowledgeOwl). The customer (or another teammate) may have made changes outside this system in the meantime. Claude reads the live KB through the built-in browser and compares every field with the project's files (the drift check in `05-BROWSER_CAPTURE_AND_DEPLOY.md`). If everything matches, it says which version each field is at, adds a row to `DEPLOYMENTS.md`, and carries on with no new folder. If any field matches no local file, it records the live KB in a `current-state` folder.

A `current-state` folder holds the 12 code fields as they are live, `style-settings-colors.md` (the Style Settings colors, fonts and logo), and fresh HTML snapshots of reader pages. Claude writes all of them from the live read. If the KB uses the legacy Homepage Custom content field, the folder also gets `homepage-custom-content.html`, from Customize > Homepage > Homepage content > Custom content. Whether it applies is settled once at setup and recorded in the `# Baseline` section of `.claude/rules/project.md`; Claude reads that record rather than re-checking the KB each time, and skips the file entirely when it says `empty`.

Without the built-in browser (a terminal or IDE session), drift can't be checked, so the user pastes each field and snapshot into a new `current-state` folder every time (05's manual path).

### Steps

1. **Run the drift check.** If every field matches a local file, stop here: no folder, and the next version folder copies from the latest version as usual.
2. **Create a `YYYY.MM.DD-current-state` folder** (using today's date). `kb_io.py unpack --into` writes the 12 code files and `style-settings-colors.md` from the live read, and Claude takes fresh HTML snapshots of the same reader pages the most recent version folder has snapshots of. Include `homepage-custom-content.html` only when the `# Baseline` section of `.claude/rules/project.md` records the legacy Homepage Custom content field as `in use`. If the answer isn't recorded yet (a project set up before that section existed), Claude reads the field once and records it, so it doesn't come up again. On the manual path the user pastes each field and snapshot instead (Chrome DevTools > Elements > right-click `<html>` > Copy outerHTML), and updates `style-settings-colors.md` only if the Style Settings may have changed.
3. **Confirm the capture came from the right KB.** If the project has both a sandbox and a live KB, it's easy to snapshot the wrong one, and the mistake is invisible once the code is in the folder. On one project the target was a sandbox but the code files and both HTML snapshots came from live; the two had diverged in both directions, so the wrong baseline would have silently reverted real work. `read()` reports the host it read and `unpack --snapshot` reports each snapshot's `rel="canonical"` host. Claude checks both against the targets in `.claude/rules/project.md` and states which KB it captured. If it's the wrong one, recapture rather than reconcile.
4. **Screenshots, if you want them.** Claude asks once whether you want fresh screenshots in the `Screenshots/` folder inside the `current-state` folder (homepage, category page, article page, and any pages relevant to the upcoming work). They're optional, since Claude can look at the live KB any time.
5. **Document what changed since the last version** — see "CHANGES File in Current-State Folders" below.
6. **Lock the folder** — once all files are in place (code files, HTML snapshots, `style-settings-colors.md`, any screenshots, and the CHANGES file), run `chmod -R a-w YYYY.MM.DD-current-state/` to make it read-only.
7. **Create the next version folder** by copying from the `current-state` snapshot (not from the old last version)
8. **Refresh the `Reference/` folder** — clean up outdated materials and add current ones (see details below)
9. **Note the new baseline** in your CHANGES file (e.g., "Based on `2026.03.15-current-state`")

### CHANGES File in Current-State Folders

The `current-state` folder should include a `CHANGES_FROM_v[last].md` file (e.g., `CHANGES_FROM_v4.md` if v4 was the last version before the gap). This documents any differences between the last version and the current live KB — changes that may have been made by the customer, another teammate, or directly in KnowledgeOwl outside this system.

Claude writes it from `unpack`'s report, which names every live field that matches no local file and which version the others match. The CHANGES file should:
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
- Don't copy screenshots over from previous version folders — they show what the KB _used to_ look like
- Fresh screenshots of the KB's current appearance, if you want them, are added in step 4, before the folder is locked (homepage, category page, article page, and any pages relevant to the upcoming work)

**Reference files (in `Reference/` at the project root):**
- Remove files no longer relevant to upcoming work (e.g., mockups for designs already deployed, Asana exports of completed tasks)
- Add new reference files for whatever's next (new mockups, updated Asana exports, new assets)
- Keep files that are still accurate and relevant (e.g., a brand guide or marketing site download that hasn't changed)

### What NOT to Clean Up

- **Old version folders** — never touch these; their screenshots and contents stay as-is as a historical record
- **The `no-changes` folder** — never modify for any reason
- **`knowledgeowl-css-quirks.md` and `knowledgeowl-css-defaults.md`** — these are permanent references, always stay

**Note:** You don't need to manually update process docs. `CLAUDE.md` fetches the latest `CLAUDE-RULES.md` from the GitHub repo at the start of each session, and process docs (`00-README.md` through `05-`, plus `theme-templates/`) live in the repo only; they are never copied into customer folders. The two capture-and-deploy helpers in `process-docs/kb-io/` are the exception: Claude downloads fresh copies into `.claude/kb-io/` at the start of each session.

### Example

```
Project/
├── 2026.01.20-no-changes/        # Original permanent backup (never modify)
├── 2026.01.21-v1/
├── 2026.01.21-v2/
├── 2026.01.28-v3/
├── 2026.01.28-v4/                # Last version from January work
├── 2026.03.15-current-state/     # Live KB had drifted: snapshot before resuming
│   └── CHANGES_FROM_v4.md        # Documents drift between v4 and current live KB
├── 2026.03.15-v5/                # New work resumes here (copied from current-state)
│   └── CHANGES_FROM_current-state.md
└── 2026.03.16-v6/
    └── CHANGES_FROM_v5.md
```

**Key points:**
- The `no-changes` folder remains untouched — it's still the original baseline
- Check for drift if more than one day has passed since the last session (or sooner if changes were made). Create a `current-state` folder only when the live KB has changed, or every time on the manual path
- Version numbering continues incrementing as usual

---

## Risky Edits — worked examples

The rules live in `CLAUDE-RULES.md` → "Risky Edits." These are the cases that produced them, kept here because they're what makes the rules land.

**Bulk renames: the two near-misses a grep couldn't see.** Renaming a content type end-to-end (a class, an id, ~28 classes, and a tag slug) looked like a one-line `sed`. An audit first caught two things it would have broken:

1. A local variable `var cb = el('input',''); cb.type='checkbox'` in a **different** engine on the same page — the guided path's compliance gate. A bare `cb` → `faq` replace would have silently broken a compliance control. Fix: only ever rewrite the token `cb-` with the hyphen **required**, never a bare `cb`.
2. `.gt-background-context` in CSS, which the JS builds at runtime as `'gt-' + typeSlug`. Renaming the slug without the matching CSS silently drops a whole column's color — no error. Same hazard for `[data-content_type="…"]` attribute selectors whose `::before` carries a visible label.

Hence the recipe: list every distinct token and count first, apply longest-first in one pass, assert MUST-SURVIVE patterns, assert zero orphans. And a cyclic renumber (06→07, 07→08, 08→06) has to be one atomic pass — done sequentially, the replaces collide.

**Control characters: why the guard exists.** A JS sentinel string containing `\x00` seemed clever ("can never collide with an id") and poisoned every subsequent grep of that file. It then **recurred** in `.claude/rules/project.md` — written while *documenting* the first occurrence — and sat undetected for two days. `file` reported the doc as `data`, plain `grep` returned nothing while `grep -a` found the content, so two sessions' consistency sweeps passed without being able to read the project's most-read doc. Prefer sentinels that are illegal in the domain but plain ASCII (e.g. a string containing spaces — HTML ids can't contain them).

## Customer-Facing Docs — mirror paths that are really anchors

The rule lives in `CLAUDE-RULES.md` → "Customer-Facing Docs." These are the confirmed cases where a `support-kb` mirror filename does **not** correspond to a live URL — the mirror has a standalone `.md` file, but on the live site the topic is a section inside a parent article:

| Mirror file | Actual live URL |
|---|---|
| `create-a-blank-article.md` | `…/help/create-new-article#create-a-blank-article` |
| `create-a-new-article-from-template.md` | `…/help/create-new-article#…` |
| `add-a-category-or-subcategory.md` | `…/help/create-a-category#…` |
| `reorder-categories-or-articles.md` | `…/help/reorder-and-move-categories#…` |

Four wrong links reached a customer's author guide after all of them were reported "verified" on the strength of the mirror having a matching filename. Treat this table as illustrative, not exhaustive — always confirm against the live site.

## Project Closeout

Before closing out a project, review the improvement log, then check whether any process improvements were discovered during the work.

### Review the improvement log (suggest only)

Improvement ideas are added to `improvement-log.md`'s **`AWAITING REVIEW`** section directly at the end of each working session (see "Reflect & Improve" in `CLAUDE-RULES.md`), so closeout is a **review/dedupe pass, not a synthesis-from-scratch step**. Open the central `improvement-log.md` (at the toolkit root — path in `.claude/rules/project.md`) and read this project's entries in `AWAITING REVIEW`: merge duplicates or near-duplicates into a single clear item, tighten anything vague, and confirm each carries a priority tag `[P1]`–`[P3]`, a target tag like `[quirks-doc]`, and the project name + date. If a coverage gap surfaces something that was never logged, add it now as a new `AWAITING REVIEW` item. **Do not apply any of them, and do not move anything into another status section** — this is suggest-only; only a human triages. Use the checklist below to sanity-check which part of the toolkit each suggestion targets:

- [ ] Any new steps or tips to add to `01-KB_CUSTOMIZATION_PROJECT_SETUP.md`?
- [ ] Any new sections to add to the `CHANGES_FROM_no-changes.md` template?
- [ ] Any new template files needed in `TEMPLATE-no-changes`?
- [ ] Any improvements to the version control process (`02-VERSION_CONTROL_PROCESS.md`)?
- [ ] Any new KnowledgeOwl CSS quirks or defaults for `Reference/knowledgeowl-css-quirks.md` / `knowledgeowl-css-defaults.md`?
- [ ] Any updates to the session rules in `CLAUDE-RULES.md`?

**Chad (template maintainer):** Apply the accepted items to the master template — a session opened in the toolkit repo is the place to do this, and Claude can make the edits for your review. Push to the repo, then MOVE each item out of `AWAITING REVIEW` into the matching status section (`APPLIED` / `DECLINED` / `DEFERRED`) in the same commit, stamping the date/commit, the decline reason, or the defer condition — per the workflow documented at the top of `improvement-log.md`. Because `CLAUDE-RULES.md` and the CSS reference docs are re-fetched from GitHub each session, accepted changes reach everyone on their next session automatically.

**Everyone else:** You won't have the central log — if anything caused friction, just share the idea with Chad in Slack. Always pull the latest version from the repo before starting a new project.
