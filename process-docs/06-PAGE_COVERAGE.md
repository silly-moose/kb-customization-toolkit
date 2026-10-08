# Page Coverage: Brand Every Page a Reader Can Reach

A theme is usually built and reviewed on the homepage, a category and an article. Readers also land on search results, the login and Restricted Access pages, the 404 page, article lists, the contact form, and on surfaces Custom CSS never reaches: the help widget, the AI chatbot and article PDFs. This doc lists all of them, says what styles each one, and gives the check that finds the gaps.

**When:** the "Page coverage" mandatory check in `CLAUDE-RULES.md`. Run it before the first version of a build is called done, and again after any version that changes fonts, colors or the login card. State the outcome in the conversation and in the CHANGES file, including the surfaces you skipped and why (feature off, not reachable).

## 1. Find out which features are on

Several page types only exist when a feature is enabled. Read the settings once and record them under `# Baseline` in `.claude/rules/project.md`, so later sessions don't re-check:

| Feature | Where (KB settings) | Adds |
|---|---|---|
| Contact form | Contact form | `/<root>/contact-us` |
| Glossary | Glossary | `/<root>/glossary`, definitions at the top of search |
| Ratings | Ratings | rating block on articles |
| Comments | Comments | comment thread on articles |
| Favorites | Favorites | star on articles, `/<root>/favorite-articles` |
| Subscriptions | Subscriptions | subscribe modal, Manage Subscriptions page, digest email |
| Required reading | Required reading | `/<root>/required-reading`, acknowledgement on articles |
| AI chatbot | AI chatbot | launcher button on full pages, chat window |
| Widget | Widget | the in-app help panel (a separate app) |
| Reader login | Security settings > Readers | login page, Reset Password and sign-up windows |

## 2. The pages

`<root>` is `/help`, `/docs` or `/home`. "Loads" means which Customize > Style fields reach the page: Custom CSS (C), Custom `<head>` (H), Body (B), Top Navigation (N). Every page gets C and H.

| Page | Path | `<body>` page class | Loads | Markup from | Reach it by |
|---|---|---|---|---|---|
| Homepage | `/<root>` | `hg-home-page` | C H B N | Homepage | always |
| Article | `/<root>/<slug>` | `hg-article-page` | C H B N | Article, Right Column | always |
| Category (content, basic, FAQ, topic) | `/<root>/<category>` | `hg-article-page hg-category-page` | C H B N | Article, or none | a category of that type |
| Blog category | `/<root>/<category>` | adds `hg-blog-page` | C H B N | none | a blog category |
| Search results, and "No results" | `/<root>/search?phrase=x` | `hg-search-page` | C H B N | none | always; a nonsense phrase for no results |
| Glossary | `/<root>/glossary` | `hg-glossary-page` | C H B N | none | always routable |
| New, Updated, Popular lists | `/<root>/new-articles`, `updated-articles`, `popular-articles` | `hg-widget-page` | C H B N | none | always |
| Required reading | `/<root>/required-reading` | `hg-widget-page` | C H B N | none | feature on, signed-in reader |
| Favorites | `/<root>/favorite-articles` | **none** | C H B N | none | feature on, at least one favorite |
| Contact form | `/<root>/contact-us` | `hg-contact-page` | C H B N | none | feature on |
| Reader login, Reset Password and sign-up windows | `/<root>/readerlogin` | `hg-login-page` | C H | Login | signed out (headless Chrome, section 4) |
| Restricted Access | `/<root>/noaccess` | **none** | C H | Login, wrapping Restricted Access | open the URL; renders for anyone |
| Shared-password login | `/<root>/singlelogin` | none | C H | Login | KB password set |
| 404 | any bad slug | `ko-error-page` | C H N, fixed body | 404 Page | `/<root>/no-such-page` |
| Manage Subscriptions | `/<root>/manage-subscriptions/sid/<id>` | `ko-manage-subscriptions-page` | C H | Manage Reader Subscriptions | feature on, link in a digest email |
| Article in an iframe (widget, contact suggestions) | `/<root>/fetch-article/hash/<slug>?widget=true&w2=true` | `hg-iframe` | C H | Article | open the URL |
| Print view | print icon on an article | plain body | C H, scripts stripped | none | click the print icon |

Notes that have cost a deploy (details in `Reference/knowledgeowl-css-quirks.md` §53 and §57):

