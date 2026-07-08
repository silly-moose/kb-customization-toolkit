# KnowledgeOwl CSS Defaults Reference

Lookup reference for default selectors, property values, and CSS architecture in KnowledgeOwl knowledge bases. Use this when writing custom CSS overrides — it tells you what you're overriding without needing to reverse-engineer from DevTools.

**Companion file:** `knowledgeowl-css-quirks.md` covers platform-specific gotchas (e.g., `!important` usage, TOC coupling, theme builder overwrite risks). This file covers default values and structure.

---

## CSS Architecture: How Styles Layer

A current (Minimalist-theme) KB loads its styles from three sources, in this order (later overrides earlier on equal specificity):

1. **Font Awesome bundle** (`koFontawesome`) — Font Awesome Pro 6.5.1 + v4 shims (legacy `fa` classes)
2. **The `ko` CSS bundle** — one compiled file (`/min/css/ko-*.css`) concatenating, in order (per `build-assets.mjs`):
   1. **Bootstrap 3.0.0** (`flatui/dist/css/vendor/bootstrap.min.css`) — grid, buttons, forms, tables, nav, modals (includes the normalize reset)
   2. **Flat UI** (`flatui/dist/css/flat-ui.min.css`) — flat design skin over Bootstrap (base body/heading typography)
   3. **`ko-css.css`** — all of KO's own public-KB layout and theme structure, including every `.hg-minimalist-theme` rule
   4. **`github.css`** — code-block syntax highlighting
3. **One inline `<style>` block** (from `KbRenderer::css()`), containing in order:
   1. **Dynamic theme styles** — selector-level rules generated per-KB from Style Settings (see "Theme Builder Color Mapping" below). These are plain generated rules like `.hg-site .hg-header{background-color:#FFFFFF}` — they do **not** set CSS variables.
   2. **Custom CSS** — the KB's Customize > Style (HTML & CSS) > Custom CSS, appended after the generated rules. New Minimalist KBs are **seeded** with KO's default Custom CSS template (`service/views/scripts/themer-templates/custom-css.css`, ~900 lines) — that template is where the `:root` custom properties and many of the "defaults" below actually live.

