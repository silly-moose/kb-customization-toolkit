# KnowledgeOwl CSS Defaults Reference

Lookup reference for default selectors, property values, and CSS architecture in KnowledgeOwl knowledge bases. Use this when writing custom CSS overrides — it tells you what you're overriding without needing to reverse-engineer from DevTools.

**Companion file:** `knowledgeowl-css-quirks.md` covers platform-specific gotchas (e.g., `!important` usage, TOC coupling, theme builder overwrite risks). This file covers default values and structure.

---

## CSS Architecture: How Styles Layer

KnowledgeOwl renders public KB pages with styles applied in this order (later layers override earlier ones):

1. **CSS Reset** — normalizes browser defaults
2. **Bootstrap 3.0.0** — grid system, buttons, forms, tables, nav, modals
3. **Flat UI** — extends Bootstrap with flat design styling
4. **KO Theme CSS** — layout and structure (`publicview.css` or `publicview_modern.css`)
5. **KO Standard CSS** — theme colors and typography (`standard.css` or `standard_modern.css`)
6. **KO Utilities CSS** (`ko-css.css`) — CSS custom properties, KO-specific overrides, utility classes
7. **Dynamic theme styles** — generated from theme builder settings (colors, fonts, layout)
8. **Custom CSS** — user-entered CSS from Customize > Style (HTML & CSS) > Custom CSS

Custom CSS loads last, so it wins on equal specificity. But many default rules use `!important` (see quirks doc #1), so you'll often need `!important` or high specificity to override.

---

## CSS Custom Properties

Defined in `ko-css.css` on `:root`. Theme builder settings override these dynamically.

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
}
```

**Note:** These are the code defaults. Each KB's theme builder settings override these, so the actual values vary per customer. Check the HTML snapshot or live KB to see the active values.

---

## Layout Structure & Container Classes

### Body-Level Classes

Applied to `<body>` or high-level wrappers. Use these to scope CSS to specific contexts:

| Class | Applied when |
|-------|-------------|
| `.hg-minimalist-theme` | Minimalist theme (most new KBs) |
| `.hg-classic-theme` | Classic theme |
| `.hg-modern-theme` | Modern theme |
| `.hg-1column-layout` | Single column layout |
| `.hg-2column-layout` | Two column layout |
| `.hg-3column-layout` | Three column layout |
| `body.hg-category-page` | Category pages |
| `body.hg-article-page` | Article pages |
| `.hg-pdf` | PDF export context |
| `.hg-iframe` | KB rendered inside an iframe |

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
| Article content max-width | `800px` |
| Article container | `margin: 0 auto` (centered) |
| Documentation padding | `0 20px` |
| Right column max-width | `calc((100vw - 920px) / 2)` |

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

### Default Values

```css
/* Navbar */
.navbar-default {
  border-bottom: 8px solid #ccc;    /* theme builder overrides the color */
}

/* Brand area */
.navbar-brand {
  padding: 17px 15px;
  font-size: 22px;
  font-weight: 700;
  line-height: 20px;
}

/* Nav links */
.navbar-default .navbar-nav > li > a {
  font-size: 15px;
  font-weight: 700;
  line-height: 20px;
}
```

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

### Typography Defaults

| Element | Properties |
|---------|------------|
| Body text | `font-family: sans-serif; font-size: 16px; line-height: 1.5` |
| H1 | `font-size: 26px (or 2em); font-weight: 500` |
| H2 | `font-size: 22px; font-weight: 500` |
| H3 | `font-size: 18px; font-weight: 500` |
| H4 | `font-size: 16px; font-weight: 500` |
| Links | `color: var(--text-links-color)` (default `#3C80BA`) |
| Strong | `font-weight: bold` |

### Spacing Defaults

| Element | Properties |
|---------|------------|
| Paragraphs | `margin: 20px 0` |
| Headings (top) | `margin-top: 30px` |
| Headings (bottom) | `margin-bottom: 10px` |
| Article top/bottom padding | `40px` (classic theme) |

---

## Table of Contents (TOC Sidebar)

### Key Selectors

| Selector | What it styles |
|----------|---------------|
| `.slideout-new` | TOC sidebar panel |
| `.slideout-panel-left` | Left panel container |
| `.toc-toggle` | TOC show/hide toggle button |
| `.toc-box-shadow` | TOC shadow effect |
| `.ko-collapse-trigger` | Category collapse/expand button |
| `.ko-collapse-article` | Collapsible article section |
| `.topic-toc-item` | Individual TOC item link |
| `.level-0`, `.level-1` | TOC nesting depth levels |

### TOC Defaults

