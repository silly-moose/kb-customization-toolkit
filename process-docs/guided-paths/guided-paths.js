/* KB Customization Toolkit: guided paths script (decision trees).
   Source of truth: process-docs/guided-paths/ in the toolkit; README.md there says how to adopt it.
   Paste it, unchanged, into a <script> at the end of Custom <head> (after the optional
   window.GP_CONFIG block), and keep a copy as guided-paths.js in the version folder. Styles are in
   guided-paths.css.

   Turns an ordinary article into a step-by-step guided path when the page loads. Authors write each
   step as a Heading 2 ("Action:", "Decision:", "Judgement:"), a decision's options as bullets
   ("answer → step name"), and a few keyword lines ("Confirm:", "End:", "Escalate:", "Go to:").
   Readers get one step at a time with progress, Back and Next, and a button per option, or every
   step on one page. Authors also get a Path check panel that names any problem; a path with a
   problem stays a normal article. The editor, search, PDFs and readers without JavaScript always
   see the plain article.

   Three parts, in order:
   1. CONFIG AND STRINGS: reads window.GP_CONFIG and picks the reader-facing labels for the KB's
      language (<html lang>: English, German or Spanish; any other language gets English).
   2. BRIDGE: marks the article body as a guided path (class gp-guided-path) when the article has
      the guided-path tag or, with activate 'auto' (the default), two or more step headings.
   3. ENGINE: parses the marked article, checks it, and renders the guided view. */

/* ---------- 1. CONFIG AND STRINGS ---------- */
(function () {
  var cfg = window.GP_CONFIG || {};
  var TABLE = {
    en: { modeGuided: '▶ Step by step', modeAll: '☰ All steps', progress: 'Progress', back: '← Back',
          next: 'Next →', markComplete: 'Mark complete ✓', completeTitle: 'Path complete',
          completeBody: 'All {n} steps done.', restart: 'Start again', counter: 'Step {a} of {b}',
          stepChip: 'Step {n}', escalationLabel: 'Escalation note', badgeLabel: 'Guided path',
          continueLabel: 'Continues at',
          typeLabels: { action: 'Action', decision: 'Decision', judgement: 'Judgement' } },
    de: { modeGuided: '▶ Schritt für Schritt', modeAll: '☰ Alle Schritte', progress: 'Fortschritt', back: '← Zurück',
          next: 'Weiter →', markComplete: 'Abschließen ✓', completeTitle: 'Pfad abgeschlossen',
          completeBody: 'Alle {n} Schritte erledigt.', restart: 'Neu starten', counter: 'Schritt {a} von {b}',
          stepChip: 'Schritt {n}', escalationLabel: 'Eskalationshinweis', badgeLabel: 'Geführter Pfad',
          continueLabel: 'Weiter bei',
          typeLabels: { action: 'Aktion', decision: 'Entscheidung', judgement: 'Ermessen' } },
    es: { modeGuided: '▶ Paso a paso', modeAll: '☰ Todos los pasos', progress: 'Progreso', back: '← Atrás',
          next: 'Siguiente →', markComplete: 'Marcar como completado ✓', completeTitle: 'Ruta completada',
          completeBody: 'Los {n} pasos están completados.', restart: 'Empezar de nuevo', counter: 'Paso {a} de {b}',
          stepChip: 'Paso {n}', escalationLabel: 'Nota de escalado', badgeLabel: 'Ruta guiada',
          continueLabel: 'Continúa en',
          typeLabels: { action: 'Acción', decision: 'Decisión', judgement: 'Criterio' } }
  };
  var lang = String(cfg.lang || document.documentElement.getAttribute('lang') || 'en').slice(0, 2).toLowerCase();
  if (!TABLE[lang]) lang = 'en';
  var str = {}, k, j;
  for (k in TABLE[lang]) str[k] = TABLE[lang][k];
  var extra = cfg.strings || {};
  for (k in extra) {
    if (k === 'typeLabels' && extra[k] && typeof extra[k] === 'object') {
      var t = {};
      for (j in str.typeLabels) t[j] = str.typeLabels[j];
      for (j in extra[k]) t[j] = extra[k][j];
      str.typeLabels = t;
    } else {
      str[k] = extra[k];
    }
  }
  var tag = String(cfg.tag || 'guided-path');
  function normTag(s) { return String(s).toLowerCase().replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, ''); }
  window.GuidedPaths = {
    lang: lang,
    strings: str,
    activate: cfg.activate === 'tag' ? 'tag' : 'auto',
    tag: tag,
    logEvents: !!cfg.logEvents,
    /* The article's tags, read from the Article template's hidden .gp-article-tags span (README,
       "Template edit") or from a visible tag list a theme already shows. */
    hasTag: function () {
      var want = normTag(tag);
      var els = document.querySelectorAll('.gp-article-tags, .hg-article-tags a, .article-tags a');
      for (var i = 0; i < els.length; i++) {
        var parts = els[i].textContent.split(',');
        for (var n = 0; n < parts.length; n++) if (normTag(parts[n]) === want) return true;
      }
      return false;
    }
  };
})();

/* ---------- 2. BRIDGE ---------- */
(function () {
  var KW = /^\s*(action|aktion|acci[oó]n|decision|entscheidung|decisi[oó]n|judgement|judgment|ermessen|criterio|juicio)\s*:/i;
  function bridge() {
    var GP = window.GuidedPaths;
    var body = document.querySelector('.hg-article-page:not(.hg-category-page) .hg-article-body') ||
               document.querySelector('.hg-article-body');
    if (!GP || !body || body.classList.contains('gp-guided-path')) return;
    var on = GP.hasTag();
    if (!on && GP.activate === 'auto') {
      var n = 0, hs = body.querySelectorAll('h2');
      for (var j = 0; j < hs.length; j++) if (KW.test(hs[j].textContent)) n++;
      on = n >= 2;
    }
    if (on) body.classList.add('gp-guided-path');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bridge); else bridge();
})();

