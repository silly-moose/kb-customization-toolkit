# Accessibility layer

The toolkit's one maintained copy of the reader-side accessibility fixes (WCAG 2.2 AA) for a KnowledgeOwl custom theme. Every build adopts it in its first version unless Chad says otherwise (CLAUDE-RULES, "Mandatory Checks"). It was built from two production themes that were remediated against a reader-side WCAG 2.2 AA audit of the stock Minimalist theme, and it bridges the gap until KnowledgeOwl's own accessibility release ships ("When KnowledgeOwl's release ships", below).

Fix it here, not in a customer's copy: a build that finds a problem in the layer logs it to the toolkit's improvement log, and the next triage updates these files.

| File | What it is | Where it goes |
|---|---|---|
| `a11y-script.js` | Landmarks and a skip link, heading levels, breadcrumb and table-of-contents semantics, form labels, dialogs, names for icon-only controls, the feedback announcement, decorative images | Unchanged, in a `<script>` at the end of Custom `<head>`; a copy as `a11y-script.js` in the version folder |
| `a11y.css` | Tokens, the skip link, focus rings, field borders, underlined links in running text, sizes for re-levelled headings, target sizes, badge and pager contrast, reduced motion | At the end of Custom CSS, with the tokens set to the brand |
| This README | How to adopt it, the template edits, the checks, and the fix table | Read it; nothing to copy |

## Adopting it in a build

1. **Script.** Fetch `a11y-script.js` from the toolkit (`curl -fsSL https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/process-docs/accessibility/a11y-script.js`) and append it to Custom `<head>` inside `<script>...</script>`. Don't edit it; the class prefix `ko-a11y-` is generic. If a build needs a change, make it in the build, log it, and say so in the CHANGES file.
2. **CSS.** Append `a11y.css` to the end of Custom CSS. Set each token to the brand's colors and measure it on every background it sits on; the comments say what each must reach. A dark band (banner, footer) gets its own `--ko-a11y-focus`. On a theme whose rules aren't scoped to `.hg-minimalist-theme`, change the scope to match.
3. **Templates.** Make the edits below in the version's Custom HTML. They are markup the script can't safely change after the page loads.
4. **Check it** (below), then record in the CHANGES file which toolkit commit the layer came from (`git log -1 --format=%h -- process-docs/accessibility`).

### Template edits

| Template | Edit | WCAG |
|---|---|---|
| Article | Move `[article("action_icons")]` out of the `<h1>` into `<div class="hg-article-actions-bar">` right after it | 1.3.1, 2.5.8 |
| Article | Related articles heading `<h3>` becomes `<h2>` | 1.3.1 |
| Article | In the expand/collapse toggle script, give each `.toggleLink` `role="button"`, `aria-expanded` (kept in step on click) and `aria-controls`, and `aria-hidden="true"` on its icon | 4.1.2 |
| Article, Homepage | Every `<img>` in the template has `alt` (`alt=""` when decorative) | 1.1.1 |
| Homepage | List headings (`New`, `Updated`, `Popular` and similar) `<h3>` become `<h2>`; add `<h2 class="sr-only">Browse by category</h2>` before the category tiles when nothing else heads them | 1.3.1 |
| 404 | The two sentences in `<h3>` become `<p class="error-page-lead">`; the list headings become `<h2>` | 1.3.1 |
| Restricted Access | `role="alert"` on the `.alert`, its `<h4>` becomes `<h1>`, `aria-hidden="true"` on the icon | 1.3.1, 4.1.3 |
| Body, Top Navigation | Any extra `<nav>` the theme adds gets an `aria-label` | 1.3.1 |

## Checking it

- **Preview** on the live page before saving (05, "Preview on the live page without saving"): kill transitions before measuring colors, and remember a script injected after load sees elements the real one may not.
- **axe-core** on one page of each type (06 §4 step 6). The layer should leave nothing but content findings (below).
- **Keyboard pass** on an article and the homepage: Tab shows the skip link first and every focus ring; Enter and Space open and close table-of-contents categories; Escape closes the slide-out table of contents at phone width; a dialog takes focus and gives it back.
- **After deploy**, check every page the script touches (CLAUDE-RULES, "Post-Deploy Verification"): the live script runs earlier than a preview and can miss elements a snippet adds on load.

## What the layer can't fix

Record these in the CHANGES file's "Not covered by this version" list, and in the customer's style guide where authors own them.

- **Article content:** alt text on article images, bold text used as headings, heading order inside articles, table captions, and authors' inline text colors (a dark design: CLAUDE-RULES step 2).
- **Third-party embeds:** YouTube's player markup.
- **KnowledgeOwl's own controls** outside the theme: the comment avatar control's `tabindex="-1"`, PDF tagging, the AI chatbot's chat window (an iframe; its branding is in 06's AI chatbot row), and the Restricted Access page's server-side title, which the script corrects in the browser.

