# Project Rules

You are helping customize a KnowledgeOwl knowledge base. Follow these rules for every session.

## At the Start of Each Session

1. **Sync template files** — older customer projects may be missing files that were added to the template after the project was created. Ensure these files exist and are up to date:
   - **`Reference/knowledgeowl-css-quirks.md`** and **`Reference/knowledgeowl-css-defaults.md`** — fetch the latest versions from the template repo and overwrite the local copies (these are maintained centrally and should always match the repo):
     - `https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/project-template/Reference/knowledgeowl-css-quirks.md`
     - `https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/project-template/Reference/knowledgeowl-css-defaults.md`
   - **`.claude/rules/project.md`** — check if it exists. If missing, fetch the template from the repo and save it locally (the user will fill in customer details). If it already exists, leave it as-is (it contains customer-specific settings):
     - `https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/project-template/.claude/rules/project.md`
   - Do this quietly — no need to announce each file. Only mention it if a file was missing and created (e.g., "I noticed `.claude/rules/project.md` was missing, so I created it from the template — you'll need to fill in the customer name and KB.").
2. Review the latest version folder, the most recent `YYYY.MM.DD-current-state` folder (if one exists), or the `YYYY.MM.DD-no-changes` folder if no versions exist yet. **If this is the first session** (only the no-changes folder exists), confirm that all content is in place — code files, HTML snapshots, `style-settings-colors.md`, and screenshots — then run `chmod -R a-w [no-changes-folder]/` to make it read-only and protect it from accidental edits. Do not lock the folder until the user has finished adding all files.
3. **Create a current-state snapshot if needed** — check the date of the latest version folder or `current-state` folder. If more than one day has passed since the last session, **always** create a new `YYYY.MM.DD-current-state` folder — do not ask whether to do this, just tell the user it's needed and walk them through it. Create the folder with empty placeholder files for all 12 code sections, and also create placeholder copies of any `full-html-snapshot-*.html` files, `style-settings-colors.md`, and `homepage-custom-content.html` (the legacy Homepage Custom content field — only if the project uses it) found in the most recent version folder. If the project has no `homepage-custom-content.html` yet (e.g., an older project created before this file existed) but the KB has content in Customize > Homepage > Custom content, create the file in this folder and capture that content. **The user pastes code directly into each file themselves** (e.g., via VS Code) — do not ask them to paste code into the Claude Code conversation. Tell them which file to open and which KnowledgeOwl section to copy from, then move to the next file. For HTML snapshots, ask the user to paste fresh HTML into each placeholder (captured via Chrome DevTools > Elements > right-click `<html>` > Copy outerHTML). For `style-settings-colors.md`, ask the user to update the hex values only if the Style Settings colors may have changed in KnowledgeOwl since the last session; otherwise they can copy the values from the previous version's file. Once all files are in place — the 12 code files, the html snapshot files, `style-settings-colors.md`, and screenshots — run `chmod -R a-w [current-state-folder]/` to make it read-only. Then proceed.
4. **Review the `Reference/` folder** — list its contents, **excluding `knowledgeowl-css-quirks.md` and `knowledgeowl-css-defaults.md`** (these are permanent references that are always relevant — do not list them alongside project-specific files). Flag any project-specific files that may be stale (e.g., files that were present in earlier versions but may no longer be relevant). Ask the user: **"Here's what's in Reference/ (besides the KnowledgeOwl CSS reference docs, which are always included). Are all of these still relevant, or should any be removed before we start?"** Do not read everything upfront, as the folder may contain large files (e.g., downloaded marketing sites) — just list the filenames and ask.
5. Check `.claude/rules/project.md` for the deployment target. If it's set, use it. If it says `[sandbox / live KB]` (i.e., hasn't been filled in yet), ask the user: **"Are we deploying to a sandbox or directly to the live KB?"** and update the file with their answer.
6. Ask what the user wants to work on before making changes
7. **If the session involves significant visual iteration** (CSS changes, layout adjustments, or a mix of CSS and HTML work), mention that localhost preview is available: **"This involves visual changes. Want me to set up localhost preview so you can see changes without deploying each time?"** If accepted, follow the Localhost Preview section below. If declined, use the normal deploy-and-verify workflow.

## Version Folders

*Authoritative reference: `02-VERSION_CONTROL_PROCESS.md` in the process docs.*

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

*Authoritative reference: `02-VERSION_CONTROL_PROCESS.md` — "Returning to an Existing Project After a Gap".*

