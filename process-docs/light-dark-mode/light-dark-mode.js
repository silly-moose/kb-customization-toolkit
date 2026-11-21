/* ==========================================================================
   LIGHT AND DARK MODE (KB Customization Toolkit, process-docs/light-dark-mode/)
   Goes FIRST in Custom <head>, inside <script>...</script>, so the mode is set before the page
   draws. Settings go in window.KB_THEME_CONFIG, in a <script> just above this one (README,
   "Settings"). Don't edit this file in a build; log anything that needs a code change.

   What it does:
   1. Sets data-kb-theme="light" or "dark" on <html>: the reader's saved choice, else the KB's
      default (the device setting, unless the build fixes one). Custom CSS keys every dark rule
      to that attribute, and the article editor and PDF exports never run Custom <head>, so they
      stay light.
   2. Adds a "Dark mode" switch (a button with aria-pressed) to the top navigation, unless the
      templates already have one. Choosing the default mode clears the saved choice, so the page
      goes back to following the device. Other open tabs follow; blocked storage falls back to
      the default.
   3. Copies the attribute onto the AI chatbot window (a same-site iframe), whose own Custom CSS
      keys its dark styles to it.
   4. Keeps authors' inline colors readable in dark mode: near-white fills become the dark
      surface, light gray borders become dark hairlines, and text below 4.5:1 against what is
      behind it is darkened or lightened in its own hue. Switching modes puts every author color
      back first.
   5. Fires a kbtheme:change event on document (detail: theme, source) after every change, and
      exposes window.KBTheme (get, set, reset).
   ========================================================================== */
