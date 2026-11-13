/* KB Customization Toolkit: reader-side accessibility script (WCAG 2.2 AA).
   Source of truth: process-docs/accessibility/ in the toolkit; README.md there says how to adopt it.
   Paste it, unchanged, into a <script> at the end of Custom <head>, and keep a copy as
   a11y-script.js in the version folder.

   Fixes the reader-side problems that live in markup KnowledgeOwl renders from merge codes, which
   the Custom HTML templates cannot change: landmarks and a skip link, heading levels on the list,
   search, category, blog, contact and login pages, breadcrumb and table-of-contents semantics,
   names for icon-only controls, form labels, dialogs, the feedback message and decorative images.
   Runs once the page has parsed, then again for pieces KnowledgeOwl adds later (the AI chatbot
   launcher, the back-to-top link, tile images a snippet inserts). Every step checks that its
   element exists, so a page without it is left alone. The editor and PDFs never load Custom
   <head>, so this runs only on reader pages.

   KnowledgeOwl's own accessibility release (the Accessible theme and shared fixes for every theme)
   renders a .ko-skip-link on every page. When that link is present, the steps KnowledgeOwl now does
   itself (skip link, table-of-contents buttons, Escape on the slide-out, Space on button links,
   dialog focus, the feedback announcement) stand down, so nothing runs twice. README.md lists
   which fixes that release covers. */
