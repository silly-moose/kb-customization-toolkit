# Guided paths (decision trees)

The toolkit's one maintained copy of the guided path script: it turns an ordinary KnowledgeOwl article into a step-by-step decision tree, for agents working through a call or readers finding their own answer. It is opt-in: adopt it when a customer asks for guided paths or decision trees. It was built for a production custom theme in July 2026, whose authors have written paths with it since, and this copy has that customer's design and content removed. KnowledgeOwl is designing a native decision tree feature; until it ships, this is how a customer gets guided paths.

Fix it here, not in a customer's copy: a build that finds a problem logs it to the toolkit's improvement log, and the next triage updates these files.

| File | What it is | Where it goes |
|---|---|---|
| `guided-paths.js` | The script: config and language strings, the bridge that decides which articles are paths, and the engine that renders them | Unchanged, in a `<script>` at the end of Custom `<head>`; a copy as `guided-paths.js` in the version folder |
| `guided-paths.css` | The styles, with color tokens at the top | At the end of Custom CSS, with the tokens set to the brand |
| `articles/` | An author guide, a template and three example paths, as article bodies | New articles in the customer's KB ("Adding the author articles", below) |
| This README | How it works, how to adopt it, the settings, the checks and the limits | Read it; nothing to copy |

## How it works

**The article is the source of truth.** Authors write a normal article in the editor; there is no code in it. When a reader opens it, the script reads the article and replaces its body with the guided view. The editor never loads Custom `<head>`, and search, PDF export and readers without JavaScript get the plain article, so all of them see every step in order.

**What authors type** (the full author guide is `articles/01-writing-a-guided-path.html`):

| In the article | Becomes |
|---|---|
| The first paragraph | The path's summary |
| A "Before you start:" paragraph and the bulleted list after it | A checklist box above the steps |
| A Heading 2 starting `Action:`, `Decision:` or `Judgement:` | One step of that type. A Heading 2 with no type word is an Action |
| Under a `Decision:` step, a bulleted list of `answer → step name` (or `->`, `-->` or `=>`) | One button per answer, each going to the named step. A bullet that links to a step's anchor works too |
| A paragraph starting `Confirm:` | A tick-box that must be checked before Next works |
| A paragraph starting `End:` | This branch ends here; the rest of the line is the completion message |
| A paragraph starting `Escalate:` | An escalation note in the step |
| A paragraph starting `Go to:` and a step name | Next goes to that step instead of the one written below it. For branches that rejoin |

The keywords work in English, German and Spanish (`Aktion`, `Entscheidung`, `Ermessen`, `Bestätigen`, `Ende`, `Eskalieren`, `Weiter zu`; `Acción`, `Decisión`, `Criterio`, `Confirmar`, `Fin`, `Escalar`, `Ir a`), whatever the KB's language.

**What readers get:** a badge, the summary and checklist, then a Step by step view (one step at a time, progress bar, Back and Next, a button per answer, a completion card) and an All steps view (every step on one page, with where each answer leads). Reader-facing labels follow the KB's language (`<html lang>`): English, German and Spanish are built in, and any other language gets English unless the build sets its own labels.

**What authors get:** a Path check panel at the top of the article page, in Preview and on the live page, never inside the editor. Green means every step, option and ending checks out; amber means the path works but something needs a look (a step nothing leads to); red names each problem and leaves the article as a normal page. The script shows the panel only when the page has KnowledgeOwl's author-only Edit link in the admin bar (`.ko-app-edit`) or the Preview bar (`.article-preview-bar`), so readers never see it. Author-facing text is English only.

**The three parts of `guided-paths.js`**, in order:

1. **Config and strings** reads `window.GP_CONFIG` (below), picks the reader labels for the KB's language and puts both on `window.GuidedPaths`.
2. **The bridge** adds the class `gp-guided-path` to the article body when the article has the guided-path tag or, with `activate: 'auto'` (the default), at least two Heading 2s that start with a step keyword. Every style is scoped to that class, so other articles are untouched.
3. **The engine** parses the marked article and checks it (nothing on the page changes if it fails), builds the steps and renders the views. It runs again when KnowledgeOwl adds an article body after the page loads, such as in the homepage slide-out, and marks each body so it runs once.