(function () {
  'use strict';
  if (window.KBTheme) return;  /* pasted twice */

  var ATTR = 'data-kb-theme';
  var root = document.documentElement;
  var cfg = window.KB_THEME_CONFIG || {};
  var DEFAULT = cfg.defaultMode === 'light' || cfg.defaultMode === 'dark' ? cfg.defaultMode : 'device';
  var KEY = typeof cfg.storageKey === 'string' && cfg.storageKey ? cfg.storageKey : 'kb-theme';
  var FRAMES = cfg.frames === 'follow' ? 'follow' : 'base';
  var LABEL = typeof cfg.label === 'string' && cfg.label ? cfg.label : 'Dark mode';
  var TOGGLE = cfg.toggle === false ? null : {
    into: (cfg.toggle && cfg.toggle.into) || '.hg-header .navbar-right',
    at: cfg.toggle && cfg.toggle.at === 'start' ? 'start' : 'end'
  };
  var AUTHOR = cfg.authorColors === false ? false : cfg.authorColors === 'always' ? 'always' : 'dark';
  var CHATBOT = cfg.chatbot !== false;
  var MIN = 4.5;

  var framed = false;
  try { framed = window.self !== window.top; } catch (e) { framed = true; }
  var pinned = framed && FRAMES === 'base';  /* widget and Style page preview: the default mode, no switch */
  if (pinned) root.classList.add('kb-theme-framed');

  /* ---- 1. Which mode ---- */
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var memo = null;  /* the reader's choice while storage is blocked; lasts until the page is reloaded */
  function device() { return media && media.matches ? 'dark' : 'light'; }
  function base() { return DEFAULT === 'device' ? device() : DEFAULT; }
  function saved() {
    try { var v = window.localStorage.getItem(KEY); return v === 'dark' || v === 'light' ? v : null; }
    catch (e) { return memo; }
  }
  function save(theme) {  /* null clears the saved choice */
    memo = theme;
    try { if (theme) window.localStorage.setItem(KEY, theme); else window.localStorage.removeItem(KEY); }
    catch (e) { /* blocked: memo holds it */ }
  }
  function wanted() {
    if (pinned) return DEFAULT === 'dark' ? 'dark' : 'light';
    return saved() || base();
  }

  var current = null;
  function quiet() {  /* no color transitions while switching: nothing fades through a low-contrast mix */
    root.classList.add('kb-theme-switching');
    var done = function () { root.classList.remove('kb-theme-switching'); };
    if (window.requestAnimationFrame) window.requestAnimationFrame(function () { window.requestAnimationFrame(done); });
    else window.setTimeout(done, 50);
  }
  function apply(theme, source) {
    var changed = theme !== current;
    if (changed && current !== null) quiet();
    current = theme;
    root.setAttribute(ATTR, theme);
    paintToggles();
    syncChatbot();
    if (!changed) return;
    authorColors();
    try { document.dispatchEvent(new CustomEvent('kbtheme:change', { detail: { theme: theme, source: source } })); }
    catch (e) { /* no CustomEvent constructor */ }
  }
  function set(theme, source) {
    save(theme === base() ? null : theme);
    apply(theme, source);
  }

  /* ---- 2. The switch ---- */
  var SWITCH =
    '<span class="kb-theme-switch" aria-hidden="true"><span class="kb-theme-knob">' +
    '<svg class="kb-theme-sun" viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
    '<svg class="kb-theme-moon" viewBox="0 0 24 24" focusable="false"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
    '</span></span>';
  function paintToggles() {
    var buttons = document.querySelectorAll('.kb-theme-toggle');
    for (var i = 0; i < buttons.length; i++) buttons[i].setAttribute('aria-pressed', current === 'dark' ? 'true' : 'false');
  }
  function addToggle() {
    if (!TOGGLE || pinned || document.querySelector('.kb-theme-toggle')) return;
    var list = document.querySelector(TOGGLE.into);
    if (!list) return;
    var item = document.createElement(/^(UL|OL)$/.test(list.tagName) ? 'li' : 'div');
    item.className = 'kb-theme-item';
    item.innerHTML = '<button type="button" class="kb-theme-toggle" aria-pressed="false">' + SWITCH + '<span class="kb-theme-label"></span></button>';
    item.querySelector('.kb-theme-label').textContent = LABEL;
    if (TOGGLE.at === 'start') list.insertBefore(item, list.firstChild);
    else list.appendChild(item);
  }
  document.addEventListener('click', function (e) {
    var button = e.target && e.target.closest ? e.target.closest('.kb-theme-toggle') : null;
    if (!button) return;
    e.preventDefault();
    set(current === 'dark' ? 'light' : 'dark', 'toggle');
  });

  /* ---- 3. The AI chatbot window ---- */
  function syncChatbot() {
    if (!CHATBOT) return;
    var frames = document.querySelectorAll('#ko-ai-chatbot iframe');
    for (var i = 0; i < frames.length; i++) {
      try { frames[i].contentDocument.documentElement.setAttribute(ATTR, current); }
      catch (e) { /* not loaded yet, or not this site */ }
    }
  }
  /* The chatbot window loads after the page, and iframe load events don't bubble: listen in the capture phase */
  document.addEventListener('load', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IFRAME' && t.closest && t.closest('#ko-ai-chatbot')) syncChatbot();
  }, true);

  /* ---- 4. Authors' inline colors ---- */
  var BODY = '.hg-article-body';
  function parse(s) {
    var m = /rgba?\(([^)]+)\)/.exec(s || '');
    if (!m) return null;
    var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function lum(c) {
    function f(v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function ratio(x, y) { var a = lum(x), b = lum(y); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }
  function over(top, under) {
    var a = top.a;
    return { r: top.r * a + under.r * (1 - a), g: top.g * a + under.g * (1 - a), b: top.b * a + under.b * (1 - a), a: 1 };
  }
  function chroma(c) { return (Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b)) / 255; }
  function canvas() {
    var els = [document.body, root];
    for (var i = 0; i < els.length; i++) {
      var c = els[i] && parse(getComputedStyle(els[i]).backgroundColor);
      if (c && c.a >= 1) return c;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }
  function backdrop(el) {
    var layers = [], n = el;
    while (n && n.nodeType === 1) {
      var bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0) { layers.push(bg); if (bg.a >= 1) break; }
      n = n.parentElement;
    }
    var c = layers.length && layers[layers.length - 1].a >= 1 ? layers.pop() : canvas();
    for (var i = layers.length - 1; i >= 0; i--) c = over(layers[i], c);
    return c;
  }
  function toHsl(c) {
    var r = c.r / 255, g = c.g / 255, b = c.b / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    var l = (mx + mn) / 2, d = mx - mn, h = 0, s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: (h * 60 + 360) % 360, s: s, l: l };
  }
  function fromHsl(h, s, l) {
    var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    var rgb = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return { r: Math.round((rgb[0] + m) * 255), g: Math.round((rgb[1] + m) * 255), b: Math.round((rgb[2] + m) * 255), a: 1 };
  }
  function css(c) { return 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')'; }
  function mark(el) {  /* remember the author's markup once, so a mode switch can put it back */
    if (el.hasAttribute('data-kb-ct')) return false;
    el.setAttribute('data-kb-ct', el.getAttribute('style') || '');
    if (el.hasAttribute('color')) el.setAttribute('data-kb-ct-color', el.getAttribute('color'));
    if (el.hasAttribute('bgcolor')) el.setAttribute('data-kb-ct-bgcolor', el.getAttribute('bgcolor'));
    return true;
  }
  function restore() {
    var els = document.querySelectorAll('[data-kb-ct]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], s = el.getAttribute('data-kb-ct');
      if (s) el.setAttribute('style', s); else el.removeAttribute('style');
      if (el.hasAttribute('data-kb-ct-color')) el.setAttribute('color', el.getAttribute('data-kb-ct-color'));
      if (el.hasAttribute('data-kb-ct-bgcolor')) el.setAttribute('bgcolor', el.getAttribute('data-kb-ct-bgcolor'));
      el.classList.remove('kb-ct-fill', 'kb-ct-line');
      if (!el.getAttribute('class')) el.removeAttribute('class');
      el.removeAttribute('data-kb-ct');
      el.removeAttribute('data-kb-ct-color');
      el.removeAttribute('data-kb-ct-bgcolor');
      el.removeAttribute('data-kb-ct-done');
    }
  }
  /* In dark mode a near-white, near-gray fill (a table cell, a box) becomes the dark surface and a light gray
     border becomes a dark hairline; colored highlights and borders keep their color */
  function neutralLight(c, min) { return c && c.a >= 0.3 && lum(c) >= min && chroma(c) <= 0.08; }
  function fill(el) {
    if (current !== 'dark') return;
    var st = getComputedStyle(el);
    if (neutralLight(parse(st.backgroundColor), 0.7) && parse(st.backgroundColor).a >= 0.5) {
      if (el.hasAttribute('bgcolor')) el.removeAttribute('bgcolor');
      el.classList.add('kb-ct-fill');
    }
    var sides = ['Top', 'Right', 'Bottom', 'Left'];
    for (var i = 0; i < sides.length; i++) {
      if (parseFloat(st['border' + sides[i] + 'Width']) > 0 && neutralLight(parse(st['border' + sides[i] + 'Color']), 0.45)) {
        el.classList.add('kb-ct-line');
        break;
      }
    }
  }
  function text(el) {
    var fg = parse(getComputedStyle(el).color), bg = backdrop(el);
    if (!fg || fg.a === 0) return;
    if (ratio(over(fg, bg), bg) >= MIN) return;
    var hsl = toHsl(fg), colored = chroma(fg) >= 0.2;
    if (lum(bg) > 0.2) {  /* light backdrop: darken in the same hue, else black */
      if (colored) for (var d = hsl.l; d >= 0.04; d -= 0.02) {
        var k = fromHsl(hsl.h, hsl.s, d);
        if (ratio(k, bg) >= MIN) { el.style.setProperty('color', css(k), 'important'); return; }
      }
      el.style.setProperty('color', 'rgb(0, 0, 0)', 'important');
      return;
    }
    /* dark backdrop: black, gray or slate takes the theme's own text color; a color lightens in its hue */
    if (!colored) {
      el.style.removeProperty('color');
      if (el.hasAttribute('color')) el.removeAttribute('color');
      var now = parse(getComputedStyle(el).color);
      if (now && ratio(over(now, bg), bg) >= MIN) return;
    } else {
      for (var l = hsl.l; l <= 0.97; l += 0.02) {
        var c = fromHsl(hsl.h, hsl.s, l);
        if (ratio(c, bg) >= MIN) { el.style.setProperty('color', css(c), 'important'); return; }
      }
    }
    el.style.setProperty('color', 'rgb(255, 255, 255)', 'important');
  }
  function authorActive() { return AUTHOR === 'always' || (AUTHOR === 'dark' && current === 'dark'); }
  var FILLS = BODY + ' [style*="background"], ' + BODY + ' [bgcolor], ' + BODY + ' [style*="border"]';
  var TEXTS = BODY + ' [style*="color"], ' + BODY + ' font[color], ' + FILLS + ', ' +
    BODY + ' [style*="background"] *, ' + BODY + ' [bgcolor] *';
  /* The homepage wraps its category tiles in .hg-article-body too; their icon colors are set in the
     category editor (inline on the <i>), so they belong to the theme, not to an author */
  var SKIP = '.category-icon, .cat-icon-panel, .ko-homepage-top';
  function scan() {  /* fills first, so text is checked against the surface it ends up on; document order, parents first */
    if (!AUTHOR || !document.body || !authorActive()) return;
    var fills = document.querySelectorAll(FILLS);
    for (var i = 0; i < fills.length; i++) {
      if (fills[i].closest(SKIP) || !mark(fills[i])) continue;
      try { fill(fills[i]); } catch (e) { /* leave it as the author set it */ }
    }
    var texts = document.querySelectorAll(TEXTS);
    for (var j = 0; j < texts.length; j++) {
      var el = texts[j];
      if (el.hasAttribute('data-kb-ct-done') || el.closest(SKIP)) continue;
      mark(el);
      el.setAttribute('data-kb-ct-done', '');
      try { text(el); } catch (e) { /* leave it as the author set it */ }
    }
  }
  function authorColors() {
    if (!AUTHOR || !document.body) return;
    restore();
    scan();
  }
  var timer = null;
  function soon() { window.clearTimeout(timer); timer = window.setTimeout(scan, 150); }

  /* ---- Start ---- */
  apply(wanted(), 'init');
  if (media) {
    var onDevice = function () { if (DEFAULT === 'device' && !saved()) apply(wanted(), 'device'); };
    if (media.addEventListener) media.addEventListener('change', onDevice);
    else if (media.addListener) media.addListener(onDevice);
  }
  window.addEventListener('storage', function (e) { if (e.key === KEY || e.key === null) apply(wanted(), 'storage'); });
  function ready() {
    addToggle();
    paintToggles();
    syncChatbot();
    scan();
    if (AUTHOR && window.MutationObserver) new MutationObserver(soon).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();

  window.KBTheme = {
    get: function () { return current; },
    set: function (theme) { if (theme === 'light' || theme === 'dark') set(theme, 'api'); },
    reset: function () { save(null); apply(wanted(), 'api'); }
  };
})();