/* ---------- 3. ENGINE ---------- */
(function () {
  /* ---- UI strings (English defaults; part 1 replaces the reader-facing ones for the KB's
     language and GP_CONFIG.strings) + parse keywords (English, German and Spanish all accepted) ---- */
  var S = {
    modeGuided: '▶ Step by step',
    modeAll: '☰ All steps',
    progress: 'Progress',
    back: '← Back',
    next: 'Next →',
    markComplete: 'Mark complete ✓',
    completeTitle: 'Path complete',
    completeBody: 'All {n} steps done.',
    restart: 'Start again',
    counter: 'Step {a} of {b}',
    stepChip: 'Step {n}',
    escalationLabel: 'Escalation note',
    typeLabels: { action: 'Action', decision: 'Decision', judgement: 'Judgement' },
    warnTitle: 'Guided path not activated: the article is shown as a normal page. Fix and re-save:',
    /* v34 - author PATH CHECK panel strings (authors only; readers never see the panel) */
    pcSumOk: '✓ Path check · {steps} steps · {branches} branch choices · {endings} endings · no issues',
    pcSumWarn: '⚠ Path check · the path renders · {n} warning(s) to review',
    pcSumErr: '✗ Path check · {n} problem(s). Guided mode is OFF; readers see a normal article',
    pcWarnIntro: 'Warnings: the path renders, but check these:',
    pcMapTitle: 'Step map (what the engine sees):',
    pcMissing: 'no step has the anchor "#{id}"',
    /* Two duplicate-id warnings - which one fires depends on whether an OPTION LINK actually
       points at the duplicated id. Options that name their step resolve by index (v42) and are
       genuinely unaffected; an option LINKED to the id still resolves through idToIndex
       (last-wins by design) and really can land readers on the wrong step. Saying "does not
       affect readers" in that case would be a false reassurance in the one panel built to catch it. */
    pcDupId: 'Steps {a} and {b} have the same hidden step id (#{id}). This normally happens when one step is copied from another. It does not affect readers: the path navigates correctly. The only consequence is reporting, which would count the two steps as one. To separate them, remove or change the id on one of the two headings in Code View; any heading without an id is given a fresh one automatically.',
    pcDupIdLinked: 'Steps {a} and {b} have the same hidden step id (#{id}), and an option LINKS to that id, so readers are sent to step {b}, which may be the wrong one. This normally happens when one step is copied from another. Fix: in Code View, delete id="{id}" from step {b}\'s heading (the copy). The link then reliably reaches step {a}, and step {b} is given a fresh id automatically. Do not remove it from step {a} instead: readers would still land on step {b} and this warning would disappear.',
    pcUnreachable: 'Step {n} "{title}" can never be reached in guided mode (no branch or "Next" leads to it).',
    pcChipGate: 'gate-check',
    pcChipEnd: 'ending',
    pcChipEsc: 'escalation',
    pcChipUnreachable: 'unreachable',
    pcFoot: 'Only authors see this panel; readers never do. It appears on the article page (preview or published), not inside the editor.',
    untaggedTitle: 'This looks like a guided path, but it isn\'t tagged',
    untaggedBody: 'The article has guided-path structure but no "{tag}" tag, so it renders as a normal article. Add the tag {tag} in the editor\'s Tags field and re-save to activate the step-by-step experience.',
    untaggedTitleAuto: 'This looks like a guided path, but it isn\'t one yet',
    untaggedBodyAuto: 'The article has a step heading, so it looks like a guided path, but it renders as a normal article until it has at least two Heading 2s that start with Action:, Decision: or Judgement:.',
    /* v36 - Phase 1 strings */
    badgeLabel: 'Guided path',
    pcByName: '(matched by name)',
    pcMissingName: 'no step is named "{name}"',
    pcAmbiguousName: 'more than one step is named "{name}". Rename one, or link the option to the right step',
    errNoName: 'Step "{step}": option "{label}" doesn\'t match any step. Type the step\'s name exactly (or "option → step name"), or link the option to the step.',
    errAmbiguousName: 'Step "{step}": option "{label}" matches more than one step named "{name}". Rename one of those steps, or link the option to the right one.',
    errDecisionNoList: 'Step "{step}" is marked Decision but has no options list (a bulleted list under the heading, each item a step name, "option → step name", or a link to a step).',
    /* v43 (Phase 1.6) - "Go to: <step name>" */
    pcChipGoto: 'continues at step {n}',
    continueLabel: 'Continues at',
    pcGotoExtra: 'Step "{step}" has more than one "Go to:" line; only the first is used. Delete the others.',
    pcNoEnding: 'No step finishes this path: every route continues somewhere else, so readers can never reach "Mark complete" (and the path would report 0% completion). Add an "End:" line to whichever step should finish, or remove the "Go to:" line from the last step, which finishes the path by default.',
    errGotoNoName: 'Step "{step}": "Go to: {name}" doesn\'t match any step. Type the step\'s name exactly as it appears in its heading (without the "Action:"/"Decision:"/"Judgement:" word).',
    errGotoAmbiguous: 'Step "{step}": "Go to: {name}" matches more than one step named "{name}". Rename one of those steps so the two can be told apart.',
    errGotoOnDecision: 'Step "{step}" has both a list of options and a "Go to:" line. The options already say where each answer leads, so delete the "Go to:" line.',
    errGotoAndEnd: 'Step "{step}" has both an "End:" line and a "Go to:" line, so it can\'t both finish the path and carry on. Keep "End:" to finish here, or "Go to:" to continue, not both.',
    errGotoSelf: 'Step "{step}" has a "Go to:" line naming itself, so Next would never move on. Name a different step.'
  };
  /* Reader-facing strings follow the KB language and GP_CONFIG.strings (part 1).
     Author-facing panel and error strings above stay English on purpose. */
  (function () {
    var L = window.GuidedPaths && window.GuidedPaths.strings;
    if (L) for (var k in L) S[k] = L[k];
  })();
  var KEYWORDS = {
    action: ['action', 'aktion', 'acción', 'accion'],                 /* v47: + Spanish */
    decision: ['decision', 'entscheidung', 'decisión'],
    judgement: ['judgement', 'judgment', 'ermessen', 'criterio', 'juicio']
  };
  /* v36 (Phase 1.1): callout TEXT conventions - a paragraph starting "Keyword:" is the
     no-code twin of the v23 `.gp-callout-*` divs (which keep working; both forms parse). */
  var CALLOUT_KEYWORDS = {
    confirm:    ['confirm', 'bestätigen', 'bestaetigen', 'confirmar'],          /* v47: + Spanish */
    end:        ['end', 'ende', 'fin', 'final'],
    escalation: ['escalate', 'escalation', 'eskalieren', 'eskalation', 'escalar', 'escalada'],
    /* v43 (Phase 1.6) - "Go to: <step name>": where a step CONTINUES. Without it, a
       non-decision step's Next always falls through to the FOLLOWING step, so when two
       branches rejoin a shared later step only the LAST branch rejoins naturally and every
       earlier one falls into the next branch's step. Deliberately NOT including a bare
       "Continue:" - a one-word keyword that plausibly opens ordinary prose ("Continue:
       monitoring the account") would hijack content and fail-soft the article. "Go to:" is
       unambiguous as a leading keyword. */
    goto:       ['go to', 'weiter zu', 'gehe zu', 'ir a']
  };
  /* v36 (Phase 1.3): a preamble paragraph with exactly this text (±colon) + the list after
     it become the "Before you start" box. */
  /* v53: + "Bevor du startest" and other wordings authors actually use */
  var BEFORE_LABELS = ['before you start', 'before you begin', 'bevor sie beginnen', 'bevor du beginnst', 'bevor du startest', 'bevor sie starten', 'bevor du anfängst', 'bevor sie anfangen', 'vor dem start', 'antes de empezar', 'antes de comenzar'];

  function fmt(s, map) { return s.replace(/\{(\w+)\}/g, function (_, k) { return map[k]; }); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function headingText(h) {
    var c = h.cloneNode(true);
    var icons = c.querySelectorAll('.ko-anchor-icon');
    for (var i = 0; i < icons.length; i++) icons[i].parentNode.removeChild(icons[i]);
    return c.textContent.trim();
  }
  /* v36 - normalized step-name key for branch-by-title matching */
  function normName(s) { return s.toLowerCase().replace(/\s+/g, ' ').trim(); }
  /* v57: the id (and so the analytics step_id) of a step heading that has NO id of its own,
     built from the step's NAME: the heading text without its Action:/Decision:/Judgement: word,
     lower-cased, umlauts and sharp s spelled out (ae, oe, ue, ss), other accents dropped, every
     run of other characters turned into one hyphen, at most 80 characters, and -2, -3 ... added
     when the page already uses that id. Before v57 such headings got "gp-step-" + position, so
     inserting, deleting or moving one step renumbered every later step's step_id, and the reports
     mixed different steps under one id. KO's editor saves typed headings without ids, so that was
     most authored paths. Now only renaming a step starts its own history over. Headings that
     already carry an id (the template's) keep it. A name with no letters or digits falls back
     to the old positional id. */
  function stepIdFromName(name) {
    var s = String(name || '').toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
    if (s.normalize) s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (s.length > 80) s = s.slice(0, 80).replace(/-+$/, '');
    if (!s) return '';
    var id = s, n = 2;
    while (document.getElementById(id)) { id = s + '-' + n; n++; }
    return id;
  }
  /* v43 - the shape of a callout keyword line: ONE word ("End:", "Confirm:") or TWO
     ("Go to:"). The optional second word can only ever win when a LISTED keyword uses one,
     because the captured prefix is matched against CALLOUT_KEYWORDS - so ordinary prose like
     "Note to: self" or "End of story: it worked" still parses as plain content, exactly as
     before. KW_STRIP_RE mirrors it; the two MUST stay in lockstep, or a keyword that matches
     would not be stripped and would render its own keyword back to the reader. */
  var KW_RE       = /^([A-Za-zÄÖÜäöüßÁÉÍÓÚÑáéíóúñ]+(?:\s+[A-Za-zÄÖÜäöüßÁÉÍÓÚÑáéíóúñ]+)?)\s*:\s*([\s\S]*)$/;
  var KW_STRIP_RE = /^\s*[A-Za-zÄÖÜäöüßÁÉÍÓÚÑáéíóúñ]+(?:\s+[A-Za-zÄÖÜäöüßÁÉÍÓÚÑáéíóúñ]+)?\s*:\s*/;
  /* v36 - find a callout in EITHER form among a step's nodes (read-only; both passes use it):
     the v23 `.gp-callout-{kind}` div, or a v36 paragraph starting with a CALLOUT_KEYWORDS word +
     colon. Returns [{node, text, isKeywordP}] in document order per node scanned. */
  function findCallouts(nodes, kind) {
    var out = [], sel = '.gp-callout-' + kind, kws = CALLOUT_KEYWORDS[kind];
    function kwText(p) {
      var m = p.textContent.trim().match(KW_RE);
      return (m && kws.indexOf(normName(m[1])) !== -1) ? m[2].trim() : null;
    }
    function consider(n) {
      if (n.matches && n.matches(sel)) { out.push({ node: n, text: n.textContent.trim(), isKeywordP: false }); return; }
      if (n.tagName === 'P') { var t = kwText(n); if (t !== null) out.push({ node: n, text: t, isKeywordP: true }); }
    }
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.nodeType !== 1) continue;
      consider(n);
      var inner = n.querySelectorAll ? n.querySelectorAll(sel + ', p') : [];
      for (var j = 0; j < inner.length; j++) consider(inner[j]);
    }
    return out;
  }
  /* v36 - remove the leading "Keyword:" from a keyword paragraph, preserving inline markup */
  function stripLeadKeyword(elm) {
    var w = document.createTreeWalker(elm, NodeFilter.SHOW_TEXT, null, false), t;
    while ((t = w.nextNode())) {
      if (/\S/.test(t.nodeValue)) {
        t.nodeValue = t.nodeValue.replace(KW_STRIP_RE, '');
        break;
      }
    }
  }

  function enhanceGP() {
    var root = document.getElementById('gp-root');
    /* v36 (Phase 1.4): tagged articles no longer need a #gp-root in the body - when the
       guided-path class is present (via the tag bridge) but the legacy root is absent,
       SYNTHESIZE the root and move the article body's children into it, so every existing
       `#gp-root`-scoped style and the rest of the engine work unchanged. Without JS
       (editor / PDF / search) the article stays a plain linear page, exactly as before. */
    if (!root) {
      var host = document.querySelector('.hg-article-body.gp-guided-path');
      if (!host || host.dataset.gpRootless || !host.querySelector('h2')) return;
      host.dataset.gpRootless = '1';
      root = document.createElement('div');
      root.id = 'gp-root';
      while (host.firstChild) root.appendChild(host.firstChild);
      host.appendChild(root);
    }
    if (!root.closest('.gp-guided-path') || root.dataset.gpEnhanced) return;
    if (!root.querySelector('h2')) return;              /* legacy config root (empty) - its own script owns it */
    if (root.querySelector('.gp-mode-toggle')) return;  /* an engine UI is already rendered */
    root.dataset.gpEnhanced = '1';

    /* v36 (Phase 1.3): the in-body <h1> is now optional - KO's native article title serves */
    var h1 = root.querySelector('h1');
    var nativeTitle = document.querySelector('.hg-article-title');
    var kbArticle = h1 ? headingText(h1)
      : (nativeTitle ? nativeTitle.textContent.trim() : document.title);
    var guideId = root.getAttribute('data-guide-id') ||
      (location.pathname.split('/').filter(Boolean).pop() || 'guided-path');
    /* Analytics transport: Google Tag Manager present → a plain dataLayer push (no gtag timing
       race, and GTM triggers can see it); else gtag() if present. Every event is also dispatched
       as a 'guidedpath:event' DOM event ({ detail: { name, params } }) for any other tool, and
       logged to the console when GP_CONFIG.logEvents is true. Common params are merged first so
       a per-event param can override them. */
    function track(name, params) {
      try {
        var p = { kb_article: kbArticle, kb_content_type: 'guided_path', guide_id: guideId }, k;
        for (k in params) p[k] = params[k];
        for (k in p) if (typeof p[k] === 'string' && p[k].length > 100) p[k] = p[k].slice(0, 100);
        if (window.GuidedPaths && window.GuidedPaths.logEvents) { try { console.info('[guided path event] ' + name, p); } catch (x) {} }
        try { document.dispatchEvent(new CustomEvent('guidedpath:event', { detail: { name: name, params: p } })); } catch (x) {}
        if (document.querySelector('script[src*="googletagmanager.com/gtm.js"]')) {
          window.dataLayer = window.dataLayer || [];
          var row = { event: name };
          for (k in p) row[k] = p[k];
          window.dataLayer.push(row);
        } else if (typeof gtag === 'function') {
          gtag('event', name, p);
        }
      } catch (e) {}
    }

    /* ---------- PASS 1: read-only parse + validation (fail-soft) ---------- */
    function isPostamble(n) {
      return n.nodeType === 1 && (n.classList.contains('gp-related') || n.classList.contains('gp-footer'));
    }
    var headings = [];
    var hs = root.querySelectorAll('h2');
    for (var i = 0; i < hs.length; i++) headings.push(hs[i]);

    /* v42: null-prototype maps. With a plain {} the `in` / truthiness probes below inherit
       Object.prototype, so a heading anchored "#constructor" or a step titled "Constructor"
       reads as ALREADY PRESENT (and `titleToIndexes['constructor']` returns a FUNCTION, whose
       .indexOf throws) - killing the engine mid-parse with no fail-soft. */
    var steps = [], idToIndex = Object.create(null), errors = [];
    headings.forEach(function (h, i) {
      var raw = headingText(h), type = null, title = raw;
      var m = raw.match(/^([A-Za-zÄÖÜäöüßÁÉÍÓÚÑáéíóúñ]+)\s*:\s*(.+)$/);
      if (m) {
        var kw = m[1].toLowerCase();
        for (var t in KEYWORDS) {
          if (KEYWORDS[t].indexOf(kw) !== -1) { type = t; title = m[2].trim(); break; }
        }
      }
      if (!h.id) h.id = stepIdFromName(title) || ('gp-step-' + (i + 1));   /* v57: by name, not position */
      var body = [], n = h.nextSibling;
      while (n && !(n.nodeType === 1 && n.tagName === 'H2') && !isPostamble(n)) {
        body.push(n); n = n.nextSibling;
      }
      steps.push({ id: h.id, index: i, heading: h, explicitType: type, title: title, bodyNodes: body,
                   choices: null, branchList: null, gate: null, isEnd: false, endText: null,
                   /* v43: set only when a valid "Go to: <step name>" resolves - `undefined`
                      means "Next falls through to the following step" (the pre-v43 behaviour). */
                   gotoIndex: undefined, gotoNode: null, gotoName: null, continueStatic: null });
      /* LAST-wins, deliberately unchanged (v42): only ANCHOR-link options read this map, and for a
         duplicated id the author's intent is unknowable - re-picking the other one would silently
         re-point already-published paths rather than fix anything. The residual risk (a link into a
         duplicated id lands on the later step) is reported to the author by S.pcDupIdLinked. */
      idToIndex[h.id] = i;
    });

    /* v36 (Phase 1.2): step-name index - options can name their target step instead of
       linking to its anchor. Both the displayed title ("Re-bill from actual readings") and
       the raw heading ("Action: Re-bill from actual readings") are accepted names. */
    var titleToIndexes = Object.create(null);
    steps.forEach(function (s, ti) {
      [s.title, headingText(s.heading)].forEach(function (t) {
        var k = normName(t);
        if (!titleToIndexes[k]) titleToIndexes[k] = [];
        if (titleToIndexes[k].indexOf(ti) === -1) titleToIndexes[k].push(ti);
      });
    });

    steps.forEach(function (s) {
      /* branch list:
         - ANY step: the first <ul> whose EVERY <li> holds an in-page anchor link (the v23
           rule, unchanged - this is what auto-detects legacy decisions);
         - a step explicitly marked "Decision:" (v36): its first <ul> is the options list
           even with plain-text items. Each item resolves by its anchor link if it has one,
           else by step NAME - "option label → step name" (also "->", and "-->", "=>" or a dash
           the editor autocorrected, so a typed long arrow leaves no stray hyphen), or just the name.
           Plain-text lists on non-Decision steps stay ordinary content (no false positives). */
      for (var b = 0; b < s.bodyNodes.length; b++) {
        var node = s.bodyNodes[b];
        if (node.nodeType !== 1 || node.tagName !== 'UL') continue;
        var items = [], allAnchors = node.children.length > 0, validLis = node.children.length > 0;
        for (var c = 0; c < node.children.length; c++) {
          var liEl = node.children[c];
          if (liEl.tagName !== 'LI') { validLis = false; break; }
          var a = liEl.querySelector('a[href^="#"]');
          if (!a) allAnchors = false;
          items.push({ li: liEl, a: a });
        }
        if (!validLis) continue;
        if (!(allAnchors || s.explicitType === 'decision')) continue;
        s.branchList = node;
        /* v42 - THE INVARIANT: a choice's destination is a step INDEX (ch.targetIndex),
           resolved ONCE here and never re-derived. A resolved choice carries no destination
           STRING at all, so no later code can re-resolve it (and get a different answer).
           `undefined` = unresolved; every consumer tests `typeof ch.targetIndex === 'number'`
           - NEVER truthiness (index 0 is falsy) and never `!== null` (undefined would pass).
           Why: before v42 the by-name branch resolved to the exact index and then threw it
           away, storing steps[hits[0]].id and re-resolving through idToIndex at click time.
           Two steps sharing an id (the natural result of copying a step block in the editor)
           collapsed both branches onto whichever came LAST. */
        s.choices = items.map(function (it) {
          if (it.a) {
            /* anchor link (pre-v36 form): the <a> genuinely only carries a string, so this is
               the one place an id is still looked up. decodeURIComponent throws URIError on a
               stray '%' (e.g. href="#50%") - that must not escape .map() and kill the engine
               mid-parse, so fall back to the raw href and let validation report it. */
            var raw = it.a.getAttribute('href').slice(1), tid;
            try { tid = decodeURIComponent(raw); } catch (e) { tid = raw; }
            return { label: it.a.textContent.trim(), rawHref: tid, targetIndex: idToIndex[tid] };
          }
          var txt = it.li.textContent.trim(), label = txt, name = txt;
          var parts = txt.split(/\s*(?:→|[-–—=]+>)\s*/);
          if (parts.length > 1) { label = parts[0].trim(); name = parts[parts.length - 1].trim(); }
          var hits = titleToIndexes[normName(name)] || [];
          if (hits.length === 1) {
            return { label: label, targetIndex: hits[0], byName: true, name: name, nameHits: 1 };
          }
          return { label: label, targetIndex: undefined, byName: true, name: name,
                   nameHits: hits.length };
        });
        break;
      }
      s.type = s.explicitType || (s.choices ? 'decision' : 'action');
      if (s.choices) {
        s.choices.forEach(function (ch) {
          if (typeof ch.targetIndex === 'number') return;
          if (ch.byName) {
            errors.push(fmt(ch.nameHits > 1 ? S.errAmbiguousName : S.errNoName,
                            { step: s.title, label: ch.label, name: ch.name }));
          } else {
            errors.push('Step "' + s.title + '": branch "' + ch.label + '" links to missing step anchor "#' + ch.rawHref + '".');
          }
        });
      }
      if (s.explicitType === 'decision' && !s.choices) {
        errors.push(fmt(S.errDecisionNoList, { step: s.title }));
      }
    });
    if (!steps.length) errors.push('No steps found (no Heading 2s).');

    /* ---------- PATH CHECK (v34): read-only analysis for the author panel ---------- */
    /* Everything here inspects bodyNodes BEFORE Pass 2 moves them - no mutation. */
    function findInNodes(nodes, sel) {
      var found = [];
      for (var fi = 0; fi < nodes.length; fi++) {
        var n = nodes[fi];
        if (n.nodeType !== 1) continue;
        if (n.matches && n.matches(sel)) found.push(n);
        var inner = n.querySelectorAll ? n.querySelectorAll(sel) : [];
        for (var fj = 0; fj < inner.length; fj++) found.push(inner[fj]);
      }
      return found;
    }
    var warnings = [];
    steps.forEach(function (s) {
      /* v36: callouts in EITHER form (v23 .gp-callout-* divs OR v36 "Keyword:" paragraphs).
         The node lists are reused by Pass 2 (node identity survives the move into bodyEl). */
      s.pcConfirms = findCallouts(s.bodyNodes, 'confirm');
      s.pcEnds     = findCallouts(s.bodyNodes, 'end');
      s.pcEscs     = findCallouts(s.bodyNodes, 'escalation');
      s.pcGotos    = findCallouts(s.bodyNodes, 'goto');
      s.pcGate = s.pcConfirms.length > 0;
      s.pcEnd  = s.pcEnds.length > 0;
      s.pcEsc  = s.pcEscs.length;

      /* v43 (Phase 1.6): "Go to: <step name>" - resolve it to an INDEX here, the same way and
         with the same machinery as a Decision's by-name options (v42), so `s.gotoIndex` obeys
         the same invariant: resolved once, never re-derived. Errors land in the same fail-soft
         `errors[]` the panel already renders, so a mistyped step name leaves a readable linear
         article plus a named fix - never a silent mis-route.
         A LINKED form ("Go to: <a href="#x">The taste test</a>") needs no extra code: the link
         TEXT is the step name, so it resolves by name and degrades gracefully. */
      if (s.pcGotos.length) {
        var g = s.pcGotos[0];
        s.gotoNode = g.node;
        s.gotoName = g.text;
        if (s.pcGotos.length > 1) warnings.push(fmt(S.pcGotoExtra, { step: s.title }));
        if (s.choices) {
          errors.push(fmt(S.errGotoOnDecision, { step: s.title }));
        } else if (s.pcEnd) {
          errors.push(fmt(S.errGotoAndEnd, { step: s.title }));
        } else {
          var gh = titleToIndexes[normName(g.text)] || [];
          if (gh.length !== 1) {
            errors.push(fmt(gh.length > 1 ? S.errGotoAmbiguous : S.errGotoNoName,
                            { step: s.title, name: g.text }));
          } else if (gh[0] === s.index) {
            errors.push(fmt(S.errGotoSelf, { step: s.title }));
          } else {
            s.gotoIndex = gh[0];
          }
        }
      }
    });
    /* duplicate ids (v42). Gate state is keyed by index, so that collision is gone. For NAVIGATION
       the answer depends on how the step is reached:
         · by NAME  → index-resolved at parse → genuinely unaffected → the cost is analytics only
           (the two steps report ONE step_id).
         · by an option LINK (<a href="#id">) → still resolves through idToIndex, which is LAST-wins
           by design (see the note at its construction) → readers really can land on the wrong step.
       So pick the warning by whether an option actually LINKS to this id. Anything else would
       either cry wolf on every by-name path or - worse - tell an author to ship a real mislanding.
       (Object.create(null): `seenIds['constructor']` on a plain {} reads as already-seen and would
       invent a duplicate warning with a function interpolated into it.) */
    var seenIds = Object.create(null);
    steps.forEach(function (s, i) {
      var first = seenIds[s.id];
      if (first === undefined) { seenIds[s.id] = i; return; }
      var linked = false;
      steps.forEach(function (o) {
        if (!o.choices) return;
        o.choices.forEach(function (ch) { if (!ch.byName && ch.rawHref === s.id) linked = true; });
      });
      warnings.push(fmt(linked ? S.pcDupIdLinked : S.pcDupId, { a: first + 1, b: i + 1, id: s.id }));
    });
    /* reachability from step 1, mirroring guided-mode navigation EXACTLY (this must stay in step
       with the Next handler, or the panel reports a flow the reader never takes):
       decision → its branch targets; "Go to:" → its named step (v43); ending/last → stop;
       otherwise → the next step. Cycles are fine - `reachable` is the visited set. */
    var reachable = {};
    if (steps.length && !errors.length) {
      var queue = [0]; reachable[0] = true;
      while (queue.length) {
        var qi = queue.shift(), qs = steps[qi], nexts = [];
        if (qs.choices) {
          qs.choices.forEach(function (ch) { if (typeof ch.targetIndex === 'number') nexts.push(ch.targetIndex); });
        } else if (typeof qs.gotoIndex === 'number') { nexts.push(qs.gotoIndex);
        } else if (!qs.pcEnd && qi < steps.length - 1) { nexts.push(qi + 1); }
        nexts.forEach(function (t) { if (!reachable[t]) { reachable[t] = true; queue.push(t); } });
      }
      steps.forEach(function (s, i) {
        if (!reachable[i]) warnings.push(fmt(S.pcUnreachable, { n: i + 1, title: s.title }));
      });
      /* v43 - CAN THE READER EVER FINISH? The dual of the unreachable-step check, and new in v43:
         before this version the physically last step ALWAYS ended the path, so "at least one
         ending" was structurally guaranteed and this could not happen. A "Go to:" on the last step
         removes that floor - and once branches can rejoin, reading order stops matching flow order,
         so writing a branch BELOW the shared step is a natural thing to do. Such a path loops
         forever: no "Mark complete" button exists anywhere, st.done is never set, and `completed`
         never fires (the funnel reads 0%, indistinguishable from readers giving up). */
      var hasEnding = false;
      steps.forEach(function (s, i) {
        if (typeof s.gotoIndex === 'number') return;      /* it continues → not an ending */
        if ((s.pcEnd || i === steps.length - 1) && reachable[i]) hasEnding = true;
      });
      if (!hasEnding) warnings.push(S.pcNoEnding);
    }

    /* ---------- PATH CHECK (v34): the author-only panel (replaces the v23 error banner) ----------
       v42 - AUTHOR SIGNAL, both channels. `.ko-app-edit` (the admin bar's Edit link,
       editor-bar.phtml:315) is emitted by editorBar(), gated on viewVars['isEditor'] - set only on
       the LIVE help site (HelpController). KO's article PREVIEW runs through KbController, which
       sets forPreview=true and NEVER sets isEditor (verified: 0 occurrences) - so previewBar()
       emits `.article-preview-bar` (SiteRenderer.php:444 / KbRenderer.php:2283) but the admin bar
       is absent. Net: this panel had NEVER rendered in Preview, which is exactly where authors
       check their work before publishing - so the engine's whole safety net was dark for the one
       audience it exists for. Both selectors are author-only; a logged-out reader has neither. */
    if (document.querySelector('.ko-app-edit, .article-preview-bar')) {
      var counts = { steps: steps.length, branches: 0, endings: 0 };
      steps.forEach(function (s, i) {
        if (s.choices) counts.branches += s.choices.length;
        /* v43: a step with "Go to:" continues, so it never counts as an ending - not even when
           it is the physically last step. */
        if (typeof s.gotoIndex !== 'number' && (s.pcEnd || i === steps.length - 1)) counts.endings++;
      });
      var pcState = errors.length ? 'err' : (warnings.length ? 'warn' : 'ok');
      var panel = el('details', 'gp-path-check gp-pc-' + pcState);
      if (pcState !== 'ok') panel.open = true;
      var sum = el('summary', '');
      sum.textContent = pcState === 'err' ? fmt(S.pcSumErr, { n: errors.length })
        : pcState === 'warn' ? fmt(S.pcSumWarn, { n: warnings.length })
        : fmt(S.pcSumOk, counts);
      panel.appendChild(sum);
      var pcBody = el('div', 'gp-pc-body');
      if (errors.length) {
        pcBody.appendChild(el('p', 'gp-pc-intro gp-pc-intro-err', S.warnTitle));
        var elist = el('ul', 'gp-pc-issues');
        errors.forEach(function (e) { var li = el('li', ''); li.textContent = e; elist.appendChild(li); });
        pcBody.appendChild(elist);
      }
      if (warnings.length) {
        pcBody.appendChild(el('p', 'gp-pc-intro gp-pc-intro-warn', S.pcWarnIntro));
        var wlist = el('ul', 'gp-pc-issues');
        warnings.forEach(function (w) { var li = el('li', ''); li.textContent = w; wlist.appendChild(li); });
        pcBody.appendChild(wlist);
      }
      if (steps.length) {
        pcBody.appendChild(el('p', 'gp-pc-intro', S.pcMapTitle));
        var map = el('ol', 'gp-pc-map');
        steps.forEach(function (s, i) {
          var li = el('li', '');
          var row = el('div', 'gp-pc-step');
          row.appendChild(el('span', 'gp-pc-type gp-pc-type-' + s.type, S.typeLabels[s.type]));
          var tt = el('span', 'gp-pc-title'); tt.textContent = s.title; row.appendChild(tt);
          if (s.pcGate) row.appendChild(el('span', 'gp-pc-chip', S.pcChipGate));
          /* v43: a "Go to:" step continues elsewhere, so it is NOT the ending even when it is
             physically last - say where it goes and don't call it an ending. */
          if (typeof s.gotoIndex === 'number') {
            row.appendChild(el('span', 'gp-pc-chip', fmt(S.pcChipGoto, { n: s.gotoIndex + 1 })));
          } else if (s.pcEnd || i === steps.length - 1) row.appendChild(el('span', 'gp-pc-chip', S.pcChipEnd));
          if (s.pcEsc) row.appendChild(el('span', 'gp-pc-chip', S.pcChipEsc));
          if (!errors.length && !reachable[i]) row.appendChild(el('span', 'gp-pc-chip gp-pc-chip-warn', S.pcChipUnreachable));
          li.appendChild(row);
          if (s.choices) {
            var bl = el('ul', 'gp-pc-branches');
            s.choices.forEach(function (ch) {
              var okT = typeof ch.targetIndex === 'number';
              var bi = el('li', okT ? 'gp-pc-okline' : 'gp-pc-badline');
              var tail;
              if (okT) {
                tail = fmt(S.stepChip, { n: ch.targetIndex + 1 }) + ' · ' +
                       steps[ch.targetIndex].title + (ch.byName ? ' ' + S.pcByName : '');
              } else if (ch.byName) {
                tail = fmt(ch.nameHits > 1 ? S.pcAmbiguousName : S.pcMissingName, { name: ch.name });
              } else {
                tail = fmt(S.pcMissing, { id: ch.rawHref });
              }
              bi.textContent = (okT ? '✓ ' : '✗ ') + ch.label + ' → ' + tail;
              bl.appendChild(bi);
            });
            li.appendChild(bl);
          }
          map.appendChild(li);
        });
        pcBody.appendChild(map);
      }
      var foot = el('p', 'gp-pc-foot'); foot.textContent = S.pcFoot; pcBody.appendChild(foot);
      panel.appendChild(pcBody);
      root.insertBefore(panel, root.firstChild);
    }

    if (errors.length) {
      errors.forEach(function (e) { try { console.warn('[gp-guided-path] ' + e); } catch (x) {} });
      return; /* fail-soft: leave the plain article untouched (panel above explains it to authors) */
    }

    /* ---------- PASS 2: build the model (mutating) ---------- */

    /* v36 (Phase 1.3): derive the chrome the template no longer carries. Every branch is
       an ADDITIVE FALLBACK - bodies that still carry the classed furniture (v23–v34) are
       left exactly as they are. Runs only after validation passed (fail-soft pages get no
       chrome). New-world body = one intro paragraph (→ summary), an optional
       "Before you start:" paragraph + list (→ the checklist box), then the H2 steps. */
    (function deriveChrome() {
      var firstH2 = steps[0].heading;
      function preambleNodes() {
        var out = [], n = root.firstChild;
        while (n && n !== firstH2) { out.push(n); n = n.nextSibling; }
        return out;
      }
      /* badge (constant chrome) - right under the author panel if present */
      if (!root.querySelector('.gp-badge')) {
        var badge = el('div', 'gp-badge'); badge.textContent = S.badgeLabel;
        var panelEl = root.querySelector('.gp-path-check');
        root.insertBefore(badge, panelEl ? panelEl.nextSibling : root.firstChild);
      }
      /* "Before you start" box: a preamble <p> reading exactly that (±colon) + the <ul> after it */
      if (!root.querySelector('.gp-before')) {
        var pre = preambleNodes();
        for (var p4 = 0; p4 < pre.length; p4++) {
          var n4 = pre[p4];
          if (n4.nodeType !== 1 || n4.tagName !== 'P') continue;
          var label4 = n4.textContent.trim().replace(/:\s*$/, '');
          if (BEFORE_LABELS.indexOf(label4.toLowerCase()) === -1) continue;
          var ul4 = n4.nextElementSibling;
          if (!ul4 || ul4.tagName !== 'UL') break;
          var box = el('div', 'gp-before');
          var strong4 = el('strong', ''); strong4.textContent = label4;
          box.appendChild(strong4);
          n4.parentNode.insertBefore(box, n4);
          box.appendChild(ul4);
          n4.parentNode.removeChild(n4);
          break;
        }
      }
      /* summary = the first remaining preamble paragraph with content */
      if (!root.querySelector('.gp-summary')) {
        var pre2 = preambleNodes();
        for (var p5 = 0; p5 < pre2.length; p5++) {
          var n5 = pre2[p5];
          if (n5.nodeType === 1 && n5.tagName === 'P' && /\S/.test(n5.textContent)) {
            n5.classList.add('gp-summary');
            break;
          }
        }
      }
      /* divider before the first step */
      if (!root.querySelector('.gp-divider')) {
        var hr = document.createElement('hr'); hr.className = 'gp-divider';
        root.insertBefore(hr, firstH2);
      }
      /* title: none derived on purpose - KO's native article title (.hg-article-title)
         already heads the page; a legacy in-body <h1> keeps working if present. */
    })();

    var ui = el('div', 'gp-ui');
    root.insertBefore(ui, steps[0].heading);

    steps.forEach(function (s, i) {
      /* header (rebuilt each render is unnecessary - one instance, moved between modes) */
      s.headerEl = el('div', 'gp-step-card-header');
      s.headerEl.appendChild(el('div', 'gp-step-num', String(i + 1)));
      var tt = el('div', 'gp-step-title-text'); tt.textContent = s.title; s.headerEl.appendChild(tt);
      var chip = el('span', 'gp-step-type type-' + s.type); chip.textContent = S.typeLabels[s.type]; s.headerEl.appendChild(chip);

      /* body: move the real nodes (preserves images/videos/links) */
      s.bodyEl = el('div', 'gp-step-body');
      s.bodyNodes.forEach(function (n) { s.bodyEl.appendChild(n); });
      s.heading.parentNode.removeChild(s.heading);

      /* branch list → choice buttons (interactive) + static chips (all-steps view) */
      if (s.branchList) s.branchList.parentNode.removeChild(s.branchList);
      if (s.choices) {
        s.choicesBtns = el('div', 'gp-choices');
        s.choices.forEach(function (ch) {
          var btn = el('button', 'gp-choice-btn');
          btn.type = 'button';
          btn.appendChild(el('span', '', ch.label));
          btn.appendChild(el('span', 'arrow', '→'));
          btn.addEventListener('click', function () {
            if (btn.disabled) return;
            /* targetIndex is guaranteed numeric here: the errors.length return above is what
               stops an unresolved choice from ever reaching Pass 2. */
            track('decision_taken', { step_id: s.id, choice_label: ch.label, target_step_id: steps[ch.targetIndex].id });
            st.history.push(st.cur); st.cur = ch.targetIndex; arrive(); render();
          });
          s.choicesBtns.appendChild(btn);
        });
        s.choicesStatic = el('div', 'gp-choices');
        s.choices.forEach(function (ch) {
          var row = el('div', 'gp-choice-btn gp-choice-static');
          row.appendChild(el('span', '', ch.label));
          row.appendChild(el('span', 'gp-choice-target', fmt(S.stepChip, { n: ch.targetIndex + 1 })));
          s.choicesStatic.appendChild(row);
        });
      }

      /* gate-check (v36: `.gp-callout-confirm` div OR a "Confirm: …" paragraph) → required
         checkbox. Node lists come from Pass 1's findCallouts - the nodes were moved into
         bodyEl above, so their identity is intact. Only the FIRST gate is consumed (v23
         behaviour); extras stay visible as ordinary content. */
      if (s.pcConfirms.length) {
        var conf = s.pcConfirms[0];
        s.gate = conf.text;
        s.gateEl = el('label', 'gp-gate');
        var cb = el('input', ''); cb.type = 'checkbox';
        s.gateEl.appendChild(cb);
        var txt = el('span', ''); txt.textContent = s.gate; s.gateEl.appendChild(txt);
        /* v42: gate STATE is keyed by step INDEX, not by s.id. Two steps sharing an id (a copied
           step block) previously shared one gate: ticking one pre-ticked and unlocked the other  - 
           a compliance gate defeating itself. Dormant before v42 only because such a step was
           unreachable; fixing navigation would have made it live. Indexes are also immune to the
           prototype-key hole (a step anchored "toString" made !!st.gateOk['toString'] truthy →
           permanently unlocked). Analytics still reports step_id: s.id - unchanged. */
        cb.addEventListener('change', function () {
          st.gateOk[s.index] = cb.checked;
          if (cb.checked && !st.gateTracked[s.index]) { st.gateTracked[s.index] = 1; track('gate_confirmed', { step_id: s.id }); }
          syncGate(s);
        });
        s.gateCb = cb;
        conf.node.parentNode.removeChild(conf.node);
      }

      /* end marker (div OR "End: …" paragraph): flags the ending + supplies the completion
         message; stays visible. A keyword paragraph is wrapped into a .gp-callout-end box so
         both forms render identically. */
      if (s.pcEnds.length) {
        var end = s.pcEnds[0];
        s.isEnd = true; s.endText = end.text;
        if (end.isKeywordP) {
          stripLeadKeyword(end.node);
          var endBox = el('div', 'gp-callout-end');
          end.node.parentNode.replaceChild(endBox, end.node);
          endBox.appendChild(end.node);
        }
      }

      /* v43: the "Go to: …" line is a navigation INSTRUCTION, not content, so consume it  - 
         guided mode expresses it as the Next button's destination. In "All steps" it comes back
         as a static "Continues at → Step N" row (built below), because in a flat linear list the
         reading order otherwise implies a fall-through that doesn't happen. Reuses the existing
         .gp-choices / .gp-choice-static / .gp-choice-target classes, so v43 needs NO new CSS.
         Without JS (PDF, editor, no-JS) the line simply stays as readable plain text - the same
         accepted trade-off as the other v36 keyword lines. */
      if (typeof s.gotoIndex === 'number') {
        /* Consume EVERY "Go to:" line, not just the one that won. If an author left a second one
           behind, only the first is obeyed (they get S.pcGotoExtra) - but a reader must never see
           a stray "Go to: …" instruction sitting in the step text. */
        s.pcGotos.forEach(function (gx) {
          if (gx.node && gx.node.parentNode) gx.node.parentNode.removeChild(gx.node);
        });
        s.continueStatic = el('div', 'gp-choices');
        var crow = el('div', 'gp-choice-btn gp-choice-static');
        crow.appendChild(el('span', '', S.continueLabel));
        crow.appendChild(el('span', 'gp-choice-target', fmt(S.stepChip, { n: s.gotoIndex + 1 })));
        s.continueStatic.appendChild(crow);
      }

      /* escalation (div OR "Escalate: …" paragraph) → the mock's purple gp-jblock,
         preserving any inline markup (links etc.) in both forms */
      s.pcEscs.forEach(function (escItem) {
        var esc = escItem.node;
        var j = el('div', 'gp-jblock');
        j.appendChild(el('div', 'gp-jblock-label', S.escalationLabel));
        if (escItem.isKeywordP) {
          stripLeadKeyword(esc);
          esc.parentNode.replaceChild(j, esc);
          j.appendChild(esc);
        } else {
          var p = el('p', '');
          while (esc.firstChild) p.appendChild(esc.firstChild);
          j.appendChild(p);
          esc.parentNode.replaceChild(j, esc);
        }
      });
    });

    /* ---------- state + events ---------- */
    var st = { cur: 0, mode: 'interactive', history: [], done: false, endText: null,
               stepsTaken: 0, gateOk: {}, gateTracked: {}, started: false };
    function arrive() {
      var s = steps[st.cur];
      st.stepsTaken++;
      track('step_viewed', { step_id: s.id, step_index: st.cur + 1, step_type: s.type });
    }
    window.addEventListener('pagehide', function () {
      if (st.started && !st.done && (st.cur > 0 || st.history.length)) {
        track('abandoned', { last_step_id: steps[st.cur] ? steps[st.cur].id : '', steps_taken: st.stepsTaken });
      }
    });

    function syncGate(s) {
      var ok = !s.gate || !!st.gateOk[s.index];
      if (s.nextBtn) s.nextBtn.disabled = !ok;
      if (s.choicesBtns) {
        var btns = s.choicesBtns.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) btns[i].disabled = !ok;
      }
    }

    /* ---------- render ---------- */
    function render() {
      ui.innerHTML = '';

      var toggle = el('div', 'gp-mode-toggle');
      [['interactive', S.modeGuided], ['scroll', S.modeAll]].forEach(function (mm) {
        var b = el('button', 'gp-mode-btn' + (st.mode === mm[0] ? ' active' : ''));
        b.type = 'button'; b.textContent = mm[1];
        b.addEventListener('click', function () {
          if (st.mode === mm[0]) return;
          track('mode_switched', { mode: mm[0] });
          st.mode = mm[0]; render();
        });
        toggle.appendChild(b);
      });
      ui.appendChild(toggle);

      if (st.mode === 'interactive') renderInteractive();
      else renderScroll();
    }

    function renderInteractive() {
      var pct = st.done ? 100 : Math.round((st.cur / steps.length) * 100);
      var prog = el('div', 'gp-progress-wrap');
      prog.appendChild(el('div', 'gp-progress-label',
        '<span>' + S.progress + '</span><span>' + pct + '%</span>'));
      var trackEl = el('div', 'gp-progress-track');
      var fill = el('div', 'gp-progress-fill'); fill.style.width = pct + '%';
      trackEl.appendChild(fill); prog.appendChild(trackEl);
      ui.appendChild(prog);

      if (st.done) {
        var doneCard = el('div', 'gp-complete');
        doneCard.appendChild(el('div', 'gp-complete-tick', '✓'));
        doneCard.appendChild(el('h3', '', S.completeTitle));
        var msg = el('p', '');
        msg.textContent = st.endText || fmt(S.completeBody, { n: steps.length });
        doneCard.appendChild(msg);
        var restart = el('button', 'gp-btn-restart'); restart.type = 'button'; restart.textContent = S.restart;
        restart.addEventListener('click', function () {
          st.cur = 0; st.history = []; st.done = false; st.endText = null; arrive(); render();
        });
        doneCard.appendChild(restart);
        ui.appendChild(doneCard);
        return;
      }

      var s = steps[st.cur];
      var card = el('div', 'gp-step-card');
      card.appendChild(s.headerEl);
      if (s.choicesStatic && s.choicesStatic.parentNode) s.choicesStatic.parentNode.removeChild(s.choicesStatic);
      /* v43: the "Continues at" row belongs to All-steps only - in guided mode the Next button
         already goes there, so showing it too would just be noise. */
      if (s.continueStatic && s.continueStatic.parentNode) s.continueStatic.parentNode.removeChild(s.continueStatic);
      card.appendChild(s.bodyEl);
      if (s.choicesBtns) s.bodyEl.appendChild(s.choicesBtns);
      if (s.gateEl) { s.bodyEl.appendChild(s.gateEl); s.gateCb.checked = !!st.gateOk[s.index]; }
      ui.appendChild(card);

      var nav = el('div', 'gp-nav');
      var back = el('button', 'gp-btn gp-btn-ghost'); back.type = 'button'; back.textContent = S.back;
      back.disabled = !st.history.length;
      back.addEventListener('click', function () {
        if (!st.history.length) return;
        st.cur = st.history.pop(); arrive(); render();
      });
      nav.appendChild(back);
      s.nextBtn = null;
      if (!s.choices) {
        /* v43: where does Next go?
             "Go to: <step>"  → that step (and the step is NOT an ending, even if physically last)
             End: / last step → finish
             otherwise        → the following step (the original fall-through)
           `hasGoto` is checked FIRST so a "Go to:" on the last step continues instead of
           completing. A step carrying BOTH End: and Go to: can't reach here - that's an error. */
        var hasGoto = typeof s.gotoIndex === 'number';
        var isLast = !hasGoto && st.cur === steps.length - 1;
        var next = el('button', 'gp-btn gp-btn-primary'); next.type = 'button';
        next.textContent = (isLast || s.isEnd) ? S.markComplete : S.next;
        next.addEventListener('click', function () {
          if (isLast || s.isEnd) {
            st.done = true; st.endText = s.endText;
            track('completed', { steps_taken: st.stepsTaken });
          } else {
            st.history.push(st.cur); st.cur = hasGoto ? s.gotoIndex : st.cur + 1; arrive();
          }
          render();
        });
        s.nextBtn = next;
        nav.appendChild(next);
      }
      nav.appendChild(el('span', 'gp-step-counter', fmt(S.counter, { a: st.cur + 1, b: steps.length })));
      ui.appendChild(nav);
      syncGate(s);
    }

    function renderScroll() {
      var list = el('div', 'gp-scroll-list');
      steps.forEach(function (s, i) {
        var card = el('div', 'gp-scroll-step');
        card.appendChild(s.headerEl);
        if (s.choicesBtns && s.choicesBtns.parentNode) s.choicesBtns.parentNode.removeChild(s.choicesBtns);
        if (s.gateEl && s.gateEl.parentNode) s.gateEl.parentNode.removeChild(s.gateEl);
        card.appendChild(s.bodyEl);
        if (s.choicesStatic) s.bodyEl.appendChild(s.choicesStatic);
        if (s.continueStatic) s.bodyEl.appendChild(s.continueStatic);
        list.appendChild(card);
        if (i < steps.length - 1) list.appendChild(el('div', 'gp-scroll-connector'));
      });
      ui.appendChild(list);
    }

    st.started = true;
    track('guide_started', { steps_total: steps.length });
    arrive();
    render();
  }

  /* v34 - author-only notice for the classic miss: a guided-path-shaped article
     (template body present) whose "guided-path" TAG was never set, so the
     content-type bridge never adds .gp-guided-path and the engine stays off.
     Fail-soft + idempotent; removes itself if the class appears later. */
  function checkUntagged() {
    var note = document.querySelector('.gp-untagged-note');
    if (document.querySelector('.gp-guided-path')) {
      if (note && note.parentNode) note.parentNode.removeChild(note);
      return;
    }
    if (note) return;
    if (!document.querySelector('.ko-app-edit, .article-preview-bar')) return;  /* authors only (incl. Preview - v42) */
    /* v36 (Phase 1.4): new-world articles have NO #gp-root, so "GP-shaped" now means:
       a legacy #gp-root with steps, OR an article body with ≥1 H2 starting with a step-type
       keyword ("Action:", "Decision:", "Judgement:" / DE). QR/BC and normal articles have
       neither, so they never see this notice. */
    var host = document.getElementById('gp-root') ||
               document.querySelector('.hg-article-page:not(.hg-category-page) .hg-article-body');
    if (!host) return;
    var shaped = false;
    if (host.id === 'gp-root') {
      shaped = !!host.querySelector('h2');                        /* empty root = legacy config - not ours */
    } else {
      var hs2 = host.querySelectorAll('h2');
      for (var i4 = 0; i4 < hs2.length && !shaped; i4++) {
        var m4 = headingText(hs2[i4]).match(/^([A-Za-zÄÖÜäöüßÁÉÍÓÚÑáéíóúñ]+)\s*:/);
        if (m4) {
          var kw4 = m4[1].toLowerCase();
          for (var t4 in KEYWORDS) {
            if (KEYWORDS[t4].indexOf(kw4) !== -1) { shaped = true; break; }
          }
        }
      }
    }
    if (!shaped) return;
    /* if the article IS tagged, the bridge will add the class momentarily - don't nag */
    if (window.GuidedPaths && window.GuidedPaths.hasTag()) return;
    var n = el('div', 'gp-author-warning gp-untagged-note');
    var auto = !(window.GuidedPaths && window.GuidedPaths.activate === 'tag');  /* with 'auto', a tag alone may do nothing (README) */
    n.appendChild(el('strong', '', auto ? S.untaggedTitleAuto : S.untaggedTitle));
    var p = el('p', ''); p.textContent = fmt(auto ? S.untaggedBodyAuto : S.untaggedBody, { tag: (window.GuidedPaths && window.GuidedPaths.tag) || 'guided-path' }); n.appendChild(p);
    host.insertBefore(n, host.firstChild);
  }

  function init() { enhanceGP(); checkUntagged(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  /* KO's homepage slideout injects article bodies after load - watch for them */
  if (typeof MutationObserver === 'function') {
    new MutationObserver(init).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