(function () {
  var d = document;
  function q(s, r) { return (r || d).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function text(el) { return (el && el.textContent || '').replace(/\s+/g, ' ').trim(); }
  function relevel(el, level) {
    var n = d.createElement('h' + level);
    for (var i = 0; i < el.attributes.length; i++) n.setAttribute(el.attributes[i].name, el.attributes[i].value);
    while (el.firstChild) n.appendChild(el.firstChild);
    el.parentNode.replaceChild(n, el);
    return n;
  }
  function sr(s) { var sp = d.createElement('span'); sp.className = 'sr-only'; sp.textContent = s; return sp; }
  function uid(prefix) { uid.n = (uid.n || 0) + 1; return prefix + '-' + uid.n; }
  var live;
  function announce(msg) {
    if (!live) { live = d.createElement('div'); live.className = 'sr-only'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); d.body.appendChild(live); }
    live.textContent = '';
    setTimeout(function () { live.textContent = msg; }, 50);
  }

  function run() {
    var body = d.body;
    if (!body || body.getAttribute('data-ko-a11y') === 'done') return;
    body.setAttribute('data-ko-a11y', 'done');
    var native = !!q('.ko-skip-link');  /* KnowledgeOwl's accessibility release is live on this KB */
    var is = function (c) { return body.classList.contains(c); };
    var path = location.pathname.replace(/\/+$/, '');
    var noaccess = /\/noaccess$/.test(path);
    var login = /\/(readerlogin|singlelogin|saml-login|readerupdate)$/.test(path);

    /* Landmarks and a skip link (WCAG 1.3.1, 2.4.1) */
    var main = q('[role="main"]') || q('#ko-article-cntr') || q('.error-page-container') || q('.login-container') || q('.reader-subscriptions-container') || q('.documentation-article');
    if (main) {
      main.setAttribute('role', 'main');
      if (!main.id) main.id = 'ko-a11y-main';
      if (!native && !q('.ko-a11y-skip-link')) {
        var skip = d.createElement('a');
        skip.className = 'ko-a11y-skip-link';
        skip.href = '#' + main.id;
        skip.textContent = 'Skip to main content';
        skip.addEventListener('click', function (e) {
          e.preventDefault();
          main.setAttribute('tabindex', '-1');
          main.focus();
          main.scrollIntoView();
        });
        body.insertBefore(skip, body.firstChild);
      }
    }
    var toc = q('#ko-documentation-categories');
    if (toc) { toc.setAttribute('role', 'navigation'); if (!toc.getAttribute('aria-label')) toc.setAttribute('aria-label', 'Table of contents'); }
    var header = q('nav.hg-header');
    if (header && !header.getAttribute('aria-label')) header.setAttribute('aria-label', 'Site');
    var footer = q('.ko-site-footer');
    if (footer) footer.setAttribute('role', 'contentinfo');

    /* The logo link's image says where it goes, not "Knowledge Base Logo" (WCAG 1.1.1, 2.4.4) */
    var brand = q('a.navbar-brand'), logo = brand && q('img', brand);
    if (logo && /logo/i.test(logo.getAttribute('alt') || '')) logo.setAttribute('alt', (brand.getAttribute('title') || 'Knowledge base') + ' home');

    /* Breadcrumbs: a labelled navigation region, separators hidden from screen readers (WCAG 1.3.1) */
    var crumbs = q('ul.hg-breadcrumbs');
    if (crumbs && !crumbs.closest('nav')) {
      var nav = d.createElement('nav');
      nav.className = 'ko-a11y-breadcrumb';
      nav.setAttribute('aria-label', 'Breadcrumb');
      crumbs.parentNode.insertBefore(nav, crumbs);
      nav.appendChild(crumbs);
      qa('li', crumbs).forEach(function (li) { if (!li.querySelector('a') && li.querySelector('i')) li.setAttribute('aria-hidden', 'true'); });
    }

    /* Headings follow the page's h1 without skipping levels (WCAG 1.3.1, 2.4.6) */
    if (is('hg-home-page')) qa('h1.faq-header').forEach(function (h) { if (!text(h)) h.parentNode.removeChild(h); });
    if (is('hg-widget-page') || is('hg-search-page')) qa('h4.hg-list-title').forEach(function (h) { relevel(h, 2); });
    if (is('hg-category-page')) qa('.category-list h3.category-header').forEach(function (h) { relevel(h, 2); });  /* category tiles follow the h1 directly; quirks §42 has the stock rule that would hide them */
    if (is('hg-blog-page')) qa('.blog-article-cntr > h3').forEach(function (h) { relevel(h, 2); });  /* blog-style categories: post titles follow the h1 */
    if (is('hg-search-page')) {
      var filter = q('.category-filter-container');
      var h5 = filter && q('h5', filter);
      if (h5) { var fh = relevel(h5, 2); fh.id = fh.id || 'ko-a11y-refine-heading'; filter.setAttribute('role', 'region'); filter.setAttribute('aria-labelledby', fh.id); }
    }
    if (is('hg-contact-page') && !q('h1')) {
      var ch = q('.hg-contact-us-form h2, .hg-contact-form-container h2');
      if (ch) relevel(ch, 1);
      else if (main) { var h1 = d.createElement('h1'); h1.className = 'sr-only'; h1.textContent = 'Contact us'; main.insertBefore(h1, main.firstChild); }
    }
    if (login || noaccess) qa('.hg-site-login h3.panel-title').forEach(function (h) { relevel(h, 1); });
    if (noaccess && !/^Restricted access/.test(d.title)) d.title = 'Restricted access | ' + d.title;  /* WCAG 2.4.2: the page title named only the KB */
    qa('h1, h2, h3, h4, h5, h6').forEach(function (h) { if (!text(h) && !h.querySelector('img')) h.setAttribute('aria-hidden', 'true'); });

    /* Form labels: a label whose "for" points outside its own form group is re-pointed at the group's field (WCAG 1.3.1, 4.1.2) */
    qa('.form-group').forEach(function (g) {
      var label = q('label[for]', g), fields = qa('input:not([type=hidden]), select, textarea', g);
      if (label && fields.length === 1 && fields[0].id && label.getAttribute('for') !== fields[0].id && !g.querySelector('[id="' + label.getAttribute('for') + '"]')) label.setAttribute('for', fields[0].id);
    });

    /* role="search" belongs on the form, not the field (axe aria-allowed-role) */
    qa('input[role="search"]').forEach(function (i) { i.removeAttribute('role'); var f = i.closest('form'); if (f && f.classList.contains('hg-search-bar') && !f.getAttribute('role')) f.setAttribute('role', 'search'); });

    /* Search results sort menu: a real label (WCAG 1.3.1) */
    var sortLabel = q('#sortResultsLabel'), sortSelect = q('#ko-search-sort');
    if (sortLabel && sortSelect && sortLabel.tagName !== 'LABEL') {
      var lab = d.createElement('label');
      lab.id = sortLabel.id; lab.className = sortLabel.className; lab.htmlFor = sortSelect.id; lab.textContent = text(sortLabel);
      sortLabel.parentNode.replaceChild(lab, sortLabel);
      sortSelect.removeAttribute('aria-labelledby');
    }

    /* Dialogs: unique title ids, aria-modal, named close buttons (WCAG 4.1.2) */
    qa('.modal[role="dialog"]').forEach(function (m) {
      m.setAttribute('aria-modal', 'true');
      var t = q('.modal-title', m);
      if (t) { if (!t.id || qa('[id="' + t.id + '"]').length > 1) t.id = uid('ko-a11y-dialog-title'); m.setAttribute('aria-labelledby', t.id); }
      qa('.close', m).forEach(function (b) {
        b.removeAttribute('aria-hidden');
        if (!b.getAttribute('aria-label')) b.setAttribute('aria-label', 'Close');
        qa('*', b).forEach(function (c) { c.setAttribute('aria-hidden', 'true'); });
      });
    });
    qa('[data-toggle="modal"]').forEach(function (a) { a.setAttribute('aria-haspopup', 'dialog'); if (a.tagName === 'A') a.setAttribute('role', 'button'); });

    /* Table of contents: expand/collapse icons become buttons, the current page is marked (WCAG 2.1.1, 4.1.2).
       Only icons whose category has something inside; the rest are hidden as decoration. */
    if (toc) {
      if (!native) qa('.cat-icon', toc).forEach(function (icon) {
        var row = icon.closest('.category-link-container'), link = row && q('a', row), list = icon.closest('.nav-header');
        var sub = list && q('ul', list);
        if (!sub || !q('li', sub)) { icon.setAttribute('aria-hidden', 'true'); return; }
        var name = 'category';
        if (link) { var copy = link.cloneNode(true); qa('.badge', copy).forEach(function (b) { b.parentNode.removeChild(b); }); name = text(copy) || name; }  /* leave out the New/Updated count badge */
        icon.setAttribute('role', 'button');
        icon.setAttribute('tabindex', '0');
        icon.setAttribute('data-ko-a11y-toc', '');
        icon.removeAttribute('aria-hidden');
        if (!sub.id) sub.id = uid('ko-a11y-toc');
        icon.setAttribute('aria-controls', sub.id);
        var sync = function () {
          var open = icon.classList.contains('fa-chevron-down');
          icon.setAttribute('aria-expanded', open ? 'true' : 'false');
          icon.setAttribute('aria-label', (open ? 'Collapse ' : 'Expand ') + name);
        };
        sync();
        if (window.MutationObserver) new MutationObserver(sync).observe(icon, { attributes: true, attributeFilter: ['class'] });  /* KnowledgeOwl swaps the chevron class when it opens or closes the category */
        else icon.addEventListener('click', function () { setTimeout(sync, 300); });
      });
      qa('a[href="#"], a[href^="javascript:"]', toc).forEach(function (a) { if (!a.getAttribute('role')) a.setAttribute('role', 'button'); });
      if (!q('[aria-current]', toc)) {
        var current = q('a.article-link.active, .article-container.active > a', toc) || q('.category-link-container.active > a, li.active > .category-link-container > a', toc);
        if (current) current.setAttribute('aria-current', 'page');
      }
      qa('.badge-new, .badge-updated', toc).forEach(function (b) {
        if (text(b) && !b.getAttribute('aria-label')) b.setAttribute('aria-label', text(b) + (b.classList.contains('badge-new') ? ' new' : ' updated'));
      });
    }

    /* Table of contents toggle: state, control and Escape to close (WCAG 2.1.2, 4.1.2) */
    var toggle = q('.ko-slideout-left-toggle');
    if (toggle && toc && !native) {
      toggle.setAttribute('aria-controls', toc.id);
      var tocOpen = function () { return d.documentElement.classList.contains('slideout-open'); };
      var syncToggle = function () { toggle.setAttribute('aria-expanded', tocOpen() ? 'true' : 'false'); };
      syncToggle();
      toggle.addEventListener('click', function () { setTimeout(syncToggle, 400); });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && tocOpen() && window.matchMedia('(max-width: 991px)').matches) { toggle.click(); setTimeout(function () { toggle.focus(); syncToggle(); }, 50); }
      });
    }

    /* Article feedback: the question and its controls form a group, and the thank-you is announced (WCAG 1.3.1, 4.1.3) */
    var rating = q('.hg-rating-container');
    if (rating) {
      var rlabel = q('.hg-rating-label', rating), controls = q('.hg-ratings', rating);
      if (rlabel && controls && !controls.getAttribute('role')) { rlabel.id = rlabel.id || 'ko-a11y-rating-label'; controls.setAttribute('role', 'group'); controls.setAttribute('aria-labelledby', rlabel.id); }
      if (!native) qa('a', rating).forEach(function (a) {
        a.addEventListener('click', function () { setTimeout(function () { var ok = q('.hg-rating-success'); if (ok) announce(text(ok) || 'Thank you for your feedback'); }, 150); });
      });
    }

    /* Section links in article headings: focusable, named, shown on focus (WCAG 2.1.1, 2.4.4) */
    qa('a.ko-anchor-icon').forEach(function (a) {
      var h = a.closest('h1, h2, h3, h4, h5, h6');
      if (!a.getAttribute('href') && h && h.id) a.setAttribute('href', '#' + h.id);
      if (h && !a.getAttribute('aria-label')) a.setAttribute('aria-label', 'Link to this section: ' + text(h).replace(/#$/, '').trim());
    });

    /* Links that act as buttons (WCAG 4.1.2) */
    qa('a[href="#"], a[href^="javascript:"]').forEach(function (a) {
      if (a.closest('.ko-editor-bar, .author-bar')) return;
      if (!a.getAttribute('role')) a.setAttribute('role', 'button');
    });

    /* Search results pager: named arrows inside a navigation region (WCAG 1.3.1, 2.4.4) */
    var pager = q('.ko-search-pager');
    if (pager) {
      if (!pager.getAttribute('role')) { pager.setAttribute('role', 'navigation'); pager.setAttribute('aria-label', 'Search results pages'); }
      var items = qa('li', pager);
      if (items.length > 1) {
        var first = q('a', items[0]), last = q('a', items[items.length - 1]);
        if (first && !text(first) && !first.getAttribute('aria-label')) first.setAttribute('aria-label', 'Previous page');
        if (last && !text(last) && !last.getAttribute('aria-label')) last.setAttribute('aria-label', 'Next page');
      }
      var cur = q('li.current a', pager); if (cur) cur.setAttribute('aria-current', 'page');
    }

    /* "See more..." links say what they lead to (WCAG 2.4.4) */
    qa('.list-action a').forEach(function (a) {
      var col = a.closest('.col-md-4, .col-sm-6, .col-md-6, div'), hd = col && q('h2, h3', col);
      if (hd && !a.getAttribute('aria-label')) a.setAttribute('aria-label', text(a).replace(/\.+$/, '') + ': ' + text(hd));
    });

    /* Article list dates say what was updated (WCAG 2.4.4) */
    qa('.hg-article-info').forEach(function (info) { if (/^Last Updated/i.test(text(info))) info.insertBefore(sr('Article '), info.firstChild); });

    /* Decorative images (WCAG 1.1.1). Images inside article text are left for the author's alt text. */
    qa('img:not([alt])').forEach(function (im) { if (!im.closest('.hg-article-body') || im.closest('.category-list, .homepage-widgets, .ko-site-footer, .cat-icons-wrapper')) im.setAttribute('alt', ''); });

    /* Keyboard: Space activates links given the button role; Enter and Space work on the table-of-contents icons (WCAG 2.1.1) */
    d.addEventListener('keydown', function (e) {
      var t = e.target;
      if (!t || !t.getAttribute) return;
      var isSpace = e.key === ' ' || e.key === 'Spacebar';
      if (!native && isSpace && t.tagName === 'A' && t.getAttribute('role') === 'button') { e.preventDefault(); t.click(); }
      if ((e.key === 'Enter' || isSpace) && t.hasAttribute('data-ko-a11y-toc')) { e.preventDefault(); t.click(); }
    });

    /* Dialog focus: focus moves into a dialog when it opens and back to its opener when it closes (WCAG 2.4.3) */
    if (window.jQuery && !native) {
      var $ = window.jQuery, opener = null;
      $(d).on('click', '[data-toggle="modal"]', function () { opener = this; });
      $(d).on('shown.bs.modal', '.modal', function () {
        this.removeAttribute('aria-hidden');
        var f = q('input:not([type=hidden]):not([disabled]), select, textarea, button:not(.close), a[href]', this);
        (f || this).focus();
      });
      $(d).on('hidden.bs.modal', '.modal', function () {
        this.setAttribute('aria-hidden', 'true');
        if (opener && d.contains(opener)) opener.focus();
      });
    }

    late();
  }

  /* Pieces KnowledgeOwl adds after the page loads, and names for icon-only controls (WCAG 1.1.1, 4.1.2) */
  function late() {
    var chat = q('#ko-ai-chatbot-btn');
    if (chat && !chat.getAttribute('aria-label')) {  /* KnowledgeOwl hides the button's text below 480px, which leaves it nameless */
      chat.setAttribute('aria-label', text(chat) || 'Ask the AI chatbot');
      chat.setAttribute('aria-haspopup', 'dialog');
    }
    qa('.back-to-top').forEach(function (b) {
      if (!b.getAttribute('aria-label') && !text(b)) b.setAttribute('aria-label', 'Back to top');
      if (b.getAttribute('href') === '#' && !b.getAttribute('role')) b.setAttribute('role', 'button');
    });
    qa('.category-list img:not([alt]), .cat-icons-wrapper img:not([alt]), .homepage-widgets img:not([alt])').forEach(function (im) { im.setAttribute('alt', ''); });  /* tile images a homepage snippet adds after the first pass */
    qa('i.fa, i.fas, i.far, i.fal, i.fad, i[class*="fa-"]').forEach(function (i) {
      if (i.closest('#ko-documentation-categories') && i.classList.contains('cat-icon')) return;
      if (!i.getAttribute('role') && !i.getAttribute('aria-label')) i.setAttribute('aria-hidden', 'true');
    });
    qa('a, button').forEach(function (a) {
      if (a.getAttribute('aria-label') || a.getAttribute('aria-labelledby') || text(a) || a.querySelector('img[alt]:not([alt=""])')) return;
      var name = a.getAttribute('title') || a.getAttribute('name');
      if (name) a.setAttribute('aria-label', name);
    });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', function () { late(); setTimeout(late, 1500); setTimeout(late, 4000); });
  if (window.MutationObserver) {
    var pending = null;
    new MutationObserver(function () { if (pending) return; pending = setTimeout(function () { pending = null; late(); }, 300); }).observe(d.documentElement, { childList: true, subtree: true });
  }
})();
