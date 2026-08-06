# Project Rules

You are helping customize a KnowledgeOwl knowledge base. Follow these rules for every session.

## Contents

**Running a session** — [At the Start of Each Session](#at-the-start-of-each-session) · [At the End of Each Session](#at-the-end-of-each-session--reflect--improve-suggest-only) · [Mandatory Checks](#mandatory-checks--the-five-that-are-easy-to-miss)

**Folders & versioning** — [Version Folders](#version-folders) · [Never Modify](#never-modify) · [Current-State Folders](#current-state-folders) · [CHANGES File](#changes-file)

**Tools & environment** — [Browser Tooling](#browser-tooling) · [Localhost Preview](#localhost-preview-optional) · [KnowledgeOwl Source CSS Lookup](#knowledgeowl-source-css-lookup-chads-machine-only)

**Starting a build** — [Fresh or Stock-Minimalist Builds](#fresh-or-stock-minimalist-builds) · [Using a Pre-Built Template](#using-a-pre-built-template--only-on-explicit-request) · [Capturing Exact Brand Colors](#capturing-exact-brand-colors)

**Design rules** — [Brand Color Tokens](#brand-color-tokens) · [Logo & Brand Assets](#logo--brand-assets) · [Style Settings Colors](#style-settings-colors) · [Editor Readability Guard](#editor-readability-guard-mandatory--every-build)

**Shipping** — [Deployment Instructions](#deployment-instructions) · [Post-Deploy Verification](#post-deploy-verification-dont-stop-at-pasted-the-files) · [Risky Edits](#risky-edits--bulk-renames-and-control-characters) · [Customer-Facing Docs](#customer-facing-docs--verify-the-claims-and-the-links)

**Lookup** — [KnowledgeOwl File-to-Section Mapping](#knowledgeowl-file-to-section-mapping)

---

## At the Start of Each Session

1. **Sync template files** — older customer projects may be missing files that were added to the template after the project was created. Ensure these files exist and are up to date:
   - **`Reference/knowledgeowl-css-quirks.md`** and **`Reference/knowledgeowl-css-defaults.md`** — fetch the latest versions from the template repo and overwrite the local copies (these are maintained centrally and should always match the repo):
     - `https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/project-template/Reference/knowledgeowl-css-quirks.md`
     - `https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/project-template/Reference/knowledgeowl-css-defaults.md`
   - **`.claude/rules/project.md`** — check if it exists. If missing, fetch the template from the repo and save it locally (the user will fill in customer details). If it already exists, leave its filled-in values alone (they're customer-specific) — but if it has no `# Baseline` section, append that section from the template with its values unfilled, so projects created before it existed pick it up too:
     - `https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/project-template/.claude/rules/project.md`
   - Do this quietly — no need to announce each file. Only mention it if a file was missing and created (e.g., "I noticed `.claude/rules/project.md` was missing, so I created it from the template — you'll need to fill in the customer name and KB.").
   - **Size tripwire on `project.md`.** It auto-loads every session, so its length is a standing tax on every conversation — one long-running project let it reach ~102 KB (~40K tokens, *every* session), roughly 60% of it superseded per-version notes. If it's over **~20 KB**, say so once and offer to prune: keep **full detail only for the newest version** (plus anything not yet live) and compress each superseded entry to a one-line digest. Nothing is lost — the CHANGES file in each version folder is the durable record. Don't prune unprompted; just flag it.
2. Review the latest version folder, the most recent `YYYY.MM.DD-current-state` folder (if one exists), or the `YYYY.MM.DD-no-changes` folder if no versions exist yet. **If this is the first session** (only the no-changes folder exists), confirm that all content is in place — code files, HTML snapshots, `style-settings-colors.md`, and screenshots — then run `chmod -R a-w [no-changes-folder]/` to make it read-only and protect it from accidental edits. Do not lock the folder until the user has finished adding all files. (The same lock-when-complete rule applies to `current-state` folders in step 3.)
   - **Settle the `# Baseline` facts here, once.** While confirming first-session content, fill in the `# Baseline` section of `.claude/rules/project.md` so later sessions never have to re-check the live KB for them:
     - **Homepage Custom content (legacy)** — ask the user whether **Customize > Homepage > Homepage content > Custom content** has anything in it. Most modern KBs leave it empty, and a brand-new KB always does. Record `empty` or `in use`. If `in use`, have them paste that field into `homepage-custom-content.html` before the folder is locked; if `empty`, leave the placeholder as-is — in the `no-changes` folder an empty placeholder is the record that the field was empty at project start, so don't delete it here (later `current-state` snapshots do skip the file — step 3). Ask this **one time only**; from then on, read the recorded answer instead of re-checking.
     - **Started from** — record whether the baseline came from the customer's existing code, the stock Minimalist defaults, or a theme template (and which).
   - **Check Library > Snippets for `<style>` / `<script>` blocks, and record what you find.** The 12 code fields are *not* the whole story: a snippet's `<style>` renders inside page content, which loads **after** Custom CSS, so it beats the theme at equal specificity — and it is invisible to the documented field-by-field capture. **"The Custom CSS is stock" is therefore not evidence that a KB has no custom styling.** A single snippet used across dozens of articles can override the theme's headings or links on exactly those pages. Note any such snippet in `# Baseline` (name + roughly how many articles reference it) so it's a known constraint rather than a post-deploy surprise. See quirks-doc §47 for the mechanism and the diagnostic.
3. **Create a current-state snapshot if needed** — if more than one day has passed since the latest version or `current-state` folder, **always** create a new `YYYY.MM.DD-current-state` folder. Do not ask whether to; tell the user it's needed and walk them through it. **The user pastes code into each file themselves** (e.g. via VS Code) — tell them which file to open and which KnowledgeOwl section to copy from, then move to the next. The full procedure — what the folder contains, reading `# Baseline` for the legacy field instead of re-checking the KB, the `CHANGES_FROM_v[last].md` drift record, and when to lock — is in **"Current-State Folders"** below.
4. **Review the `Reference/` folder** — list its contents, **excluding `knowledgeowl-css-quirks.md` and `knowledgeowl-css-defaults.md`** (these are permanent references that are always relevant — do not list them alongside project-specific files). Flag any project-specific files that may be stale (e.g., files that were present in earlier versions but may no longer be relevant). Ask the user: **"Here's what's in Reference/ (besides the KnowledgeOwl CSS reference docs, which are always included). Are all of these still relevant, or should any be removed before we start?"** Do not read everything upfront, as the folder may contain large files (e.g., downloaded marketing sites) — just list the filenames and ask.
5. Check `.claude/rules/project.md` for the deployment target. If it's set, use it. If it says `[sandbox / live KB]` (i.e., hasn't been filled in yet), ask the user: **"Are we deploying to a sandbox or directly to the live KB?"** and update the file with their answer.
6. Ask what the user wants to work on before making changes
7. **If the session involves significant visual iteration** (CSS changes, layout adjustments, or a mix of CSS and HTML work), mention that localhost preview is available: **"This involves visual changes. Want me to set up localhost preview so you can see changes without deploying each time?"** If accepted, follow the Localhost Preview section below. If declined, use the normal deploy-and-verify workflow.

## At the End of Each Session — Reflect & Improve (suggest only)

Help the toolkit get sharper over time by capturing what caused friction in how the session actually went. This is **suggest-only**: during a customer session you record improvement suggestions in the central log, but you NEVER *apply* them to the toolkit itself (this rules file, the `Reference/` CSS docs, the process docs, or the templates). You're working in the customer folder, and the CSS reference docs are overwritten from GitHub every session — a mid-session edit would be lost. Recording a suggestion for Chad to review ≠ applying it.

1. **Add each actionable improvement directly to `AWAITING REVIEW`.** Look up the toolkit's local path in `.claude/rules/project.md` ("Toolkit path"). In `improvement-log.md` at that toolkit root, add each concrete, actionable idea as its own entry at the top of the **`AWAITING REVIEW`** section (newest on top), following the format already used there: a `[P1]`–`[P3]` priority tag + a target tag (`[quirks-doc]`, `[defaults-doc]`, `[rules]`, `[process]`, `[template]`), the insight/fix, and ending with the project name + date. Look for: tools/sources that errored, stale or missing reference data (e.g. a CSS quirk or default value that wasn't documented), steps that wasted effort, coverage gaps, or calibration/communication observations. Keep entries compact; fold related observations into one item. **Only add genuinely actionable, generalizable improvements** — if nothing rose to that bar, add nothing and just say "no notable friction this session" in the conversation. Do NOT move items between status sections — that's a human-only triage step.
   - **If the Toolkit path isn't set or the log isn't reachable** (the typical case for anyone other than Chad): do NOT create any file. Just mention the friction in the conversation and suggest the user share it with Chad in Slack if they think it's worth improving. There is deliberately no teammate logging process.
2. **Route CSS gotchas to the log, not the docs.** If you discovered a new KnowledgeOwl CSS quirk or default value, do NOT edit `Reference/knowledgeowl-css-quirks.md` or `knowledgeowl-css-defaults.md` (they are re-fetched and overwritten from GitHub each session, so a local edit is lost and can't reach the team). Add it as an `AWAITING REVIEW` entry tagged `[quirks-doc]` or `[defaults-doc]` so Chad can fold it into the central file.
3. **One-line heads-up.** Tell the user in one line what you logged (e.g. "Added 2 items to the toolkit improvement-log's AWAITING REVIEW, suggest-only, for your review."). Keep it to one line.
4. **Never apply during a session.** Don't edit or push the toolkit yourself, and don't move items between the log's status sections. Applying accepted suggestions — and triaging `AWAITING REVIEW` into `APPLIED`/`DECLINED`/`DEFERRED` — is Chad's separate step, done in a session opened in the toolkit repo. At **project closeout**, review/dedupe `AWAITING REVIEW` — see "Project Closeout" in `02-VERSION_CONTROL_PROCESS.md`.

## Mandatory Checks — the five that are easy to miss

These are the gates that must not be skipped. Each has a full section below; this is the list so none gets lost in the middle of a build. **State the outcome of each in the conversation** — including "not needed this version," so the decision is visible rather than silently omitted.

| Check | Fires when | Detail |
|---|---|---|
| **Snippets scan** | First session, during baseline capture | Check Library > Snippets for `<style>` / `<script>` and record it in `# Baseline`. Content-level CSS loads *after* Custom CSS and outranks the theme, so "the Custom CSS is stock" proves nothing — step 1 above, and quirks §47 |
| **Color-Change Checkpoint** | Any version that adds or changes a color value | Reconcile against Style Settings, state the table, and contrast-check every token that colors text — "Style Settings Colors" below |
| **Editor Readability Guard** | Every build | The guard block must be present in Custom CSS, and verified with the editor-simulation harness *before* deploying — "Editor Readability Guard" below |
| **Pre-deploy selector diff** | Before deployment instructions for any wholesale field replacement | Set-difference the selectors so a customer's hand-added rule can't vanish silently — "Deployment Instructions" below |
| **Post-deploy verification** | After the user deploys a color / type / layout change | Sample what actually rendered; this failure class is invisible in the version folder — "Post-Deploy Verification" below |

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

**Corollary — don't reorganize project docs that locked folders point at.** Because version and current-state folders are `chmod`'d read-only, any path referenced *inside* them is effectively frozen: you cannot fix a stale reference in a locked folder without unlocking a permanent record. So renaming a doc, number-prefixing it, or moving it into a subfolder can break references you have no clean way to repair. Before moving any project doc, grep for its path across `.claude/rules/project.md`, the process docs, and **every** version folder — and if a locked folder references it, leave the path alone.

## Current-State Folders

*Authoritative reference: `02-VERSION_CONTROL_PROCESS.md` — "Returning to an Existing Project After a Gap".*

A `YYYY.MM.DD-current-state` folder contains the 12 code files copied from KnowledgeOwl's Customize > Style (HTML & CSS) sections (the core snapshot), plus placeholder copies of any `full-html-snapshot-*.html` files and `style-settings-colors.md` found in the most recent version folder — and `homepage-custom-content.html` only when `# Baseline` in `.claude/rules/project.md` records the legacy Homepage Custom content field as `in use`. If that answer isn't recorded yet (a project predating the `# Baseline` section), ask once, then write it there so no later session asks again.

The html snapshot files are not pulled from KnowledgeOwl — the user captures them from the browser (Chrome DevTools > Elements > right-click `<html>` > **Copy outerHTML**). Include a placeholder for each and ask the user to paste in fresh HTML. For `style-settings-colors.md`, the user only needs to update the hex values if the Style Settings colors may have changed in KnowledgeOwl since the last session; otherwise they can copy the values from the previous version's file.

**Verify the snapshot came from the RIGHT KB before you trust it.** A capture from the wrong KB is easy to make and invisible afterwards: on one project the deployment target was a sandbox but the 12 code files and both HTML snapshots came from the **live** KB. The two had diverged in *both* directions — live carried newer author CSS, the sandbox carried a teammate's width experiment absent from live — so building on the wrong baseline would have silently reverted real work. Nothing else in this process catches it.

Check the captured `full-html-snapshot-*.html` for its `rel="canonical"` (or any absolute KB URL in the head) and confirm the host matches the deployment target recorded in `.claude/rules/project.md`. Then **say which KB you snapshotted** — e.g. "Snapshot is from `acme-sandbox.knowledgeowl.com`, matching the sandbox target." If it doesn't match, stop and recapture; don't reconcile the difference.

Once **all** content is in place — the 12 code files, the HTML snapshots, `style-settings-colors.md`, screenshots, and the `CHANGES_FROM_v[last].md` drift record (next paragraph) — run `chmod -R a-w [current-state-folder]/` to make it read-only, then proceed. Do not lock a partially-captured folder.

Create a `current-state` folder whenever resuming work after more than one day has passed since the last session — or sooner if you know that you or the customer made changes directly in KnowledgeOwl. Treat it like the `no-changes` folder: never modify it, and use it as the starting point for the next version folder. If a `current-state` folder exists and is newer than the latest version folder, copy from it (not the old version) when creating the next version.

Before locking the `current-state` folder, compare its code files against the last version folder and include a `CHANGES_FROM_v[last].md` documenting any differences. These changes were not made through this system — note that their origin (customer, teammate, direct KO edit) may be unknown. When creating the next version folder from `current-state`, name its CHANGES file `CHANGES_FROM_current-state.md`.

When a `current-state` folder is created, the user should also refresh supporting files. Old screenshots and reference materials can be actively misleading — they may show a design or layout that no longer exists. Remind the user to:
- Replace screenshots in `current-state/Screenshots/` with fresh ones showing the KB's current appearance
- Remove outdated materials from `Reference/` (e.g., deployed mockups, completed task exports) and add any new reference files for upcoming work
- Leave `knowledgeowl-css-quirks.md` and `knowledgeowl-css-defaults.md` in place — they're permanent references

## Browser Tooling

A session may expose more than one browser surface, and the tool names change over time — so check what's actually available rather than assuming. **Default to the built-in browser for everything**, login-gated targets included: it's a separate profile from the user's everyday browser, so it starts signed out, but it can be logged into like any other browser.

- **Never enter credentials yourself.** When a target needs a login — the KnowledgeOwl admin app (`app.knowledgeowl.com`, including the article editor iframe), a private or IP-restricted KB, a post-login state like the Restricted Access page — ask the user to sign in inside the built-in browser, then continue working there.
- **The real-Chrome surface is a convenience, not a capability.** Its only edge is already carrying the user's existing sessions. Reach for it when the user is signed in there and would rather not re-authenticate, or when they ask for it — not merely because a page sits behind a login.

Either way, pull **values** — hex codes, font names, computed styles, element rects — rather than whole files. Browser tool results can truncate or filter large or encoded payloads (base64 images, long SVG path data).

## Localhost Preview (Optional)

*Authoritative reference: `03-LOCALHOST_PREVIEW.md` in the process docs (`https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/process-docs/03-LOCALHOST_PREVIEW.md`). Fetch it when the user accepts the trigger prompt below — it contains the full Step-by-Step Setup, troubleshooting, and limitations.*

For sessions involving significant visual iteration (CSS changes, layout adjustments, or a mix of CSS and HTML work), offer localhost preview to skip the deploy-and-verify cycle. Trigger prompt:

> "This involves visual changes. Want me to set up localhost preview so you can see changes without deploying each time?"

If accepted, fetch `03-LOCALHOST_PREVIEW.md` from the process docs and follow its Step-by-Step Setup section. During the session, keep `preview/custom-css.css` in sync with the version folder on every CSS edit, and run `rm -rf preview` when teardown is needed. Use the session's browser tooling (see "Browser Tooling" above) to verify changes visually: screenshot for **look**, computed styles and element rects for **geometry**.

If declined, use the normal deploy-and-verify workflow.

## KnowledgeOwl Source CSS Lookup (Chad's Machine Only)

**Start with the two `Reference/` files** — `knowledgeowl-css-quirks.md` (platform gotchas) and `knowledgeowl-css-defaults.md` (default selectors, values, CSS architecture). They cover the vast majority of what you need when writing overrides. Each opens with an index; use it rather than reading the whole file.

If they and the customer's HTML snapshot don't answer the question, and the KO source codebase is available at `/Users/chadtimblin/My Drive*/Claude Code/ko-codebase/knowledgeowl` (a glob — resolve with `ls -d`), you can read source CSS directly. **The codebase only exists on Chad's machine** — everyone else relies on the reference docs plus the snapshot, and inspects computed styles in the browser.

Which file holds what, and when reading source beats debugging in the browser (notably the **editor-iframe** and **PDF** contexts, where it's often the only decisive view): **`knowledgeowl-css-defaults.md` → "Source File Map."**

**Do not read source speculatively.** Only open a specific file to answer a specific question, and use targeted line ranges rather than whole files.

## Capturing Exact Brand Colors

Prefer the customer's downloaded marketing site (in `Reference/`) for colors, fonts, and assets. If the download doesn't yield confident, exact values — e.g., compiled/minified CSS, colors set via JS, or JS-rendered logos — use the session's browser tooling to read the **computed styles** off their live site (primary/CTA buttons, headings, body, links, nav, footer, plus `font-family`) — see "Browser Tooling" above. Record the confirmed values in the project so the build and later sessions share one source of truth. See `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` §4 for details.

## Fresh or Stock-Minimalist Builds

When the KB is **brand-new or still on the stock Minimalist theme** with no real custom code yet — common for prospect-trial and demo builds — don't walk the user through copying each field out by hand. Offer the documented defaults instead:

> "This KB looks uncustomized. Want me to drop in the documented Minimalist defaults as the `no-changes` baseline instead of you copying each field by hand?"

If accepted, follow `04-MINIMALIST_THEME_DEFAULTS.md` (fetch on demand) — it `curl`s the 12 code files from the repo byte-exact, before the folder is locked. Record `stock Minimalist defaults` under **Started from** in `# Baseline`.

On a fresh build the *rest* of the capture is largely moot too — scale it to what actually exists rather than asking for the full set (Style Settings values, snapshots, screenshots, the legacy field: see "Scaling the rest of the capture" in `04-MINIMALIST_THEME_DEFAULTS.md`).

**Don't use this path to overwrite a KB whose custom code is worth keeping** — the `no-changes` folder exists to preserve the customer's real work as the rollback baseline. **But "has custom code" isn't automatically "worth keeping":** a sandbox carrying a trial-era or pre-sales first-pass theme that this build is meant to replace is a legitimate restart-from-stock case. Don't bulldoze it silently either — ask which the user wants (capture it as a real rollback point / defaults as baseline / defaults plus the old theme archived in `Reference/`). Options and trade-offs: `04-MINIMALIST_THEME_DEFAULTS.md`.

**One consequence you must handle if you take either defaults route:** `style-settings-colors.md` then holds the Minimalist defaults, not the customer's actual swatches — so it no longer describes the live KB. That silently breaks the Color-Change Checkpoint, which needs a real "Current value" or it produces a table of fiction. **Confirm the 8 live Style Settings swatches before deploying the first version** and record those as the current values. Nothing else prompts you to do this.

## Using a Pre-Built Template — Only on Explicit Request

**Design bespoke by default.** Do **not** start a build from a pre-built theme template, and do **not** propose one, unless the user explicitly asks. The templates are generic in layout by construction, so reaching for one unprompted caps the design at whatever that template already does. That trade-off is the user's to make, not yours.

**"Explicitly asks" means** the user names a template ("apply `modern-docs`") or asks for the template path in substance ("start from one of the toolkit templates", "re-skin an existing template for this"). It does **not** include a stylistic brief that merely echoes a template's name — a prospect who wants a "modern" or "bright, airy" look is describing a **design direction**, not requesting `modern-docs` or `aurora-docs`. Design to the brief.

**When the user does ask**, follow the toolkit's `process-docs/theme-templates/README.md`: fetch the template's raw files into the current version folder, then swap the `--brand-*` tokens to the prospect's brand, reconcile the Style Settings, and set the logo + hero. The available templates and each one's token-by-token swap map live under `process-docs/theme-templates/`. Fetch the how-to on demand:
`https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/process-docs/theme-templates/README.md`

**This gate covers using a template's files as a build's starting point — nothing else.** Still fine without asking:
- **The stock Minimalist defaults** (`process-docs/minimalist-theme-defaults/`) — that's the `no-changes` baseline, not a designed theme. See "Fresh or Stock-Minimalist Builds" above.
- **`theme-templates/_reference-snapshots/`** — a genericized homepage + article used as a preview harness, not a theme.
- **Reading a template for reference** — e.g. to see how a pattern was tokenized. Take the technique, not the design; the build should still be its own.

## Brand Color Tokens

Define the brand palette as CSS custom properties at the top of Custom CSS (a `:root` block) and reference them everywhere — one place to swap when the theme is reused for another brand. For any brand color used in **translucent effects** (glows, tints, gradient washes, an animated ambient), also define its **`-rgb` components** and compose the alpha with `rgba(var(--…-rgb), α)`:

```css
:root {
  --brand-primary: #133253;
  --brand-primary-rgb: 19, 50, 83;   /* same color, as R,G,B */
}
/* solids use the hex; effects use the rgb components, so BOTH re-skin from one token */
.some-glow { box-shadow: 0 24px 60px -20px rgba(var(--brand-primary-rgb), .34); }
```

Without the `-rgb` pair, `rgba()` effects keep hardcoded color literals and *don't* follow a token change — so the theme only half-re-skins. This is what makes a build cleanly reusable as a template (see the `theme-templates/` templates and their extraction process).

## Logo & Brand Assets

**Upload the logo through KnowledgeOwl's native uploader, not custom code.** KO has a dedicated logo field at **Customize > Style > Style Settings > Logo** — that's where a KB's logo belongs. It lives where the customer expects to manage it, survives theme and version changes, and KO handles the markup and responsive sizing for you.

- **Treat the logo as a manual step**, listed in the CHANGES file's "Manual Steps in KnowledgeOwl" section. Do **not** hardcode or reference a logo image URL in Custom CSS/HTML, and do **not** recolor a logo with a CSS `filter` (e.g., whitening a dark logo for a dark nav). If the design needs a different logo variant, **upload that variant** — customers usually have a light/white version for dark backgrounds — rather than transforming it in code. Uploading the right file is more robust and keeps the theme portable as a template (nothing brand-specific baked into the CSS).
- **Other theme images** that genuinely must be referenced from CSS (e.g., a homepage hero background) go in the **KB's file library**, referenced by that KB-hosted URL — never hotlink the customer's marketing site. See `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` §4.
- **Capturing vs. deploying:** pulling the customer's logo into `Reference/` (from their site or a brand kit) so you can see it while designing is fine and separate — that's reference material, not where the logo gets deployed.
- **Quantify logo contrast against the nav — don't eyeball it.** Whenever the nav is a brand color (or the theme darkens it), measure the logo's contrast against that background instead of judging it by eye: sample the **opaque** pixels of the logo PNG and take their **10th-percentile luminance** (the darkest meaningful part of the mark, ignoring anti-aliased edges), then compute the WCAG ratio against the nav color — see the colour-math helper in `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` §4. This is what turns a vague "looks a bit dark" into **"1.61:1 — half the wordmark disappears"** (the customer's white variant, for comparison: 19.19:1), which is what makes "upload the white logo variant" read as **required** rather than cosmetic. Put the measured number in the CHANGES file's Manual Steps entry so the customer sees why.

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

**Before handing over deployment instructions for a wholesale field replacement, assert that no baseline selector went missing.** Replacing the whole Custom CSS field is the normal way to apply a theme, and it's also how a customer's one hand-added rule gets silently deleted — the loss shows up as an *absence*, which nobody notices (quirks §44 is the classic case: a lone `display` override that keeps the KB's own name visible). Cheap mechanical check: parse selectors out of both files (`([^{}]+)\{`), set-difference baseline → new, and report anything that disappeared. On a real build this proved a new version dropped none of the baseline's 159 selectors. If something *is* intentionally dropped, say so in the CHANGES file rather than letting it be silent.

**Lead with the deploy list — keep it scannable.** The first thing the user should see when you hand off a change is a tight list (a short table or a few bullets) of exactly which file(s) to copy and where each one goes in KnowledgeOwl. Put that up front and keep the surrounding prose minimal — the user is usually mid-deploy and needs the "what + where," not a long explanation. Save rationale and detail for after the list (or the CHANGES file).

## Risky Edits — Bulk Renames and Control Characters

**Before ANY bulk rename or find-replace, enumerate every occurrence and hunt false positives first.** A rename that looks like a one-line `sed` routinely isn't — real near-misses have included a same-named variable in an unrelated engine on the same page, and a CSS class the JS *composes* at runtime so the grep never sees it. Rename via a script that (a) lists every distinct token and count **first** for you to eyeball, (b) applies rules **longest-first in ONE pass**, (c) asserts a list of MUST-SURVIVE patterns, (d) asserts zero orphans of the old token. A cyclic renumber (06→07, 07→08, 08→06) **must** be a single atomic pass — sequential replaces collide.

**Never write a raw control character into a file** — writing prose *about* one is enough to embed it. Use the escape (`\x00`) or the word NUL, never the literal byte. A NUL makes `file` report the doc as **`data`** and plain `grep` return **nothing**, so an end-of-session consistency sweep silently *passes* while unable to read the file at all.

- **Guard:** `file .claude/rules/project.md *.md` — anything reporting `data` is corrupted. Or `grep -rlP '[\x00-\x08\x0B\x0C\x0E-\x1F]' .`
- **Habit:** if a grep of a file you *know* has content returns empty, suspect a binary byte before doubting the content.

*Worked examples of both traps: `02-VERSION_CONTROL_PROCESS.md` → "Risky Edits".*

## Customer-Facing Docs — Verify the Claims and the Links

When a build produces an author guide or any doc the customer will follow, two things need checking that nothing else in this process catches:

**1. Every "the theme does X automatically" claim must name the code that does X.** Documentation written *ahead* of the implementation is worse than stale documentation, because the reader has no way to tell — on one build an author followed the guide verbatim and got nothing, because the sentence described intended behavior the code didn't have yet. Cheap end-of-build check: for each such claim, point at the code. If you can't, it's a promise, not a doc — mark the gap explicitly in the guide or don't ship the sentence.

**2. Verify KnowledgeOwl help-doc links against the LIVE site, never against the local `support-kb` Markdown mirror.** The mirror's file layout does **not** map 1:1 to live URLs — it has standalone `.md` files for topics that are really **anchors inside a parent article**. So "the mirror has a file named `{slug}.md`" is **not** evidence the URL exists; that false confidence shipped **four wrong help links** in an author guide after all were reported "verified." Check each slug against the live site (`https://support.knowledgeowl.com/help/{slug}`, or search the live Support KB) and use the real URL including any `#anchor`. The mirror is fine for content and grep — not for URL validity.

*Known mirror paths that are really anchors: `02-VERSION_CONTROL_PROCESS.md` → "Customer-Facing Docs".*

## Post-Deploy Verification (don't stop at "pasted the files")

**Deploying is not the same as done.** A class of failure exists that is invisible in the version folder, in Style Settings, and in every deployed field — most notably a `<style>` block living in **page content** (a snippet or hand-written article HTML), which loads after Custom CSS and wins at equal specificity (quirks-doc §47). The version folder can be perfect and the live page still wrong.

So after the user deploys a version that changed colors, typography, or layout:

1. **Sample what actually rendered** — look at the live page and compare the real values against the intended tokens. A screenshot plus a pixel sample is enough to catch a wrong color; reading computed styles is better where you can.
2. **If something doesn't match, enumerate the matching rules in cascade order** rather than reasoning about specificity by hand — use the **guarded** diagnostic in quirks-doc §47 (the naïve version reports a false "nothing else matches"; §47 explains why and ships the fixed snippet).
3. **Say what you verified** in the conversation, the same way the Color-Change Checkpoint is stated — e.g. "Verified on the live article page: H1 renders `#343f37` as intended."

If the KB is login-gated, have the user sign into the built-in browser (see "Browser Tooling") so this step is still possible.

## Style Settings Colors

KnowledgeOwl's Style Settings (Customize > Style > Style Settings > Colors) include color pickers that generate dynamic theme CSS. This dynamic CSS loads *before* Custom CSS. When your changes introduce new brand colors or significantly alter the color scheme, the Style Settings colors should be updated to match — otherwise the theme-level CSS and your Custom CSS will have competing color values, which can cause visual inconsistencies and confuse anyone editing the KB later.

### Color-Change Checkpoint (mandatory, every version)

Whenever a version adds or changes a **color value** in Custom CSS or any custom code — a hex, `rgb()`/`hsl()`, named color, or a `var()` whose value changed — you MUST reconcile it against the Style Settings before presenting deployment instructions, **without being asked**. The theme CSS these settings generate loads *before* Custom CSS, so leaving them unaligned causes competing color values.

As part of writing each version's deployment instructions:
1. **State it in the conversation** (not only in the CHANGES file) as a table covering every affected setting: `| Style Setting | Current value | New value | Why |` — use the "Available Style Settings colors" table below to decide which settings a given color change touches.
2. **Record the same table** in the CHANGES "Manual Steps in KnowledgeOwl" section, and list the Style Settings changes **before** the code files in the deploy order.

If a version changes colors but **no** Style Setting is affected, say so explicitly ("No Style Settings changes needed for this version") so the decision is visible rather than silently skipped.

3. **Contrast-check every token that colors TEXT — measure it, don't eyeball it.** Any color assigned to headings, body text, or links must clear **AA (≥4.5:1)** against its background, and real brand colors routinely fail: a logo terracotta at 4.31:1 and a brand orange at 3.04:1 both look fine in a swatch and are unreadable as body-link text. Use the colour-math helper in `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` §4 and state the measured ratio in the conversation. When the true brand hex fails, darken it, keep the bright original for decorative roles, record **both** values, and comment the deviation inline so a later session doesn't "correct" it back. (Same helper answers "did this color actually change?" via CIEDE2000 — useful when a customer sends revised swatches with no changelog.)

**When to update Style Settings:** Any version that changes brand colors, accent colors, or the overall color scheme. Not every version needs this — only those that shift the palette. (The checkpoint above still runs every time — it covers the how: the conversation table, the CHANGES "Manual Steps" record, and Style Settings changes listed **before** the code files, both in the deploy order and when walking the user through deployment in conversation. When the palette is untouched, it simply concludes with "no changes needed.")

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

## Editor Readability Guard (mandatory — every build)

The Froala **article editor** renders your compiled Custom CSS in a **white iframe** that
loads neither the Style-Settings color block nor the Custom `<head>` — so unscoped and
`.documentation-article`-scoped theme text colors paint in there too, where a light or brand
color is unreadable. A recurring dark-/custom-theme trap that has bitten headings and links on
real builds. **Canonical spec of that cascade — body classes, what loads, why theme-scoped
rules don't apply — is quirk #28; don't restate it, link it.**

**The rule:** **every build's Custom CSS must contain the Editor Readability Guard block** —
the canonical, copy-whole block in `Reference/knowledgeowl-css-quirks.md` §28. It is
**editor-only and provably safe** (`fr-view` / `fr-editor-svelte` / `cke_editable` exist only
inside the editor iframe — never on public pages or in PDF), so it never affects the live
site. Keep it even when in doubt; the cost of having it is zero.

**Why a rule and not just the baseline:** the guard ships inside the Minimalist default
(`minimalist-theme-defaults/custom-css.css`) and each theme template, so clean-start builds
have it automatically. But a build that starts from the **customer's existing Custom CSS**
(pasted into the `no-changes` baseline) inherits neither — this rule is what guarantees those
builds get it too.

**Folded into the Color-Change Checkpoint:** whenever a version adds or changes a **text**
color (heading, link, body, or a `--text-*` token), as part of that checkpoint **confirm the
guard is present in Custom CSS and that any newly-recolored text element is covered by it** —
and say so in the conversation (e.g. "Editor Readability Guard present; covers the new link
color"). If a build's editor canvas is intentionally not white, adjust the guard's hexes
rather than removing it.

**Verify it mechanically, before deploying — don't eyeball it afterwards.** Because that
cascade is fully specified (quirk #28), it reproduces locally. Use the ready-made harness:
`https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/process-docs/editor-simulation/editor-simulation.html`
Point it at the KB's `ko-*.css` bundle URL plus the version's compiled `custom-css.css`, open
it, and read the PASS/FAIL/STOCK table. Report the result in the conversation as part of the
Color-Change Checkpoint. Setup and how to read it: `process-docs/editor-simulation/README.md`.

Two distinct failures, with **different** fixes — the harness tells you which:
- **Heading or link fails** → the guard is missing or doesn't cover it. Add/extend §28's block.
- **Body-level text fails** → do **not** extend the guard (it leaves body text alone by design
  so authors' toolbar colors survive). Scope the leaking theme rule live+PDF-only with
  `.hg-article-body:not(.documentation-article)` — quirk #29.

Rows reading **STOCK** are at KO's own editor color and are not build regressions, even where
KO's default is itself below AA (its stock link blue is ~4.2:1 on white). A live spot-check in
the real editor after deploy is still worth doing as confirmation — but it is no longer the
mechanism.

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
| `homepage-custom-content.html` | Customize > Homepage > Homepage content > Custom content *(legacy field — only some older KBs use it; not the same as `custom-html-5-homepage.html`. Governed by `# Baseline` in `.claude/rules/project.md` — skip the file entirely when it records `empty`.)* |
