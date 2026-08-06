# Project Info

- **Customer:** [customer name]
- **KB:** [knowledge base name or URL]
- **Deployment target:** [sandbox / live KB] — this determines the deployment instructions you write in CHANGES files
- **Toolkit path:** `/Users/chadtimblin/My Drive*/Claude Code/Customers/*kb-customization-toolkit` *(a glob — resolve it with `ls -d`; only exists on Chad's machine)* — where the central `improvement-log.md` lives, so end-of-session improvement suggestions can be added to its `AWAITING REVIEW` section. If blank or unreachable, Claude won't create a log — it'll just suggest sharing any improvement ideas with Chad in Slack.

# Baseline

Facts about the KB settled **once** during setup, so later sessions don't re-check the live KB for them. Claude fills these in during the first session and reads them afterward.

- **Homepage Custom content (legacy):** [empty / in use] — Customize > Homepage > Homepage content > Custom content. Once this says `empty`, skip `homepage-custom-content.html` in every later snapshot and don't ask about it again. If it says `in use`, include and refresh that file with each snapshot.
- **Started from:** [customer's existing code / stock Minimalist defaults / theme template: name] — what the `no-changes` baseline was populated with. Leave unfilled on a project set up before this section existed; don't guess it retroactively.

# Project Notes

<!-- Add any project-specific context here as it comes up: brand colors, design preferences,
     areas to avoid, special constraints, etc. For example:
     - Primary brand color #2563eb; prefer subtle shadows over hard borders
     - Customer wants the login page left untouched
     - Deadline: sandbox review with stakeholders on YYYY.MM.DD -->
