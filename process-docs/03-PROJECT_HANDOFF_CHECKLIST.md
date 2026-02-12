# Project Handoff Checklist

Use this checklist when completing a KnowledgeOwl customization project.

---

## Deployment Target

Check which deployment workflow applies to this project:

- [ ] **Sandbox → Production** — changes are tested in a sandbox first, then deployed to the live KB after approval
- [ ] **Live KB** — changes are deployed directly to the live KB

---

## Pre-Deployment Verification

- [ ] All CSS changes tested and verified
- [ ] All HTML changes tested and verified
- [ ] Screenshots captured showing completed work
- [ ] Customer has approved changes
- [ ] CHANGES file is up to date in the final version folder

---

## Rollback Readiness

- [ ] The `no-changes` backup folder is intact and unmodified
- [ ] The previous version folder is intact (in case rollback is needed)

---

## Code Deployment

- [ ] Custom CSS deployed
- [ ] Custom HEAD deployed (if modified)
- [ ] Custom HTML sections deployed (list which ones):
  - [ ] Body
  - [ ] Top Navigation
  - [ ] Article
  - [ ] Article Version
  - [ ] Homepage
  - [ ] Login
  - [ ] Manage Reader Subscriptions
  - [ ] 404 Page
  - [ ] Restricted Access Page
  - [ ] Right Column

### If Sandbox → Production

- [ ] All changes verified in sandbox
- [ ] Changes deployed from sandbox to production KB
- [ ] Production KB tested and verified working

### Assets & Manual Updates
- [ ] Images/icons uploaded to KnowledgeOwl file library
- [ ] Category icons updated (if applicable)
- [ ] Category descriptions updated (if applicable)
- [ ] Favicon updated (if applicable)
- [ ] Navigation settings configured (if applicable)
- [ ] Any other manual KnowledgeOwl settings configured

---

## Post-Deployment

- [ ] KB tested and verified working after deployment
- [ ] Screenshots captured showing completed work
- [ ] Customer notified that changes are live
- [ ] Any follow-up tasks documented or handed off

---

## Project Documentation

- [ ] Final version folder contains all deployed code
- [ ] CHANGES file accurately reflects all modifications
- [ ] Reference folder contains all mockups/requirements received
- [ ] Screenshots folder contains before/after images

---

## Improve the Template

Before closing this project, review if any process improvements were discovered:

- [ ] Any new steps or tips to add to `01-KB_CUSTOMIZATION_PROJECT_SETUP.md`?
- [ ] Any new checklist items to add to `03-PROJECT_HANDOFF_CHECKLIST.md`?
- [ ] Any new sections to add to the `CHANGES_FROM_no-changes.md` template?
- [ ] Any new template files needed in `TEMPLATE-no-changes`?

**Chad (template maintainer):** Update the master template directly and push to the repo.

**Everyone else:** Submit suggestions to Chad via a GitHub issue or direct message. Always pull the latest version from the repo before starting a new project.

---

## Notes
<!-- Add any project-specific notes here -->
