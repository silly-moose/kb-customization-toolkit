# Light and dark mode

The toolkit's one maintained copy of a reader light/dark mode for a KnowledgeOwl custom theme: a script that picks the mode before the page draws and adds a "Dark mode" switch, CSS that darkens the KnowledgeOwl components that otherwise stay light, and the AI chatbot window's dark styles. It is opt-in: adopt it when a customer asks for dark mode, and mention it when scoping a theme. Customers who want it tend to care a lot, and it doubles the color checks for every later version, so don't add it unasked. It was built from three production themes that shipped a light/dark mode between October and November 2026, with their designs and content removed.

Fix it here, not in a customer's copy: a build that finds a problem logs it to the toolkit's improvement log, and the next triage updates these files.

| File | What it is | Where it goes |
|---|---|---|
| `light-dark-mode.js` | The script: settings, the mode, the switch, the chatbot sync, authors' colors | Unchanged, in a `<script>` at the **top** of Custom `<head>`; a copy as `light-dark-mode.js` in the version folder |
| `light-dark-mode.css` | The switch styles, the dark palette tokens, and dark rules for KnowledgeOwl's components | At the end of Custom CSS, with the tokens set to the brand |
| `chatbot-custom-css.css` | Dark styles for the AI chatbot window | Settings > AI chatbot > Edit branding > Custom CSS, saved there; a copy in the version folder |
| This README | How it works, how to adopt it, the settings, the checks and the limits | Read it; nothing to copy |

## How it works

**The editor, PDFs and print stay light.** The script sets `data-kb-theme="light"` or `"dark"` on `<html>`, and every dark rule is keyed to that attribute inside `@media screen`. The article editor and PDF exports never run Custom `<head>`, so the attribute is never set there. Never use `@media (prefers-color-scheme)` in Custom CSS: the editor loads Custom CSS and would go dark for an author whose device is dark (quirks §66).

**Which mode a reader gets:** their saved choice, else the KB's default, which is the device setting unless the build fixes one. The script runs in `<head>`, so there is no flash of the wrong mode. Without a saved choice, the page follows the device when it changes. Pages shown inside another page (the help widget, the Style page preview) get the default mode and no switch.

**The switch** is a real `<button>` with `aria-pressed`, a fixed name and visible label ("Dark mode"), a sun or moon on the knob, and a 36px target. The script adds it to the end of the top navigation's right-hand list, which sits in the menu at phone width. Choosing the default mode clears the saved choice, so the page goes back to following the device. The choice is kept per browser (`localStorage`), other open tabs follow it, and blocked storage keeps it until the page reloads.

**Authors' colors.** Authors pick colors on the editor's white canvas, so in dark mode their black and gray text nearly disappears and their light table fills glare. On every `.hg-article-body` (articles, category descriptions, homepage custom content; not the category tiles), the script:
- turns near-white, near-gray fills into the dark surface (class `kb-ct-fill`) and light gray borders into dark hairlines (`kb-ct-line`); colored highlights and borders keep their color;
- checks every author-colored or highlighted piece of text against what is actually behind it, and below 4.5:1 it gives black, gray or slate text the theme's own color and moves a color lighter or darker in its own hue until it reaches 4.5:1. Text on a light highlight goes dark.

Switching to light puts every author color back as written. Late content (a slide-out article, guided paths) is checked when it arrives.

**For other scripts:** a `kbtheme:change` event on `document` after every change (`event.detail.theme`, and `source`: `init`, `toggle`, `device`, `storage` or `api`), and `window.KBTheme` with `get()`, `set('light' | 'dark')` and `reset()` (forget the saved choice).

## Adopting it in a build

