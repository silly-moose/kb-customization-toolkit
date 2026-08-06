# Project Rules

You are helping customize a KnowledgeOwl knowledge base. Follow these rules for every session.

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
3. **Create a current-state snapshot if needed** — check the date of the latest version folder or `current-state` folder. If more than one day has passed since the last session, **always** create a new `YYYY.MM.DD-current-state` folder — do not ask whether to do this, just tell the user it's needed and walk them through it. Create the folder with empty placeholder files for all 12 code sections, and also create placeholder copies of any `full-html-snapshot-*.html` files and `style-settings-colors.md` found in the most recent version folder. For the legacy Homepage Custom content field, **read `# Baseline` in `.claude/rules/project.md` instead of re-checking the KB**: if it records `in use`, include a `homepage-custom-content.html` placeholder and have the user refresh it from Customize > Homepage > Homepage content > Custom content; if it records `empty`, skip the file entirely and don't raise it. Only if the answer isn't recorded yet (a project set up before the `# Baseline` section existed) ask once — then write the answer there so no later session asks again. **The user pastes code directly into each file themselves** (e.g., via VS Code) — do not ask them to paste code into the Claude Code conversation. Tell them which file to open and which KnowledgeOwl section to copy from, then move to the next file. For HTML snapshots, ask the user to paste fresh HTML into each placeholder (captured via Chrome DevTools > Elements > right-click `<html>` > Copy outerHTML). For `style-settings-colors.md`, ask the user to update the hex values only if the Style Settings colors may have changed in KnowledgeOwl since the last session; otherwise they can copy the values from the previous version's file. Once all files are in place — the 12 code files, the html snapshot files, `style-settings-colors.md`, screenshots, **and the `CHANGES_FROM_v[last].md` drift record** (required in every current-state folder — see "Current-State Folders" below; write it before locking) — run `chmod -R a-w [current-state-folder]/` to make it read-only. Then proceed.
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

A `YYYY.MM.DD-current-state` folder contains the 12 code files copied from KnowledgeOwl's Customize > Style (HTML & CSS) sections (the core snapshot), plus placeholder copies of any `full-html-snapshot-*.html` files and `style-settings-colors.md` found in the most recent version folder — and `homepage-custom-content.html` only when `# Baseline` in `.claude/rules/project.md` records the legacy Homepage Custom content field as `in use`. The html snapshot files are not pulled from KnowledgeOwl — the user captures them from the browser. Include placeholders for each one and ask the user to paste in fresh HTML. For `style-settings-colors.md`, the user only needs to update the hex values if the Style Settings colors may have changed in KnowledgeOwl since the last session; otherwise they can copy the values from the previous version's file. Do not make the folder read-only until all content — code files, HTML snapshots, `style-settings-colors.md`, screenshots, and the `CHANGES_FROM_v[last].md` drift record (next paragraph) — has been added.

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

Two reference files in `Reference/` cover the most common CSS lookup needs:
- `knowledgeowl-css-quirks.md` — platform-specific gotchas and idiosyncrasies
- `knowledgeowl-css-defaults.md` — default selectors, property values, and CSS architecture

**Start with these files.** They cover the vast majority of what you need when writing CSS overrides.

If you need exact property values or full selector chains not covered in the reference files, and the KO source codebase is available at `/Users/chadtimblin/My Drive*/Claude Code/ko-codebase/knowledgeowl` (a glob — resolve it with `ls -d`; the git repo root — `public/`, `service/`, etc. live directly under it), you can read specific source CSS files directly for targeted lookups. **This codebase is only available on Chad's machine** — other teammates should rely on the reference files and the customer's HTML snapshot.

Key source files for targeted lookup:
- `public/css/public/ko-css.css` — CSS custom properties and KO-specific utilities (~2,700 lines)
- `public/css/public/publicview.css` — Classic theme layout (7,468 lines)
- `public/css/public/publicview_modern.css` — Modern theme layout (7,416 lines)
- `public/css/public/standard.css` — Classic theme colors/typography (906 lines)
- `public/css/public/standard_modern.css` — Modern theme colors/typography (876 lines)
- `service/views/scripts/themer-templates/custom-css.css` — default custom CSS template (alert styles, TOC anchors, image captions, list numbering, PDF rules, etc.)
- `service/views/scripts/themer-templates/` — HTML templates defining page structure and class names

**When to reach for the source (Chad only).** If a Custom CSS override "isn't taking," or an element renders unexpectedly (invisible, wrong size/color, clipped, mis-positioned), the fast path is to `grep` these files for the selector/element and read the *actual winning rule* — rather than deep-debugging computed styles in the browser, which is noisy and slow (accumulated injected styles, timing/JS races, cross-origin sheets you can't read). Confirm the real rule in the source, then write a scoped override that beats it. This is *especially* the fast path for the **editor-iframe** and **PDF-export** contexts (see quirks-doc §28 and §14): neither can be inspected like a normal page in the browser, so reading the source is often the only decisive way to see the real cascade there. (Teammates without the codebase: rely on the customer's HTML snapshot + the reference files, and inspect computed styles in the browser.)