A `YYYY.MM.DD-current-state` folder contains the 12 code files copied from KnowledgeOwl's Customize > Style (HTML & CSS) sections (the core snapshot), plus placeholder copies of any `full-html-snapshot-*.html` files, `style-settings-colors.md`, and `homepage-custom-content.html` (the legacy Homepage Custom content field, if the project uses it) found in the most recent version folder. The html snapshot files are not pulled from KnowledgeOwl — the user captures them from the browser. Include placeholders for each one and ask the user to paste in fresh HTML. For `style-settings-colors.md`, the user only needs to update the hex values if the Style Settings colors may have changed in KnowledgeOwl since the last session; otherwise they can copy the values from the previous version's file. Do not make the folder read-only until all content — code files, HTML snapshots, `style-settings-colors.md`, and screenshots — has been added.

Create a `current-state` folder whenever resuming work after more than one day has passed since the last session — or sooner if you know that you or the customer made changes directly in KnowledgeOwl. Treat it like the `no-changes` folder: never modify it, and use it as the starting point for the next version folder. If a `current-state` folder exists and is newer than the latest version folder, copy from it (not the old version) when creating the next version.

Before locking the `current-state` folder, compare its code files against the last version folder and include a `CHANGES_FROM_v[last].md` documenting any differences. These changes were not made through this system — note that their origin (customer, teammate, direct KO edit) may be unknown. When creating the next version folder from `current-state`, name its CHANGES file `CHANGES_FROM_current-state.md`.

When a `current-state` folder is created, the user should also refresh supporting files. Old screenshots and reference materials can be actively misleading — they may show a design or layout that no longer exists. Remind the user to:
- Replace screenshots in `current-state/Screenshots/` with fresh ones showing the KB's current appearance
- Remove outdated materials from `Reference/` (e.g., deployed mockups, completed task exports) and add any new reference files for upcoming work
- Leave `knowledgeowl-css-quirks.md` and `knowledgeowl-css-defaults.md` in place — they're permanent references

## Localhost Preview (Optional)

*Authoritative reference: `03-LOCALHOST_PREVIEW.md` in the process docs (`https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/process-docs/03-LOCALHOST_PREVIEW.md`). Fetch it when the user accepts the trigger prompt below — it contains the full Step-by-Step Setup, troubleshooting, and limitations.*

For sessions involving significant visual iteration (CSS changes, layout adjustments, or a mix of CSS and HTML work), offer localhost preview to skip the deploy-and-verify cycle. Trigger prompt:

> "This involves visual changes. Want me to set up localhost preview so you can see changes without deploying each time?"

If accepted, fetch `03-LOCALHOST_PREVIEW.md` from the process docs and follow its Step-by-Step Setup section. During the session, keep `preview/custom-css.css` in sync with the version folder on every CSS edit, and run `rm -rf preview` when teardown is needed. If Claude Preview MCP tools are available, use `preview_screenshot` or `preview_inspect` to verify changes visually.

If declined, use the normal deploy-and-verify workflow.

## KnowledgeOwl Source CSS Lookup (Chad's Machine Only)

Two reference files in `Reference/` cover the most common CSS lookup needs:
- `knowledgeowl-css-quirks.md` — platform-specific gotchas and idiosyncrasies
- `knowledgeowl-css-defaults.md` — default selectors, property values, and CSS architecture

**Start with these files.** They cover the vast majority of what you need when writing CSS overrides.

If you need exact property values or full selector chains not covered in the reference files, and the KO source codebase is available at `/Users/chadtimblin/My Drive*/Claude Code desktop/ko-codebase`, you can read specific source CSS files directly for targeted lookups. **This codebase is only available on Chad's machine** — other teammates should rely on the reference files and the customer's HTML snapshot.

Key source files for targeted lookup:
- `public/css/public/ko-css.css` — CSS custom properties and KO-specific utilities (2,616 lines)
- `public/css/public/publicview.css` — Classic theme layout (7,468 lines)
- `public/css/public/publicview_modern.css` — Modern theme layout (7,416 lines)
- `public/css/public/standard.css` — Classic theme colors/typography (906 lines)
- `public/css/public/standard_modern.css` — Modern theme colors/typography (876 lines)
- `service/views/scripts/themer-templates/custom-css.css` — default custom CSS template (alert styles, TOC anchors, image captions, list numbering, PDF rules, etc.)
- `service/views/scripts/themer-templates/` — HTML templates defining page structure and class names

**Do not read these files speculatively.** Only look up a specific file when the reference files and HTML snapshot don't answer your question. Use targeted reads (specific line ranges) rather than reading entire files.

## Capturing Exact Brand Colors