1. **Build the light theme with single-purpose color tokens** (CLAUDE-RULES, "Brand Color Tokens"), so dark mode can re-point them: one for links, one for body text, one for muted text, one for surfaces, one for lines. A token used for text in one place and a background in another (KnowledgeOwl's own `--white` and `--primary-color`) needs a dark rule per selector instead.
2. **Settings, if any** (below). Most builds need none.
3. **Script.** Fetch `light-dark-mode.js` (`curl -fsSL https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/process-docs/light-dark-mode/light-dark-mode.js`) and put it at the **top** of Custom `<head>` inside `<script>...</script>`, above everything else, so it runs before the page draws. Don't edit it; change behavior through the settings, and log anything that needs a code change.
4. **CSS.** Append `light-dark-mode.css` to the end of Custom CSS, after the theme layer, the accessibility layer and guided paths. Design the palette ("Designing the dark palette", below), re-point the theme layer's own tokens in the marked spot, and add the theme's own dark rules (hero, tiles, anything bespoke) at the end of the `@media screen` block, each keyed to `html[data-kb-theme="dark"]`.
5. **Logo.** If the logo doesn't read on the dark top bar, have the customer upload a version for dark backgrounds to the live KB's File Library (the user uploads; CLAUDE-RULES, "Logo & Brand Assets") and uncomment the logo rule in the CSS with its URL. It keeps the image's size, link and alt text.
6. **AI chatbot**, when the KB has it on: paste `chatbot-custom-css.css` into the chatbot's branding Custom CSS with the build's palette values, and list it under the CHANGES file's deploy steps, since it is saved in that window, not the Style page.
7. **Authors' colors.** Before the first version, count articles that set inline colors (CLAUDE-RULES, "At the Start of Each Session", step 2) and say what the script will do with them.
8. **Check it** (below), then record in the CHANGES file which toolkit commit the files came from (`git log -1 --format=%h -- process-docs/light-dark-mode`) and any settings the build uses.

### Settings

Put this block in Custom `<head>` above the script, with only the keys you need:

```html
<script>
window.KB_THEME_CONFIG = {
  defaultMode: 'dark',      // 'device' (default): follow the reader's device. 'light' or 'dark': that mode until the reader switches
  label: 'Modo oscuro',     // the switch's visible label and accessible name (default 'Dark mode')
  toggle: { into: '.hg-header .navbar-right', at: 'start' },  // where the switch goes ('end' by default); false: the build places its own
  storageKey: 'acme-theme', // the localStorage key (default 'kb-theme'); change it only to keep a key an earlier version used
  authorColors: 'always',   // 'dark' (default): fix authors' colors in dark mode only. 'always': in both modes. false: never
  frames: 'follow',         // 'base' (default): framed pages get the default mode and no switch. 'follow': as on the page
  chatbot: false            // don't copy the mode onto the AI chatbot window (default true)
};
</script>
```

`defaultMode` only chooses which design a reader sees first. The light design is always the unkeyed one, because the editor, PDFs and print get it; a dark-first brand still writes its dark design under `html[data-kb-theme="dark"]`.

**Placing the switch yourself** (in a template, the footer, or a second place): add this markup and set `toggle: false`. The script finds every `.kb-theme-toggle` and keeps `aria-pressed` in step.

```html
<button type="button" class="kb-theme-toggle" aria-pressed="false">
  <span class="kb-theme-switch" aria-hidden="true"><span class="kb-theme-knob">
    <svg class="kb-theme-sun" viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
    <svg class="kb-theme-moon" viewBox="0 0 24 24" focusable="false"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
  </span></span>
  <span class="kb-theme-label">Dark mode</span>
</button>
```

## Designing the dark palette

The `--dm-*` defaults are a neutral gray-blue that passes WCAG 2.2 AA, so nothing is unreadable while the build works. Design them for the brand, as the build designs the light theme, then measure each pair (01, "Colour math"). Off-white text on a dark gray reads better than pure white on black.

| Token | Use | Needs |
|---|---|---|
| `--dm-bg`, `--dm-surface`, `--dm-raised` | Page; top bar, table of contents and cards; inputs, menus and pop-ups | Steps far enough apart to see panels |
| `--dm-tint`, `--dm-line` | Accent-tinted surface (active row, notes); hairlines | |
| `--dm-border` | Input and button borders | 3:1 on `--dm-raised` |
| `--dm-text`, `--dm-heading`, `--dm-muted` | Body text, headings, metadata | 4.5:1 on every surface |
| `--dm-link`, `--dm-link-hover`, `--dm-link-visited` | Links | 4.5:1 on every surface, including `--dm-tint` |
| `--dm-accent` | Icons, focus rings, active markers | 3:1 on every surface |
| `--dm-button`, `--dm-button-hover`, `--dm-on-button` | Primary buttons | 4.5:1 for the text |
| `--dm-highlight` | The keyboard row in search suggestions | Visibly different from `--dm-raised`; white text 4.5:1 |
| `--dm-footer` | Footer | Its text 4.5:1 |
| `--kb-toggle-*` | The switch, in light mode | The label 4.5:1 and the border and track 3:1 on the top bar. **Set these on every build**: the defaults suit a white bar |

Brand accents that pass on white usually fail on dark: lighten them, keep the hue. The same tokens re-point the accessibility layer (`--ko-a11y-*`) and guided paths (`--gp-*`) in dark mode; check those values too when the build has them.

## Checking it

- **Before saving,** preview on the live page (05, "Preview on the live page without saving"), and turn transitions off before reading colors. Inject the script at the top of `<head>` for a true first-paint check; injected later, it can't show the flash it prevents.
- **Both modes, every page type** (06): homepage, category, article, search, glossary, contact, 404, Restricted Access, login, manage subscriptions. Run axe-core's color-contrast rule (06 §4 step 6) in dark mode as well as light, and look for panels still on a light fill: §39 of the quirks doc lists the usual ones.
- **Authors' colors** on two or three real articles with inline colors and table fills; then switch to light and check they are back as written.
- **The switch:** keyboard (Tab, then Enter and Space), `aria-pressed` changes, the choice survives a reload, a second tab follows, and choosing the default mode and reloading follows the device again. At phone width it sits in the menu.
- **Follows the device:** reload under each color scheme. The built-in browser's color-scheme emulation fires no change event, so a live device change can't be tested there.
- **Stays light:** the article editor, a PDF export, print preview, and the Style page preview.
- **AI chatbot:** open it in dark mode; text, links, the Submit button and the icons read.

## What it can't do

Tell the customer these at the start, and record them in the CHANGES file's "Not covered by this version" list.

- **Images.** Photos stay as they are; article images get a white backing so transparent diagrams stay visible, which shows as a white edge on some. Screenshots of light screens stay bright.
- **Embedded content:** PDF previews are only dimmed, and videos and other sites' embeds keep their own colors.
- **The help widget and the Style page preview** show the default mode, not the reader's choice (setting `frames: 'follow'` changes this).
- **PDFs, print and the editor** are always light, by design.
- **Authors' colors outside article bodies,** and colors set by a `<style>` block in an article (quirks §47): the script only reads inline styles.
- **The AI chatbot embedded on the customer's own site** stays light: it can't see the KB page's mode.

## History

| Toolkit version | Notes |
|---|---|
| 1.0 (2026-11-21) | First toolkit copy, from three production themes: the head script and chatbot sync of the first (October 2026), the injected switch, change event and author-color contrast check of the other two (November 2026). One attribute name (`data-kb-theme`) for every build, a configurable default mode, fills and borders handled in the script instead of by attribute-string CSS, and token re-points for the accessibility layer and guided paths added. |