Custom CSS loads last, so it wins on equal specificity. Some rules in the bundles use `!important` (see quirks doc #1), so you'll sometimes need `!important` or high specificity to override.

**Legacy note:** `publicview.css` / `standard.css` (and the `_modern` variants) are compiled into separate `public` / `publicModern` bundles used only by **older custom-HTML themes** and their PDFs — they are *not* loaded on Minimalist KBs. `reset.css` is only used on KO's admin/app pages, not on public KBs.

---

## CSS Custom Properties

Defined on `:root` at the top of the **default Custom CSS** that every new Minimalist KB is seeded with (source template: `service/views/scripts/themer-templates/custom-css.css`). They are **not** in any platform stylesheet — they live in each KB's own editable Custom CSS.

```css
:root {
  --primary-color: #1d284f;
  --secondary-color: #f8b88b;
  --text-links-color: #3C80BA;
  --border-color: #dcdcdc;
  --border-hover-color: #b3b3b3;
  --box-shadow-color: #aeaeae;
  --toc-border-color: #ddd;
  --input-border-color: #E6E6E6;
  --image-caption-link-color: #F6A267;
  --input-focus-color: #378DFF;
  --white: #ffffff;
  /* the styles associated with these colors are commented out by default */
  --toc-box-shadow-color: #F8F4F1;
  --toc-category-hover-color: #f2e9e3;
  --toc-article-hover-color: #e8e8e8;
}
```

**Note:** The theme builder / Style Settings do **not** touch these variables — Style Settings emit separate selector-level rules (see "Theme Builder Color Mapping"). The variables only change if someone edits the KB's Custom CSS, which customers and past projects often have — so the actual values vary per KB. Check the HTML snapshot or live KB to see the active values.

---

## Layout Structure & Container Classes

### Body-Level Classes

Applied to `<body>` or high-level wrappers. Use these to scope CSS to specific contexts:

| Class | Applied when |
|-------|-------------|
| `.hg-minimalist-theme` | Minimalist theme (most new KBs) |
| `.hg-classic-theme` | Classic theme (also the fallback when no theme name is set) |
| `.hg-modern-theme` | Modern theme |
| `.hg-clayton-theme` | Clayton theme (legacy) |
| `.hg-1column-layout` | Single column layout |
| `.hg-2column-layout` | Two column layout |
| `.hg-3column-layout` | Three column layout |
| `body.hg-category-page` | Category pages |
| `body.hg-article-page` | Article pages |
| `.toc-always-open` | TOC set to stay open (Minimalist `open-inside` TOC behavior) |
| `.is-author` | Viewer is a logged-in author/agent (editor bar offsets kick in) |
| `.hg-pdf` | PDF export context |
| `.hg-iframe` | KB rendered inside an iframe |

The theme class is generated as `hg-{theme_name}-theme`; `theme_name` is one of `classic`, `modern`, `minimalist`, `clayton` (`service/models/Theme.php`).

### Page Structure (outermost → innermost)

```
.hg-site
  .hg-site-body
    .navbar-default              ← top navigation bar
    .documentation-body          ← main content area
      .slideout-new              ← TOC sidebar (left)
      .documentation-article     ← article/page content
      [right column]             ← optional right sidebar
```

### Layout Width Defaults

| Element | Default Value |
|---------|---------------|
| `.hg-article` (article content) | `max-width: 800px; margin: 0 auto; height: 100%; line-height: 1.5` |
| `.ko-content-cntr` (content column, non-homepage) | `max-width: 900px; margin: 0 auto` |
| `.documentation-body` | `padding: 0 15px` |
| `.hg-site-body .documentation-article` | `padding: 10px 20px 40px 20px; min-height: calc(100vh - 60px)` |
| Right column (3-col layout) | `max-width: calc((100vw - 920px) / 2)`; at ≤1473px `calc((100vw - 720px) / 2)` — from the seeded Custom CSS |

---

## Navigation & Header

### Key Selectors

| Selector | What it styles |
|----------|---------------|
| `.navbar-default` | Top navigation bar |
| `.navbar-brand` | Logo/brand area |
| `.hg-header` | Header wrapper |
| `.hg-project-name` | Project name text in header |
| `.nav.navbar-right` | Right-aligned nav items (search, login) |
| `.hg-search-bar` | Search bar component |
| `.ko-slideout-left-toggle` | Left TOC slideout button (the "bars"/"X" toggle) |
| `.ko-slideout-right-toggle` | Right-column slideout button |

### Default Values

```css
/* Navbar */
.navbar-default {
  border-bottom: 8px solid #ccc;    /* Style Settings regenerate the color (computed from column bg + text) */
}

/* Brand area — a three-layer cascade: */
.navbar-brand { height: 53px; padding: 14px 21px; font-size: 24px; font-weight: 700; }  /* Flat UI */
.navbar-brand { padding: 17px 15px; margin-bottom: 1em; }                               /* ko-css.css */
.hg-minimalist-theme .navbar-brand { padding: 10px 15px 10px 0; height: 35px; margin-bottom: 0; }  /* net on Minimalist */

/* Nav links (Flat UI) */
.navbar-nav > li > a {
  font-size: 15px;   /* Flat UI sets 16px then 15px in a later rule */
  font-weight: 700;
}

/* Slideout toggles (Minimalist) — left = TOC "bars/X" button, right = right-column */
.hg-minimalist-theme .ko-slideout-left-toggle,
.hg-minimalist-theme .ko-slideout-right-toggle {
  float: left;
  background: none;
  border: none;
  padding-right: 15px;
  padding-top: 11px;   /* NO height and NO bottom padding → a short box pinned to the top of the bar */
  width: 50px;
}
.hg-minimalist-theme .ko-slideout-right-toggle {
  position: absolute; right: 25px; top: 12px;
}
```

Because these have no `height` and only a top offset, their icon sits high in a taller nav bar — to vertically center it, flex-center the button (see quirks doc §27, "Centering an Icon in a Nav Toggle Button").

---

## Article Content

### Key Selectors

| Selector | What it styles |
|----------|---------------|
| `.hg-article` | Article wrapper |
| `.hg-article-header` | Article header section |
| `.hg-article-title` | Article title (h1) |
| `.hg-article-body` | Article content body |
| `.hg-article-footer` | Article footer section |
| `.hg-article-controls` | Article action buttons |
| `.documentation-padding` | Content padding wrapper |

### Background Defaults

Both `.documentation-article` and `.hg-article` default to a **solid white background** in `ko-css.css`, separate from the outer wrappers (`.documentation-body`, `.ko-content-cntr`):

```css
.documentation-article { background-color: #fff; box-shadow: 5px 0 5px -2px #888; }
.hg-article            { background: #fff; }
```

A dark (or otherwise non-white) theme must override **both** of these inner panels — not just the outer wrappers — or the content column stays white. `.documentation-article` also carries a right-edge `box-shadow` that should be removed on dark. See the quirks doc, "Article Panels Default to White (Dark-Theme Trap)."

### Typography Defaults

Article typography is a three-layer cascade — Flat UI base → generated Style-Settings rules → seeded Custom CSS overrides:

| Element | Net stock value | Where it comes from |
|---------|-----------------|---------------------|
| Page text (outside articles) | `18px Lato, color #34495e, line-height 1.72` | Flat UI `body` rule |
| Article body text (`.hg-article-body, .hg-article-body p`) | `16px, weight 400`, family from Style Settings (stock Lato) | Generated from the **Body font** Style Setting |
| Headings H1–H6 | Generated: H1 = title size (stock `48px`), each level **−6px** (min 12px), weight 700, family from title font | Generated from the **Title font** Style Setting |
| H2 / H3 / H4 in articles | `28px` / `24px` / `18px` — overriding the generated sizes | Seeded Custom CSS (`.documentation-article h2/h3/h4`) |
| Heading color | H2–H6: **Header tags** Style Setting (stock `#212121`). H1: `var(--primary-color)` — the seeded Custom CSS out-specifies the generated rule | Generated rules + seeded Custom CSS |
| Links | `color: var(--text-links-color)` (default `#3C80BA`); hover/focus color is a **generated** accent-derived rule | Seeded Custom CSS + generated rules |

So net stock article headings are **H1 48px, H2 28px, H3 24px, H4 18px** — and note the oddity that H5 (24px, generated) renders *larger* than H4 (18px, seeded override).

> **`em` / specificity traps on body text:** the generated `.hg-article-body, .hg-article-body p` rule is specificity **(0,1,1)** — a bare custom class **(0,1,0)** loses to it, so scope custom body-paragraph styling as `.hg-article-body p.my-class` **(0,2,1)** (or higher). And because the body is pinned to **16px** while the article **header** (`.hg-article-header`, *not* covered by that rule) sits on the **18px** page base, the same `em` renders at different sizes in each — `0.75em` = **12px** in the body but **13.5px** in the header. A custom body line can't match a header metadata row by copying its `em` value; measure and set the px. See `knowledgeowl-css-quirks.md` §30.

### Spacing Defaults

| Element | Properties |
|---------|------------|
| Paragraphs (`.hg-article-body p`) | `margin: 20px 0` (ko-css.css) — but the seeded Custom CSS zeroes the bottom (`.documentation-article p { margin-bottom: 0 }`), so net is `20px 0 0` |
| Headings (top) | `margin-top: 30px` |
| Headings (bottom) | `margin-bottom: 10px` |
| Article panel padding | `10px 20px 40px 20px` (`.hg-site-body .documentation-article`) |
| Ordered-list items | `padding: 10px 0` (`.hg-article-body ol li`, seeded Custom CSS) |
| Paragraphs inside lists | `margin: 20px 0 0` (`.hg-article-body ul p, .hg-article-body ol p`, seeded Custom CSS) |

> **Paragraph-spacing trap:** because the seeded Custom CSS zeroes `.documentation-article p { margin-bottom: 0 }`, restoring space between paragraphs needs a `p`-level `margin-bottom` override — adding padding/margins to a container won't do it. Body-text *color* has no p/li-level default in stock KO (it inherits Flat UI's `body { color: #34495e }`), but customer KBs frequently add their own `p` / `li` color rules in Custom CSS — if a container-level `color` override "does nothing", grep the KB's Custom CSS for direct `p` / `li` rules.