Prefer the customer's downloaded marketing site (in `Reference/`) for colors, fonts, and assets. If the download doesn't yield confident, exact values — e.g., compiled/minified CSS, colors set via JS, or JS-rendered logos — use Claude in Chrome to read the **computed styles** off their live site (primary/CTA buttons, headings, body, links, nav, footer, plus `font-family`). Record the confirmed values in the project so the build and later sessions share one source of truth. See `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` §4 for details.

## CHANGES File

*Authoritative reference: `02-VERSION_CONTROL_PROCESS.md` — "Document Changes" and "Provide Deployment Instructions".*

Every new version folder and current-state folder must include a CHANGES file:
- **First version:** `CHANGES_FROM_no-changes.md`
- **Subsequent versions:** `CHANGES_FROM_v[previous].md` (e.g., `CHANGES_FROM_v2.md` in the v3 folder)
- **Current-state folders:** `CHANGES_FROM_v[last].md` (documents drift between the last version and the live KB — see "Current-State Folders" above)
- **First version after a current-state snapshot:** `CHANGES_FROM_current-state.md`

Copy the template from the no-changes folder and update it. Include these sections:
- Summary of what changed and why
- Which files were modified (with details)
- Color palette (only if new colors were introduced)
- What the user will see after deployment
- Manual steps needed in KnowledgeOwl (only if applicable — see below)
- Files to deploy (see below)

Delete any sections that don't apply to the current version. Only include files that were actually modified — do not list all 12 files every time.

## Deployment Instructions

*Authoritative reference: `02-VERSION_CONTROL_PROCESS.md` — "Provide Deployment Instructions".*

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

## Style Settings Colors

KnowledgeOwl's Style Settings (Customize > Style > Style Settings > Colors) include color pickers that generate dynamic theme CSS. This dynamic CSS loads *before* Custom CSS. When your changes introduce new brand colors or significantly alter the color scheme, the Style Settings colors should be updated to match — otherwise the theme-level CSS and your Custom CSS will have competing color values, which can cause visual inconsistencies and confuse anyone editing the KB later.

### Color-Change Checkpoint (mandatory, every version)

Whenever a version adds or changes a **color value** in Custom CSS or any custom code — a hex, `rgb()`/`hsl()`, named color, or a `var()` whose value changed — you MUST reconcile it against the Style Settings before presenting deployment instructions, **without being asked**. The theme CSS these settings generate loads *before* Custom CSS, so leaving them unaligned causes competing color values.

As part of writing each version's deployment instructions:
1. **State it in the conversation** (not only in the CHANGES file) as a table covering every affected setting: `| Style Setting | Current value | New value | Why |` — use the "Available Style Settings colors" table below to decide which settings a given color change touches.
2. **Record the same table** in the CHANGES "Manual Steps in KnowledgeOwl" section, and list the Style Settings changes **before** the code files in the deploy order.

If a version changes colors but **no** Style Setting is affected, say so explicitly ("No Style Settings changes needed for this version") so the decision is visible rather than silently skipped.

**When to update Style Settings:** Any version that changes brand colors, accent colors, or the overall color scheme. Not every version needs this — only those that shift the palette. (The checkpoint above still runs every time; it simply concludes with "no changes needed" when the palette is untouched.)

**How to handle it:**
1. Include the recommended Style Settings changes as a **manual step** in the CHANGES file (in the "Manual Steps in KnowledgeOwl" section), with a table showing each setting, its current value, and the recommended new value
2. In deployment instructions, list the Style Settings changes **before** the code file deployments — the theme-level CSS should already match when Custom CSS overrides layer on top
3. When telling the user to deploy in conversation, mention the Style Settings changes first

**Available Style Settings colors** (Customize > Style > Style Settings > Colors):

| Setting | What it affects |
|---------|-----------------|
| Top navigation bar | Top navigation bar background |
| Top navigation text | Top navigation text |
| H1s, H2s, H3s, etc. | Headings across the KB |
| Table of contents | Table of contents background |
| Table of contents text | Table of contents text |
| Highlights & Accents | Buttons, active states, accent elements — this is usually the most impactful setting |
| Icon color | Default category icon color |
| Icon background | Default category icon background |

## KnowledgeOwl File-to-Section Mapping

| File | KnowledgeOwl Location |
|------|-----------------------|
| `custom-css.css` | Customize > Style (HTML & CSS) > Custom CSS |
| `custom-head.html` | Customize > Style (HTML & CSS) > Custom `<head>` |
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
| `homepage-custom-content.html` | Customize > Homepage > Custom content *(legacy field — only some older KBs use it; not the same as `custom-html-5-homepage.html`)* |
