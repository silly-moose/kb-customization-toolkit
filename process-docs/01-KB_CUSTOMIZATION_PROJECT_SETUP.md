# Knowledge Base Customization Project Setup

Detailed instructions for starting a new KnowledgeOwl knowledge base customization project. For a quick overview of the full workflow, see `00-README.md`.

---

## 1. Create the Project Folder Structure

1. Duplicate the `project-template/` folder from your local copy of the repo

2. Rename the duplicated folder to the customer's name:
   ```
   Example: Acme, Acme Corp
   ```

3. Inside the customer folder, rename `TEMPLATE-no-changes` to the current date:
   ```
   YYYY.MM.DD-no-changes
   ```
   Example: `2026.01.28-no-changes`

---

## 2. Populate the Backup Folder with Current Code

Open each file in the `YYYY.MM.DD-no-changes` folder and replace the placeholder comment with the current code from the customer's knowledge base.

If a customer has no existing custom code in a given field, leave the placeholder comment as-is. It serves as a record that the field was empty at project start.

| File Name | Source in KnowledgeOwl |
|-----------|------------------------|
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
| `homepage-custom-content.html` | Customize > Homepage > Custom content *(legacy — only some older KBs)* |

*Authoritative version: the mapping table in `CLAUDE-RULES.md` (which Claude fetches from GitHub automatically). This copy is for human reference during setup. If KnowledgeOwl adds or changes sections, update `CLAUDE-RULES.md` first.*

**About `homepage-custom-content.html`:** This is a *legacy* field, separate from `custom-html-5-homepage.html`. It maps to the **Custom content** box on the standalone **Customize > Homepage** page (`app.knowledgeowl.com/kb/home-page/`) — not the Style editor's *Custom HTML > Homepage* section. Most modern KBs leave it empty; populate this file only if the customer has content there. Otherwise leave the placeholder as-is.

### Record Current Style Settings Colors

While you're in the Customize > Style area, also record the current Style Settings colors (Customize > Style > Style Settings > Colors). This captures the customer's original theme-level color configuration. If the project later changes brand colors, Claude will recommend updating these settings to match — having the original values on record makes that easier and provides a rollback reference.

The color picker only reveals one hex code at a time, so you'll need to record each swatch separately. Use whichever approach is faster for you:

- **Screenshot each swatch** — click each color to reveal its hex, capture it, and save all screenshots in the `Screenshots/` folder inside the no-changes folder.
- **Type the hex codes into a file** — open `style-settings-colors.md` in the no-changes folder and fill in each color by its label (e.g., `Top navigation bar: #1D284F`).

---

## 3. Capture the Current State

### Screenshots
Add screenshots of key pages in the customer's current knowledge base to the `Screenshots/` folder inside the no-changes folder:
- Homepage
- An article page
- A category page
- Any other pages relevant to the project

**Tip: Use full-page screenshots.** A regular screenshot only captures the visible viewport. To capture the *entire* page (including content below the fold), use Chrome's built-in DevTools command:
1. Open DevTools: **Cmd+Option+I** (Mac) or **Ctrl+Shift+I** (Windows)
2. Open the command menu: **Cmd+Shift+P** (Mac) or **Ctrl+Shift+P** (Windows)
3. Type `screenshot` and select **Capture full size screenshot**

Chrome saves a full-length PNG automatically. This is especially useful for long article and category pages where the below-the-fold layout matters.

### Full HTML Snapshots (for Claude reference)
Capture snapshots for both the homepage and an article page — each gives Claude visibility into a different template structure.

1. Open the customer's homepage in Google Chrome
2. Right-click anywhere on the page and select **Inspect**
3. In the Elements panel, right-click on the `<html>` tag at the top
4. Select **Copy > Copy outerHTML**
5. Open `full-html-snapshot-homepage.html` in the no-changes folder
6. Replace the placeholder comment with the copied HTML
7. Repeat steps 1-6 on any article page, pasting into `full-html-snapshot-article.html`
8. Optional: repeat for other key pages if needed (create new files like `full-html-snapshot-category.html`)

