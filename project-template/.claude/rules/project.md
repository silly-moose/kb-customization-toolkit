# Project Info

- **Customer:** [customer name]
- **KB:** [knowledge base name or URL]
- **Deployment target:** [sandbox / live KB] — this determines the deployment instructions you write in CHANGES files; the KBs themselves are listed under `# Deploy targets`
- **Toolkit path:** `/Users/chadtimblin/My Drive*/Claude Code/Customers/*kb-customization-toolkit` *(a glob — resolve it with `ls -d`; only exists on Chad's machine)* — where the central `improvement-log.md` lives, so end-of-session improvement suggestions can be added to its `AWAITING REVIEW` section. If blank or unreachable, Claude won't create a log — it'll just suggest sharing any improvement ideas with Chad in Slack.

# Baseline

Facts about the KB settled **once** during setup, so later sessions don't re-check the live KB for them. Claude fills these in during the first session and reads them afterward.

- **Homepage Custom content (legacy):** [empty / in use] — Customize > Homepage > Homepage content > Custom content. Once this says `empty`, skip `homepage-custom-content.html` in every later snapshot and don't ask about it again. If it says `in use`, include and refresh that file with each snapshot.
- **Started from:** [customer's existing code / stock Minimalist defaults / theme template: name] — what the `no-changes` baseline was populated with. Leave unfilled on a project set up before this section existed; don't guess it retroactively.
- **Back-to-top snippet:** [filled / empty / not used]: whether the `backToTop` snippet behind `{{snippet.backToTop}}` in the Body template has content. KnowledgeOwl can seed it empty (quirks-doc §58); if `empty`, the fix goes in a version's deploy steps.
- **Features on:** [list]: which reader features are turned on (contact form, glossary, ratings, comments, favorites, subscriptions, required reading, AI chatbot, widget, reader login), so later sessions know which pages and surfaces to check. `06-PAGE_COVERAGE.md` §1 has the list and where each setting lives.
- **Content-level `<style>` (snippets and articles):** [none found / name + roughly how many articles use it] — Library > Snippets containing `<style>` or `<script>`, and CSS pasted into article bodies. These render inside page content, which loads *after* Custom CSS, so they can outrank the theme on every article that uses them (quirks-doc §47). Record them here rather than rediscovering them after a deploy.

# Deploy targets

The KB this project folder is for: one KB per project folder (00-README.md). Claude fills this in from the first read (05-BROWSER_CAPTURE_AND_DEPLOY.md); `DEPLOYMENTS.md` at the project root records each save.

| Role | KB host | Project ID | Signed in as |
|---|---|---|---|
| [sandbox / live] | [host.knowledgeowl.com] | [24-character id] | [account whose saves appear in KO's history] |

# Project Notes

<!-- Add any project-specific context here as it comes up: brand colors, design preferences,
     areas to avoid, special constraints, etc. For example:
     - Primary brand color #2563eb; prefer subtle shadows over hard borders
     - Customer wants the login page left untouched
     - Deadline: sandbox review with stakeholders on YYYY.MM.DD -->
