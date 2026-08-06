# Knowledge Base Customization Project Setup

Detailed instructions for starting a new KnowledgeOwl knowledge base customization project. For a quick overview of the full workflow, see `00-README.md`.

---

## 1. Create the Project Folder Structure

1. Duplicate the `project-template/` folder from your local copy of the repo

2. Rename the duplicated folder to the customer's name:
   ```
   Example: Acme Corp, Globex
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

**Also audit content-level CSS — in two places, because snippets alone aren't enough.** These 12 fields aren't the whole picture: a `<style>` block inside page *content* loads **after** Custom CSS, so it can override the theme wherever it appears — and it won't show up anywhere in this capture.

1. **Library > Snippets** — check each for `<style>` / `<script>`. On a KB with a lot of them, Claude can read them all in one pass rather than you opening each modal.
2. **One or two rendered articles** — authors paste CSS straight into article bodies, and a clean snippet audit does not catch that. On one KB all 17 snippets were fine and a rendered article still carried a hand-written unscoped `body { font-family: … }`.

So finding stock Custom CSS doesn't mean the KB is unstyled. Tell Claude what turns up — it gets recorded in `# Baseline` so it's a known constraint from the start rather than a surprise after deploying.

**Tip — stock Minimalist KB?** If the KB is still on KnowledgeOwl's default **Minimalist** theme and hasn't been customized, you don't have to copy each field out by hand. Ask Claude to drop in the documented Minimalist defaults as your baseline — see `04-MINIMALIST_THEME_DEFAULTS.md`. Those files are the same code a fresh Minimalist KB ships with, so the result is identical to copying from the live KB, just faster. If the KB already has real custom code, capture *that* instead, the normal way above — the defaults are only for stock KBs.

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
| `homepage-custom-content.html` | Customize > Homepage > Homepage content > Custom content *(legacy — only some older KBs)* |

*Authoritative version: the mapping table in `CLAUDE-RULES.md` (which Claude fetches from GitHub automatically). This copy is for human reference during setup. If KnowledgeOwl adds or changes sections, update `CLAUDE-RULES.md` first.*

**About `homepage-custom-content.html`:** This is a *legacy* field, separate from `custom-html-5-homepage.html`. It maps to the **Custom content** box (in the **Homepage content** card) on the standalone **Customize > Homepage** page (`app.knowledgeowl.com/kb/home-page/`) — not the Style editor's *Custom HTML > Homepage* section. Most modern KBs leave it empty, and a **brand-new KB always does**; populate this file only if the customer has content there. Otherwise leave the placeholder as-is.

**Check it once, then record it.** Claude settles this during the first session and writes the answer (`empty` or `in use`) to the `# Baseline` section of `.claude/rules/project.md`. Once it's recorded as `empty`, the file is skipped in every later current-state snapshot and Claude won't ask about it again — so this is a one-time question, not a recurring one. (Older projects created before the `# Baseline` section existed get it appended automatically at the start of their next session.)

### Record Current Style Settings Colors

While you're in the Customize > Style area, also record the current Style Settings colors (Customize > Style > Style Settings > Colors). This captures the customer's original theme-level color configuration. If the project later changes brand colors, Claude will recommend updating these settings to match — having the original values on record makes that easier and provides a rollback reference.

The color picker only reveals one hex code at a time, so you'll need to record each swatch separately. Use whichever approach is faster for you:

- **Screenshot each swatch** — click each color to reveal its hex, capture it, and save all screenshots in the `Screenshots/` folder inside the no-changes folder.
- **Type the hex codes into a file** — open `style-settings-colors.md` in the no-changes folder and fill in each color by its label (e.g., `Top navigation bar: #1D284F`).

---

## 3. Capture the Current State

### First: is the KB reachable without a login?

Many customer KBs aren't — reader-restricted KBs are the norm rather than the exception in healthcare, insurance, and finance — and a KB **on trial** has public access disabled by KnowledgeOwl outright. Two different gates, worth telling apart:

- **Reader-restricted KB:** an unauthenticated request doesn't return a clean 401. It enters a self-referential `?r=` redirect loop that terminates in **HTTP 414 (URI Too Long)** — which reads like a malformed URL and sends you hunting for a typo that doesn't exist. If you see a 414 on a KB URL, you're being asked to log in.
- **Trial KB:** redirects to a KnowledgeOwl gate reading roughly *"During your trial, public access to your knowledge base is disabled."*

**Neither blocks the capture — you just have to be signed in.** Claude's built-in browser can be signed into like any other browser (see "Browser Tooling" in `CLAUDE-RULES.md`), so once you log in there, snapshots and screenshots can be captured normally. Claude never enters credentials, so that sign-in step is yours.

If you'd rather not sign in, or the KB is behind SSO that won't authenticate a separate browser profile:

- Capture from **your own** authenticated browser instead (the DevTools steps below work unchanged), or use KO admin's **Preview / "View as"**, or a shared link.
- Or **mark the snapshots and screenshots pending and leave the `no-changes` folder UNLOCKED** until you have them. Don't `chmod` an incomplete baseline read-only — the lock is meant to protect a finished record, not to freeze a half-captured one.

Either way the build isn't blocked: the 12 code files and `style-settings-colors.md` can be filled from the documented Minimalist defaults on a stock KB (see `04-MINIMALIST_THEME_DEFAULTS.md`), and the localhost-preview path that works with **no KB access at all** is in `03-LOCALHOST_PREVIEW.md` → "Previewing a Build BEFORE Anything Is Deployed."

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

When the downloaded files don't give you confident, exact values for the brand colors (or fonts, or the logo), have Claude read them off the **live site with its browser tooling** — Claude's built-in browser handles this, and a marketing site needs no login at all (see "Browser Tooling" in `CLAUDE-RULES.md`):

1. Point Claude at the customer's site and ask it to report the **computed styles** of the key brand elements — primary/CTA button background, headings, body text, links, top nav, footer — plus the heading and body `font-family`.
2. `getComputedStyle()` returns the value the browser actually paints, regardless of how it was authored, so you get exact hex codes and real font stacks even from compiled CSS or JS-applied styles.

Prefer the static download first (offline, archivable); use the live capture as the exactness fallback. Record the confirmed values somewhere durable in the project (e.g., a short `brand.md` in `Reference/`) so the build and any later session share one source of truth.

**Tip:** browser tool results can truncate or filter large/encoded payloads (base64, long SVG path data) — pull *values* (hex, font names) rather than whole files, and grab assets like logos from the page source or the downloaded site.

### When a customer names a reference site, record the MECHANISM — not the measurement

Customers often point at another KB or docs site: *"we want our content column like theirs."* Measuring that column and copying the number is the obvious move and it is frequently wrong, because the same width can be produced by completely different means — and the mechanism is what has to survive the transplant.

A real case: the cited reference had a ~1060px centre column, which read as support for capping prose width. It wasn't. That site gets the width **structurally** — both rails are permanently visible (left nav always open, right TOC always present) — with no per-element cap anywhere. The customer's own KB had a *collapsible* slideout nav and an *opt-in* right TOC, so the identical CSS produced a far wider column and a different result entirely.

So when capturing a reference, write down **how** it achieves the effect: what's permanently visible vs. collapsible, whether the constraint lives on a container or per-element, what the page structure is. Then check whether the customer's KB shares those preconditions. If it doesn't, the reference tells you the *goal*, not the implementation. Record this next to the brand values in the project so a later session doesn't re-derive it from the pixel value.

### Colour math: contrast and "did this colour actually change?"

Two colour questions come up on nearly every build, and both are judgment calls until you measure them. This helper answers both — drop it in a scratch file and import it.

**Use it for:**