```css
.slideout-new {
  width: 360px;                        /* coupled with translateX — see quirks doc #5 */
  border-right: var(--toc-border-color);
}
```

---

## Search

### Key Selectors

| Selector | What it styles |
|----------|---------------|
| `.hg-search-bar` | Search bar container |
| `.hg-article-search` | Search results list |
| `.input-group` | Search input wrapper (border is here, not on input — see quirks doc #13) |
| `.input-group:focus-within` | Focus state border change |
| `.category-dropdown` | Category filter dropdown |
| `.category-dropdown ul` | Dropdown list |
| `.category-dropdown .sub-menu` | Nested subcategory menu |

---

## Components

### Ratings

| Selector | What it styles |
|----------|---------------|
| `.hg-ratings` | Rating widget container |

### Comments

| Selector | What it styles |
|----------|---------------|
| `.hg-comments` | Comments section container |

### Contact Form

| Selector | What it styles |
|----------|---------------|
| `.hg-contact-us-form` | Contact form wrapper |
| `.hg-contactus-article` | Article context area |
| `.hg-contactus-button-bar` | Button area |

### Breadcrumbs

| Selector | What it styles |
|----------|---------------|
| `.breadcrumb` | Breadcrumb navigation (Bootstrap) |

### Tags

| Selector | What it styles |
|----------|---------------|
| `.hg-article-tags` | Article tags container |

### Related Articles

| Selector | What it styles |
|----------|---------------|
| `.hg-related-articles` | Related articles widget |

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

---

## Embedded Widget

### Key Selectors

| Selector | What it styles |
|----------|---------------|
| `.helpgizmo-container` | Widget container |
| `.hg-container-bottom_left`, `.hg-container-bottom_right`, etc. | Widget position variants |
| `.hg-widget-modal` | Widget modal overlay |
| `.hg-modal-content` | Widget modal body |
| `.hg-widget-backdrop` | Darkening overlay behind modal |
| `.hg-widget-footer-content` | Widget footer area |
| `.hg-widget-articles` | Article list inside widget |
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

KnowledgeOwl adds custom breakpoints (see quirks doc #9):

| Breakpoint | Media Query | Typical Use |
|------------|-------------|-------------|
| 576px | `@media (max-width: 576px)` | Small mobile |
| 991px | `@media (max-width: 991px)` | Tablet/small desktop |
| 1473px | `@media (min-width: 1473px)` | Large desktop / 3-column layout |

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

KnowledgeOwl uses **Font Awesome 6 Pro** (with Font Awesome 4.7.0 as legacy fallback). Icon classes follow the standard Font Awesome patterns:

```css
.fa-solid, .fa-regular, .fa-light, .fa-brands  /* FA6 style prefixes */
.fa                                              /* FA4 legacy prefix */
```

---

## Theme Builder Color Mapping

The theme builder UI controls these CSS properties. When a customer changes a theme color, it overrides the corresponding CSS custom property or direct style:

| Theme Setting | What It Affects |
|---------------|-----------------|
| Content background | Page and article background color |
| Header color | Navigation bar background |
| Header text color | Nav links and project name |
| Body text color | Default text color in articles |
| Accent/link color | Links, buttons, active states |
| Border color | Dividers, card borders, input borders |
| Hover/active colors | Interactive state styling |
| Button colors | Primary action buttons |

---

## Source File Map

For reference, these are the source CSS files in the KnowledgeOwl codebase that generate the default styles described above:

| File | Lines | Purpose |
|------|-------|---------|
| `public/css/public/ko-css.css` | 2,616 | CSS custom properties, KO-specific overrides, utility classes |
| `public/css/public/publicview.css` | 7,468 | Classic theme layout and grid |
| `public/css/public/publicview_modern.css` | 7,416 | Modern theme layout and grid |
| `public/css/public/standard.css` | 906 | Classic theme colors and typography |
| `public/css/public/standard_modern.css` | 876 | Modern theme colors and typography |
| `public/css/public/article.css` | 104 | Article-specific styles |
| `public/css/public/contact-us.css` | 14 | Contact form styles |
| `public/css/public/reset.css` | 675 | CSS reset |
| `public/css/public/widgetiframe.css` | 107 | Embedded widget styles |

HTML template files that define the page structure and class names:

| Directory/File | Purpose |
|----------------|---------|
| `service/views/scripts/themer-templates/` | Layout templates (1-col, 2-col, 3-col), site wrapper, nav header |
| `service/views/scripts/help/partials/` | Component partials (searchbar, TOC, breadcrumbs, ratings, comments, etc.) |
| `service/views/scripts/help/` | Page templates (article, category, search, contact, login, etc.) |
