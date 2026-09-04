# KnowledgeOwl CSS Defaults Reference

Lookup reference for default selectors, property values, and CSS architecture in KnowledgeOwl knowledge bases. Use this when writing custom CSS overrides — it tells you what you're overriding without needing to reverse-engineer from DevTools.

**Companion file:** `knowledgeowl-css-quirks.md` covers platform-specific gotchas (e.g., `!important` usage, TOC coupling, theme builder overwrite risks). This file covers default values and structure.

---

## Index

**Start here if you're new to the cascade:**
[CSS Architecture](#css-architecture-how-styles-layer) — the load order (platform bundle → generated Style-Settings → seeded Custom CSS) that explains *why* an override wins or loses ·
[CSS Custom Properties](#css-custom-properties) — the `:root` tokens and which are seeded vs generated

**Per-area defaults** — selectors and stock values you'd be overriding:
[Layout & Containers](#layout-structure--container-classes) (body classes, page structure, width defaults) ·
[Navigation & Header](#navigation--header) ·
[Article Content](#article-content) (**typography, background and spacing defaults — incl. the paragraph/list-spacing compounding trap**) ·
[Table of Contents](#table-of-contents-toc-sidebar) (incl. the nav-tree / `toc-always-open` variant) ·
[Search](#search) ·
[Components](#components) (ratings, comments, article actions, contact form, breadcrumbs, tags, related, required reading, glossary, favorites) ·
[Category Pages](#category-pages) (**incl. homepage `icon-cats` tiles**) ·
[Embedded Widget](#embedded-widget)

**Lookups:**
[Bootstrap 3 Classes](#bootstrap-3-classes-most-used-in-ko) ·
[Responsive Breakpoints](#responsive-breakpoints) ·
[Font Resources](#font-resources) (**KO self-hosts and ships only 300/400/700 — 500 and 600 silently render as 700**) ·
[Icon Library](#icon-library) ·
[Theme Builder Color Mapping](#theme-builder-color-mapping) (which selectors each Style Setting generates — needed to simulate the block locally) ·
[Minimalist Style-Settings Defaults](#minimalist-theme--style-settings-defaults) (the 8 stock swatch values) ·
[Source File Map](#source-file-map)

**Colour math** (contrast + perceptual delta) lives in `../../process-docs/01-KB_CUSTOMIZATION_PROJECT_SETUP.md` §4, not here.

---

## CSS Architecture: How Styles Layer

A current (Minimalist-theme) KB loads its styles from three sources, in this order (later overrides earlier on equal specificity):

1. **Font Awesome bundle** (`koFontawesome`) — Font Awesome Pro 6.5.1: `all.css` plus the Thin and Sharp (light/regular/solid/thin) style sheets, plus `v4-shims.css` so legacy `fa` class names still resolve
2. **The `ko` CSS bundle** — one compiled file (`/min/css/ko-*.css`) concatenating, in order (per `build-assets.mjs`):
   1. **Bootstrap 3.2.0** (`flatui/dist/css/vendor/bootstrap.min.css`, the copy shipped inside Flat UI; includes normalize.css 3.0.1) — grid, buttons, forms, tables, nav, modals. The separate `public/bootstrap-3.0.0/` folder in the repo supplies only JavaScript, not CSS.
   2. **Flat UI Free 2.2.2** (`flatui/dist/css/flat-ui.min.css`) — flat design skin over Bootstrap (base body/heading typography)
   3. **`ko-css.css`** — all of KO's own public-KB layout and theme structure, including every `.hg-minimalist-theme` rule
   4. **`github.css`** — code-block syntax highlighting (the Rainbow.js "GitHub theme"; rules are scoped `.rainbow …`)
3. **One inline `<style>` block** (from `KbRenderer::css()`), containing in order:
   1. **Dynamic theme styles** — selector-level rules generated per-KB from Style Settings (see "Theme Builder Color Mapping" below). These are plain generated rules like `.hg-site .hg-header{background-color:#FFFFFF}` — they do **not** set CSS variables.
   2. **Custom CSS** — the KB's Customize > Style (HTML & CSS) > Custom CSS, appended after the generated rules. New Minimalist KBs are **seeded** with KO's default Custom CSS template (`service/views/scripts/themer-templates/custom-css.css`, 900 lines) — that template is where the `:root` custom properties and many of the "defaults" below actually live.

Custom CSS loads last, so it wins on equal specificity. Some rules in the bundles use `!important` (see quirks doc #1), so you'll sometimes need `!important` or high specificity to override.

`KbRenderer::styleSheets()` emits the same two bundles for every theme name; there is no per-theme bundle. Two theme **options** change what loads: "bare minimum mode" (`bare_mode`) drops the `ko` bundle and loads only Font Awesome plus Bootstrap, and also suppresses the generated Style-Settings rules; "barer minimum mode" (`barer_mode`) loads Font Awesome alone. Both are advanced-user toggles on the theme's Options pane and are off on every normal KB.

**Other contexts reuse the same pieces.** The article editor iframe loads the `koFroalaEditor` bundle (the `ko` bundle plus `public/css/app/article-content-editor.css`) and a compiled copy of the inline block (see quirks doc §28). PDFs load Bootstrap + Flat UI + `ko-css.css` + `pdf.css` as raw text, then the inline block (quirks doc §14).

**Legacy note:** `publicview.css` / `standard.css` (and the `_modern` variants) are compiled into separate `public` / `publicModern` bundles used only by **older custom-HTML themes** (`_bootheader.phtml`, and `ResourceLoader::loadRawPdfCss()` for those projects' PDFs) — they are *not* loaded on Minimalist KBs. `reset.css` is only used on KO's admin/app pages, not on public KBs.

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
| `.toc-always-open` | TOC pinned open. Only theme-locked (Minimalist) KBs get it (`KbRenderer::tocBehavior()`): TOC behavior `open` adds it on every page; `open-inside` (the default for new KBs) adds it on every page **except the homepage**; anything else never adds it. Its layout rules in `ko-css.css` sit inside `@media (min-width: 992px)`, so below 992px the class is present but inert. |
| `.is-author` | Viewer is a logged-in author on the live site (`KbRenderer::isEditor()`; never set in the themer or in the widget iframe). Its `ko-css.css` offsets (`top: 32px !important` on the header/TOC, article `margin-top`) are wrapped in `@media (min-width: 992px)`. |
| `.hg-pdf` | PDF export wrapper `<div>` (inside `<body class="hg-site hg-minimalist-theme">`, not on `<body>` itself; quirks doc §14) |
| `.hg-iframe` | KB rendered inside an iframe (`.hg-site.hg-iframe { background: #fff; overflow-x: hidden; padding-left: 20px }`) |

The theme class is generated as `hg-{theme_name}-theme`; `theme_name` is one of `classic`, `modern`, `minimalist`, `clayton` (`service/models/Theme.php`). The layout class is `hg-{layout}-layout` from the theme's `layout` (`KbRenderer::layoutName()`, falling back to `hg-3column-layout` when unset). The full body attribute is assembled in `site-wrapper.phtml` as `hg-site [theme] [is-editor] [page-name] [layout-name] [toc-behavior]`, so every one of these classes lives on the **same `<body>` element** (see quirks doc §15 for the compound-selector consequence).

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
| `.hg-article` (article content) | `max-width: 800px; margin: 0 auto; height: 100%; line-height: 1.5; border: none`. On a **1-column homepage** `.hg-1column-layout.hg-home-page .hg-article` widens to `max-width: 1100px`. |
| `.ko-content-cntr` (content column, non-homepage) | `.hg-minimalist-theme:not(.hg-home-page) .ko-content-cntr { max-width: 900px; margin: 0 auto }` (no width cap on the homepage) |
| `.documentation-body` | `padding: 0 15px`; Minimalist adds `min-height: 100%` |
| `.hg-site-body` | `margin-top: 100px; position: relative` (room for the fixed header) |
| `.hg-site-body .documentation-article` | Base: `padding: 10px 20px 40px 20px; min-height: calc(100vh - 60px)`. **Minimalist overrides both**: `.hg-minimalist-theme .hg-site-body .documentation-article { padding: 1em 20px; min-height: calc(100vh - 110px); box-shadow: none }` (`calc(100vh - 160px)` when the body also carries `.hg-editor-bar`). At ≤991px, non-homepage pages drop to `padding: 1em`. |
| `.hg-header` (Minimalist) | `min-height: 55px` (the top bar's stock height; the TOC panel's `top: 55px` is tuned to it) |
| Right column (3-col layout) | `ko-css.css`: `.hg-minimalist-theme.hg-3column-layout .right-column { position: fixed; top: 55px; bottom: 0; right: 0 }` (`top: 105px` for `.is-author`). Seeded Custom CSS: `top: 65px; padding-right: 35px; z-index: 2; max-width: calc((100vw - 920px) / 2)`; at ≤1473px `calc((100vw - 720px) / 2)` while `.ko-content-cntr` narrows to 700px |

---

## Navigation & Header

### Key Selectors

| Selector | What it styles |
|----------|---------------|
| `.navbar-default` | Top navigation bar |
| `.navbar-brand` | Logo/brand area |
| `.hg-header` | Header wrapper |
| `.hg-project-name` | Project name text in header — **`display: none` in the Minimalist theme** (`ko-css.css:1876`); see quirks doc #44 |
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

/* Nav links: Flat UI base, then the Minimalist override in ko-css.css */
.navbar-nav > li > a { padding: 15px 21px; font-size: 16px; font-weight: 700; line-height: 23px; }  /* Flat UI */
.hg-minimalist-theme .navbar-nav > li > a { line-height: 25px; font-weight: 400; }                  /* ko-css.css: net Minimalist weight is REGULAR, not bold */

/* Slideout toggles (Minimalist) — left = TOC "bars/X" button, right = right-column */
.hg-minimalist-theme .ko-slideout-left-toggle,
.hg-minimalist-theme .ko-slideout-right-toggle {
  float: left;
  background: none;
  border: none;
  padding-right: 15px;
  padding-top: 11px;   /* NO height and NO bottom padding → a short box pinned to the top of the bar */
  z-index: 2;
  width: 50px;
}
.hg-minimalist-theme .ko-slideout-right-toggle {
  position: absolute; padding: 0; right: 25px; top: 12px;   /* right: 15px at ≤767px */
}
```

On `.toc-always-open` pages at ≥992px the left toggle is `display: none` (the TOC is pinned, so there is nothing to toggle).

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
.hg-minimalist-theme .hg-site-body .documentation-article { box-shadow: none; }   /* Minimalist already removes the shadow */
```

The outer wrappers are painted too, from two layers: `ko-css.css` gives `.hg-site { background: #eee }`, and the seeded Custom CSS then sets `.hg-site { background: var(--white) }` and `.hg-minimalist-theme .documentation-body { background: var(--white) }`.

A dark (or otherwise non-white) theme must override **both** inner panels as well as the two wrappers, or the content column stays white. The `.documentation-article` box-shadow is already `none` on Minimalist, so re-zeroing it is harmless insurance rather than a requirement. See the quirks doc, "Article Panels Default to White (Dark-Theme Trap)."

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
| Paragraphs (`.hg-article-body p`) | `margin: 20px 0; line-height: 1.5` (ko-css.css) — but the seeded Custom CSS zeroes the bottom (`.documentation-article p { margin-bottom: 0 }`), so net is `20px 0 0` |
| Headings H1–H4 in the body | `margin-top: 30px; margin-bottom: 10px` (`.hg-article-body h1`, `h2:not(.hg-article-title)`, `h3`, `h4` in ko-css.css) |
| Headings H5–H6 in the body | Not touched by ko-css.css, so Flat UI's `h4, h5, h6 { margin-top: 15px; margin-bottom: 15px }` applies |
| Article body line-height | `.hg-article-body { line-height: 31px }` base, overridden to `1.5` on Minimalist |
| Article header | `.hg-article-header { margin-top: 15px; margin-bottom: 28px }`; `.hg-article-title { margin-top: 15px; margin-bottom: 2px }`; `.hg-article-footer { margin: 3em 0 }` |
| Article panel padding | Base `10px 20px 40px 20px`, but Minimalist nets to **`1em 20px`** (`.hg-minimalist-theme .hg-site-body .documentation-article`); `1em` all round at ≤991px |
| Ordered-list items | `padding: 10px 0` (`.hg-article-body ol li`, seeded Custom CSS) |
| Paragraphs inside lists | `margin: 20px 0 0` (`.hg-article-body ul p, .hg-article-body ol p`, seeded Custom CSS) |

> **Paragraph-spacing trap — MEASURE the computed margins before adding any:** the seeded Custom CSS zeroes only the *bottom* (`.documentation-article p { margin-bottom: 0 }`), so `ko-css`'s `margin: 20px 0` survives as `20px 0 0`. That surviving **top** margin is usually already providing the gap between paragraphs. Adding a `p`-level `margin-bottom` on top of it therefore *compounds* rather than restores — e.g. a 16px bottom margin puts paragraphs 36px apart. Container-level padding still won't do it, but the first move is to read the computed value, not to add one.
>
> **The two spacing defaults COMPOUND inside list items.** `ol li` padding (`10px 0`, seeded) stacks with the paragraph top margin above, and the result is far larger than either number suggests: a **single-line numbered step measured 83px tall** on a stock-spacing KB. Tune `ol > li` padding and the `ol p` margin **together**, and use the height of a one-line list item as the thing you measure. On procedural KBs — where articles are almost entirely numbered steps — getting this right took **21% off the height** of a typical article.
>
> Body-text *color* has no p/li-level default in stock KO (it inherits Flat UI's `body { color: #34495e }`), but customer KBs frequently add their own `p` / `li` color rules in Custom CSS — if a container-level `color` override "does nothing", grep the KB's Custom CSS for direct `p` / `li` rules.

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

Two markup facts worth knowing (`help/partials/toc.phtml`, `help/tableofcontents.phtml`): the panel is server-rendered with class `hide` on Minimalist and the slideout JS removes it (adding `slideout-menu slideout-menu-left`), so a no-JS snapshot shows a hidden TOC; and collapsed branches are rendered with `style="display:none"` on the `ul.documentation-articles.level-N`, not omitted (quirks doc §40). Each article `<li>` also carries `data-type="article" data-id="…"` plus one `data-{field}` per API-populated `meta_data` field (quirks doc §36).

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
| `ul.hg-breadcrumbs` | KO's breadcrumb trail (`help/partials/breadcrumb.phtml`). KO does **not** use Bootstrap's `.breadcrumb` class on reader pages. Separator items are real `<li><i class="fa fa-angle-double-right"></i></li>` elements and the current page is never included — see quirks doc §43 |

### Tags

| Selector | What it styles |
|----------|---------------|
| `.ko-tags-container` | Article tags container |
| `.ko-tag`, `.ko-tag-label` | Individual tag chip / label. Stock chip: `a.ko-tag { color: #555; border: 1px solid #fff; border-radius: 15px }` (ko-css.css) |
| `.badge-new`, `.badge-updated` | Article-list badges: `#478F31` / `#2380AC` backgrounds at **`opacity: .5`** (ko-css.css), which is why they look washed out on dark themes (quirks doc §39) |

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
| `.cat-icons-cntr .category-list` (+ `.colN`) | The tile grid: `display: grid; grid-template-columns: repeat(N, 1fr); gap: 20px; grid-auto-rows: 1fr` (N from the `col=` template arg, 1–6, default 4). The same rules are duplicated for `.hg-minimalist-theme .faq-nav-content .cat-icons-cntr .category-list`, so category landing pages with Icon-panel subcategories share them (quirks doc §41). `.cat-icons-cntr` itself has `margin-bottom: 48px`. |
| Responsive grid | At **≤991px** `.col5` / `.col6` switch to `repeat(auto-fit, minmax(190px, 1fr))`; at **≤767px** every column count does. These `ko-css.css` rules are the *only* responsive behavior the stock tiles have (the seeded Custom CSS's 576px / 992px "category list" rules never match; see Responsive Breakpoints below). |
| `.cat-icon-panel` | The tile (a block link). `display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; border: 1px solid #E6E6E6; border-radius: 5px; cursor: pointer; transition: all .2s ease-in-out` |
| `.cat-icon-panel:hover` | `transform: scale(1.01) translateZ(0); box-shadow: 2px 4px 4px #aeaeae` (and the icon scales to 1.10) |
| `.category-icon` | Icon wrapper. `height: 100px` |
| `.category-icon i` | The icon glyph. `font-size: 75px; margin-top: 16px; padding: 5px`. Stock icons are `fa-duotone fa-fw` |
| `.category-icon i.fa-fw` | `width: 1.5em` (fixed-width icons) |
| `.cat-icon-img` | Uploaded image icon. `width: 100px; height: 100px` |
| `.category-header` | The label. `font-size: 18px; color: #1D284F; text-align: center` |

Notes: the per-category icon **color** is set in the Category editor and rendered **inline** on the `<i>` (`help/icon-category.phtml`), so recoloring all icons from Custom CSS needs `!important`. The two "Default category icon colors" Style Settings (`categoryIcon`, `categoryIconBackground`) are not CSS at all: they are the defaults the category editor and the template fall back to (`KbController` passes `#69B2F0` / `#ffffff` when the theme has none), so changing them does not repaint categories that already have their own color.

> **Check the per-category icon colors during setup — they're frequently an off-brand rainbow.** KO's category color picker offers its own stock swatches, and KBs that never curated them end up with icons in KO's alert-border palette (`#69B2F0` blue, `#E6ADA9` red, `#BDDCBC` green, `#FBD9A4` amber). Because the value is **inline**, no amount of theme CSS fixes it without `!important`. Make it an explicit decision rather than a surprise: a blanket `!important` normalize gives a cohesive theme out of the box, while leaving them per-category keeps the customer in control of each one. Pick one and say which in the CHANGES file.

> **If you resize `.category-icon i`, zero its box too.** The default carries `margin-top: 16px` + `padding: 5px`, sized for the 75px homepage glyph. Drop it into a smaller custom container (say a 54px tile) and override only `font-size`, and that stock top margin pushes the glyph ~16px low — `place-items: center` on the parent **can't** fix it, because it centers the margin-box. Set `margin: 0; padding: 0; line-height: 1` on the `<i>` as well.

**Tile structure:** each `.cat-icon-panel` is an `<a>` that is a **direct child of `.category-list`** (no wrapping `<div>`), so `.category-list > div` won't match — target `.category-list > .cat-icon-panel`. The grid always reserves N tracks (`repeat(N, 1fr)`), so when a KB has fewer categories than columns the tiles left-align and leave empty trailing tracks rather than centering — see quirks doc #26 for the flex fix.

---

## Embedded Widget

### Key Selectors

The **legacy** widget's outer chrome (container, modal, backdrop) is styled by CSS the embed **JavaScript injects** into the host page (`service/views/scripts/javascript/widget*.phtml` / `widgetcss.phtml`) — it's not in any public stylesheet. The iframe internals load `widgetiframe_min_2016_12_09.css` (source: `widgetiframe.css`).

**Widget 2.0 is a separate app.** The current contextual-help widget (`public/widget-app/`, the `widget` CSS bundle built from `widget-app/assets/css/style.css`, Nunito Sans at 14px) renders in its own iframe and has its own Custom CSS field (`widget_settings.new_widget.custom_css`, served by `WidgetController::cssAction()` at `/widget/css`). The KB's Custom CSS and Style Settings do **not** reach it; style it from the widget's own settings.

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

KnowledgeOwl uses Bootstrap 3.2.0 (the build bundled with Flat UI Free 2.2.2). These are the most commonly encountered classes in KB markup:

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

KnowledgeOwl adds its own queries in `ko-css.css` and the seeded Custom CSS (see quirks doc #9):

| Breakpoint | Media Query | What it does |
|------------|-------------|--------------|
| 576px | `@media (min-width: 576px)` | Seeded Custom CSS: `.hg-minimalist-theme .hg-home-page .category-list > div { width: 50% }` (25% at ≥992px). **These rules are dead**: the theme class and `.hg-home-page` sit on the same `<body>`, so the descendant selector never matches (quirks doc §15). Stock homepage tiles get their responsive behavior from `ko-css.css` instead (next two rows). |
| 767px | `@media (max-width: 767px)` | `ko-css.css`: every `icon-cats` column count collapses to `repeat(auto-fit, minmax(190px, 1fr))`; Minimalist nav items stack; right toggle moves to `right: 15px` |
| 991px | `@media (max-width: 991px)` | Seeded: open TOC panel stops shrinking the article (`width: 100%`). `ko-css.css`: `.toc-toggle` shows, `col5`/`col6` tile grids go auto-fit, non-home article panel padding drops to `1em` |
| 992px | `@media (min-width: 992px)` | `ko-css.css`: the `.is-author` header/TOC offsets and **all** `.toc-always-open` layout rules (pinned TOC at `z-index: 1031`, header/article/footer shifted by 360px) live only here |
| 1400px | `@media (min-width: 1400px)` | Minor wide-screen tweaks in `ko-css.css` |
| 1473px | `@media (max-width: 1473px)` | Seeded: 3-column layout squeeze, content max-width 700px, right column widens |

---

## Font Resources

### System Fonts Available

Arial, Courier New, Georgia, Tahoma, Times New Roman, Trebuchet MS, Verdana

### Google Fonts Available

All 27, in the order Style Settings lists them (`Model_Theme::$googleFonts`): Roboto, Open Sans, Noto Sans JP, Montserrat, Lato, Poppins, Source Sans Pro, Roboto Condensed, Oswald, Roboto Mono, Inter, Raleway, Roboto Slab, Merriweather, Inconsolata, Lobster, Pacifico, Amatic SC, Great Vibes, Rokkitt, Special Elite, Quattrocento, Poiret One, Patrick Hand, Neuton, Holtwood One SC, Cutive.

Style Settings also accepts a **custom font URL** per role (`font.title.custom_url` / `font.body.custom_url` with a `custom_name`); when set, KO emits that `<link>` instead of its own stylesheet for that role.

**KO self-hosts these families, and ships only THREE weights — 300 / 400 / 700.** When a family is picked in Style Settings, KO puts its own stylesheet in the page `<head>` (`KbRenderer::font()`), served from `https://d1whm9yla4elqy.cloudfront.net/<slug>/<slug>.css`, where `<slug>` is the lowercase hyphenated key (`open-sans/open-sans.css`, `roboto-slab/roboto-slab.css`). When title and body use the same family only one link is emitted. One `curl` of that URL lists exactly what's available for that family — typically 300, 400, 700 plus italics, **not** a full variable-font range.

Two consequences for any theme:

- **`font-weight: 500` and `600` silently render at 700.** The browser snaps to the nearest available weight, so a "medium" nav link or sub-heading comes out as bold and becomes indistinguishable from the genuinely-bold elements — flattening the hierarchy the theme was trying to build. **Pick the theme's weight ramp from what's actually served** (300/400/700 gives you light / regular / bold), and check the family's CSS before designing around an intermediate weight.
- **Don't add a Google Fonts `<link>` in Custom `<head>` for a family already set in Style Settings.** KO is already loading it; a second load of the same family is pure waste and risks a FOUT mismatch between the two copies.

### Geomanist is NOT on public KBs

KnowledgeOwl's Geomanist web font is referenced only by the admin app's signup stylesheets (`public/css/app/signup/*.css`). No public-KB bundle, the seeded Custom CSS, or the reader templates load it, so don't expect it to be available in a KB theme without adding your own `@font-face`.

---

## Icon Library

KnowledgeOwl uses **Font Awesome Pro 6.5.1**. The `koFontawesome` bundle concatenates `all.css` (solid, regular, light, duotone, brands), the **Thin** and **Sharp** (light / regular / solid / thin) style sheets, and `v4-shims.css` so legacy Font Awesome 4.7.0 class names still work. Icon classes follow the standard Font Awesome patterns:

```css
.fa-solid, .fa-regular, .fa-light, .fa-thin, .fa-duotone, .fa-brands  /* FA6 style prefixes */
.fa-sharp.fa-solid, .fa-sharp.fa-regular, .fa-sharp.fa-light, .fa-sharp.fa-thin   /* Sharp family */
.fa                                              /* FA4 legacy prefix */
```

Stock homepage category icons and the TOC chevrons use `fa-duotone` / `fa` respectively. The same bundle is linked into the editor iframe and PDF `<head>` via `KbRenderer::font($linkOnly, $includeFontAwesome = true)`.

---

## Theme Builder Color Mapping

Style Settings do **not** set CSS variables. `KbRenderer::css()` generates plain selector-level rules from hardcoded selector maps and injects them into the page's `<style>` block, *before* the Custom CSS. Internal setting keys and what they paint (on a Minimalist / theme-locked KB):

| Style Setting (internal key) | Generated rules |
|------------------------------|-----------------|
| Top nav bar background (`header`) | `.hg-site .hg-header { background-color }` and `.hg-widget-page .pager { background-color }` (the article-list pager) |
| Top nav text (`headerText`) | `color` on `.hg-site > .navbar`, `.navbar-default .navbar-nav > li > a.hg-header-link`, `.toc-toggle`, `.navbar-default .navbar-toggle:before` (+ its hover/focus); also button *text* color (`.btn-primary`, `.btn-success`, `.btn-danger` and their `:hover`) |
| TOC / column background (`content`) | `.hg-minimalist-theme.hg-2column-layout .slideout-menu { background-color }`, **2-column only**; a 3-column Minimalist KB gets no generated TOC background from this swatch. Plus **computed** derivatives: (a) a generic hover set for every theme, `content` **lightened** by 20/255 per channel on `.article-container:hover`, `.category-link-container:hover`, `.documentation-categories li a:hover`, `.category-link-container.active`, `li.active`; (b) on theme-locked Minimalist KBs a second, more specific set (`$minimalistTocClasses`, twelve `.hg-minimalist-theme …` selectors) at `content` **darkened** by 10/255 per channel (stock `#F8F4F1` → `#EEEAE7`, quirks doc #24), which is the one you actually see; (c) border colors = the midpoint blend of this with `bodyText` (`Service_ColorServer::shifttowards`, 0.5) on `.navbar-default { border-bottom-color }`, `.documentation-outter-list > .article-container`, `.level-0` |
| TOC / column text (`bodyText`) | `.hg-site:not(.hg-modern-theme) .documentation-categories li a { color }` |
| H1s–H6s / Header tags (`headers`) | `color` on `.documentation-article h1…h7, .cke_editable h1…h7` (H1 is re-overridden by the seeded Custom CSS to `var(--primary-color)` on the live site; in the editor iframe, where `.hg-minimalist-theme` is absent, this swatch is what H1 shows) |
| Highlights & accents (`accent`) | `color` on the **TOC expand icons** `.cat-icon`, `.home-icon`, `.alt-icon` and on `.form-group.focus .form-control`; link `:hover`/`:focus` color (`.hg-minimalist-theme a:not(.btn):hover / :focus`), `.form-control:focus` border, `.btn-danger` background, `.hg-ratings .hg-helpful` color, `.faq-cat-container:hover a`, `.faq-cat-panel:hover` border, `.ko-article-actions a`. Derived shades: `headerAccent` (accent clamped, no-white) paints `.btn-primary` / `.btn-success` backgrounds and `.hg-ratings .hg-unhelpful`; `btnp_hover` / `btnd_hover` (accent +20) paint button hover/focus/active states, `.ko-article-actions a:hover`, `.pager li > a:hover`; `darkAccent` (accent −40) is generated for base `.hg-minimalist-theme a:not(.btn)` color, but the seeded Custom CSS `var(--text-links-color)` rule wins the cascade |
| Category icon color / background (`categoryIcon` / `categoryIconBackground`) | **Not emitted as CSS.** They are the defaults the category editor and `help/icon-category.phtml` fall back to; the chosen color lands inline on each tile's `<i>` (see Category Pages) |
| Body font (`font.body`) | `.hg-article-body, .hg-article-body p, .cke_editable, .cke_editable p { font-family; font-size; font-weight }` |
| Title font (`font.title`) | `.documentation-article h1…h7, .cke_editable h1…h7` — H1 gets the set size, each level −6px while the result stays ≥12px (otherwise the size stops shrinking); family also applied to `body` and `.hg-site .hg-project-name` |

Because these are generated *before* Custom CSS in the same `<style>` block, Custom CSS wins ties — but the generated selectors are often more specific than a naive override (e.g. heading rules pair `.documentation-article h2` with `.cke_editable h2`). The whole block is skipped when the theme's `bare_mode` option is on. The maps live at the top of `KbRenderer.php` (`$minimalistColorMap`, `$minimalistTocClasses`, `$textMap`, `$borderMap`, `$effectMap`, `$fontMap`, `$fontFamilyMap`); non-locked legacy themes use `$colorMap` instead, which paints `content` onto `.documentation-body` and the Classic TOC.

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

*Verified against an uncustomized Minimalist trial KB (2026-06) **and** against the code defaults in `Model_Theme::defaultTheme()` (`service/models/Theme.php`, re-checked 2026-09-04), which match exactly (internal keys: `header`, `headerText`, `headers`, `content`, `bodyText`, `accent`, `categoryIcon`, `categoryIconBackground`; there's also `window: #757575`, the backdrop color, not exposed as a Minimalist swatch). The same method seeds the fonts (**body Lato 16px / 400, title Lato 48px / 700**), `layout: 2column`, `toc_behavior: open-inside`, and the Custom CSS template. Classic and Modern themes have different defaults. A per-project record of the customer's actual values lives in each project's `style-settings-colors.md`.*

---

## Source File Map

Source files in the KnowledgeOwl codebase that generate the styles described above. Compiled bundles are defined in `build-assets.mjs`; `KbRenderer::styleSheets()` decides what a page loads.

> **Reading the source directly (Chad's machine only).** The KO codebase lives at `/Users/chadtimblin/My Drive*/Claude Code/ko-codebase/knowledgeowl` (a glob — resolve with `ls -d`; `public/`, `service/` etc. sit directly under it). Everyone else works from this doc, the quirks doc, and the customer's HTML snapshot.
>
> **When source beats the browser:** if an override "isn't taking," or an element renders unexpectedly (invisible, wrong size or color, clipped, mis-positioned), `grep` these files for the selector and read the **actual winning rule**. That's faster and more reliable than debugging computed styles in a live page, which is noisy — accumulated injected styles, timing and JS races, cross-origin sheets you can't enumerate (see quirks §47). Confirm the real rule, then write a scoped override that beats it.
>
> It's *especially* the fast path for the **editor iframe** (quirks §28) and **PDF export** (quirks §14): neither can be inspected like a normal page, so the source is often the only decisive view. Two starting points beyond the table below: `service/views/scripts/themer-templates/custom-css.css` is the seeded default Custom CSS (alerts, TOC anchors, image captions, list numbering, PDF rules), and `service/views/scripts/themer-templates/` holds the HTML templates that define page structure and class names.
>
> **Don't read speculatively** — open a file to answer a specific question, with targeted line ranges.

**Loaded on current (Minimalist) KBs** — the `ko` bundle, in concatenation order:

| File | Lines | Purpose |
|------|-------|---------|
| `public/flatui/dist/css/vendor/bootstrap.min.css` | (min) | Bootstrap 3.2.0 — grid, components, normalize 3.0.1 (`public/flatui/dist/css/flat-ui.css` is the readable, unminified Flat UI source; there is no unminified Bootstrap copy in the repo) |
| `public/flatui/dist/css/flat-ui.min.css` | (min) | Flat UI Free 2.2.2 skin — base body/heading typography |
| `public/css/public/ko-css.css` | 2,714 | All KO public-KB structure incl. `.hg-*-theme` rules, icon-cats, TOC, widget page styles. The last line (2714) is a minified block of Froala's own content styles (`.documentation-article img.fr-*`, `.fr-video`, emoticons) |
| `public/css/github.css` | 88 | Code-block syntax highlighting (Rainbow.js GitHub theme, `.rainbow …`) |

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
| `public/css/public/contact-us.css` / `contact-us-modern.css` | 14 / 14 | Legacy bundles: contact form |

**Other:**

| File | Lines | Purpose |
|------|-------|---------|
| `public/css/pdf.css` | 27 | Appended to every PDF's raw CSS: `body .hg-article-body img { max-width: 100% }`, zeroes `.hg-article` padding/border, hides `.ko-article-actions`, `.hg-article-pdf`, `.hg-article-footer`, and styles `.ko-pdf-clickable-link`. No color rules |
| `public/css/mpdf.css` | — | Header CSS for the Full-PDF table of contents that mpdf assembles |
| `public/css/app/article-content-editor.css` | — | Editor-iframe-only additions (`koFroalaEditor` bundle): `.fr-view.hg-article-body.fr-editor-svelte { max-width: 930px }`, `.documentation-article { box-shadow: none !important }`, blockquote reset |
| `public/css/public/widgetiframe.css` | 107 | Legacy embedded widget iframe internals (served as `widgetiframe_min_2016_12_09.css`) |
| `public/widget-app/assets/css/style.css` | — | Widget 2.0 (`widget` bundle); separate Custom CSS field, see Embedded Widget |
| `public/css/reset.css` | 8 | CSS reset — **admin/app pages only**, not public KBs |

Key PHP/template files:

| Directory/File | Purpose |
|----------------|---------|
| `service/services/KbRenderer.php` | Merge-code rendering; `css()` generates the dynamic Style-Settings rules (selector maps at the top of the class, lines ~38–166); `styleSheets()` picks bundles; `font()` emits the self-hosted font links; `tocBehavior()` / `layoutName()` / `isEditor()` produce body classes |
| `service/services/ColorServer.php` | `getColorShade()` (per-channel add) and `shifttowards()` (midpoint blend) used for the computed TOC hover / border / button colors |
| `service/services/ResourceLoader.php` | `loadCssFile()` resolves bundle names to hashed CDN files; `loadRawPdfCss()` builds the PDF stylesheet text |
| `service/services/PDF/PdfGenerator.php`, `FullPdf.php`, `ArticleVersionPdf.php` | PDF pipeline (wkhtmltopdf via Snappy for content, mpdf for assembly; quirks doc §14) |
| `service/models/Theme.php` | Theme model — default colors/fonts (`defaultTheme()`), font lists, theme name enum |
| `service/controllers/HelpController.php` | Sets `__pageName` (the page-type body class) per route; `HelpController::__pageName` assignments are the authority for quirks doc §15 |
| `service/controllers/KbController.php` | Compiles `KbRenderer::css()` into the static `{projectID}_css.css` file the editor iframe loads (quirks doc §28); passes `customCSS` / `fontFiles` / `koFroalaEditor` to `kb/article-svelte.phtml` |
| `app-svelte/src/lib/froala/config.ts`, `app-svelte/src/lib/FroalaEditor.svelte` | Current (Svelte) article editor: `iframeStyleFiles`, `editorBodyClass` |
| `public/js/app/wysiwyg.js` | Legacy editor bootstrap (category / snippet / home-page editors still use it) |
| `service/views/scripts/themer-templates/` | Layout templates (1-col, 2-col, 3-col), site wrapper, nav header, default Custom CSS |
| `service/views/scripts/help/partials/` | Component partials (searchbar, TOC (`toc.phtml`), breadcrumbs, ratings, comments, `slideout-left.phtml`, `header-anchors.phtml`, `editor-bar.phtml`) |
| `service/views/scripts/help/` | Page templates (article, faq-navigation, icon-category, `tableofcontents.phtml`, search, contact, login, etc.) |
| `service/views/scripts/javascript/` | Legacy embed widget JS + injected widget CSS (`widget*.phtml`, `widgetcss.phtml`) |
| `service/controllers/WidgetController.php` | Widget 2.0; `cssAction()` serves the widget's own Custom CSS |
