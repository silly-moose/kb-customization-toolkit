# Knowledge Base Customization Project Setup

Detailed instructions for starting a new KnowledgeOwl knowledge base customization project. For a quick overview of the full workflow, see `00-README.md`.

---

## 1. Create the Project Folder Structure

1. Duplicate the `TEMPLATE-new-project` folder from your local copy of the repo

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

---

## 3. Capture the Current State

### Screenshots
Add screenshots of key pages in the customer's current knowledge base to the `Screenshots/` folder inside the no-changes folder:
- Homepage
- A category page
- An article page
- Any other pages relevant to the project

### Full HTML Snapshot (for Claude reference)
1. Open the customer's homepage in Google Chrome
2. Right-click anywhere on the page and select **Inspect**
3. In the Elements panel, right-click on the `<html>` tag at the top
4. Select **Copy > Copy outerHTML**
5. Open `homepage-full-html-snapshot.html` in the no-changes folder
6. Replace the placeholder comment with the copied HTML
7. Repeat for other key pages if needed (create new files like `category-page-full-html-snapshot.html`)

**Why:** This gives Claude visibility into the actual rendered HTML structure, including dynamically generated elements and template output that isn't visible in the Custom HTML fields alone.

---

## 4. Add Reference Documents

Create a `Reference/` folder at the project root (same level as the markdown files) and add:
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

---

## 5. Verify Your Folder Structure

Your project should look like this:
```
[your projects folder]/
└── [Customer Name]/
    ├── 00-README.md                            (onboarding intro for new teammates)
    ├── 01-KB_CUSTOMIZATION_PROJECT_SETUP.md   (this file - for reference)
    ├── 02-VERSION_CONTROL_PROCESS.md
    ├── 03-PROJECT_HANDOFF_CHECKLIST.md        (use when completing project)
    ├── CLAUDE.md                               (auto-read by Claude Code each session)
    ├── .claude/                                (Claude Code settings - no need to edit)
    ├── Reference/
    │   ├── (mockups, Asana exports, assets)
    │   └── marketing-site-example.com/  (optional - see section 4)
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
        ├── homepage-full-html-snapshot.html
        ├── CHANGES_FROM_no-changes.md
        └── Screenshots/
            └── (current state screenshots)
```

**Optional: Protect the backup folder from accidental edits.** After populating the no-changes folder, you can make its files read-only so they can't be accidentally modified:
```bash
chmod -R a-w YYYY.MM.DD-no-changes/
```
This is not required, but it adds a safety net. If you need to undo it later: `chmod -R u+w YYYY.MM.DD-no-changes/`

---

## 6. Ready to Start

Once setup is complete, open Claude Code in the customer folder — it automatically reads `CLAUDE.md` and picks up the version control rules. Then paste this prompt to kick off the first session:

```
Review the no-changes folder and the reference materials in Reference/. Then let me know when you're ready to start.
```

Claude will review the code, ask whether you're deploying to a sandbox or live KB, and ask what you want to work on. It will create versioned folders (e.g., `2026.01.28-v1`) as it works.

For guidance on starting subsequent sessions, see "Starting a New Claude Code Session" in `00-README.md`.

---

## 7. Project Completion

When the project is complete, use `03-PROJECT_HANDOFF_CHECKLIST.md` (included in this folder) to ensure all deployment and documentation steps are completed.

---

## Quick Reference: KnowledgeOwl Navigation

- **Custom CSS:** Customize > Style (HTML & CSS) > Custom CSS
- **Custom HEAD:** Customize > Style (HTML & CSS) > Custom HEAD
- **Custom HTML sections:** Customize > Style (HTML & CSS) > Custom HTML > [Section Name]