**Why:** Unlike View Page Source (which captures the raw server HTML before JavaScript runs), Copy outerHTML captures the page's *rendered* DOM — the HTML as it actually exists after the browser and JavaScript have fully processed the page. This gives Claude visibility into dynamically generated elements and template output that aren't visible in the Custom HTML fields alone.

---

## 4. Add Reference Documents

Add materials to the `Reference/` folder (already included in the project template):
- Mockups/design screenshots from the customer
- Asana task exports or requirement documents
- Any icons, images, or assets the customer provides

### Optional: Download the Customer's Marketing Site

If the customer has a marketing site, downloading it gives Claude a complete picture of their brand — colors, typography, layout patterns, imagery — so it can suggest KB customizations that match. This is especially useful when the customer hasn't provided a style guide or detailed mockups.

**How to capture a marketing site:**

1. Install the [Save All Resources](https://chromewebstore.google.com/detail/save-all-resources/abpdnfjocnmdomablahdcfnoggeeiedb) Chrome extension
2. Open the customer's marketing site in Chrome
3. Open DevTools (F12) and switch to the **ResourcesSaver** tab
4. Click **Save All Resources** — this downloads a `.zip` of the entire page (HTML, CSS, JS, images, fonts)
5. Unzip the downloaded file
6. Move the unzipped folder into the `Reference/` folder and name it clearly (e.g., `marketing-site-acme.com`)
7. Add screenshots of key marketing site pages into a `Screenshots/` subfolder within the marketing site folder

**Why this helps:** Claude can read the downloaded HTML/CSS to extract exact brand colors, font stacks, spacing patterns, and layout conventions — then apply them to the KB customization. This produces more accurate results than working from screenshots alone.

**Example folder structure:**
```
Reference/
├── marketing-site-acme.com/
│   ├── index.html
│   ├── about.html
│   ├── css/
│   ├── images/
│   └── Screenshots/
│       ├── homepage.png
│       ├── about-page.png
│       └── pricing-page.png
├── mockup-from-customer.png
└── asana-task-export.pdf
```

### If the download doesn't surface exact brand data

A static capture isn't always enough. Modern marketing sites often ship **compiled/minified CSS** (e.g., Tailwind) where brand colors are buried in utility classes, define colors as **CSS variables** or apply them via **JavaScript** at runtime, or render logos/images **client-side or as data URIs**.

When the downloaded files don't give you confident, exact values for the brand colors (or fonts, or the logo), capture them from the **live site with Claude in Chrome**:

1. Point Claude at the customer's site and ask it to report the **computed styles** of the key brand elements — primary/CTA button background, headings, body text, links, top nav, footer — plus the heading and body `font-family`.
2. `getComputedStyle()` returns the value the browser actually paints, regardless of how it was authored, so you get exact hex codes and real font stacks even from compiled CSS or JS-applied styles.

Prefer the static download first (offline, archivable); use the live capture as the exactness fallback. Record the confirmed values somewhere durable in the project (e.g., a short `brand.md` in `Reference/`) so the build and any later session share one source of truth.

**Tip:** the Claude-in-Chrome result filter can block large/encoded payloads (base64, long SVG path data) — pull *values* (hex, font names) rather than whole files, and grab assets like logos from the page source or the downloaded site.

---

## 5. Verify Your Folder Structure

Your project should look like this:
```
[your projects folder]/
└── [Customer Name]/
    ├── CLAUDE.md                       (auto-read by Claude Code — bootstrap that fetches latest rules from GitHub)
    ├── CLAUDE-RULES.md                 (process rules — fetched fresh from GitHub each session, local copy is fallback)
    ├── .claude/
    │   └── rules/
    │       └── project.md              (auto-read by Claude Code — customer-specific settings)
    ├── Reference/
    │   ├── knowledgeowl-css-quirks.md  (CSS quirks reference — Claude reads this automatically for CSS/HTML tasks)
    │   ├── knowledgeowl-css-defaults.md (default selectors, property values, CSS architecture — Claude reads this automatically for CSS/HTML tasks)
    │   ├── (screenshots, mockups, emails, Asana tasks, assets, etc.)
    │   └── marketing-site-example.com/ (optional - see section 4)
    │       ├── (downloaded site files)
    │       └── Screenshots/
    └── YYYY.MM.DD-no-changes/
        ├── custom-css.css
        ├── custom-head.html
        ├── custom-html-1-body.html
        ├── custom-html-2-top-navigation.html
        ├── custom-html-3-article.html
        ├── custom-html-4-article-version.html
        ├── custom-html-5-homepage.html
        ├── custom-html-6-login.html
        ├── custom-html-7-manage-reader-subs.html
        ├── custom-html-8-404-page.html
        ├── custom-html-9-restricted-access-page.html
        ├── custom-html-10-right-column.html
        ├── full-html-snapshot-homepage.html
        ├── full-html-snapshot-article.html
        ├── homepage-custom-content.html    (legacy - only older KBs)
        ├── style-settings-colors.md
        ├── CHANGES_FROM_no-changes.md
        └── Screenshots/
            └── (current state screenshots)
```

**Note:** Process docs (`00-README.md`, `01-KB_CUSTOMIZATION_PROJECT_SETUP.md`, etc.) are not included in customer folders. They live in the template repo and Claude fetches them on demand.

**Claude automatically protects the backup folder.** During your first session, after all content has been added to the no-changes folder (code files, HTML snapshots, `style-settings-colors.md`, and screenshots), Claude runs `chmod -R a-w YYYY.MM.DD-no-changes/` to make the folder read-only, preventing accidental edits. Similarly, Claude runs this command automatically after all content has been added to any `current-state` folder. If you need to correct a setup mistake before any real work has started, ask Claude to unlock the folder for you (or run `chmod -R u+w [folder-name]/` yourself).

---

## 6. Ready to Start

Once setup is complete, fill in the customer name and KB in `.claude/rules/project.md`, then open Claude Code in the customer folder — it automatically reads `CLAUDE.md` (which fetches the latest `CLAUDE-RULES.md` from GitHub) and `.claude/rules/project.md` (customer-specific settings). Paste this prompt to kick off the first session:

> **Note: `.claude/` is a hidden folder.** Files and folders starting with a dot (`.`) are hidden by default in macOS Finder and Windows File Explorer. To make it visible:
> - **Mac:** Press **Command + Shift + .** (period) in Finder to toggle hidden files on/off
> - **Windows:** In File Explorer, go to **View > Show > Hidden items**
> - **Easiest option:** Open the project folder in **VS Code** — it shows dotfiles by default, no toggle needed

```
Review the no-changes folder and the reference materials in Reference/. Then let me know when you're ready to start.
```

Claude will review the code, check the deployment target (or ask if it hasn't been set yet), and ask what you want to work on. It will create versioned folders (e.g., `2026.01.28-v1`) as it works.

**Alternatively**, if you'd rather have Claude walk you through setup instead of doing it on your own first, see the guided setup prompts in "Starting a New Claude Code Session" in `00-README.md`.

For guidance on starting subsequent sessions, see "Starting a New Claude Code Session" in `00-README.md`.

---

## 7. Project Completion

When the project is complete, review the "Project Closeout" section in `02-VERSION_CONTROL_PROCESS.md` to capture any process improvements discovered during the work.

---

## Quick Reference: KnowledgeOwl Navigation

- **Style Settings colors:** Customize > Style > Style Settings > Colors
- **Custom CSS:** Customize > Style (HTML & CSS) > Custom CSS
- **Custom `<head>`:** Customize > Style (HTML & CSS) > Custom `<head>`
- **Custom HTML sections:** Customize > Style (HTML & CSS) > Custom HTML > [Section Name]
- **Homepage Custom content (legacy):** Customize > Homepage > Custom content