- **Contrast, before assigning a brand colour to anything that colours TEXT.** The theme templates *require* AA (≥4.5:1) on their text tokens, and real brands routinely fail: a logo terracotta `#D05030` measures **4.31:1** on white — under the floor — and a brand orange `#ff5f14` is only **3.04:1**, unreadable as body-link text. Without a prescribed check, the natural move is to paste the brand hex and move on.
- **Perceptual delta, when a customer sends "revised" colours** with no statement of what changed. CIEDE2000 turns "should we redo anything?" into a number: on one build all four revised hues came in under **ΔE 2.0** (three under 0.6) — perceptually the same colour, so nothing needed redoing.

```python
import math

def _lin(c):
    c /= 255
    return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055) ** 2.4

def hex_rgb(h):
    h = h.lstrip('#')
    if len(h) == 3: h = ''.join(c*2 for c in h)
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def luminance(h):
    r, g, b = (_lin(c) for c in hex_rgb(h))
    return 0.2126*r + 0.7152*g + 0.0722*b

def contrast(fg, bg='#ffffff'):
    """WCAG 2.x contrast ratio. AA body text needs >= 4.5; large text >= 3.0."""
    a, b = luminance(fg), luminance(bg)
    return (max(a, b) + 0.05) / (min(a, b) + 0.05)

def _lab(h):
    r, g, b = (_lin(c) for c in hex_rgb(h))
    x = (0.4124*r + 0.3576*g + 0.1805*b) / 0.95047
    y =  0.2126*r + 0.7152*g + 0.0722*b
    z = (0.0193*r + 0.1192*g + 0.9505*b) / 1.08883
    f = lambda t: t ** (1/3) if t > 216/24389 else (841/108)*t + 4/29
    fx, fy, fz = f(x), f(y), f(z)
    return 116*fy - 16, 500*(fx - fy), 200*(fy - fz)

def delta_e(h1, h2):
    """CIEDE2000 between two hex colours. <1 imperceptible; <2 ~ 'same colour'."""
    L1, a1, b1 = _lab(h1); L2, a2, b2 = _lab(h2)
    C1, C2 = math.hypot(a1, b1), math.hypot(a2, b2)
    Cb = (C1 + C2) / 2
    G = 0.5 * (1 - math.sqrt(Cb**7 / (Cb**7 + 25**7))) if Cb else 0.5
    a1p, a2p = (1+G)*a1, (1+G)*a2
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1p = math.degrees(math.atan2(b1, a1p)) % 360 if (a1p or b1) else 0
    h2p = math.degrees(math.atan2(b2, a2p)) % 360 if (a2p or b2) else 0
    dLp, dCp = L2 - L1, C2p - C1p
    if C1p*C2p == 0:            dhp = 0
    elif abs(h2p-h1p) <= 180:   dhp = h2p - h1p
    elif h2p <= h1p:            dhp = h2p - h1p + 360
    else:                       dhp = h2p - h1p - 360
    dHp = 2*math.sqrt(C1p*C2p)*math.sin(math.radians(dhp)/2)
    Lbp, Cbp = (L1+L2)/2, (C1p+C2p)/2
    if C1p*C2p == 0:            hbp = h1p + h2p
    elif abs(h1p-h2p) <= 180:   hbp = (h1p+h2p)/2
    elif h1p+h2p < 360:         hbp = (h1p+h2p+360)/2
    else:                       hbp = (h1p+h2p-360)/2
    T = (1 - 0.17*math.cos(math.radians(hbp-30)) + 0.24*math.cos(math.radians(2*hbp))
         + 0.32*math.cos(math.radians(3*hbp+6)) - 0.20*math.cos(math.radians(4*hbp-63)))
    Sl = 1 + (0.015*(Lbp-50)**2)/math.sqrt(20 + (Lbp-50)**2)
    Sc, Sh = 1 + 0.045*Cbp, 1 + 0.015*Cbp*T
    Rc = 2*math.sqrt(Cbp**7/(Cbp**7 + 25**7)) if Cbp else 0
    Rt = -math.sin(math.radians(2 * 30*math.exp(-(((hbp-275)/25)**2)))) * Rc
    return math.sqrt((dLp/Sl)**2 + (dCp/Sc)**2 + (dHp/Sh)**2 + Rt*(dCp/Sc)*(dHp/Sh))
```

