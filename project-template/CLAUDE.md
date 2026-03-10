# Project Rules

You are helping customize a KnowledgeOwl knowledge base. Follow these rules for every session.

## Process Documentation

All process docs live in the GitHub repo and should be fetched on demand — they are not stored in customer project folders.

- **Repo:** https://github.com/spongetimblin/kb-customization-toolkit
- **Process docs location:** `process-docs/` folder in the repo

Available docs (fetch from GitHub when needed):
- `00-README.md` — Onboarding overview for new teammates
- `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` — Detailed setup instructions
- `02-VERSION_CONTROL_PROCESS.md` — Full version control process, examples, and rollback procedures
- `03-PROJECT_HANDOFF_CHECKLIST.md` — Checklist for deployment and project completion
- `04-LOCALHOST_PREVIEW.md` — Optional localhost preview for faster CSS iteration

If the user asks a question about the process, setup, version control, or handoff, fetch the relevant doc from:
`https://raw.githubusercontent.com/spongetimblin/kb-customization-toolkit/main/process-docs/[filename]`

## At the Start of Each Session

1. **Update this file** — download the latest `CLAUDE.md` from the template repo and save it as `CLAUDE.md` in this project folder, replacing the existing copy:
   `https://raw.githubusercontent.com/spongetimblin/kb-customization-toolkit/main/project-template/CLAUDE.md`
   Then re-read the updated file before continuing. If the download fails (e.g., network issue), continue with the existing version.
2. Review the latest version folder, the most recent `YYYY.MM.DD-current-state` folder (if one exists), or the `YYYY.MM.DD-no-changes` folder if no versions exist yet. **If this is the first session** (only the no-changes folder exists), confirm that all content is in place — code files, HTML snapshots, and screenshots — then run `chmod -R a-w [no-changes-folder]/` to make it read-only and protect it from accidental edits. Do not lock the folder until the user has finished adding all files.
3. **Prompt the user about a current-state snapshot** — check the date of the latest version folder or `current-state` folder. If more than one day has passed since the last session, ask: **"It's been more than a day since the last session. Do you want to create a `current-state` snapshot before we start? This captures any changes made in KnowledgeOwl since we last worked."** If the user confirms, walk them through copying all 12 code files from KnowledgeOwl into a new `YYYY.MM.DD-current-state` folder, and also create placeholder copies of any `full-html-snapshot-*.html` files found in the most recent version folder. Ask the user to paste fresh HTML into each placeholder (captured via Chrome DevTools > Elements > right-click `<html>` > Copy outerHTML). Once all files are in place — the 12 code files, the html snapshot files, and screenshots — run `chmod -R a-w [current-state-folder]/` to make it read-only. Then proceed.
4. **Review the `Reference/` folder** — list its contents and flag any files that may be stale (e.g., files that were present in earlier versions but may no longer be relevant). Ask the user: **"Here's what's in Reference/. Are all of these still relevant, or should any be removed before we start?"** Do not read everything upfront, as the folder may contain large files (e.g., downloaded marketing sites) — just list the filenames and ask. **Always read `knowledgeowl-css-quirks.md` if the task involves CSS or HTML changes.**
5. Check `.claude/rules/project.md` for the deployment target. If it's set, use it. If it says `[sandbox / live KB]` (i.e., hasn't been filled in yet), ask the user: **"Are we deploying to a sandbox or directly to the live KB?"** and update the file with their answer.
6. Ask what the user wants to work on before making changes
7. **If the session involves CSS work**, mention that localhost preview is available: **"This involves CSS changes. Want me to set up localhost preview so you can see changes without deploying each time?"** If accepted, follow the Localhost Preview section below. If declined, use the normal deploy-and-verify workflow.

## Version Folders

- **Format:** `YYYY.MM.DD-v#` (e.g., `2026.01.21-v1`, `2026.01.22-v3`)
- **Date:** Use today's date
- **Version number:** Always increment from the last version in the project — never reset, even across days
- **Create a new version folder** for: feature additions, design changes, significant refactoring, multi-file updates, complex bug fixes
- **Do not create a new version** for: typo fixes, single-line corrections, comment updates, minor text changes — make these edits directly in the latest (most recent) version folder
- **When in doubt, create a new version.** The cost is low (just a folder copy) and the safety net is valuable.
- **Process:** Copy the entire previous version folder, then make changes only in the new copy

## Never Modify

- Files in any previous version folder
- Files in the `YYYY.MM.DD-no-changes` backup folder — this is the permanent baseline and emergency rollback point
- Files in any `YYYY.MM.DD-current-state` folder — these are snapshots of the live KB taken when returning to a project after a gap

## Current-State Folders

A `YYYY.MM.DD-current-state` folder contains the 12 code files copied from KnowledgeOwl's Customize > Style (HTML & CSS) sections (the core snapshot), plus placeholder copies of any `full-html-snapshot-*.html` files found in the most recent version folder. The html snapshot files are not pulled from KnowledgeOwl — the user captures them from the browser. Include placeholders for each one and ask the user to paste in fresh HTML. Do not make the folder read-only until all content — code files, HTML snapshots, and screenshots — has been added.

Create a `current-state` folder whenever resuming work after more than one day has passed since the last session — or sooner if you know that you or the customer made changes directly in KnowledgeOwl. Treat it like the `no-changes` folder: never modify it, and use it as the starting point for the next version folder. If a `current-state` folder exists and is newer than the latest version folder, copy from it (not the old version) when creating the next version.