**Step ids** (used in analytics): a step heading's own `id`, or one built from the step's name. Rewording a step's text keeps its history; renaming the step starts a new one. The author guide says so.

## Adopting it in a build

1. **Settings, if any.** Most builds need none. To change a default, put this block in Custom `<head>` above the script, with only the keys you need:
   ```html
   <script>
   window.GP_CONFIG = {
     activate: 'tag',            // 'auto' (default): tagged articles plus any article with 2+ step headings. 'tag': tagged articles only
     tag: 'guided-path',         // the tag that turns an article into a path
     lang: 'de',                 // reader labels in this language instead of <html lang>: 'en', 'de' or 'es'
     strings: { next: 'Continue →', typeLabels: { judgement: 'Judgment' } },  // replace any reader label
     logEvents: true             // log each analytics event in the browser console (handy while testing)
   };
   </script>
   ```
   The reader labels `strings` can replace are `modeGuided`, `modeAll`, `progress`, `back`, `next`, `markComplete`, `completeTitle`, `completeBody`, `restart`, `counter`, `stepChip`, `escalationLabel`, `badgeLabel`, `continueLabel` and `typeLabels`; see part 1 of the script for the English wording and the `{n}`-style placeholders.
2. **Script.** Fetch `guided-paths.js` (`curl -fsSL https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/process-docs/guided-paths/guided-paths.js`) and append it to Custom `<head>` inside `<script>...</script>`. Don't edit it; change behavior through `GP_CONFIG`, and log anything that needs a code change.
3. **CSS.** Append `guided-paths.css` to the end of Custom CSS and set the tokens ("Branding it", below).
4. **Template edit, for tags.** The bridge reads tags from a hidden span in the Article template, because the Minimalist template doesn't show them. Add it as the first line inside `<div class="hg-article">` in Custom HTML > Article (and Article Version, if the build customizes it):
   ```html
   <span class="gp-article-tags" style="display:none" aria-hidden="true">[template("article-tag-names")]</span>
   ```
   Required with `activate: 'tag'`. With the default `'auto'` it's optional: without it, an article needs two step headings to become a path, and a tag alone does nothing. A theme that already shows tags in `.hg-article-tags a` or `.article-tags a` needs no edit.
5. **Author articles** ("Adding the author articles", below).
6. **Check it** (below), then record in the CHANGES file which toolkit commit the files came from (`git log -1 --format=%h -- process-docs/guided-paths`) and any `GP_CONFIG` the build sets.

### Adding the author articles

Create these in the customer's KB, in a category for authors (for example "Guided paths"). Keep the titles: the guide links to the others by the URLs KnowledgeOwl makes from them.

| File | Title | What it is |
|---|---|---|
| `01-writing-a-guided-path.html` | Writing a guided path | The author guide |
| `02-guided-path-template.html` | Guided path template | The starting point authors copy |
| `03-example-agent-path.html` | A customer can't sign in | An agent-facing example: a tick-box, decisions, branches that rejoin, a judgement step with an escalation note, early endings |
| `04-example-self-serve-path.html` | Why can't I see an article? | A reader-facing example |
| `05-example-with-a-mistake.html` | Example with a mistake | Shows authors a red Path check. Readers see a normal article |

Paste each file into the editor's Code View, or create them through the API. If the KB is open to readers, restrict the category to authors' reader groups or leave the examples unpublished once authors have seen them. When the build uses `activate: 'tag'`, tag the template and examples `guided-path`, and change step 5 of the author guide to "Add the tag guided-path, then view the article."

## Branding it

