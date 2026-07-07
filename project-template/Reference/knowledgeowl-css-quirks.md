# KnowledgeOwl CSS Quirks & Idiosyncrasies

Reference for anyone writing or editing CSS/HTML in a KnowledgeOwl knowledge base.

For full documentation, see: https://support.knowledgeowl.com/help/look-and-feel

---

## 1. Heavy `!important` Usage

Source: https://support.knowledgeowl.com/help/default-custom-css

KnowledgeOwl's default styles use `!important` extensively — there are 300+ instances across the public CSS files, primarily on display/visibility utilities (`display: block !important`, `display: none !important`), float utilities, responsive table rules, and print styles. Custom CSS overrides often need `!important` too, or very high specificity selectors, to take effect.

## 2. Theme-Namespaced Selectors

Source: https://support.knowledgeowl.com/help/default-custom-css

Most default selectors are scoped under a theme class like `.hg-minimalist-theme`. Writing `.some-element { color: red; }` likely won't work — you typically need:

```css
.hg-minimalist-theme .some-element { color: red; }
```

**Note:** `.hg-minimalist-theme` is the selector for the Minimalist theme, which most new customers are locked into. Older customers may use different themes with different selectors, so the CSS you need can vary significantly between KBs. Always check the existing selector specificity before writing overrides.

## 3. Competing Link Selectors

Source: https://support.knowledgeowl.com/help/default-custom-css

Rules like `a:not(.btn)` appear multiple times for different contexts (article body, TOC, navigation, search pager). The default link color uses the `--text-links-color` CSS variable, but specific contexts override it with `--primary-color` or `--secondary-color`. Link styling can be tricky — make sure your selector targets the right context and that you're overriding the correct CSS variable or specificity level.

## 4. Froala Image Classes and `.no-border`

Source: https://support.knowledgeowl.com/help/default-custom-css

Images inserted via the Froala editor can have classes applied: `.fr-shadow` (adds `box-shadow`), `.fr-bordered` (adds `border: solid 5px #CCC`), and `.fr-rounded` (adds `border-radius: 10px`). These are opt-in per image, not blanket defaults — but they appear frequently because the editor applies them. The `.no-border` utility class (documented by KnowledgeOwl) removes visual borders from specific images. When writing image-related CSS, be aware of these Froala classes and their specificity.

## 5. TOC Slideout Layout Coupling

Source: https://support.knowledgeowl.com/help/default-custom-css

The table of contents uses two tightly coupled values:

```css
transform: translateX(360px);
width: calc(100% - 360px);
```

Changing one without the other breaks the layout. If you modify the TOC width, update both values.

## 6. Anchor Link Offset for Fixed Navigation

Source: https://support.knowledgeowl.com/help/fix-anchor-links-hidden-by-top-navigation

Anchor links scroll behind the fixed top navigation bar. KnowledgeOwl compensates with invisible `.toc-anchor` elements:

```css
.toc-anchor {
    display: block;
    height: 140px;
    margin-top: -140px;
    visibility: hidden;
}
```

Any custom anchor approach needs to account for the fixed nav height.

## 7. Alert Box Pseudo-Elements

Source: https://support.knowledgeowl.com/help/change-alert-div-icon

Alert/callout boxes use `::before` pseudo-elements with a 65px width for icons. Paragraphs inside alerts use `margin-left: 75px` to clear the icon. Lists and other elements within alerts may need separate margin adjustments to avoid overlapping the icon.

## 8. Theme Builder Can Overwrite Custom CSS

Source: https://support.knowledgeowl.com/help/theme-colors

Theme color settings (set via the KnowledgeOwl theme builder UI) are applied directly to the CSS output. Making changes in the theme builder after writing custom CSS can silently overwrite your custom work.

## 9. Responsive Breakpoints

Source: https://support.knowledgeowl.com/help/default-custom-css

KnowledgeOwl uses Bootstrap 3 breakpoints plus custom ones. The most important breakpoints for custom CSS:

| Breakpoint | Typical Use |
|------------|-------------|
| 576px      | Small mobile |
| 768px      | Tablet (Bootstrap `sm`) |
| 991px / 992px | Small desktop / landscape tablet (Bootstrap `md`) |
| 1200px     | Large desktop (Bootstrap `lg`) |
| 1473px     | Extra large / three-column layout (KO-specific) |

**Note:** The codebase contains many additional breakpoints (e.g., 1400px, 1540px, 1600px) for fine-tuned responsive rules. The five listed above are the primary ones to align with.

## 10. Custom Utility Classes to Know

Source: https://support.knowledgeowl.com/help/default-custom-css

| Class | Purpose |
|-------|---------|
| `.no-border` | Removes visual borders/shadows from images (see quirk #4) |
| `.check-list` | Styled bullet list with FontAwesome checkmarks (**Note:** This is a Support KB-specific artifact that was never supposed to be in the default custom CSS. It's flagged for removal, but documenting here since it currently exists in the default theme and can cause unexpected styling.) |
| `.toc-anchor` | Invisible anchor offset for fixed nav |
| `.margin-top-20` | Spacing utility |
| `.hg-minimalist-theme` | Primary theme wrapper (used for selector scoping) |
| `.hg-2column-layout` | Two-column layout variant |
| `.hg-3column-layout` | Three-column layout variant |
| `.slideout-menu` | TOC sidebar container |
| `.slideout-new` | Updated TOC sidebar container used in the current default theme's HTML. Less buggy sliding in/out behavior than `.slideout-menu` alone. Note: this class appears in HTML markup but has no dedicated CSS definition — its behavior is controlled by JavaScript and inherited styles. |

## 11. Image Caption Selectors (`fr-img-caption`)

Source: https://support.knowledgeowl.com/help/style-image-captions

Captioned and non-captioned images use different selectors. Captioned images are wrapped in `span.fr-img-caption`, which gets its own border and layout styles. Caption backgrounds use `var(--primary-color)` (defaults to `#1d284f`) and caption link colors use `var(--image-caption-link-color)` (defaults to `#F6A267`). Since these are CSS variables, the actual values vary per KB based on theme settings. Be aware of this split when writing image-related CSS — you may need separate rules for captioned vs. non-captioned images.

## 12. Nested Ordered List Numbering

Source: https://support.knowledgeowl.com/help/customize-nested-numbered-list-styles

The default CSS enforces a three-tier numbering hierarchy for ordered lists inside articles:

- Level 1: `decimal` (1, 2, 3)
- Level 2: `lower-alpha` (a, b, c)
- Level 3: `lower-roman` (i, ii, iii)

These are set on `.hg-article-body ol` with child combinators. Custom list styling needs to match or override these specific selectors.

**Note:** This numbering hierarchy was originally Support KB-specific and shouldn't have been hard-coded into the default theme, but it was. It's flagged for removal from the default theme.

## 13. Search Bar Border Pattern

Source: https://support.knowledgeowl.com/help/default-custom-css

Individual search input elements have their borders removed. The visible border is on the outer `.input-group` wrapper instead. Focus state is handled via `.input-group:focus-within`, which changes the border color. Styling the search bar requires targeting the wrapper, not the input.

## 14. PDF-Specific CSS Rules

Source: https://support.knowledgeowl.com/help/default-custom-css

Some elements are hidden on screen but visible in PDFs. For example, `.pdf-header` uses `display: none` by default but switches to `display: block` in PDF context. When writing CSS for elements that appear in both web and PDF views, check whether PDF-specific rules already exist.

To apply styles only in PDFs, begin your selector with `.hg-pdf`:

```css
.hg-pdf .some-element { font-size: 14px; }
```

See: https://support.knowledgeowl.com/help/pdfs#styling-pdfs

**PDF DOM is minimal — and `.hg-pdf` is NOT under the theme class.** The exported PDF's DOM is just `.hg-pdf > .documentation-article > [your article body HTML]` (`PdfGenerator.php`):

```html
<body class="hg-site hg-minimalist-theme">
  <div class="hg-pdf">
    <div class="documentation-article">…article body…</div>
  </div>
</body>
```

Two traps follow:

1. **`hg-minimalist-theme` sits on `<body>` — an ANCESTOR of `.hg-pdf`, not a descendant** — so a `.hg-pdf .hg-minimalist-theme …` fence never matches in a PDF (this silently killed an alert-icon hide for a whole version). The correct PDF prefix is **`.hg-pdf .documentation-article …`**.
2. **The page-type class (`.hg-article-page`, etc., see §15) and all page chrome are absent** — no breadcrumbs, related, ratings, comments, or reading-panel wrappers exist in the PDF. Don't rely on them in PDF selectors.

The PDF **does** load Custom CSS + Custom `<head>`, so `:root` tokens are defined. Common gotcha: Font Awesome alert icons (`.alert.alert-{type}::before { content:"\fXXX" }`, from KO's default template) render as tofu (□) because the PDF engine has no FA webfont — hide them with:

```css
.hg-pdf .documentation-article .alert::before { content: none !important; display: none !important; }
```

## 15. Page-Type Body Classes

Different page types get different high-level classes applied to the `body` element. These selectors are important for writing page-specific custom styles:

| Body Class | Applied To |
|------------|------------|
| `.hg-article-page` | All article and category pages |
| `.hg-category-page` | Category pages (always paired with `.hg-article-page`) |
| `.hg-blog-page` | Blog-style category pages (paired with both above) |
| `.hg-home-page` | Homepage |
| `.hg-search-page` | Search results page |
| `.hg-contact-page` | Contact form pages |
| `.hg-login-page` | Reader login pages |

```css
/* Target only article pages (exclude categories) */
body.hg-article-page:not(.hg-category-page) .some-element { ... }

/* Target only category pages */
body.hg-category-page .some-element { ... }

/* Target only homepage */
body.hg-home-page .some-element { ... }
```

**Gotcha:** Category pages have *both* `.hg-article-page` and `.hg-category-page`. The source CSS uses `.hg-article-page:not(.hg-category-page)` to target articles only — if you use just `.hg-article-page`, your styles will also hit category pages.

**Gotcha — the theme class and the page class are on the SAME element:** `.hg-minimalist-theme` (the theme class) and the page-type classes (`.hg-home-page`, `.hg-category-page`, etc.) are all applied to the same `<body>`. So a *descendant* selector with a space between them (`.hg-minimalist-theme .hg-home-page …`) does **not** match — there's no ancestor/descendant relationship. Use a **compound** selector with no space: `.hg-minimalist-theme.hg-home-page …`. This fails silently — the rule simply never applies, with no error — so homepage/category-scoped overrides written with a space appear to "do nothing."

## 16. Z-Index Layering Gaps

The default CSS uses z-index values with large gaps between layers. If you create positioned elements (sticky headers, floating buttons, overlays), be aware of the existing layers:

| Z-Index Range | Used By |
|---------------|---------|
| 0–5 | Slideout menu, basic positioned elements |
| 20 | Various mid-level components |
| 1031 | Minimalist theme TOC sidebar |
| 1050 | Bootstrap modal dialogs |

Custom positioned elements should avoid 1031+ unless you intend to overlay the TOC or modals.

## 17. Colors Are CSS Variables (Theme-Dependent)

Many colors in the default CSS use CSS custom properties (`var(--primary-color)`, `var(--text-links-color)`, etc.) rather than hardcoded hex values. The theme builder overrides these variables dynamically. This means:

- The default hex values in the source (e.g., `--primary-color: #1d284f`) may not match what a specific customer's KB uses
- Always check the customer's HTML snapshot or live KB to see the actual computed values
- When overriding colors, you can either set a new value on the variable (`--primary-color: #ff0000`) to change it everywhere, or override the specific property on the specific selector

## 18. Deep Selector Nesting for Theme Overrides

Theme-specific styles often use deeply nested selectors (5–7 levels), for example:

```css
.hg-minimalist-theme .documentation-article .fr-img-caption .fr-img-wrap a > span { ... }
```

This creates high specificity that's difficult to override without equally deep selectors or `!important`. When your override isn't taking effect, check whether the default rule uses deep nesting — you may need to match or exceed its specificity.

## 19. Full-Bleed Footer (and other edge-to-edge bands)

The footer (`.ko-site-footer`) — and similar bands — are Bootstrap `.row` elements nested inside a padded, max-width content container. A plain `background` on one therefore stops short of the viewport edges (you get white gutters on the left and right). To stretch a band edge-to-edge regardless of how deeply it's nested, pull it out with symmetric negative side margins:

```css
.hg-minimalist-theme .ko-site-footer {
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  /* width stays auto and fills out to the viewport edges */
}
```

This works when the container is horizontally centered (the usual case). The `50vw` references the viewport *including* the scrollbar, so after applying it, verify there's no unwanted horizontal scrollbar (fine in practice on KO, but check).

## 20. Article Panels Default to White (Dark-Theme Trap)

When converting to a dark theme, it's easy to transparentize the obvious content wrappers (`.documentation-body`, `.ko-content-cntr`, `.ko-homepage-top`) and still be left with a **white content column** — because `ko-css.css` sets white on two *inner* article panels that are easy to miss:

```css
.documentation-article { background-color: #fff; box-shadow: 5px 0 5px -2px #888; }
.hg-article            { background: #fff; }
```

Override **both** (transparent, or your dark fill), and kill the `.documentation-article` box-shadow:

```css
.hg-minimalist-theme .documentation-article,
.hg-minimalist-theme .hg-article { background: transparent !important; }
.hg-minimalist-theme .documentation-article { box-shadow: none !important; }
```

These are plain single-class rules (low specificity), so a scoped override wins easily — the trap is simply *forgetting* they exist, since the outer wrappers are the ones you think of first.

## 21. Href-less `<a>` Are Hidden as Anchor Jump-Targets

`ko-css.css` treats any anchor **without an `href`** as an in-page jump target and hides it:

```css
.hg-minimalist-theme a:not([href]):not(.ko-anchor-icon) {
  display: block; height: 100px; margin-top: -100px; visibility: hidden;
}
```

**Gotcha:** if you build clickable-looking cards/tiles as `<a>` with no `href` (e.g. placeholder links before real routes exist), KnowledgeOwl renders them **invisible** — they sit in the DOM at full size but are `visibility:hidden`, so they never paint. This is easy to misdiagnose as the markup being *stripped* (it isn't — inspect and you'll find the elements present with `visibility:hidden`).

Fixes: use `<div>` for dormant/placeholder cards (switch to `<a href>` once wired to real routes), or give them a real `href`. Distinct from the `.toc-anchor` offset in §6, though it's the same underlying "href-less anchor = jump target" behavior.

## 22. Homepage Article Panel Has a Fixed (Viewport-Derived) Height

For the TOC slideout mechanism, KO pins a **fixed height** (roughly the viewport height — *not* `min-height`) on the homepage article container (`#ko-article-cntr` / `.ko-content-cntr` / `.hg-article`). Stock homepages are short enough to fit, but a **taller custom homepage overflows it**: the content spills out visually (overflow is visible, so you still see it) and the footer — positioned after the pinned-height panel — rides **up over** the content.

Fix by letting the homepage containers grow to their content:

```css
.hg-minimalist-theme.hg-home-page #ko-article-cntr,
.hg-minimalist-theme.hg-home-page .ko-content-cntr,
.hg-minimalist-theme.hg-home-page .ko-content-cntr .hg-article,
.hg-minimalist-theme.hg-home-page .ko-content-cntr .hg-article-body {
  height: auto !important;
}
```

Scope the homepage fix to `.hg-home-page` so it stays independent of other pages. Related to the slideout coupling in §5.

**Article pages carry the same pin.** The article slideout panel gets the same viewport-derived fixed height, so a long article — or one with a reading panel — can clip its body and let the footer ride up over the content, exactly as on the homepage. Release it the same way, scoped to the article context:

```css
.hg-minimalist-theme #ko-article-cntr,
.hg-minimalist-theme .ko-content-cntr,
.hg-minimalist-theme .ko-content-cntr .hg-article,
.hg-minimalist-theme .ko-content-cntr .hg-article-body {
  height: auto !important;
}
```

Also give the article wrapper `display: flow-root` so it contains KO's floated comment form — otherwise the float escapes the panel and overlaps the footer:

```css
.hg-minimalist-theme .hg-article { display: flow-root; }
```

## 23. Reader-Login Page: Light Panels + TWO Flash Mechanisms (Dark-Theme Trap)

The reader-login page (`/help/readerlogin`, body class `hg-login-page`) is **not** dark "for free" — it renders in flat-ui/Bootstrap **light** panels. Under a dark theme its light label/link text lands on white → invisible ("Username", "Password", "Don't have a login?"). Darken everything, scoped to the space-less compound `.hg-minimalist-theme.hg-login-page` (see §15):

- the login `.panel.panel-default` (+ `.panel-heading` / `.panel-title`)
- `.form-control` inputs + `.control-label` labels
- the "Don't have a login?" `.alert.alert-default`
- the signup / reset modals (`#hg-reader-signup` / `#hg-password-reset`): `.modal-content`, `-header` / `-footer` / `-title`, labels, `.btn-danger` (Cancel), and the close `×`

**The bigger trap: the login page shows flash messages via TWO *different* class families** — fixing only one silently misses the other:

- **`.alert.*`** (`alert-warning` / `-info` / `-success` / `-danger` / `-default`) → signup errors + password-reset confirmations.
- **`.bs-callout.*`** (`bs-callout-warning` / `-danger` / `-info` / `-success`) → **login errors**, e.g. `<div class="bs-callout bs-callout-warning">Incorrect Username or Password.</div>`. This is a `bs-callout`, **not** an `.alert`, so an `.alert`-only fix leaves login errors light-on-light.

flat-ui backs both with **light `!important` fills**, so a non-`!important` theme alert rule (§7) loses here — the override needs higher specificity **plus** `!important`, and must target **both** families:

```css
/* dark fill + light text for panels AND both flash mechanisms (example colours) */
.hg-minimalist-theme.hg-login-page .panel.panel-default,
.hg-minimalist-theme.hg-login-page .alert,
.hg-minimalist-theme.hg-login-page .bs-callout,
.hg-minimalist-theme.hg-login-page .modal-content {
  background: #180048 !important;                 /* your dark panel colour */
  border: 1px solid rgba(255,255,255,0.08) !important;
  color: #F0FFFF !important;                       /* your light text colour */
}
/* accent left-border per flash type — cover BOTH families */
.hg-minimalist-theme.hg-login-page .alert.alert-warning,
.hg-minimalist-theme.hg-login-page .bs-callout-warning { border-left: 3px solid #FFD84F !important; }
.hg-minimalist-theme.hg-login-page .alert.alert-danger,
.hg-minimalist-theme.hg-login-page .bs-callout-danger  { border-left: 3px solid #ff8b8b !important; }
/* …repeat for -info (cyan) and -success (green) */
```

**Finding the flash markup:** these states only appear after a form POST, so they're not in a static login-page snapshot. The login page is **public**, so the fastest way to capture the real DOM is to drive it in a browser (submit the form to trigger the message) and inspect — that's how the `.bs-callout` login-error mechanism surfaced after an `.alert`-only fix had missed it. Same dark-theme-trap family as §20 (white article panels) and §22 (fixed panel height).

## 24. TOC Hover/Active Highlight Lives on the LINK, Not the `<li>`

The Minimalist theme's default TOC hover/active background (a warm peach, ~`#EEEAE7`) is painted on **different elements for categories vs. articles** in the left nav:

- **Categories:** on the link — `a.documentation-category:hover` / `.active` — *not* the `.category-container` `<li>` or the `.category-link-container` wrapper.
- **Articles:** on the list item — `.article-container:hover` / `.article-container.active` — *not* the inner `.article-link`.

So a TOC restyle must override the **right element per type**. A single `<li>`-level override kills the beige for articles but leaves it on categories — a "looks fixed until you hover a category" bug. To find where a hover paints, hover the element and read the `:hover` chain: `[...document.querySelectorAll(':hover')].map(e => [e.className, getComputedStyle(e).backgroundColor])` (see `03-LOCALHOST_PREVIEW.md`). For a clean full-row highlight, kill the default on the painting element and apply one tint to the row (the `<li>` for articles, the `.category-link-container` for categories), leaving the link plain.

## 25. Flexbox on `.ko-homepage-top` Collapses the Homepage Search

Making the homepage hero (`.ko-homepage-top`) a `display: flex; flex-direction: column` container — a tempting way to vertically center the title + large search — **shrinks the `[template("large-search")]` input to its content width** (the search becomes a flex item and stops filling the row). Space/center the hero with vertical **padding** instead; or, if you need flex, give the search wrapper an explicit width. (`.ko-homepage-top` is also full-bleed — it carries negative side margins — so it already spans edge-to-edge without flex.)

## 26. Homepage `icon-cats` Tiles Left-Align With Fewer Categories Than Columns

The homepage category tiles (`[template("icon-cats,col=N")]`, see `knowledgeowl-css-defaults.md`) render in an **N-wide grid** — the default CSS forces `width: 25%` on the tiles at ≥992px. When the KB has **fewer categories than N** (e.g. 3 categories in a `col=4` grid), they left-align and leave an empty trailing slot instead of centering. Center them with flex on the row:

```css
.hg-minimalist-theme.hg-home-page .category-list {
  display: flex !important; flex-wrap: wrap; justify-content: center; gap: 22px;
}
.hg-minimalist-theme.hg-home-page .category-list > .cat-icon-panel {
  flex: 0 0 240px !important; max-width: 240px; float: none !important; margin: 0 !important;
}
```

The tiles are direct `<a class="cat-icon-panel">` children of `.category-list` (no wrapping `<div>`), so target `.category-list > .cat-icon-panel` — `> div` won't match.

## 27. Centering an Icon in a Nav Toggle Button — Use Flex, Not `line-height`

KO's slideout toggles are `<button>`s holding a single Font Awesome glyph — e.g. the left TOC toggle `.ko-slideout-left-toggle` wraps `<i class="fa fa-bars fa-2x">`. To vertically center that icon in a taller nav bar, set the button to **`display: flex; align-items: center;` with a fixed `height`** — the same technique `.navbar-brand` uses. Do **not** reach for `line-height`: on an inline icon it only aligns the glyph to the text **baseline** (which sits below the visual center), so the icon rides high with a gap beneath it.

```css
.hg-minimalist-theme .ko-slideout-left-toggle {
  display: flex;
  align-items: center;
  height: var(--nav-height);   /* match the logo / .navbar-brand box height */
  padding-top: 0;              /* KO's default is padding-top: 11px with no bottom — that top-offsets the icon */
  padding-bottom: 0;
}
```

Leave KO's `float`, `width`, and `padding-right` in place so only the vertical alignment changes (the toggle's default box is documented in `knowledgeowl-css-defaults.md` → Navigation & Header).

## 28. Froala Article Editor Is an IFRAME (Editor-Only Overrides Behave Differently)

The article editor renders inside an **iframe**, which changes how "editor-only" CSS must be written:

- **`.fr-box` lives in the PARENT document**, not the iframe — so `.fr-box .fr-element h1` (a common "style headings only in the editor" override) **never matches** the headings inside the editor.
- The iframe `<body>` carries `documentation-article hg-article-body fr-editor-svelte` (+ Froala's own `fr-view`) — **crucially NOT `hg-minimalist-theme`** — so theme-scoped rules don't apply inside the editor either.
- The per-KB **Style-Settings color block is NOT injected into the editor iframe.** Only Custom CSS, the static `koFroalaEditor` bundle, and fonts load there — so `:root` tokens defined via Style Settings are **absent**, and editor overrides must use **literal hex**, not `var(--…)`.

To force heading readability inside the editor, target `.fr-view` / `.fr-editor-svelte` with literal hex + `!important`:

```css
.fr-view h1, .fr-editor-svelte h1 { color: #1a1a1a !important; }
```

(Source: `FroalaEditor.svelte`, `froala/config.ts`, `KbRenderer.php` — the on-page heading rule `.documentation-article h1, .cke_editable h1 { color:… }` has **no** `!important`, so a themed heading color loses to editor defaults unless you force it.)
