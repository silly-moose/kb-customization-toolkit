# KnowledgeOwl CSS Quirks & Idiosyncrasies

Reference for anyone writing or editing CSS/HTML in a KnowledgeOwl knowledge base.

For full documentation, see: https://support.knowledgeowl.com/help/look-and-feel

---

## 1. Heavy `!important` Usage

Source: https://support.knowledgeowl.com/help/default-custom-css

KnowledgeOwl's default styles use `!important` extensively (e.g., `font-family: 'Geomanist', sans-serif !important`). Custom CSS overrides often need `!important` too, or very high specificity selectors, to take effect.

## 2. Theme-Namespaced Selectors

Source: https://support.knowledgeowl.com/help/default-custom-css

Most default selectors are scoped under a theme class like `.hg-minimalist-theme`. Writing `.some-element { color: red; }` likely won't work — you typically need:

```css
.hg-minimalist-theme .some-element { color: red; }
```

Always check the existing selector specificity before writing overrides.

## 3. Competing Link Selectors

Source: https://support.knowledgeowl.com/help/default-custom-css

Rules like `a:not(.btn)` appear multiple times with different color values for different contexts (article body, TOC, navigation). Link styling can be tricky — make sure your selector targets the right context.

## 4. The `.no-border` Class

Source: https://support.knowledgeowl.com/help/default-custom-css

Images get a `box-shadow` by default via a broad selector. The only clean way to remove it is adding a `.no-border` class to the image — you can't easily override the shadow without matching the original selector's specificity.

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

KnowledgeOwl uses four breakpoints. Custom responsive CSS should align with these:

| Breakpoint | Typical Use |
|------------|-------------|
| 576px      | Small mobile |
| 768px      | Tablet |
| 991px      | Small desktop / landscape tablet |
| 1473px     | Large desktop / three-column layout |

## 10. Custom Utility Classes to Know

Source: https://support.knowledgeowl.com/help/default-custom-css

| Class | Purpose |
|-------|---------|
| `.no-border` | Removes box-shadow from images |
| `.check-list` | Styled bullet list with FontAwesome checkmarks |
| `.toc-anchor` | Invisible anchor offset for fixed nav |
| `.margin-top-20` | Spacing utility |
| `.hg-minimalist-theme` | Primary theme wrapper (used for selector scoping) |
| `.hg-2column-layout` | Two-column layout variant |
| `.hg-3column-layout` | Three-column layout variant |
| `.slideout-menu` | TOC sidebar container |

## 11. Image Caption Selectors (`fr-img-caption`)

Source: https://support.knowledgeowl.com/help/style-image-captions

Captioned and non-captioned images use different selectors. Non-captioned images are targeted with `:not(span.fr-img-caption) img.img-responsive`, while captioned images use `span.fr-img-caption`. Captions get a dark background (`#1d284f`) with special link colors (`#F6A267`) to remain readable. Be aware of this split when writing image-related CSS.

## 12. Nested Ordered List Numbering

Source: https://support.knowledgeowl.com/help/customize-nested-numbered-list-styles

The default CSS enforces a three-tier numbering hierarchy for ordered lists inside articles:

- Level 1: `decimal` (1, 2, 3)
- Level 2: `lower-alpha` (a, b, c)
- Level 3: `lower-roman` (i, ii, iii)

These are set on `.hg-article-body ol` with child combinators. Custom list styling needs to match or override these specific selectors.

## 13. Search Bar Border Pattern

Source: https://support.knowledgeowl.com/help/default-custom-css

Individual search input elements have their borders removed. The visible border is on the outer `.input-group` wrapper instead. Focus state is handled via `.input-group:focus-within`, which changes the border color. Styling the search bar requires targeting the wrapper, not the input.

## 14. PDF-Specific CSS Rules

Source: https://support.knowledgeowl.com/help/default-custom-css

Some elements are hidden on screen but visible in PDFs. For example, `.pdf-header` uses `display: none` by default but switches to `display: block` in PDF context. When writing CSS for elements that appear in both web and PDF views, check whether PDF-specific rules already exist.