Set the tokens at the top of `guided-paths.css`. Each text color must reach 4.5:1 on the background it sits on, and each border or control color 3:1 (the toolkit's contrast check in 01, "Colour math").

| Token | Colors |
|---|---|
| `--gp-ink`, `--gp-muted` | Step text, and secondary text (labels, counters) |
| `--gp-surface`, `--gp-soft`, `--gp-line` | Step cards, card headers and the mode switch, borders and the progress track |
| `--gp-accent`, `--gp-accent-soft`, `--gp-accent-hover`, `--gp-accent-line`, `--gp-on-accent` | Step numbers, primary buttons, progress, Decision steps, the tick-box box; `--gp-on-accent` is text on the accent |
| `--gp-green`, `--gp-green-soft`, `--gp-green-line` | Action steps, endings, the completion card, a green Path check |
| `--gp-purple`, `--gp-purple-soft` | Judgement steps and the checklist box |
| `--gp-amber`, `--gp-amber-soft`, `--gp-amber-line` | Escalation notes and amber Path check warnings |
| `--gp-red`, `--gp-red-soft`, `--gp-red-line` | A red Path check |

The defaults are a neutral light design. On a dark theme, set `--gp-surface`, `--gp-soft`, `--gp-line`, `--gp-ink` and `--gp-muted` together, then re-check every text token. With the light/dark mode layer (`process-docs/light-dark-mode/`), its CSS re-points every `--gp-*` token in dark mode; set those values to the brand there.

## Analytics

The script sends these events. Each also carries `kb_article` (the title), `kb_content_type` (`guided_path`) and `guide_id` (the article's URL slug).

| Event | When | Extra parameters |
|---|---|---|
| `guide_started` | The guided view loads | `steps_total` |
| `step_viewed` | A step is shown | `step_id`, `step_index`, `step_type` |
| `decision_taken` | A reader picks an answer | `step_id`, `choice_label`, `target_step_id` |
| `gate_confirmed` | A tick-box is checked | `step_id` |
| `completed` | The completion card is shown | `steps_taken` |
| `abandoned` | The reader leaves mid-path | `last_step_id`, `steps_taken` |
| `mode_switched` | Step by step and All steps are switched | `mode` |

Where they go: a `dataLayer` push when the page loads Google Tag Manager, otherwise `gtag()` when it exists, and always a `guidedpath:event` DOM event (`event.detail` has `name` and `params`) that any other tool can listen for. Nothing is sent when the KB has none of these; KnowledgeOwl's own analytics records page views only.

## Checking it

- **Before saving**, preview on the live page (05, "Preview on the live page without saving") with one of the examples pasted into a draft article: the badge, summary, checklist, Step by step and All steps render, and a walk through each answer reaches the right step and ends with the completion card.
- **As an author**, the Path check shows on the article page and on the Preview page; "Example with a mistake" shows red and stays a normal article.
- **Logged out** (or in a private window, if the KB is public): no Path check, no warnings.
- **Tags**, when the build uses them: a tagged article becomes a path; with `activate: 'tag'`, an untagged one with step headings shows authors the "isn't tagged" note.
- **Language**: the labels match the KB's language, or the `strings` the build set.
- **Contrast** of every token as set, in both Step by step and All steps.

## What it can't do

Tell the customer these at the start, and record them in the CHANGES file's "Not covered by this version" list.

- **Different steps for different reader groups.** A whole path can be restricted like any article; single steps can't.
- **Usage reports inside KnowledgeOwl.** The events need the customer's own analytics tool.
- **Sending a reader's answers anywhere**, such as into a contact form or ticket.
- **Checking inside the editor.** The Path check shows on the article page only, so authors preview to check their work.
- **Author-facing text in other languages.** The Path check and warnings are English.

## History

| Toolkit version | Notes |
|---|---|
| 1.1 (2026-11-20) | Options also accept `-->`, `=>` and an autocorrected dash before `>` as the arrow. Before, `-->` worked but left a hyphen at the end of the button text (seen on a customer's first draft). |
| 1.0 (2026-11-16) | First toolkit copy, from engine version 57 of the production theme: the theme's design, names and customer content removed; `GP_CONFIG` settings, built-in German and Spanish labels, the `guidedpath:event` DOM event and color tokens added. Behavior matches the source on every example path. |
