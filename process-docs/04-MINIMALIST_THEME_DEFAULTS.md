# Minimalist Theme — Default Code Baseline

KnowledgeOwl's default theme is **Minimalist**. This doc documents the stock, out-of-the-box code for a fresh Minimalist KB — the Custom CSS, all 10 Custom HTML sections, and the Custom `<head>` — and explains how to drop it into a project as a baseline starting point so you don't have to copy each field out of the live KB by hand.

The canonical code lives as **raw files** in the [`minimalist-theme-defaults/`](minimalist-theme-defaults/) folder next to this doc — one file per editable section, named exactly like the files in a project's `no-changes` folder. They're stored as real files (not pasted inline here) so Claude can copy them **byte-for-byte** into a project — the same mechanism the toolkit already uses to fetch `CLAUDE-RULES.md` and the Reference CSS docs from GitHub. A markdown doc that re-typed 900 lines of CSS could silently drop or mangle a rule; a raw file copy can't.

---

## When to use this

Use it when you're setting up a project for a KB that's **still on (or close to) the stock Minimalist theme** — i.e., the customer hasn't customized their Custom CSS/HTML yet. Instead of copying each field out of the live KB one at a time, have Claude populate the project's `no-changes` folder with the documented defaults in one step. Because these files *are* the same code a fresh Minimalist KB ships with, the result is identical to copying from the live KB — just faster and less error-prone.

**Do not use it to overwrite a KB that already has custom code.** The whole point of the `no-changes` folder is to capture the customer's *existing* code as the permanent rollback baseline. If the KB has real customizations, capture those the normal way (copy from each Customize > Style section — see [`01-KB_CUSTOMIZATION_PROJECT_SETUP.md`](01-KB_CUSTOMIZATION_PROJECT_SETUP.md) §2). The master `project-template/TEMPLATE-no-changes/` placeholders stay empty by design — this doc never changes them.

---

## What's in the baseline

The 12 editable code sections of a stock Minimalist KB. Each row maps the raw file to its KnowledgeOwl location and notes what's there by default.

| File | KnowledgeOwl section | Default content | Lines |
|------|----------------------|-----------------|-------|
| `custom-css.css` | Custom CSS | The full Minimalist theme stylesheet — `:root` color variables plus layout, typography, TOC, search, homepage, and component styles. Pasteable into Custom CSS as-is. | ~900 |
| `custom-head.html` | Custom `<head>` | **Empty by default** — a fresh Minimalist KB ships with no Custom `<head>` code. The file is just the placeholder comment, matching how empty fields are represented everywhere in the toolkit. | 1 |
| `custom-html-1-body.html` | Custom HTML > Body | Site body wrapper (`[template("layout")]`) + back-to-top + the default copyright / "Made with KnowledgeOwl" footer | 8 |
| `custom-html-2-top-navigation.html` | Custom HTML > Top Navigation | Navbar: logo/brand, project name, search bar, TOC + nav toggles, and the right-side search / contact / login items | 29 |
| `custom-html-3-article.html` | Custom HTML > Article | Article header (title + action icons + last-modified), body, and footer (related articles, rating, comments) | 21 |
| `custom-html-4-article-version.html` | Custom HTML > Article Version | Article view with the full version-metadata block (version number, author, created/activated/deactivated dates) | 22 |
| `custom-html-5-homepage.html` | Custom HTML > Homepage | Homepage title + large search, body, the `icon-cats` category tiles, and popular / new / updated article widgets | 14 |
| `custom-html-6-login.html` | Custom HTML > Login | Login page container (`[template("login-page")]`) | 2 |
| `custom-html-7-manage-reader-subs.html` | Custom HTML > Manage Reader Subscriptions | Reader-subscriptions container (`[template("readersubscriptions-page")]`) | 2 |
| `custom-html-8-404-page.html` | Custom HTML > 404 Page | "Uh oh!" 404 message, search, and popular / updated / new article widgets | 25 |
| `custom-html-9-restricted-access-page.html` | Custom HTML > Restricted Access Page | "You do not have access to view this content" alert | 4 |
| `custom-html-10-right-column.html` | Custom HTML > Right Column | "About this Article" panel (created / last updated / action icons) | 9 |

**These files contain KnowledgeOwl merge codes** — the square-bracket tokens like `[template("layout")]`, `[article("title")]`, and `[translation("…")]`. That's expected: it's exactly what KnowledgeOwl stores in these fields. They render correctly when pasted back into a KB. Don't "fix" them into literal HTML.