## When KnowledgeOwl's release ships

KnowledgeOwl PR 1573 (branch `accessible-default-theme`, in code review on 2026-11-13) adds an Accessible built-in theme and a set of fixes for every theme. Its skip link (`.ko-skip-link`) is on every page once it ships; the script looks for it and stands down on the fixes KnowledgeOwl then does itself, so a live KB doesn't get them twice. After the release:

1. Re-check this table against the released code and change "PR 1573" to the release.
2. Delete the script steps marked **every theme** below, and the CSS the Accessible theme covers if new builds start from that theme.
3. Decide whether new builds start from the Accessible theme instead of Minimalist; the base theme is a `# Baseline` fact (05, "Switching the base theme").

### Fix table

"PR 1573" says what the release covers: **every theme**, **Accessible only** (the theme's own templates and CSS; Minimalist keeps the problem), or **no**. "Where" is this layer's fix: S (script), C (CSS), T (template edit).

| Problem | WCAG | Where | PR 1573 |
|---|---|---|---|
| No skip link | 2.4.1 | S, C | every theme |
| No main landmark | 1.3.1 | S | every theme |
| Footer not `contentinfo`; top nav and table of contents unnamed | 1.3.1 | S | every theme |
| Breadcrumbs aren't a navigation region; separators read aloud | 1.3.1 | S | every theme |
| Logo image named "Knowledge Base Logo", not where it goes | 1.1.1, 2.4.4 | S | no |
| Empty `h1.faq-header` on the homepage | 1.3.1 | S | every theme |
| List and search result titles are h4 under the h1 | 1.3.1 | S, C | Accessible only |
| Category tile titles are h3 under the h1 | 1.3.1 | S, C | Accessible only |
| Blog-style category post titles are h3 under the h1 | 1.3.1 | S, C | no |
| Search "Refine by category" is an h5, not a region | 1.3.1 | S | every theme |
| Contact page has no h1 | 1.3.1 | S, C | Accessible only |
| Login and Restricted Access titles aren't the page's h1 | 1.3.1 | S, T, C | Accessible only |
| Restricted Access browser title is only the KB name | 2.4.2 | S | every theme |
| Login username label points at the password field | 1.3.1 | S | every theme |
| Search sort "Sort by" isn't a real label | 1.3.1 | S | every theme |
| `role="search"` on a field instead of the form | 4.1.2 | S | every theme |
| Dialogs not announced; duplicate title ids; unnamed close buttons | 4.1.2 | S | every theme |
| Dialog focus doesn't move in or come back | 2.4.3 | S | every theme |
| Dialog close glyph is 1.6:1 | 1.4.11 | C | Accessible only |
| Table-of-contents chevrons aren't keyboard buttons, no expanded state | 2.1.1, 4.1.2 | S | every theme |
| Current page not marked in the table of contents | 1.3.1 | S | every theme |
| New/Updated badges unnamed and 1.7:1 | 1.3.1, 1.4.3 | S, C | partly: named on every theme, recolored on Accessible only |
| Slide-out table of contents: no expanded state, no Escape | 2.1.2, 4.1.2 | S | every theme |
| Feedback question and controls not grouped; thank-you not announced | 1.3.1, 4.1.3 | S | every theme |
| "Link to this section" icons only on hover, unnamed | 2.1.1, 2.4.4 | S, C | every theme |
| Links acting as buttons lack the role and Space | 4.1.2, 2.1.1 | S | every theme |
| Search pager arrows unnamed, not a navigation region | 2.4.4, 1.3.1 | S | every theme |
| "See more..." links don't say what they lead to | 2.4.4 | S | no |
| "Last Updated: date" lacks context | 2.4.4 | S | no |
| Decorative images without `alt` | 1.1.1 | S, T | partly: the footer logo |
| Icon-only controls (PDF, print, email, favorite, back to top, chatbot launcher) unnamed | 4.1.2 | S | partly: the chatbot launcher |
| Article action icons inside the h1; small targets | 1.3.1, 2.5.8 | T, C | Accessible only |
| No visible focus ring | 2.4.7, 2.4.11 | C | Accessible only (Minimalist gets a missing-comma fix) |
| Form field and search borders 1.2:1 | 1.4.11 | C | Accessible only |
| Links in running text told apart by color alone | 1.4.1 | C | Accessible only |
| Table-of-contents icons 1.7:1; 24px targets | 1.4.11, 2.5.8 | C | partly: 24px on Accessible only, not recolored |
| Disabled pager links 2.3:1 | 1.4.3 | C | no |
| Motion for readers who ask for less | 2.3.3 | C | Accessible only |
| Expand/collapse toggles in articles lack state | 4.1.2 | T | no |