---

## Table of Contents (TOC Sidebar)

### Key Selectors

| Selector | What it styles |
|----------|---------------|
| `.slideout-menu` | TOC sidebar panel (the class that actually carries the CSS) |
| `.slideout-new` | Marker class on `.hg-site-body` — **no CSS definition**; a JS hook for the newer slideout system |
| `.slideout-panel-left` | Markup class on `#ko-article-cntr` (the sliding article panel) |
| `.toc-toggle` | TOC show/hide toggle button |
| `.ko-collapse-trigger` | Category collapse/expand button |
| `.ko-collapse-article` | Collapsible article section |
| `.topic-toc-item` | Quick-link item on topic category pages (styled in seeded Custom CSS) |
| `.level-0`, `.level-1` | TOC nesting depth levels |

### TOC Defaults

```css
/* ko-css.css */
.slideout-menu {
  position: fixed; top: 55px; bottom: 0;
  width: 360px;                        /* coupled with the panel translateX — see quirks doc #5 */
  z-index: 0;
  display: none;                       /* .slideout-open shows it; Minimalist 2/3-col pins it left: 0 */
}

/* seeded Custom CSS — border, slide transition, and the coupled open-state shift */
.hg-minimalist-theme.hg-2column-layout .slideout-menu {
  border: 1px solid var(--toc-border-color);
  left: -360px;                        /* slides to left: 0 when open */
}
.hg-minimalist-theme #ko-article-cntr.slideout-panel.open {
  transform: translateX(360px);
  width: calc(100% - 360px);
}
```