- **Restricted Access and favorites have no page class.** A rule scoped to `body.hg-login-page` misses Restricted Access even though it sits inside your Login template. Scope with `.login-container`, or `body:has(.login-container)` for the page background.
- **Login-template copy shows on Restricted Access too.** A "Sign in to continue." line in the Login template appears to a signed-in reader who lacks access. Hide it with `.login-container:has(.alert)`.
- **Never put a `z-index` on the login card.** It traps the Reset Password window under its own backdrop, so readers can't click into it (quirks §57).
- **Bootstrap's leftovers survive a theme.** Expect stock colors in form fields (Lato, `#34495e`), the in-page search button (colored like the border, nearly invisible), the search sort menu, the "No results" box, `.badge`, the list-page pager, and alerts outside article bodies.

## 3. Surfaces Custom CSS doesn't reach

| Surface | Styled from | What to know |
|---|---|---|
| **Help widget (Widget 2.0)** | Settings > Widget: Custom Widget Styles, Button Background Color, Button Text Color | The panel is its own app (Nunito Sans, hard-coded colors, no CSS variables; `public/widget-app/assets/css/style.css` has the selectors). `@import` works there. Articles open as `fetch-article` pages, so they use the KB theme. The launcher's shape comes from CSS KO loads on the customer's own site; only its two colors are settings. No logo setting. Keep the file in the version folder as `widget-custom-css.css`. |
| **AI chatbot** | Settings > AI chatbot > Edit branding: launcher button colors and icon, avatar, footer, Custom CSS | The launcher sits in the KB page but gets its colors as inline styles, so set them in branding (Custom CSS would need `!important`, and wouldn't reach the chatbot when it is embedded on the customer's site). The chat window is an iframe whose security policy allows fonts only from the KB's own domain, and KO strips `@import`, so web fonts can't load there: give it the brand font first and a close system font after. KO defines its variables (`--fontFamily`, `--fontColor`, `--link`, `--bgChat`, `--borderSubtle`, `--accentColor`) and rules on `.ko-chatbot-sv`, so scope every override to it. Keep the file as `chatbot-custom-css.css`. |
| **Article PDFs** | Custom CSS, Style Settings, Custom `<head>`; header and footer HTML in Customize > PDF | Each PDF is generated once and stored. A theme deploy doesn't regenerate them: they change only when an article is re-saved with a text change, or when KnowledgeOwl support regenerates them all. After the final version, ask support to regenerate the KB's PDFs, and say so in the CHANGES file. |
| **Reader emails** | Reader settings (welcome, password reset: subject and text); subscription digest uses a fixed template | Plain content, nothing to theme beyond wording. |
| **System pages** | not themeable | Suspended or trial-restricted KB, unknown domain, 500 errors, basic-auth prompt. KnowledgeOwl-branded by design; don't report them as gaps. |

### Previewing the widget and the chatbot without saving

- **Widget:** on a reader page of the KB, load the widget with its embed code (`_ko19.__pc` and `base_url` from Settings > Widget, then `/widget/load`) and call `_ko19.open()`. The panel iframe is same-origin with the KB page, so a `<style>` with the candidate CSS can be appended to `document.getElementById('ko-widget-iframe').contentDocument`. Articles show only where the reader session reaches, which on a restricted KB means the KB's own domain. A localhost test page loads the widget but can't show restricted articles.
- **Chatbot:** click `#ko-ai-chatbot-btn` on a reader page; the chat iframe (`/chatbot-app/main`) is same-origin, so inject the candidate CSS the same way. Don't send test questions on a customer KB: they land in the customer's chatbot reporting.
- **The built-in browser blocks some cross-site requests** (web fonts inside an iframe on another site, `localhost` from a KB page), so a font that falls back there may load fine in real Chrome. Check in headless Chrome before reporting it.

## 4. Run the check

1. **Scan every reachable page.** Inject `kb-io/page-audit.js` on a reader page and run `koAudit.run([...paths], {fonts, text, palette})` with the brand's fonts and colors. It loads each path in a hidden iframe and lists text in other fonts, text and background colors outside the palette, and off-palette borders. Pass `css` to preview a fix on every page before deploying. Treat results as leads: icon glyphs aren't scanned, and intended accents show up too.
2. **Check signed-out pages in headless Chrome.** The reader login, Reset Password and sign-up windows only render signed out. Load them with Chrome's DevTools protocol, run `koAudit.scan(window, opts)`, open each window, and confirm it takes clicks (`document.elementFromPoint` at the email field should return the input, not `.modal-backdrop`).
3. **Look at each page once.** The scan finds stock colors; only a screenshot finds layout problems (an oversized alert, a card on a white page).
4. **Check the separate surfaces** in section 3 that are turned on.
5. **Record the outcome**: in the conversation, then in the CHANGES file's "Not covered by this version" list for anything left (feature off, PDFs waiting on regeneration).