*The `delta_e` implementation is verified against the published Sharma et al. CIEDE2000 test pairs, and `contrast` against the canonical `#767676` = 4.54:1 AA boundary. Don't rewrite them from memory — copy this block.*

**When a brand colour fails AA as text:** darken it, **record both values**, and note the deviation inline in the CSS, so a later session doesn't "fix" the link colour back to the official brand hex. The templates already separate these roles — link text goes through an AA-checked token while the bright brand colour keeps the decorative roles (see any template's README).

**Also worth measuring:** a logo against the nav it sits on — sample the logo PNG's **opaque** pixels, take their 10th-percentile luminance, and run `contrast()` against the nav colour. See "Logo & Brand Assets" in `CLAUDE-RULES.md`.

### Getting exact palettes out of source files rather than off a render

Sampling a screenshot introduces JPEG error and guesswork. Prefer the source:

- **The customer's downloaded marketing site is worth mining even when they've sent brand guidelines.** On a WordPress/Goodlayers build, the theme's *generated* options stylesheet (`wp-content/uploads/gdlr-style-custom.css`) revealed the live site ran an entirely different palette from the guidelines — plus a large transparent white logo that answered the dark-nav variant question for free. Grepping that one generated file beat every other approach; on WordPress builds it's the single highest-value file in the capture.
- **PPTX decks:** unzip and pull `srgbClr val="…"` from `ppt/slides/slideN.xml` in document order, then zip against the `<a:t>` label runs — exact hexes plus their names, no rendering step. (`pdfimages` plays the same role for PDF swatch pages.)
- **On a live site, enumerate `:root`'s custom properties before sampling anything element-by-element.** Site builders in the CivicPlus / Squarespace / Webflow class declare the whole brand as CSS variables, so one read of the custom properties on `:root` returns the authoritative palette *and* the real font stack in a single call — far better than walking elements and reading computed styles one at a time. Worth trying first on any site whose CSS looks generated. Pixel-sampling the logo PNG can also surface an accent hue the CSS never exposes at all.

**Tip — the logo goes in Style Settings, not custom code:** Upload the KB's logo through KnowledgeOwl's native uploader at **Customize > Style > Style Settings > Logo** (upload the right variant per KB — e.g., a white version for a dark nav). Don't hardcode a logo URL in Custom CSS/HTML or recolor a logo with a CSS `filter`. It's more robust and keeps the theme portable as a template. See "Logo & Brand Assets" in `CLAUDE-RULES.md`.

**Tip — host other theme images in the KB:** When you reference a customer image *in the theme itself* (e.g., a homepage hero background), upload it to the **KB's file library** and use that URL in the CSS — don't hotlink the customer's live marketing site. A hotlinked URL can break if they redesign or move the file; a KB-hosted copy is stable and under your control.

---

## 5. Verify Your Folder Structure

Your project should look like this:
```
[your projects folder]/
└── [Customer Name]/
    ├── CLAUDE.md                       (auto-read by Claude Code — bootstrap that fetches latest rules from GitHub)
    ├── CLAUDE-RULES.md                 (process rules — fetched fresh from GitHub each session, local copy is fallback)
    ├── .claude/
    │   ├── launch.json                 (localhost preview server config — see 03-LOCALHOST_PREVIEW.md)
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

Once setup is complete, fill in the customer name and KB in `.claude/rules/project.md`, then open Claude Code in the customer folder — it automatically reads `CLAUDE.md` (which fetches the latest `CLAUDE-RULES.md` from GitHub) and `.claude/rules/project.md` (customer-specific settings).

> **Note: `.claude/` is a hidden folder.** Dot-files are hidden by default (Mac: press **Command + Shift + .** in Finder to toggle them; Windows: **View > Show > Hidden items** in File Explorer). Easiest option: open the project folder in **VS Code**, which shows dotfiles without any toggling.

Paste this prompt to kick off the first session:

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
- **Homepage Custom content (legacy):** Customize > Homepage > Homepage content > Custom content