### TOC Nav Tree (left sidebar / `toc-always-open`)

The always-open TOC is a category/article navigation tree. Structure (outermost → innermost):

```
#ko-documentation-categories.slideout-menu-left
  ul.documentation-outter-list
    li.category-container.level-0          ← a top-level category (or a leaf link like Home)
      div.category-link-container          ← the category ROW (hover target)
        i.cat-icon / i.home-icon           ← expand/collapse chevron, or leaf icon
        a.documentation-category           ← the category label link (KO paints its hover
                                             beige HERE — see quirks doc #24)
      ul.documentation-articles.level-1    ← the category's articles (when expanded)
        li.article-container               ← an article row; gets .active on the CURRENT article
          a.article-link                   ← the article label link
```

Key hooks for a docs-style TOC: **`.article-container.active`** is the "you-are-here" current article (set by JS from the page's object id); `.category-link-container` is the category-row hover target; `a.documentation-category` / `a.article-link` are the label links. The hover/active *background* is applied per-type (category link vs. article `<li>`) — see quirks doc #24.

---

## Search

### Key Selectors

| Selector | What it styles |
|----------|---------------|
| `.hg-search-bar` | Search bar container |
| `.hg-article-search` | Search results list |
| `.input-group` | Search input wrapper (border is here, not on input — see quirks doc #13) |
| `.input-group:focus-within` | Focus state — gets a `box-shadow: 0 0 0 2px var(--input-focus-color)` ring (seeded Custom CSS) |
| `.category-dropdown` | Category filter dropdown |
| `.category-dropdown ul` | Dropdown list |
| `.category-dropdown .sub-menu` | Nested subcategory menu |

---

## Components

### Ratings

| Selector | What it styles |
|----------|---------------|
| `.hg-ratings` | Rating widget container |
| `.hg-helpful`, `.hg-unhelpful` | Thumbs up / down (colors come from generated accent rules) |

### Comments

| Selector | What it styles |
|----------|---------------|
| `.hg-comment-list` | Comments list container |
| `.hg-comment` | Individual comment (`.hg-admin` added for agent comments) |
| `.hg-comment-post` | Comment compose area |
| `#hg-comment-form` | The comment form |

### Article Actions

| Selector | What it styles |
|----------|---------------|
| `.ko-article-actions` | Article action links (print/PDF/share etc.); link color is a generated accent rule |

### Contact Form

| Selector | What it styles |
|----------|---------------|
| `.hg-contact-us-form` | Contact form wrapper |
| `.hg-contactus-article` | Article context area |
| `.hg-contactus-button-bar` | Button area |
| `.hg-contact-form-container` | Contact form container (labels/inputs styled in seeded Custom CSS) |

### Breadcrumbs

| Selector | What it styles |
|----------|---------------|
| `.breadcrumb` | Breadcrumb navigation (Bootstrap) |

### Tags

| Selector | What it styles |
|----------|---------------|
| `.ko-tags-container` | Article tags container |
| `.ko-tag`, `.ko-tag-label` | Individual tag chip / label |

### Related Articles

| Selector | What it styles |
|----------|---------------|
| `.ko-related-articles` | Related articles list (article footer) |
| `.right-col-panel.related-panel` | Related articles panel in the right column |

### Required Reading

| Selector | What it styles |
|----------|---------------|
| `.required-reading-flag` | Required reading indicator badge |

### Glossary

| Selector | What it styles |
|----------|---------------|
| `.ko-glossary-term` | Glossary term styling (tooltip trigger) |

### Favorites

| Selector | What it styles |
|----------|---------------|
| `.ko-js-favorites` | Favorite/bookmark button |

---

## Category Pages

### Key Selectors

| Selector | What it styles |
|----------|---------------|
| `.category-list` | Category grid container |
| `.category-link-container` | Individual category card |
| `.article-container` | Article list item |
| `.article-link` | Article title link |
| `.faq-nav-wrapper` | FAQ-style category layout |

### Homepage Category Icons (`icon-cats` template)

The homepage `[template("icon-cats…")]` renders category tiles that are distinct from the FAQ-style category layout above. Default selectors and values (from `ko-css.css`):

| Selector | Default |
|----------|---------|
| `.cat-icons-cntr .category-list` (+ `.colN`) | The tile grid: `display: grid; grid-template-columns: repeat(N, 1fr); gap: 20px; grid-auto-rows: 1fr` (N from the `col=` template arg, default 4) |
| `.cat-icon-panel` | The tile (a block link). `display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; border: 1px solid #E6E6E6; border-radius: 5px` |
| `.cat-icon-panel:hover` | `transform: scale(1.01); box-shadow: 2px 4px 4px #aeaeae` (and the icon scales to 1.10) |
| `.category-icon` | Icon wrapper. `height: 100px` |
| `.category-icon i` | The icon glyph. `font-size: 75px; margin-top: 16px; padding: 5px` |
| `.category-icon i.fa-fw` | `width: 1.5em` (fixed-width icons) |
| `.cat-icon-img` | Uploaded image icon. `width: 100px; height: 100px` |
| `.category-header` | The label. `font-size: 18px; color: #1D284F; text-align: center` |

Notes: the per-category icon **color** is set in the Category editor (inline on the `<i>`), so recoloring all icons from Custom CSS needs `!important`. And `.category-icon i` carries `margin-top: 16px`, so the icon's vertical position is tied to its size — if you change the `font-size`, adjust the margin/centering to match.

**Tile structure:** each `.cat-icon-panel` is an `<a>` that is a **direct child of `.category-list`** (no wrapping `<div>`), so `.category-list > div` won't match — target `.category-list > .cat-icon-panel`. The grid always reserves N tracks (`repeat(N, 1fr)`), so when a KB has fewer categories than columns the tiles left-align and leave empty trailing tracks rather than centering — see quirks doc #26 for the flex fix.

---

## Embedded Widget

### Key Selectors

The widget's outer chrome (container, modal, backdrop) is styled by CSS the embed **JavaScript injects** into the host page (`service/views/scripts/javascript/widget*.phtml` / `widgetcss.phtml`) — it's not in any public stylesheet. The iframe internals load `widgetiframe_min_2016_12_09.css` (source: `widgetiframe.css`).

| Selector | What it styles |
|----------|---------------|
| `.helpgizmo-container` | Widget container (injected by widget JS) |
| `.hg-container-bottom_left`, `.hg-container-bottom_right`, etc. | Widget position variants (injected) |
| `.hg-widget-modal` | Widget modal overlay (injected) |
| `.hg-modal-content` | Widget modal body (injected) |
| `.hg-widget-backdrop` | Darkening overlay behind modal (injected) |
| `.hg-widget-footer-content` | Widget footer area (`widgetiframe.css`) |
| `.hg-widget-articles` | Article list inside widget (`widgetiframe.css`) |
| `#hg-widget-article-iframe` | Article iframe (min-height: 425px) |
| `#hg-widget-contact-form` | Contact form (min-height: 450px) |

---

## Bootstrap 3 Classes (Most Used in KO)

KnowledgeOwl uses Bootstrap 3.0.0. These are the most commonly encountered classes in KB markup:

### Grid

| Class Pattern | Purpose |
|---------------|---------|
| `.container` | Fixed-width centered container |
| `.col-sm-*`, `.col-md-*`, `.col-lg-*` | Responsive grid columns (12-column system) |
| `.row` | Grid row |

### Visibility

| Class | Purpose |
|-------|---------|
| `.visible-sm`, `.visible-md`, `.visible-lg` | Show at breakpoint |
| `.hidden-sm`, `.hidden-md`, `.hidden-lg` | Hide at breakpoint |
| `.sr-only` | Screen reader only (visually hidden) |
| `.hidden`, `.hide` | Hide element |

### Buttons

| Class | Purpose |
|-------|---------|
| `.btn` | Base button |
| `.btn-default` | Default (gray) button |
| `.btn-primary` | Primary action button |
| `.btn-success` | Success (green) button |
| `.btn-danger` | Danger (red) button |

### Text

| Class | Purpose |
|-------|---------|
| `.text-center`, `.text-left`, `.text-right` | Text alignment |
| `.text-muted` | Muted gray text |
| `.text-primary`, `.text-success`, `.text-warning`, `.text-danger` | Colored text |
| `.lead` | Lead paragraph (larger font) |

### Layout

| Class | Purpose |
|-------|---------|
| `.pull-left`, `.pull-right` | Float utilities |
| `.collapse`, `.in` | Collapsible sections |
| `.pager` | Pagination controls |
| `.badge`, `.label` | Badge/label styling |
| `.modal`, `.modal-content`, `.modal-body` | Modal dialogs |
| `.panel`, `.panel-heading`, `.panel-body` | Panel components |

---

## Responsive Breakpoints

Bootstrap 3 breakpoints used by KnowledgeOwl:

| Breakpoint | Media Query | Typical Use |
|------------|-------------|-------------|
| 768px | `@media (min-width: 768px)` | Tablet |
| 992px | `@media (min-width: 992px)` | Desktop |
| 1200px | `@media (min-width: 1200px)` | Large desktop |

KnowledgeOwl adds custom breakpoints, mostly in the seeded Custom CSS (see quirks doc #9):

| Breakpoint | Media Query | What it does |
|------------|-------------|--------------|
| 576px | `@media (min-width: 576px)` | Homepage category list goes 2-up (then 4-up at ≥992px) |
| 991px | `@media (max-width: 991px)` | Open TOC panel stops shrinking the article (`width: 100%`) |
| 1400px | `@media (min-width: 1400px)` | Minor wide-screen tweaks in `ko-css.css` |
| 1473px | `@media (max-width: 1473px)` | 3-column layout squeeze: content max-width 700px, right column widens |

---

## Font Resources

### System Fonts Available

Arial, Courier New, Georgia, Tahoma, Times New Roman, Trebuchet MS, Verdana

### Google Fonts Available

Roboto, Open Sans, Noto Sans JP, Montserrat, Lato, Poppins, Source Sans Pro, Roboto Condensed, Oswald, Raleway, Inter, Roboto Slab, Merriweather, Neuton, and others

### Custom Web Font

KnowledgeOwl uses the Geomanist font family (Book, Medium, Regular weights) for its own UI. This may appear in some KB elements.

---

## Icon Library

KnowledgeOwl uses **Font Awesome Pro 6.5.1** (with v4 shims so legacy Font Awesome 4.7.0 class names still work). Icon classes follow the standard Font Awesome patterns:

```css
.fa-solid, .fa-regular, .fa-light, .fa-brands  /* FA6 style prefixes */
.fa                                              /* FA4 legacy prefix */
```

---

## Theme Builder Color Mapping

Style Settings do **not** set CSS variables. `KbRenderer::css()` generates plain selector-level rules from hardcoded selector maps and injects them into the page's `<style>` block, *before* the Custom CSS. Internal setting keys and what they paint (on a Minimalist / theme-locked KB):

| Style Setting (internal key) | Generated rules |
|------------------------------|-----------------|
| Top nav bar background (`header`) | `.hg-site .hg-header { background-color }` |
| Top nav text (`headerText`) | `color` on `.hg-site > .navbar`, `.navbar-nav > li > a.hg-header-link`, `.toc-toggle`; also button *text* color (`.btn-primary`, `.btn-success`, `.btn-danger`) |
| TOC / column background (`content`) | `.hg-minimalist-theme.hg-2column-layout .slideout-menu { background-color }` — plus **computed** derivatives: TOC hover/active background = this color darkened by 10/255 per channel (stock `#F8F4F1` → `#EEEAE7`, see quirks doc #24), and border colors = a blend of this with `bodyText` (`.navbar-default { border-bottom-color }`, TOC item borders) |
| TOC / column text (`bodyText`) | `.hg-site:not(.hg-modern-theme) .documentation-categories li a { color }` |
| H1s–H6s / Header tags (`headers`) | `color` on `.documentation-article h1…h7` (H1 is re-overridden by the seeded Custom CSS to `var(--primary-color)`) |
| Highlights & accents (`accent`) | Link `:hover`/`:focus` color (`.hg-minimalist-theme a:not(.btn):hover`), focused input border, `.btn-danger` background, ratings thumbs, category-icon defaults, `.ko-article-actions a` — plus computed shades for button hover states. A darker shade is also generated for base `a:not(.btn)` color, but the seeded Custom CSS `var(--text-links-color)` rule wins the cascade |
| Category icon color / background (`categoryIcon` / `categoryIconBackground`) | Homepage icon-cats tile icon colors |
| Body font (`font.body`) | `.hg-article-body, .hg-article-body p { font-family; font-size; font-weight }` |
| Title font (`font.title`) | `.documentation-article h1…h7` — H1 gets the set size, each level −6px (min 12px); family also applied to `body` and `.hg-project-name` |

Because these are generated *before* Custom CSS in the same `<style>` block, Custom CSS wins ties — but the generated selectors are often more specific than a naive override (e.g. heading rules pair `.documentation-article h2` with `.cke_editable h2`).

---

## Minimalist Theme — Style Settings Defaults

Default hex values for a stock (uncustomized) **Minimalist** theme KB, from Customize > Style > Style Settings > Colors. Use these as the baseline for new projects and when reverting a KB to its original theme. KnowledgeOwl shows two labels per swatch depending on the KB ("common / variant"); both are listed.

| Style Setting (common / variant) | Default |
|----------------------------------|---------|
| Top navigation bar / Header background | `#ffffff` |
| Top navigation text / Header text | `#1d284f` |
| H1s, H2s, H3s, etc. / Header tags | `#212121` |
| Table of contents / Column background | `#f8f4f1` |
| Table of contents text / Column text | `#1d284f` |
| Highlights & Accents / Highlights & accents | `#f8b88b` |
| Default category icon colors — Icon color | `#69b2f0` |
| Default category icon colors — Icon background | `#ffffff` |

*Verified against an uncustomized Minimalist trial KB (2026-06) **and** against the code defaults in `Model_Theme::defaultTheme()` (`service/models/Theme.php`), which match exactly (internal keys: `header`, `headerText`, `headers`, `content`, `bodyText`, `accent`, `categoryIcon`, `categoryIconBackground`; there's also `window: #757575`, the backdrop color, not exposed as a Minimalist swatch). Classic and Modern themes have different defaults. A per-project record of the customer's actual values lives in each project's `style-settings-colors.md`.*

---

## Source File Map

Source files in the KnowledgeOwl codebase that generate the styles described above. Compiled bundles are defined in `build-assets.mjs`; `KbRenderer::styleSheets()` decides what a page loads.

**Loaded on current (Minimalist) KBs** — the `ko` bundle, in concatenation order:

| File | Lines | Purpose |
|------|-------|---------|
| `public/flatui/dist/css/vendor/bootstrap.min.css` | (min) | Bootstrap 3.0.0 — grid, components, normalize |
| `public/flatui/dist/css/flat-ui.min.css` | (min) | Flat UI skin — base body/heading typography |
| `public/css/public/ko-css.css` | 2,682 | All KO public-KB structure incl. `.hg-*-theme` rules, icon-cats, TOC, widget page styles |
| `public/css/github.css` | — | Code-block syntax highlighting |

**Seeded into each new Minimalist KB's Custom CSS** (then owned/edited per-KB):

| File | Lines | Purpose |
|------|-------|---------|
| `service/views/scripts/themer-templates/custom-css.css` | 900 | Default Custom CSS template — `:root` variables, article heading sizes, alert styles, TOC borders/transition, search-bar borders, `.toc-anchor`, `.pdf-header`, custom breakpoints |

**Legacy bundles** (older custom-HTML themes and their PDFs — *not* loaded on Minimalist KBs):

| File | Lines | Purpose |
|------|-------|---------|
| `public/css/public/publicview.css` | 7,468 | `public` bundle: layout + embedded Bootstrap/Flat UI derivatives |
| `public/css/public/standard.css` | 906 | `public` bundle: colors and typography |
| `public/css/public/publicview_modern.css` | 7,416 | `publicModern` bundle: layout |
| `public/css/public/standard_modern.css` | 876 | `publicModern` bundle: colors and typography |
| `public/css/public/article.css` | 104 | Both legacy bundles: article styles |
| `public/css/public/contact-us.css` / `contact-us-modern.css` | 14 / 15 | Legacy bundles: contact form |

**Other:**

| File | Lines | Purpose |
|------|-------|---------|
| `public/css/pdf.css` | 27 | Appended when rendering PDFs |
| `public/css/public/widgetiframe.css` | 107 | Embedded widget iframe internals (served as `widgetiframe_min_2016_12_09.css`) |
| `public/css/reset.css` | 8 | CSS reset — **admin/app pages only**, not public KBs |

Key PHP/template files:

| Directory/File | Purpose |
|----------------|---------|
| `service/services/KbRenderer.php` | Merge-code rendering; `css()` generates the dynamic Style-Settings rules (selector maps at the top of the class); `styleSheets()` picks bundles |
| `service/models/Theme.php` | Theme model — default colors/fonts (`defaultTheme()`), font lists, theme name enum |
| `service/views/scripts/themer-templates/` | Layout templates (1-col, 2-col, 3-col), site wrapper, nav header, default Custom CSS |
| `service/views/scripts/help/partials/` | Component partials (searchbar, TOC, breadcrumbs, ratings, comments, etc.) |
| `service/views/scripts/help/` | Page templates (article, category, icon-category, search, contact, login, etc.) |
| `service/views/scripts/javascript/` | Embed widget JS + injected widget CSS (`widget*.phtml`, `widgetcss.phtml`) |