**Do not read these files speculatively.** Only look up a specific file when the reference files and HTML snapshot don't answer your question. Use targeted reads (specific line ranges) rather than reading entire files.

## Capturing Exact Brand Colors

Prefer the customer's downloaded marketing site (in `Reference/`) for colors, fonts, and assets. If the download doesn't yield confident, exact values — e.g., compiled/minified CSS, colors set via JS, or JS-rendered logos — use the session's browser tooling to read the **computed styles** off their live site (primary/CTA buttons, headings, body, links, nav, footer, plus `font-family`) — see "Browser Tooling" above. Record the confirmed values in the project so the build and later sessions share one source of truth. See `01-KB_CUSTOMIZATION_PROJECT_SETUP.md` §4 for details.

## Fresh or Stock-Minimalist Builds

When the KB is **brand-new or still on the stock Minimalist theme** with no real custom code yet — common for prospect-trial and demo builds — don't walk the user through copying each field out by hand. Offer the documented defaults instead:

> "This KB looks uncustomized. Want me to drop in the documented Minimalist defaults as the `no-changes` baseline instead of you copying each field by hand?"

If accepted, follow `04-MINIMALIST_THEME_DEFAULTS.md` (fetch on demand) — it `curl`s the 12 code files from the repo byte-exact, before the folder is locked. Record `stock Minimalist defaults` under **Started from** in `# Baseline`.

On a fresh build the *rest* of the capture is largely moot too, so scale it to what actually exists rather than asking for the full set:

- **Style Settings colors** — on a **brand-new** KB the values *are* the Minimalist defaults already listed at the bottom of `style-settings-colors.md`, so copy them up into "Customer's values" rather than clicking through every swatch. On an **older KB that merely looks stock, confirm each swatch instead**: Style Settings live in their own UI, so the colors can have been changed without Custom CSS/HTML ever being touched.
- **HTML snapshots** — still capture one homepage and one article. They show KO's stock rendered DOM, which is exactly what the build will be overriding.
- **Screenshots** — one homepage and one article is enough. There's no customer design to preserve, so don't chase a full page inventory.
- **Legacy Homepage Custom content** — always empty on a brand-new KB, so there's nothing to check: record `empty` in `# Baseline` (step 2), leave the `no-changes` placeholder as-is, and move on.

**Don't use this path to overwrite a KB whose custom code is worth keeping.** The `no-changes` folder exists to preserve the customer's real work as the rollback baseline — capture that the normal way instead.

### The exception: deliberately discarding a throwaway theme

There's a legitimate and fairly common case the rule above would otherwise forbid: **a sandbox already carries a trial-era or pre-sales first-pass theme, and the build is meant to start over from stock.** Nobody wants to roll back to it. Don't treat that as "the KB has custom code, capture it" — but don't silently bulldoze it either. Ask which of these the user wants:

| Option | When it fits |
|---|---|
| **Capture the live code as a true rollback point** (normal path) | Any chance someone wants the old theme back, or it's on a live KB |
| **Use the Minimalist defaults as the baseline** | A sandbox throwaway nobody will miss — cleanest start |
| **Defaults as baseline, old theme archived in `Reference/`** | Recommended default for a throwaway: costs one file, keeps the option to look back |

**One consequence to handle explicitly if you take either defaults route:** `style-settings-colors.md` no longer describes the live KB — it now holds the Minimalist defaults, not the customer's actual swatches. That silently breaks the Color-Change Checkpoint, which needs a real "Current value" for its table and would otherwise produce a table of fiction. So **confirm the 8 live Style Settings swatches before deploying the first version** and record those as the current values. Cheap, but nothing else prompts you to do it.

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

**Before ANY bulk rename or find-replace, enumerate every occurrence and hunt false positives first.** A rename that looks like a one-line `sed` routinely isn't. Two real near-misses, both invisible to a grep for the obvious string:

- A local variable `var cb = el('input','')` in a **different** engine on the same page — a bare `cb` → `faq` replace would have silently broken an unrelated control. The fix was to only ever rewrite the token `cb-`, hyphen **required**, never a bare `cb`.
- A CSS class the JS *composes* at runtime (`'gt-' + typeSlug`), so renaming the slug without the matching CSS silently drops a whole column's color. Same hazard for `[data-content_type="…"]` attribute selectors whose `::before` carries visible text.

**Rename with a script that:** (a) lists every distinct token and its count **first**, for you to eyeball; (b) applies rules **longest-first in ONE pass**; (c) asserts a list of MUST-SURVIVE patterns afterwards; (d) asserts zero orphans of the old token. And note that a cyclic renumber (06→07, 07→08, 08→06) **must** be a single atomic pass — sequential replaces collide and corrupt each other.

