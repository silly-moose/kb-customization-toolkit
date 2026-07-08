# KnowledgeOwl CSS Quirks & Idiosyncrasies

Reference for anyone writing or editing CSS/HTML in a KnowledgeOwl knowledge base.

For full documentation, see: https://support.knowledgeowl.com/help/look-and-feel

---

## 1. Heavy `!important` Usage

Source: https://support.knowledgeowl.com/help/default-custom-css

KnowledgeOwl's default styles use `!important` regularly. On a current Minimalist KB the loaded CSS carries ~150 instances (Bootstrap 3.0.0 ≈63, Flat UI ≈63, `ko-css.css` 20, seeded Custom CSS 6) — primarily on display/visibility utilities (`display: block !important`, `display: none !important`), float utilities, responsive table rules, and print styles. (The legacy `publicview*.css` bundles add ~153 each, but those don't load on Minimalist KBs.) Custom CSS overrides often need `!important` too, or very high specificity selectors, to take effect.

## 2. Theme-Namespaced Selectors

Source: https://support.knowledgeowl.com/help/default-custom-css

Most default selectors are scoped under a theme class like `.hg-minimalist-theme`. Writing `.some-element { color: red; }` likely won't work — you typically need:

```css
.hg-minimalist-theme .some-element { color: red; }
```

**Note:** `.hg-minimalist-theme` is the selector for the Minimalist theme, which most new customers are locked into. Older customers may be on other themes — the body class is `hg-{theme_name}-theme` with `theme_name` one of `classic` (also the fallback), `modern`, `minimalist`, or `clayton` — so the CSS you need can vary significantly between KBs. Always check the existing selector specificity before writing overrides.

## 3. Competing Link Selectors

Source: https://support.knowledgeowl.com/help/default-custom-css

Rules like `a:not(.btn)` appear multiple times, from **two different sources** that split base vs. hover:

- **Base link color** comes from the seeded Custom CSS: `.hg-minimalist-theme a:not(.btn), a:not(.btn) { color: var(--text-links-color) }` (default `#3C80BA`). A *generated* Style-Settings rule also sets a base `a:not(.btn)` color (a dark accent shade), but the Custom CSS rule wins the cascade.
- **Hover/focus color** comes from a *generated* rule (`.hg-minimalist-theme a:not(.btn):hover … { color: <accent shade> }`) — changing `--text-links-color` does **not** change hover; that follows the "Highlights & accents" Style Setting.
- Specific contexts override again in the seeded Custom CSS with `--primary-color` / `--secondary-color` (e.g. the search results pager).

Link styling can be tricky — make sure your selector targets the right context, and remember base and hover are controlled by different mechanisms.

## 4. Froala Image Classes and `.no-border`

Source: https://support.knowledgeowl.com/help/default-custom-css

Images inserted via the Froala editor can have classes applied (all in `ko-css.css`): `.fr-shadow` (adds `box-shadow: 0 1px 3px rgba(0,0,0,.12), 0 1px 1px 1px rgba(0,0,0,.16)`), `.fr-bordered` (adds `border: solid 5px #CCC`), and `.fr-rounded` (adds `border-radius: 10px`). These are opt-in per image, not blanket defaults — but they appear frequently because the editor applies them. The `.no-border` class KnowledgeOwl's docs reference is **not** in the platform CSS or the seeded Custom CSS template — if a KB relies on it, the rule was added to that KB's own Custom CSS (define it yourself if you want it). When writing image-related CSS, be aware of these Froala classes and their specificity.

## 5. TOC Slideout Layout Coupling

Source: https://support.knowledgeowl.com/help/default-custom-css

The table of contents couples one width across three rules in two files:

```css
/* ko-css.css — the TOC panel itself */
.slideout-menu { width: 360px; }

/* seeded Custom CSS — closed position + the article panel's open-state shift */
.hg-minimalist-theme.hg-2column-layout .slideout-menu { left: -360px; }
.hg-minimalist-theme #ko-article-cntr.slideout-panel.open {
  transform: translateX(360px);
  width: calc(100% - 360px);
}
```

Changing one without the others breaks the layout. If you modify the TOC width, update all of them. (At ≤991px the seeded Custom CSS resets the open panel to `width: 100%`.)

