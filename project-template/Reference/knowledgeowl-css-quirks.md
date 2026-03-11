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