**Never write a raw control character into a file.** Writing prose *about* one is enough to embed it — a session documenting this very bug put a real NUL into `.claude/rules/project.md`, where it sat undetected for two days. Always write the escape (`\x00`) or the word NUL, never the literal byte.

Why it's nasty: `file` reports the doc as **`data`** rather than text, and plain `grep` then returns **nothing** (exit 1) while `grep -a` finds the content. So an end-of-session consistency sweep *passes* — it found no stale text because it couldn't read the file at all. Two sessions' greps came back silently empty.

- **Guard:** `file .claude/rules/project.md *.md` — anything reporting `data` is corrupted. Or `grep -rlP '[\x00-\x08\x0B\x0C\x0E-\x1F]' .` to find offenders directly.
- **Habit:** if a grep of a file you *know* has content returns empty, suspect a binary byte before doubting the content.

## Customer-Facing Docs — Verify the Claims and the Links

When a build produces an author guide or any doc the customer will follow, two things need checking that nothing else in this process catches:

**1. Every "the theme does X automatically" claim must name the code that does X.** Documentation written *ahead* of the implementation is worse than stale documentation, because the reader has no way to tell. On one build an author followed the project's own guide verbatim — "write it like a normal article, nothing special" — and got nothing, because that sentence described the *intended* no-code behavior while the implementation still required about a dozen hand-pasted classes. Cheap end-of-build check: for each such claim, point at the code. If you can't, it's a promise, not a doc — either mark the gap explicitly in the guide or don't ship the sentence.

**2. Verify KnowledgeOwl help-doc links against the LIVE site, never against the local `support-kb` Markdown mirror.** The mirror's file layout does **not** map 1:1 to live URLs: it has standalone `.md` files for topics that are actually **sections within a parent article**. Real examples — `create-a-blank-article` and `create-a-new-article-from-template` are anchors under `create-new-article` (`…/help/create-new-article#create-a-blank-article`); `add-a-category-or-subcategory` lives under `create-a-category#…`; `reorder-categories-or-articles` under `reorder-and-move-categories#…`.

So "the mirror has a file named `{slug}.md`" is **not** evidence the URL exists. That false confidence shipped **four wrong help links** in an author guide after they were all reported "verified," and the customer found them. Check each slug against the live site (`https://support.knowledgeowl.com/help/{slug}`, or search the live Support KB) and use the real URL including any `#anchor`. The mirror is fine for content and grep — not for URL validity.

## Post-Deploy Verification (don't stop at "pasted the files")

**Deploying is not the same as done.** A class of failure exists that is invisible in the version folder, in Style Settings, and in every deployed field — most notably a `<style>` block living in **page content** (a snippet or hand-written article HTML), which loads after Custom CSS and wins at equal specificity (quirks-doc §47). The version folder can be perfect and the live page still wrong.

So after the user deploys a version that changed colors, typography, or layout:

1. **Sample what actually rendered** — look at the live page and compare the real values against the intended tokens. A screenshot plus a pixel sample is enough to catch a wrong color; reading computed styles is better where you can.
2. **If something doesn't match, enumerate the matching rules in cascade order** rather than reasoning about specificity by hand — use the guarded diagnostic in quirks-doc §47. Two traps make the naïve version of that snippet report a *false* "nothing else matches": KO's bundles are cross-origin (so `cssRules` throws and a bare `catch` hides it) and rules inside `@media` are missed without recursing.
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

The Froala **article editor** renders in a **white iframe** that loads `ko.css` + your
compiled **Custom CSS** — but **NOT** the Style-Settings color block or the Custom `<head>`
(quirk #28). So any text color the theme applies through an **unscoped** stock rule (KO's own
`a:not(.btn){color:var(--text-links-color)}`) or a **`.documentation-article`-scoped** rule
paints inside the editor too, where a light or brand color is **unreadable on the white
canvas**. This is a recurring dark-/custom-theme trap (it bit headings and links on real
builds).

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

**Verify it mechanically, before deploying — don't eyeball it afterwards.** The editor's
cascade is fully specified (body classes `documentation-article hg-article-body
fr-editor-svelte` + `fr-view`, **no** `hg-minimalist-theme`, and neither the Style-Settings
block nor the Custom `<head>`), so it *is* reproducible locally — what can't be reproduced is
Froala's UI, which is irrelevant here. Use the harness:
`https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/process-docs/editor-simulation/editor-simulation.html`
(how-to: `process-docs/editor-simulation/README.md`). Point it at the KB's `ko-*.css` bundle
URL plus the version's compiled `custom-css.css`, open it, and read the PASS/FAIL/STOCK table.
Report the result in the conversation as part of the Color-Change Checkpoint.

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
