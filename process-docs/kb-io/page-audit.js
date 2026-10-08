/*
 * page-audit.js: the off-brand scan behind 06-PAGE_COVERAGE.md.
 *
 * Inject this whole file with javascript_tool on a reader page of the KB (any page;
 * signed in through the admin's "View knowledge base" link if the KB is restricted),
 * then call:
 *
 *   await koAudit.run(['/help/search?phrase=a', '/help/glossary', ...], {
 *     fonts: ['Open Sans'],                       // the theme's font families
 *     text: ['#222222', '#0055AA', '#FFFFFF'],    // colors allowed for text
 *     palette: ['#222222', '#0055AA', '#F2F2F2'], // every brand color (backgrounds, borders)
 *     css: ''                                     // optional: candidate CSS to preview on each page
 *   })
 *
 * Each path loads in a hidden same-origin iframe at 1280px. For every visible element
 * the scan reports text in a font outside `fonts`, text in a color outside `text`, and
 * backgrounds and borders outside `palette`, with up to three examples each. Results
 * are leads, not verdicts: icon glyphs drawn with ::before are not scanned, and an
 * accent the design uses on purpose (aqua text on a purple hero) shows up too.
 * koAudit.scan(window) scans the current page; run it from headless Chrome to check
 * signed-out pages such as the reader login. simulateLoginMessages(), simulateReaderUpdate()
 * and printView() rebuild states that are hard to reach (see 06-PAGE_COVERAGE.md section 4).
 */
(() => {
  const hex = h => { const n = parseInt(h.replace('#', ''), 16); return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`; };
  const base = c => c.replace(/rgba\((\d+), (\d+), (\d+), [\d.]+\)/, 'rgb($1, $2, $3)');
  const SKIP = '[class*="admin-bar"], [class*="editor-bar"], .author-bar, .osano-cm-window, .osano-cm-widget, script, style, noscript';

  function scan(win, opts = {}) {
    const doc = win.document, cs = e => win.getComputedStyle(e);
    const fonts = new RegExp((opts.fonts || ['Open Sans']).map(f => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
    const icons = /awesome|icon|glyph/i;
    const textOk = new Set((opts.text || []).map(hex));
    const palette = new Set([...(opts.palette || []), '#FFFFFF', '#000000'].map(hex));
    const label = e => {
      const t = (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28);
      const c = typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/)[0] : '';
      return `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${c} "${t}"`;
    };
    const visible = e => { const r = e.getBoundingClientRect(), s = cs(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity !== 0; };
    const out = { fonts: {}, textColors: {}, backgrounds: {}, borders: {} };
    const add = (bucket, key, e) => { (bucket[key] = bucket[key] || []).length < 3 && bucket[key].push(label(e)); };
    for (const e of doc.body.querySelectorAll('*')) {
      if (e.closest(SKIP) || !visible(e)) continue;
      const s = cs(e);
      const hasText = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || /^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(e.tagName);
      if (hasText) {
        const f = s.fontFamily.split(',')[0].replace(/["']/g, '').trim();
        if (!fonts.test(f) && !icons.test(f)) add(out.fonts, f, e);
        if (textOk.size && !textOk.has(base(s.color))) add(out.textColors, s.color, e);
      }
      if (s.backgroundColor !== 'rgba(0, 0, 0, 0)' && !palette.has(base(s.backgroundColor))) add(out.backgrounds, s.backgroundColor, e);
      if (parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none' && !palette.has(base(s.borderTopColor)) && !s.borderTopColor.startsWith('rgba(0, 0, 0')) add(out.borders, s.borderTopColor, e);
    }
    return { url: win.location.pathname + win.location.search, body: doc.body.className.replace(/\s+/g, ' ').trim(), title: doc.title, ...out };
  }

  async function run(paths, opts = {}) {
    const results = [];
    for (const p of paths) {
      const f = document.createElement('iframe');
      f.style.cssText = 'position:fixed;left:-1400px;top:0;width:1280px;height:900px;border:0';
      document.body.appendChild(f);
      await new Promise(r => { f.onload = r; f.src = p; setTimeout(r, 15000); });
      try {
        if (opts.css) { const st = f.contentDocument.createElement('style'); st.textContent = opts.css; f.contentDocument.head.appendChild(st); }
        await new Promise(r => setTimeout(r, 1500));
        await f.contentDocument.fonts.ready;
        results.push({ asked: p, ...scan(f.contentWindow, opts) });
      } catch (e) {
        results.push({ asked: p, error: String(e) });
      }
      f.remove();
    }
    return results;
  }

  // States that can't be reached without signing in or sending mail, rebuilt from KO's templates
  // (service/views/scripts/help/readerlogin.phtml, readerupdate.phtml). Run on the signed-out
  // /<root>/readerlogin page, then koAudit.scan(window, opts) and take a screenshot.
  function simulateLoginMessages() {
    document.querySelector('.hg-site-login').insertAdjacentHTML('afterbegin',
      '<div class="bs-callout bs-callout-warning"><i class="fa fa-exclamation-triangle"></i> Invalid username or password.</div>' +
      '<div class="bs-callout bs-callout-info">We have received your password reset request. If you provided a valid email address, you will receive an email shortly.</div>');
  }
  function simulateReaderUpdate() {
    document.querySelector('.hg-site-login').innerHTML =
      '<div class="alert alert-warning"><h5><i class="fa fa-exclamation-triangle"></i> Your password must be at least 8 characters.</h5></div>' +
      '<div class="panel panel-default"><div class="panel-heading update"><h3 class="panel-title">Update Required</h3></div><div class="panel-body"><form>' +
      '<div class="form-group"><label class="control-label">Email address:</label><input type="email" class="form-control"></div>' +
      '<div class="form-group"><div class="password-requirements"><div>At least 8 characters.</div></div></div>' +
      '<div class="form-group"><label class="control-label">New Password:</label><input type="password" class="form-control"></div>' +
      '<div class="text-right"><button type="button" class="btn btn-primary">Submit</button></div></form></div></div>';
  }
  // The article print view, built the way public/js/public/ko-misc.js builds it, without print().
  // Run on an article page; it replaces the page, so scan or screenshot afterwards.
  function printView() {
    const art = document.querySelector('.documentation-article').cloneNode(true);
    art.querySelectorAll('.hg-article-footer, script, [id^="survey-wrapper"], .hg-article-controls').forEach(e => e.remove());
    const head = document.head.cloneNode(true);
    head.querySelectorAll('script').forEach(e => e.remove());
    const html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN' 'http://www.w3.org/TR/html4/loose.dtd'>\n<html>\n<head>" +
      head.innerHTML + "\n</head>\n<body style='padding:2em'>\n<div class='documentation-article' style='box-shadow:none;'>" + art.innerHTML + "\n</div>\n</body>\n</html>";
    document.open(); document.write(html); document.close();
  }

  window.koAudit = { scan, run, simulateLoginMessages, simulateReaderUpdate, printView };
  return 'koAudit ready: koAudit.run(paths, {fonts, text, palette, css})';
})();