When a `current-state` folder is created, the user should also refresh supporting files. Old screenshots and reference materials can be actively misleading — they may show a design or layout that no longer exists. Remind the user to:
- Replace screenshots in `current-state/Screenshots/` with fresh ones showing the KB's current appearance
- Remove outdated materials from `Reference/` (e.g., shipped mockups, completed task exports) and add any new reference files for upcoming work
- Leave `knowledgeowl-css-quirks.md` in place — it's a permanent reference

## Localhost Preview (Optional)

For CSS-heavy sessions, you can serve HTML snapshots locally to preview changes without deploying to KnowledgeOwl each time. This is optional — skip it for quick fixes or sessions where you'd rather deploy and verify directly.

### How It Works

The HTML snapshots already contain the full rendered page with embedded styles. By adding a `<link>` tag that loads `custom-css.css` from the same folder, the local file overrides the embedded custom CSS (same specificity, later source order). External assets (fonts, images, Bootstrap) load from their CDN URLs as usual.

### Setup

1. Create the preview folder: `mkdir -p preview`
2. For each `full-html-snapshot-*.html` in the current version folder, copy it to `preview/` with a short name (e.g., `full-html-snapshot-homepage.html` → `homepage.html`). Insert `<link rel="stylesheet" href="custom-css.css">` immediately before `</head>` in each copy.
3. Copy the CSS: `cp [version-folder]/custom-css.css preview/custom-css.css`
4. Start the server: use `preview_start` (reads `.claude/launch.json`) or run `python3 -m http.server 8080 -d preview` from the project root
5. Open `http://localhost:8080/homepage.html` in a browser

### Keeping Preview in Sync

Every time you edit `custom-css.css` in the version folder, also copy it to `preview/custom-css.css`. Tell the user the preview is updated so they can refresh the browser. If Claude Preview MCP tools are available, use `preview_screenshot` or `preview_inspect` to verify changes visually.

### Teardown

Delete the preview folder when done: `rm -rf preview`. The preview folder is ephemeral — never version it, never preserve it.

### Limitations

- **CSS only.** Changes to HTML template files (`custom-html-*.html`) are not reflected in the preview because the snapshot is a point-in-time capture. For HTML changes, deploy to KnowledgeOwl and re-capture the snapshot.
- **Static content.** JavaScript-dependent features (search, dynamic nav, login) will not function. The preview is for visual/layout verification only.
- **Snapshot freshness.** The preview is only as current as the last HTML snapshot. If the live KB changed since the snapshot was captured, the preview may not match production exactly.

## CHANGES File

Every new version folder must include a CHANGES file:
- **First version:** `CHANGES_FROM_no-changes.md`
- **Subsequent versions:** `CHANGES_FROM_v[previous].md` (e.g., `CHANGES_FROM_v2.md` in the v3 folder)

Copy the template from the no-changes folder and update it. Include these sections:
- Summary of what changed and why
- Which files were modified (with details)
- Color palette (only if new colors were introduced)
- What the user will see after deployment
- Manual steps needed in KnowledgeOwl (only if applicable)
- Files to deploy (see below)

Delete any sections that don't apply to the current version. Only include files that were actually modified — do not list all 12 files every time.

## Deployment Instructions

Always include explicit deployment instructions in the CHANGES file. Never assume the user knows which files to deploy. For each modified file, specify:

```
### [Section Name] — COPY THIS FILE
**Source**: `/YYYY.MM.DD-v#/[filename]`
**Destination**: KnowledgeOwl > Customize > Style (HTML & CSS) > [exact location]
**Changes**: [brief description]
```

End deployment instructions based on the deployment target established at the start of the session:
- **If sandbox:** "Deploy to sandbox first. Once verified, deploy to production."
- **If live KB:** "Deploy directly to the live KB. Verify changes immediately after deployment."

Every time you update code and ask the user to test or deploy, tell them in the conversation exactly which file(s) to copy and where to paste them in KnowledgeOwl. Do this every single time — even if you're iterating on the same file. Never assume the user will check the CHANGES file or remember from a previous message.

## KnowledgeOwl File-to-Section Mapping

| File | KnowledgeOwl Location |
|------|-----------------------|
| `custom-css.css` | Customize > Style (HTML & CSS) > Custom CSS |
| `custom-head.html` | Customize > Style (HTML & CSS) > Custom HEAD |
| `custom-html-1-body.html` | Customize > Style (HTML & CSS) > Custom HTML > Body |
| `custom-html-2-top-navigation.html` | Customize > Style (HTML & CSS) > Custom HTML > Top Navigation |
| `custom-html-3-article.html` | Customize > Style (HTML & CSS) > Custom HTML > Article |
| `custom-html-4-article-version.html` | Customize > Style (HTML & CSS) > Custom HTML > Article Version |
| `custom-html-5-homepage.html` | Customize > Style (HTML & CSS) > Custom HTML > Homepage |
| `custom-html-6-login.html` | Customize > Style (HTML & CSS) > Custom HTML > Login |
| `custom-html-7-manage-reader-subs.html` | Customize > Style (HTML & CSS) > Custom HTML > Manage Reader Subscriptions |
| `custom-html-8-404-page.html` | Customize > Style (HTML & CSS) > Custom HTML > 404 Page |
| `custom-html-9-restricted-access-page.html` | Customize > Style (HTML & CSS) > Custom HTML > Restricted Access Page |
| `custom-html-10-right-column.html` | Customize > Style (HTML & CSS) > Custom HTML > Right Column |
