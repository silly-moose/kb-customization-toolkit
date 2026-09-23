<!-- TEMPLATE FOR CLAUDE:
     When creating a new version folder, rename this file to match the version's baseline:
     - In v1 folder: keep as CHANGES_FROM_no-changes.md
     - In v2 folder: rename to CHANGES_FROM_v1.md
     - In v3 folder: rename to CHANGES_FROM_v2.md (always reference the previous version)
     Then clear the previous version's content, update the title/Date/Based On fields below,
     and fill in each section. Delete any sections that don't apply.
     When each version reaches which KB is recorded in DEPLOYMENTS.md at the project root,
     not here.
-->

# Changes from YYYY.MM.DD-no-changes

**Date:** YYYY.MM.DD
**Based on:** YYYY.MM.DD-no-changes

## Summary
<!-- Brief description of what was changed and why -->

## Files Modified
<!-- List only the files that were actually modified. For each file, describe what changed.
     See CLAUDE-RULES.md for the full file-to-KnowledgeOwl mapping. -->

## Color Palette
<!-- Delete this section if no new colors were added. -->

| Element | Hex Code |
|---------|----------|
| Example | `#000000` |

## What User Will See After Deployment
<!-- Bullet points describing visible changes -->

## Style Settings
<!-- Delete this section if no Style Setting changes. This is the Color-Change Checkpoint
     table (CLAUDE-RULES.md). Set the same new values in this version's
     style-settings-colors.md "Values" table: that table is what the deploy sets, in the same
     save as the code files. The logo goes in its logo.file row by File Library name. -->

| Style Setting | Current value | New value | Why |
|---------------|---------------|-----------|-----|
| Example: Highlights & Accents | `#f8b88b` | `#009d9c` | Brand accent |

## Manual Steps in KnowledgeOwl
<!-- Delete this section if there are no manual steps. Only what Claude can't do in the
     Style page save belongs here. Examples:
     - Upload the logo file to Library > Files (upload the right variant, e.g. a white logo for a
       dark nav); Claude then sets it as the logo by name in the deploy
     - Upload the favicon (Customize > Style > Style Settings > Favicon; it saves immediately)
     - Upload images to the KB's File Library
     - Default Text, the homepage title, the legacy homepage Custom content, snippets
     - Update category icons or descriptions
     - Configure redirect rules
-->

---

## Files to Deploy

<!-- For each modified file, add a section using this format:

     ### [Section Name]
     **Source**: `/YYYY.MM.DD-v#/[filename]`
     **Destination**: KnowledgeOwl > Customize > Style (HTML & CSS) > [exact location]
     **Changes**: [brief description]

     See CLAUDE-RULES.md for the full file-to-KnowledgeOwl mapping.
     Only include sections for files that were actually modified.
     Claude deploys this list after the user's yes (05-BROWSER_CAPTURE_AND_DEPLOY.md); on the
     manual path it is the paste list.
-->

<!-- Add deployment target note:
     - If sandbox: "Deploys to the sandbox. Promoting to live is a separate deploy with its own yes."
     - If live KB: "Deploys directly to the live KB, verified immediately after."
-->