---

## How to copy the defaults into a project

### The one-line ask

In a session opened in the **customer's project folder**, paste:

```
This KB is a stock Minimalist theme with no existing custom code. Copy the documented
Minimalist defaults from the toolkit into my no-changes folder as the baseline
(process-docs/04-MINIMALIST_THEME_DEFAULTS.md).
```

### What Claude does

Claude fetches each raw file from GitHub straight into the project's dated `no-changes` folder (e.g. `2026.06.24-no-changes/`), overwriting the empty placeholders. A `curl` of each raw file is byte-exact — it never round-trips through the model:

```bash
BASE="https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/process-docs/minimalist-theme-defaults"
DEST="/path/to/CustomerName/2026.06.24-no-changes"   # the project's dated no-changes folder

for f in custom-css.css custom-head.html \
  custom-html-1-body.html custom-html-2-top-navigation.html \
  custom-html-3-article.html custom-html-4-article-version.html \
  custom-html-5-homepage.html custom-html-6-login.html \
  custom-html-7-manage-reader-subs.html custom-html-8-404-page.html \
  custom-html-9-restricted-access-page.html custom-html-10-right-column.html; do
  curl -fsSL "$BASE/$f" -o "$DEST/$f"
done
```

**Timing note:** do this during initial setup, *before* the `no-changes` folder is locked read-only (`chmod -R a-w`). If the folder is already locked, unlock it first (`chmod -R u+w <folder>`), copy, then re-lock. See [`01-KB_CUSTOMIZATION_PROJECT_SETUP.md`](01-KB_CUSTOMIZATION_PROJECT_SETUP.md) §5 for the locking step.

**What this does and doesn't touch:** it populates the 12 code files only. The HTML snapshots (`full-html-snapshot-*.html`), screenshots, and `CHANGES_FROM_no-changes.md` are still captured the normal way during setup. The legacy `homepage-custom-content.html` field is empty on stock Minimalist KBs, so leave its placeholder as-is.

**Fidelity notes** — these files reproduce KO's stock code exactly, including KO's own oddities:

- `custom-css.css` line ~817 is missing a trailing comma in the long `:focus-visible` selector list (verified present in KO's source too), which silently merges two selectors. **Leave it as-is** — "fixing" it would break the byte-for-byte match with a stock KB.
- The footer in `custom-html-1-body.html` reads `Copyright © 2025 Your Company, LLC` — that year is hardcoded in KO's own template, so KBs created after KO bumps it may show a different year. If the live KB's footer differs, reconcile that one line against the live KB rather than deploying the baseline's year.

---

## Style Settings colors

The Minimalist theme's default Style Settings colors (Customize > Style > Style Settings > Colors) are **already documented** — this doc does not duplicate them:

- Every project's `no-changes/style-settings-colors.md` already lists the Minimalist defaults in its "Minimalist theme defaults (reference)" section (it ships in the `TEMPLATE-no-changes` template).
- They're also in `Reference/knowledgeowl-css-defaults.md` under "Minimalist Theme — Style Settings Defaults."

For a stock Minimalist KB, the customer's actual values *are* those defaults, so you can copy them up into the "Customer's values" section of `style-settings-colors.md` rather than recording each swatch by hand.

---

## Also handy: resetting a sandbox KB to stock

These same files double as **deploy-ready stock code**. If you ever need to reset a sandbox KB back to the default Minimalist theme, paste each file's contents into its matching Customize > Style (HTML & CSS) field. (The primary use here is still the `no-changes` baseline above — this is just a convenient side benefit.)

---

## Keeping this current (for Chad / template maintainers)

This baseline is a point-in-time snapshot of KnowledgeOwl's Minimalist default. If KnowledgeOwl ships theme changes, refresh it:

1. Spin up (or open) a stock, uncustomized Minimalist KB.
2. Copy each Customize > Style (HTML & CSS) field into the matching file in `process-docs/minimalist-theme-defaults/`.
3. Re-check the Style Settings default colors against `Reference/knowledgeowl-css-defaults.md` and each project template's `style-settings-colors.md`; update if they changed.
4. Commit and push. Because the copy fetches these raw files from GitHub at use time, every teammate picks up the refreshed defaults automatically — no local sync needed.

*Captured from a stock Minimalist KB. Verify against a current stock KB if KnowledgeOwl has updated the theme since.*