## 6. Anchor Link Offset for Fixed Navigation

Source: https://support.knowledgeowl.com/help/fix-anchor-links-hidden-by-top-navigation

Anchor links scroll behind the fixed top navigation bar. KnowledgeOwl compensates with invisible `.toc-anchor` elements (rule lives in the seeded Custom CSS, scoped `.hg-minimalist-theme .toc-anchor`):

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

Alert/callout boxes use `::before` pseudo-elements for icons — a `65px × 60px` **floated** block holding a 48px Font Awesome 6 Pro glyph (weight 900), from the seeded Custom CSS. Because the icon is a float:

- **Paragraphs** get no margin — the text simply wraps around the float (alerts also get `min-height: 90px` so short ones don't collapse below the icon, and `p` inside alerts get `margin-top: 0`).
- **Lists** don't wrap cleanly, so the seeded CSS offsets them explicitly: `.alert ul, .alert ol { margin-left: 75px }`.

Other block elements you place inside alerts may need the same `margin-left` treatment to avoid overlapping the icon. Per-type icons/colors: `.alert.alert-danger/-info/-success/-warning` each set a background, border, and a `content: "\fXXX"` glyph.

## 8. Theme Builder Can Overwrite Custom CSS

Source: https://support.knowledgeowl.com/help/theme-colors

Theme color settings are rendered as generated CSS rules injected into the page just *before* the Custom CSS (see the defaults doc's "Theme Builder Color Mapping"). They don't rewrite your Custom CSS text, but changing them after a customization can silently fight it: a new generated color re-paints any element your CSS didn't explicitly pin, and computed derivatives (TOC hover, borders, button hovers) shift with them. After theme-builder changes, re-verify the customized pages.

## 9. Responsive Breakpoints

Source: https://support.knowledgeowl.com/help/default-custom-css

KnowledgeOwl uses Bootstrap 3 breakpoints plus custom ones (the custom ones live in the seeded Custom CSS). The most important breakpoints for custom CSS:

| Breakpoint | Direction | Typical Use |
|------------|-----------|-------------|
| 576px      | `min-width` | Homepage category list goes 2-up |
| 768px      | `min-width` | Tablet (Bootstrap `sm`) |
| 991px / 992px | `max` / `min` | Small desktop / landscape tablet (Bootstrap `md`); ≤991px also disables the TOC-open article squeeze |
| 1200px     | `min-width` | Large desktop (Bootstrap `lg`) |
| 1473px     | **`max-width`** | Three-column squeeze: below this, content narrows to 700px and the right column widens (KO-specific) |

**Note:** watch the directions — 1473px is a `max-width` query (it applies to screens *narrower* than 1474px), not a `min-width` one. `ko-css.css` also has a `min-width: 1400px` rule for wide screens. The five listed above are the primary ones to align with.

## 10. Custom Utility Classes to Know

Source: https://support.knowledgeowl.com/help/default-custom-css

| Class | Purpose |
|-------|---------|
| `.no-border` | Referenced in KO docs for removing image borders/shadows, but **not defined** in the platform CSS or the seeded template — add your own rule (see quirk #4) |
| `.check-list` | Styled bullet list with FontAwesome checkmarks (`ul.check-list`, seeded Custom CSS lines ~565–579). (**Note:** This is a Support KB-specific artifact that was never supposed to be in the default custom CSS. It's flagged for removal, but documenting here since it currently exists in the seeded template and can cause unexpected styling.) |
| `.toc-anchor` | Invisible anchor offset for fixed nav (seeded Custom CSS; see quirk #6) |
| `.margin-top-20` | Spacing utility (seeded Custom CSS, scoped `.hg-minimalist-theme .margin-top-20` — no sibling sizes exist) |
| `.hg-minimalist-theme` | Primary theme wrapper (used for selector scoping) |
| `.hg-2column-layout` | Two-column layout variant |
| `.hg-3column-layout` | Three-column layout variant |
| `.slideout-menu` | TOC sidebar container — the class that carries the panel CSS (`width: 360px`, fixed position) |
| `.slideout-new` | Marker class on `.hg-site-body` for the newer slideout system. It appears in HTML markup but has **no CSS definition** — it's a JavaScript hook; the panel styling is all on `.slideout-menu` / `.slideout-panel`. |

## 11. Image Caption Selectors (`fr-img-caption`)

Source: https://support.knowledgeowl.com/help/style-image-captions

Captioned and non-captioned images use different selectors. Captioned images are wrapped in `span.fr-img-caption`, which gets its own border and layout styles. The styling is layered: `ko-css.css` sets a hardcoded base (caption background `#656565`, wrapper border `2px solid #bdc3c7`, Minimalist override to `#1d284f`), then the **seeded Custom CSS** re-styles it with variables — background `var(--primary-color)` (default `#1d284f`), border removed, caption links `var(--image-caption-link-color)` (default `#F6A267`, hover `var(--secondary-color)`). Since the final layer uses the KB's Custom CSS variables, actual values vary per KB. Be aware of this split when writing image-related CSS — you may need separate rules for captioned vs. non-captioned images.

## 12. Nested Ordered List Numbering

Source: https://support.knowledgeowl.com/help/customize-nested-numbered-list-styles

The default CSS enforces a three-tier numbering hierarchy for ordered lists inside articles:

- Level 1: `decimal` (1, 2, 3)
- Level 2: `lower-alpha` (a, b, c)
- Level 3: `lower-roman` (i, ii, iii)

These are set on `.hg-article-body ol` with child combinators, in the seeded Custom CSS (which also adds `.hg-article-body ol li { padding: 10px 0 }`). Custom list styling needs to match or override these specific selectors.

**Note:** This numbering hierarchy was originally Support KB-specific and shouldn't have been hard-coded into the default theme, but it was. It's flagged for removal from the default theme.

**Custom `<ol>` shrink-wrap gotcha:** if a *custom* ordered-list component renders shrink-wrapped to ~content width instead of filling its column, check the KB's **own** Custom CSS for an inherited `li { display: table }` (or `ol li { display: table }`). This is **not** a KO default — no current or legacy KO bundle sets it (the platform's `display: table` rules are all Bootstrap clearfixes like `.documentation-body::after`) — but individual KBs sometimes carry it, and `display: table` on a list item shrinks it to its content. Override on the component with `display: block !important; width: auto`. (This one hides from computed-style spot-checks — colors/fonts all pass; it only shows up as a width problem in a visual preview.)

## 13. Search Bar Border Pattern

Source: https://support.knowledgeowl.com/help/default-custom-css

Individual search input elements have their borders removed (`.hg-search-bar input.form-control`, `.input-group-btn .btn` → `border: none`). The visible border is on the outer `.input-group` wrapper instead (`1px solid var(--input-border-color)` + a soft box-shadow). Focus state is handled via `.hg-search-bar .input-group:focus-within:not(:focus-visible)`, which adds a `box-shadow: 0 0 0 2px var(--input-focus-color)` ring. All of this lives in the seeded Custom CSS. Styling the search bar requires targeting the wrapper, not the input.

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

The PDF **does** load Custom CSS + Custom `<head>`, so `:root` tokens are defined. (Full PDF CSS stack: Bootstrap + Flat UI + `ko-css.css` — or a legacy `publicview` bundle for older themes — plus `public/css/pdf.css` and the KB's Custom CSS; see `ResourceLoader::loadRawPdfCss()`.) Common gotcha: Font Awesome alert icons (`.alert.alert-{type}::before { content:"\fXXX" }`, from KO's default template) render as tofu (□) because the PDF engine has no FA webfont — hide them with:

```css
.hg-pdf .documentation-article .alert::before { content: none !important; display: none !important; }
```

**Two PDF engines, both weak — never depend on JS or advanced layout.** KO renders PDFs with *two* different engines depending on the export type, so behavior isn't uniform:

- **Single-article download → wkhtmltopdf** (`PdfGenerator.php`, via Knp\Snappy — JS is *enabled*; the `disable-javascript` option is commented out). It's an old WebKit build, so JS *runs* but **unreliably**: on large or Word-pasted articles it frequently doesn't finish before the page is captured, so a script that works on the live page silently no-ops in the PDF.
- **Full-KB / multi-article / version PDFs → mpdf** (`FullPdf.php`, `ArticleVersionPdf.php`). mpdf is a pure-PHP engine that runs **no JavaScript at all**, has **weak flex/grid support** (grids collapse to one column), and **mis-positions** absolutely-positioned / flex `::before` counters (numbered-step digits float outside their circles, etc.).

Practical rule: anything that must render in a PDF should be **CSS-only and simple-layout** (block/table, not flex/grid) and must not rely on JS. Give decorative `::before` counters a plain inline fallback for the PDF context. (This is why the Approved-By / metadata patterns moved to CSS-only — see the customer project notes.)

**Dark component panels vs. the white-page text fence.** If a component keeps a dark background in the PDF, the usual "make PDF text dark on white paper" fence — e.g. `.hg-pdf .documentation-article p, .hg-pdf .documentation-article li { color: #212121 }` (whether from KO's `pdf.css` or one you added) — turns the text *inside* the dark panel unreadable (dark-on-dark). Re-lighten per panel with a **more specific** selector — an `#id` in the chain outranks the class-only fence:

```css
.hg-pdf .documentation-article #my-dark-panel p,
.hg-pdf .documentation-article #my-dark-panel li { color: #fff; }
```

Specificity trap: a `.hg-pdf …` override that merely **ties** the screen rule's specificity **loses**, because the screen rule usually sits later in the file. Add an extra wrapper class (or an `#id`) to the PDF override so it actually wins.

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

The default CSS uses z-index values with large gaps between layers. If you create positioned elements (sticky headers, floating buttons, overlays), be aware of the existing layers (from `ko-css.css` unless noted):

| Z-Index | Used By |
|---------|---------|
| 0 / 1 | `.slideout-menu` (TOC panel) / `.slideout-panel` (article panel) |
| 2 | Slideout toggles, right column |
| 3 / 5 | Loading spinner / article preview bar |
| 20 | Autocomplete/type-ahead menu (`.ui-menu`) |
| 100 | `.back-to-top` snippet (seeded Custom CSS) |
| 1030 | Fixed navbar (Bootstrap `.navbar-fixed-top`) |
| 1031 | Minimalist `toc-always-open` TOC sidebar (sits just above the navbar) |
| 1040 / 1050 | Bootstrap modal backdrop / modal dialogs |

Custom positioned elements should avoid 1030+ unless you intend to overlay the header, TOC, or modals.

## 17. Colors Are CSS Variables (Theme-Dependent)

Many colors in the *seeded Custom CSS* use CSS custom properties (`var(--primary-color)`, `var(--text-links-color)`, etc.) rather than hardcoded hex values. The variables are defined in the KB's own Custom CSS — the theme builder does **not** set or override them (it generates separate selector-level rules; see quirk #8). This means:

- The template defaults (e.g., `--primary-color: #1d284f`) may not match what a specific customer's KB uses — anyone can have edited the KB's Custom CSS
- Always check the customer's HTML snapshot or live KB to see the actual computed values
- When overriding colors, you can either set a new value on the variable (`--primary-color: #ff0000`) to change everything that *references the variable*, or override the specific property on the specific selector — but remember theme-builder-generated colors (heading colors, TOC hover, button colors) don't go through these variables at all

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

For the TOC slideout mechanism, KO pins the homepage article container's height to its ancestors — `ko-css.css` sets `.hg-article { height: 100% }` (and `.hg-site-body .documentation-article { min-height: calc(100vh - 60px) }`), so the panel chain (`#ko-article-cntr` / `.ko-content-cntr` / `.hg-article`) resolves to roughly the viewport height, *not* to the content. Stock homepages are short enough to fit, but a **taller custom homepage overflows it**: the content spills out visually (overflow is visible, so you still see it) and the footer — positioned after the pinned-height panel — rides **up over** the content.

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

Both families carry light default fills — the `.alert.*` backgrounds come from the seeded Custom CSS (`#F4E2E2`, `#F0F7FD`, …) and the `.bs-callout-*` fills from `ko-css.css` (`#fcf2f2`, `#fefbed`, …). None of them are `!important` in the source, but they sit at various cascade positions relative to where your override lands, so the safe pattern is higher specificity **plus** `!important`, targeting **both** families:

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

## 24. TOC Hover/Active Highlight Is GENERATED, and Paints on Multiple Elements

The Minimalist theme's TOC hover/active background is a **generated Style-Settings rule**, not static CSS. `KbRenderer` computes it from the "Table of contents / Column background" color — **darkened by 10/255 per RGB channel** (stock `#F8F4F1` → `rgb(238,234,231)` = `#EEEAE7`, the familiar warm peach) — and paints it across a dozen selectors at once (`$minimalistTocClasses`): container-level (`.category-link-container:hover/.active`, `.article-container:hover/.active`, `li.active`) *and* link-level (`.documentation-categories li a:hover`, `.article-link:hover/.active`).

What you *see* is whichever painted element is innermost, and that differs per type:

- **Categories:** the link — `a.documentation-category` (matched by `li a:hover`) paints over its `.category-link-container` wrapper.
- **Articles:** the list item — `.article-container:hover` / `.article-container.active`.

Consequences for a restyle:

1. A single `<li>`-level override kills the beige for articles but leaves it on categories — a "looks fixed until you hover a category" bug. You must override **both container-level and link-level** selectors.
2. The color isn't in any stylesheet — changing the TOC background Style Setting silently changes the hover color too.
3. `ko-css.css` also has static `#ddd` fallbacks on the same elements (`.article-container:hover`, `.category-link-container:hover`, `li a:hover`), so killing only the generated rule can reveal gray.

To find where a hover paints, hover the element and read the `:hover` chain: `[...document.querySelectorAll(':hover')].map(e => [e.className, getComputedStyle(e).backgroundColor])` (see `03-LOCALHOST_PREVIEW.md`). For a clean full-row highlight, kill the default on the painting elements and apply one tint to the row (the `<li>` for articles, the `.category-link-container` for categories), leaving the link plain. (The seeded Custom CSS also ships commented-out hover overrides wired to `--toc-category-hover-color` / `--toc-article-hover-color` — a customer may have uncommented those.)

## 25. Flexbox on `.ko-homepage-top` Collapses the Homepage Search

Making the homepage hero (`.ko-homepage-top`) a `display: flex; flex-direction: column` container — a tempting way to vertically center the title + large search — **shrinks the `[template("large-search")]` input to its content width** (the search becomes a flex item and stops filling the row). Space/center the hero with vertical **padding** instead; or, if you need flex, give the search wrapper an explicit width. (`.ko-homepage-top` is also full-bleed — it carries negative side margins — so it already spans edge-to-edge without flex.)

## 26. Homepage `icon-cats` Tiles Left-Align With Fewer Categories Than Columns

The homepage category tiles (`[template("icon-cats,col=N")]`, see `knowledgeowl-css-defaults.md`) render in an **N-track CSS grid** — `ko-css.css` sets `.cat-icons-cntr .category-list.colN { display: grid; grid-template-columns: repeat(N, 1fr) }`. The grid always reserves N tracks, so when the KB has **fewer categories than N** (e.g. 3 categories in a `col=4` grid), the tiles left-align and leave an empty trailing track instead of centering. Center them by switching the row to flex:

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

This bites **two** text elements in practice: **headings** (a theme's `.documentation-article h1{…}`-style rule matches the editor body) and **links** (KO's seeded base-link rule from §3 — `.hg-minimalist-theme a:not(.btn), a:not(.btn){color:var(--text-links-color)}` — reaches the editor through its **second, unscoped** `a:not(.btn)` selector, so a re-tokened light link color renders unreadable on the white canvas).

### Editor Readability Guard (the canonical fix — paste whole into every build's Custom CSS)

This is **mandatory in every build** (see `CLAUDE-RULES.md` → "Editor Readability Guard"). It's editor-only and provably safe — `fr-view` / `fr-editor-svelte` / `cke_editable` exist **only** inside the editor iframe, never on public pages or in PDF — so it cannot touch the live site. Literal hex on purpose (the `:root` tokens are absent in the iframe). Only change the hexes if a KB's editor canvas is intentionally not the default white.

```css
/* ── EDITOR READABILITY GUARD — keep readable text on the white Froala canvas ──
   The editor iframe loads ko.css + compiled Custom CSS but NOT the Style-Settings
   block or Custom <head>, so unscoped / .documentation-article-scoped theme text
   colors leak in. These editor-only selectors restore KO's stock readable colors. */
.fr-view, .fr-editor-svelte, .cke_editable { --text-links-color: #3C80BA; }
.fr-view h1, .fr-view h2, .fr-view h3, .fr-view h4, .fr-view h5, .fr-view h6,
.fr-editor-svelte h1, .fr-editor-svelte h2, .fr-editor-svelte h3, .fr-editor-svelte h4, .fr-editor-svelte h5, .fr-editor-svelte h6,
.cke_editable h1, .cke_editable h2, .cke_editable h3, .cke_editable h4, .cke_editable h5, .cke_editable h6 {
  color: #212121 !important;
}
.fr-view a:not(.btn), .fr-editor-svelte a:not(.btn), .cke_editable a:not(.btn) {
  color: #3C80BA !important;
}
```

Notes:
- The first line **re-points `--text-links-color`** inside the editor, which generically neutralizes *any* unscoped ko.css rule that consumes that token (belt-and-suspenders beyond the explicit link rule below it).
- Guard **headings and links only** — do **not** blanket-reset body `p`/`li` text: a blanket `!important` there would also override an author's own toolbar text colors (they'd look default-black while editing, then publish colored). If a specific build's authors color headings and you want those preserved in the editor, exclude them with `:not([style*="color"])` on the heading selector.
- (Source: `wysiwyg.js:46-50` loads `[koCssPath, customCSS, …fonts]`, applied at `:901`/`:1086`; `editorBodyClass` at `:906`/`:1089`. The on-page heading rule `.documentation-article h1, .cke_editable h1{color:…}` from `KbRenderer.php` has **no** `!important`, so the guard wins.)

## 29. Distinguishing Live vs PDF vs Editor When Scoping `.hg-article-body`

`.hg-article-body` is the article-body wrapper in **three** contexts, and a rule scoped to it applies in all three — which bites when the rule is only meant for the rendered article:

- **Live article:** `<div class="hg-article-body">` inside `.hg-article`, with a real `.hg-article-header` sibling above it.
- **PDF export:** `.hg-pdf > .documentation-article > … > .hg-article-body` — here `documentation-article` is an **ancestor** (see §14).
- **WYSIWYG editor:** the editable body *itself* is `class="documentation-article hg-article-body"` — both classes on the **same element** (`wysiwyg.js:906` `editorBodyClass`; `:1089` `CKEDITOR.config.bodyClass`).

So a hack that assumes the live layout — e.g. a negative `margin-top` that pulls a body line up under the article header — **misfires in the editor**, where there's no header above it: the line gets dragged off the top of the editable area and vanishes (looks like the class "broke" the editor).

The disambiguator: the editor is the only context where `documentation-article` and `hg-article-body` sit on the **same element**, so `:not(.documentation-article)` excludes the editor while keeping live + PDF (where the body element itself isn't `.documentation-article`):

```css
/* size/look everywhere, incl. the editor preview */
.hg-article-body p.my-meta { font-size: 13.5px; }
/* header-relative pull-up ONLY where a header exists (live + PDF), NOT the editor */
.hg-article-body:not(.documentation-article) p.my-meta { margin-top: -28px; }
/* PDF-specific tweak (documentation-article is an ancestor here, so this still matches) */
.hg-pdf .hg-article-body p.my-meta { margin-top: -20px; }
```

Rule of thumb: put font/color/size on the plain `.hg-article-body …` selector (so the editor previews it correctly), and put any header-relative spacing behind `:not(.documentation-article)`.

## 30. Article Header and Body Sit on Different Font-Size Bases (`em` Doesn't Transfer)

The article **header** and **body** compute `em` against different base font-sizes, so the *same* `em` value renders at different pixel sizes in each:

- **`.hg-article-body`** is pinned to **16px** by the generated **Body font** Style-Settings rule (`.hg-article-body, .hg-article-body p { font-size: 16px }` — see `knowledgeowl-css-defaults.md` → Typography Defaults).
- **`.hg-article-header`** is *not* covered by that rule, so it inherits the page base — Flat UI's `body { font-size: 18px }`.

Consequence: a header metadata element at `font-size: 0.75em` computes to **13.5px** (0.75 × 18), while the *same* `0.75em` on a body element computes to **12px** (0.75 × 16). So a custom body line meant to match a header metadata row (e.g. an "Effective date" line matching "Last Approved Date") comes out visibly **smaller** — matching by copying the header's `em` value silently fails.

Two more wrinkles:

1. **PDF differs again.** The PDF stylesheet (`ResourceLoader::loadRawPdfCss`, see §14) may not carry the generated 16px body pin, so the same `em` rule can look correct in the PDF yet wrong in the live KB (or vice-versa) — verify both contexts.
2. **Don't hand-compute the cascade** across Bootstrap + Flat UI + `ko-css` + generated + Custom CSS to guess the px — it's error-prone. Measure the target's computed `font-size` (reproduce the snapshot locally + `getComputedStyle`, or have the user paste one from the live page — see `03-LOCALHOST_PREVIEW.md`), then set that px explicitly for the context that's wrong.

Related specificity note (also in `knowledgeowl-css-defaults.md`): the generated `.hg-article-body p` rule is specificity **(0,1,1)**, so a bare custom class **(0,1,0)** loses to it — scope custom body-paragraph styling as `.hg-article-body p.my-class` **(0,2,1)**.

## 31. Hiding Article Chrome on Full-Bleed Custom Pages — Use Descendant Selectors

When a custom, full-bleed article page needs KO's stock article chrome (related articles, ratings, comments) hidden, note those blocks are **not direct children of `.ko-content-cntr`** — they live inside `.hg-article-footer`, which is inside `.hg-article`:

```
.ko-content-cntr > .hg-article > .hg-article-footer > { .ko-related-articles, .hg-ratings, comment blocks }
```

So a `:has()`/child-combinator fence written with `>` (e.g. `.ko-content-cntr:has(.my-wrapper) > .ko-related-articles`) silently **misses** them, and the footer chrome still shows under your custom page. Use **descendant** selectors and include `.hg-article-footer` itself:

```css
.ko-content-cntr:has(.my-wrapper) .hg-article-footer,
.ko-content-cntr:has(.my-wrapper) .ko-related-articles,
.ko-content-cntr:has(.my-wrapper) .hg-ratings { display: none; }
```

Related: KO's front-end JS **appends** `#`-anchor icons (`.ko-anchor-icon`) to article-body headings at runtime (h2 and h3+), so a custom landing-page component built from headings needs a scoped `.ko-anchor-icon { display: none }` too — the icons aren't in the static snapshot; they appear after load. (Same "href-less anchor" family as §21.)

## 32. Detecting a Logged-In Author Client-Side (`.ko-app-edit`)

For UI that should show only to logged-in authors (e.g. an author-only validation banner readers must never see), the reliable client-side signal is the admin toolbar's **Edit** link: `<li class="ko-app-edit">…Edit…</li>` (`editor-bar.phtml:315`). It renders into the editor bar for authenticated authors and carries a `hide` class when the viewer lacks edit access — so `.ko-app-edit:not(.hide)` present in the DOM ≈ "the viewer is a logged-in author who can edit this article." Readers get no editor bar at all.

```css
/* author-only element, hidden for everyone by default */
.my-author-note { display: none; }
body:has(.ko-app-edit:not(.hide)) .my-author-note { display: block; }
```

## 33. KB Search Never Indexes `<script>` Content

KnowledgeOwl strips `<script>` blocks out of the article body *before* indexing it (`Indexer.php:265`: `preg_replace('/<script.*?<\/script>/is', ' ', $cleanBody)`). So any article whose content is **rendered by JavaScript** (a config-object-plus-engine pattern, a script that builds the DOM on load, etc.) is **invisible to KB search** — the words never enter the index.

The same JS-rendered content also (a) does **not** appear in PDF exports on the mpdf path and is unreliable on wkhtmltopdf (§14), and (b) shows as **raw code** in the WYSIWYG editor. So for interactive article content, prefer **plain markup in the article body** enhanced by a theme-level (Custom `<head>`) progressive-enhancement script, rather than generating the body from JS inside the article itself.
