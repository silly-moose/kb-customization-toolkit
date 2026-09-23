/*
 * ko-style-io.js: the in-page half of the KB Customization Toolkit's browser
 * capture and deploy. Claude injects this whole file with javascript_tool on an
 * app.knowledgeowl.com tab, then calls window.koIO. Procedure and rules:
 * process-docs/05-BROWSER_CAPTURE_AND_DEPLOY.md
 *
 * Injecting returns a self-hash of koioFactory's source. kb_io.py computes the
 * same hash from this file, and read() and stage() refuse to run unless the two
 * match, so a helper that was mis-copied into the page never runs.
 */
function koioFactory() {
  const K = { v: '1', self: null, armed: false, blocked: false, pending: false, problems: [] };
  const FIELDS = [
    ['css', 'custom-css'], ['head', 'head-html'], ['body', 'body-html'], ['nav', 'nav-html'],
    ['article', 'article-html'], ['articleversion', 'articleversion-html'], ['homepage', 'homepage-html'],
    ['login', 'login-html'], ['readersub', 'readersub-html'], ['error404', 'error404-html'],
    ['noaccess', 'noaccess-html'], ['rcol', 'rcol-html']
  ];
  const NOT_SETTINGS = ['files', 'cssFile', 'css', 'html_sections'];
  const FONT_PROPS = ['family', 'size', 'weight', 'custom_name', 'custom_url'];
  const out = o => JSON.stringify(o);
  const fail = (problems, extra) => out(Object.assign({ ok: false, problems: [].concat(problems) }, extra || {}));

  // The hash rule, identical in kb_io.py: strip a BOM, CRLF/CR to LF, trim ASCII
  // whitespace, then the first 12 hex characters of SHA-256 over UTF-8. (No
  // unicode escapes anywhere in this file: they do not survive being copied
  // into a tool call, and the self-hash would refuse the copy.)
  const norm = s => {
    s = String(s == null ? '' : s);
    if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
    return s.replace(/\r\n?/g, '\n').replace(/^[ \t\n\v\f\r]+|[ \t\n\v\f\r]+$/g, '');
  };
  async function sha(s) {
    const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(d), b => b.toString(16).padStart(2, '0')).join('').slice(0, 12);
  }
  const hash = s => sha(norm(s));
  const bytes = s => new TextEncoder().encode(norm(s)).length;

  // JSON with sorted keys, so equal settings always hash the same.
  function canon(v) {
    if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
    if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
    return JSON.stringify(v === undefined ? null : v);
  }
  // The comparable part of the theme JSON: colors lowercased, fonts as strings,
  // the logo as its URL. files and cssFile change in the background, and css and
  // html_sections travel in their own form fields, so they are left out.
  function settingsOf(theme) {
    const t = {};
    Object.keys(theme || {}).forEach(k => { if (!NOT_SETTINGS.includes(k)) t[k] = theme[k]; });
    const colors = {};
    Object.keys(t.colors || {}).forEach(k => { colors[k] = t.colors[k] == null ? '' : String(t.colors[k]).toLowerCase(); });
    t.colors = colors;
    const font = {};
    Object.keys(t.font || {}).forEach(k => {
      const f = t.font[k] || {};
      font[k] = {};
      FONT_PROPS.forEach(p => { font[k][p] = f[p] == null ? '' : String(f[p]); });
    });
    t.font = font;
    t.logo = t.logo && !Array.isArray(t.logo) && t.logo.url ? String(t.logo.url) : '';
    return t;
  }
  function diffSettings(a, b) {
    const d = [];
    new Set(Object.keys(a).concat(Object.keys(b))).forEach(k => {
      if (k === 'colors' || k === 'font') {
        new Set(Object.keys(a[k] || {}).concat(Object.keys(b[k] || {}))).forEach(s => {
          if (canon((a[k] || {})[s]) !== canon((b[k] || {})[s])) d.push(k + '.' + s);
        });
      } else if (canon(a[k]) !== canon(b[k])) d.push(k);
    });
    return d;
  }
  // KO's own pre-save check (themer.js getCustomSections). true means KO will
  // show its "bad CSS/HTML" dialog for this value when Save is clicked.
  function koFlags(v) {
    try { JSON.parse(new DOMParser().parseFromString(JSON.stringify(v), 'text/html').documentElement.textContent); return false; }
    catch (e) { return true; }
  }
  // Anchored edits: each old string must occur exactly once. split/join, not
  // replace(), because "$&" in a replacement string is special to replace().
  function applyEdits(text, edits) {
    edits.forEach(([o, n]) => {
      const parts = text.split(o);
      if (parts.length !== 2) throw new Error('patch anchor found ' + (parts.length - 1) + ' times: ' + JSON.stringify(o.slice(0, 60)));
      text = parts.join(n);
    });
    return text;
  }
  function cmFor(ta) {
    const el = Array.from(document.querySelectorAll('.CodeMirror')).find(c => c.CodeMirror && c.CodeMirror.getTextArea() === ta);
    return el ? el.CodeMirror : null;
  }
  const valueOf = ta => { const cm = cmFor(ta); return cm ? cm.getValue() : ta.value; };

  async function fetchDoc(url) {
    const r = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
    return { doc: new DOMParser().parseFromString(await r.text(), 'text/html'), url: new URL(r.url).pathname };
  }
  const hostOf = doc => {
    const m = Array.from(doc.scripts, s => s.textContent).join('\n').match(/new HGThemer\('([0-9a-f]{24})',\s*'([^']*)'\)/);
    try { return m ? new URL(m[2]) : null; } catch (e) { return null; }
  };
  // One fresh, read-only read of a KB's Style page. A fetched document loads no
  // iframes, so this never starts the author session the preview iframe does.
  async function readStyle(pid) {
    const { doc, url } = await fetchDoc('/kb/style/id/' + pid);
    const r = { pid, url, problems: [] };
    const form = doc.querySelector('#js-theme-f');
    if (!form) { r.problems.push('no Style form at ' + url + ': signed out, no access, or not this KB'); return r; }
    if (form.getAttribute('action') !== '/kb/style-save/id/' + pid) r.problems.push('the Style form belongs to ' + form.getAttribute('action'));
    const u = hostOf(doc);
    r.host = u ? u.host : '';
    r.root = u ? u.pathname : '';
    const view = doc.querySelector('.style-view-kb a');
    r.kbName = view ? view.textContent.trim().replace(/^View\s+/, '').replace(/^"(.*)"$/, '$1') : '';
    r.admin = !!doc.querySelector('.save-bar input[type=submit]');
    const left = doc.querySelector('.style-left-col input[type=submit]');
    r.saveLabel = left ? left.value : '';
    r.texts = {};
    FIELDS.forEach(([key, name]) => {
      const ta = form.querySelector('textarea[name="' + name + '"]');
      if (ta) r.texts[key] = ta.value; else r.problems.push('field not found on the page: ' + key);
    });
    try { r.theme = JSON.parse(doc.querySelector('#js-theme-json').value.trim()); }
    catch (e) { r.theme = null; r.problems.push('the theme JSON does not parse'); }
    r.saves = Array.from(doc.querySelectorAll('#revert-save-select option'), o => o.value);
    return r;
  }
  async function findFiles(pid, name) {
    const token = document.querySelector('#csrf-token');
    const body = new URLSearchParams({ pid, term: name, typeFilter: 'image', start: '0', limit: '50' });
    const r = await fetch('/library/ajax-file-search', {
      method: 'POST', credentials: 'same-origin', body,
      headers: { 'X-CSRF-Token': token ? token.value : '', 'X-Requested-With': 'XMLHttpRequest' }
    });
    const html = await r.text();
    if (html.trim() === 'false') throw new Error('the File Library search failed');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const files = Array.from(doc.querySelectorAll('.panel-body[data-url]'), p => ({ id: p.dataset.id, name: p.dataset.name, url: p.dataset.url }));
    return { files, exact: files.filter(f => f.name === name) };
  }

  function block(problems) {
    K.blocked = true;
    K.pending = false;
    K.problems = problems;
    document.querySelectorAll('#js-theme-f input[type=submit]').forEach(b => { b.disabled = true; });
    let bar = document.getElementById('koio-blocked');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'koio-blocked';
      bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#b3261e;color:#fff;padding:12px 16px;font:14px/1.45 sans-serif';
      document.body.appendChild(bar);
    }
    bar.textContent = 'Save blocked by the toolkit check. Nothing was posted. Reload this page before trying again. ' + problems.join(' | ');
  }
  // Runs on the exact bytes about to be posted, after KO's own submit handler
  // has copied the editors into their textareas and built the theme JSON.
  async function gate() {
    const form = document.querySelector('#js-theme-f'), bad = [];
    for (const [key, name] of FIELDS) {
      const h = await hash(form.querySelector('textarea[name="' + name + '"]').value);
      if (h !== K.expect.fields[key]) bad.push(key + ' would post ' + h + ', expected ' + K.expect.fields[key]);
    }
    let posted = null;
    try { posted = settingsOf(JSON.parse(form.querySelector('#js-theme-json').value)); }
    catch (e) { bad.push('the theme JSON about to be posted does not parse'); }
    if (posted && (await sha(canon(posted))) !== K.expect.settingsHash) {
      bad.push('the Style Settings about to be posted differ from the plan: ' + diffSettings(posted, K.expect.settings).join(', '));
    }
    const now = await readStyle(K.pid);
    if (now.problems.length) bad.push.apply(bad, now.problems);
    else {
      for (const [key] of FIELDS) {
        if ((await hash(now.texts[key])) !== K.base.fields[key]) bad.push(key + ' changed on the server after this page loaded');
      }
      if ((await sha(canon(settingsOf(now.theme)))) !== K.base.settingsHash) bad.push('the Style Settings changed on the server after this page loaded');
      if (canon(now.saves) !== canon(K.base.saves)) bad.push('someone saved this theme after this page loaded');
    }
    return bad;
  }
  function arm(form) {
    // Native submits (a click, Enter) are cancelled while a check runs or after a block.
    form.addEventListener('submit', e => {
      if (K.blocked || K.pending) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
    // KO's handler ends with jQuery trigger('submit'), which calls form.submit().
    form.submit = function () {
      if (K.blocked || K.pending) return;
      K.pending = true;
      gate().then(bad => {
        if (bad.length) { block(bad); return; }
        K.pending = false;
        K.posted = true;
        HTMLFormElement.prototype.submit.call(form);
      }, e => block(['the save check failed: ' + e.message]));
    };
  }

  // read(pid, have, opts): read-only. Returns 'KOIO1' + JSON with every field's
  // hash and byte count, the settings and the Revert list. A field's text is
  // included only when its hash is not in have[key] (have.all returns every
  // text). opts.home also reads the legacy homepage Custom content field.
  K.read = async function (pid, have, opts) {
    have = have || {};
    opts = opts || {};
    if (have.self !== K.self) return 'KOIO1' + fail('helper self-hash ' + K.self + ' does not match ' + have.self + '; re-inject ko-style-io.js exactly as downloaded');
    const r = await readStyle(pid);
    const o = {
      kind: 'read', v: K.v, ok: !r.problems.length, pid, url: r.url, host: r.host || '', root: r.root || '',
      kbName: r.kbName || '', admin: !!r.admin, saveLabel: r.saveLabel || '', problems: r.problems, fields: {}, saves: r.saves || []
    };
    for (const [key] of FIELDS) {
      if (!r.texts || !(key in r.texts)) continue;
      const t = r.texts[key], f = { n: bytes(t), h: await hash(t) };
      if (have.all || !(have[key] || []).includes(f.h)) f.text = t;
      o.fields[key] = f;
    }
    if (r.theme) {
      o.settings = settingsOf(r.theme);
      o.settingsHash = await sha(canon(o.settings));
      // The logo URL carries a slug, not the File Library name; look the name up by file id.
      const m = o.settings.logo.match(/\/app\/image\/id\/([0-9a-f]{24})\//);
      if (m) {
        try { const f = (await findFiles(pid, m[1])).files[0]; o.logoFile = f ? { id: f.id, name: f.name } : null; }
        catch (e) { o.logoFile = null; }
      }
    }
    if (opts.home) {
      const { doc, url } = await fetchDoc('/kb/home-page/id/' + pid);
      const title = doc.querySelector('#title'), content = doc.querySelector('textarea#content');
      if (!content) o.problems.push('no homepage editor at ' + url);
      else {
        const t = content.value, f = { n: bytes(t), h: await hash(t) };
        if (have.all || !(have.legacy || []).includes(f.h)) f.text = t;
        o.home = { title: title ? title.value : '', content: f };
      }
    }
    return 'KOIO1' + out(o);
  };

  // files(pid, name): File Library images whose name contains name; exact holds
  // the ones named exactly that. Read-only.
  K.files = async function (pid, name) {
    try { return out(Object.assign({ ok: true }, await findFiles(pid, name))); }
    catch (e) { return fail(e.message); }
  };

  // put(i, text, h): holds one payload chunk for stage(). ok is false when the
  // chunk arrived altered (its raw SHA-256 prefix is not h).
  K.put = async function (i, text, h) {
    const buf = window.__koioBuf = window.__koioBuf || {};
    buf[i] = text;
    return out({ ok: (await sha(text)) === h, i, n: new TextEncoder().encode(text).length });
  };

  // stage(plan): run on a freshly loaded /kb/style/id/<pid>. Checks the page
  // against the plan's preflight read, rebuilds every new value and checks its
  // hash, writes the values into the editors and settings controls, and arms the
  // submit gate. If a precondition fails, nothing on the page is touched.
  K.stage = async function (plan) {
    const P = [];
    const form = document.querySelector('#js-theme-f');
    if (!plan || plan.self !== K.self) return fail('helper self-hash ' + K.self + ' does not match the plan (' + (plan && plan.self) + '); re-inject ko-style-io.js exactly as downloaded');
    if (K.armed || K.blocked) return fail('this page was already staged; reload it and start again');
    if (location.pathname !== '/kb/style/id/' + plan.pid || !form) return fail('open /kb/style/id/' + plan.pid + ' freshly, then stage');
    const u = hostOf(document);
    if (!u || u.host !== plan.host) P.push('this page is for ' + (u ? u.host : 'an unknown host') + '; the plan targets ' + plan.host);
    if (!document.querySelector('.save-bar input[type=submit]')) P.push('no admin Save button: the signed-in user cannot save Style settings');
    const left = document.querySelector('.style-left-col input[type=submit]');
    if (left && left.value !== 'Save') P.push('this KB saves drafts ("' + left.value + '"); making it live is a separate step, so stop and ask');
    const tas = {};
    for (const [key, name] of FIELDS) {
      const ta = form.querySelector('textarea[name="' + name + '"]');
      if (!ta) { P.push('field not found: ' + key); continue; }
      tas[key] = ta;
      const loaded = await hash(ta.defaultValue);
      if (loaded !== plan.base.fields[key]) P.push(key + ' changed since the preflight read');
      if ((await hash(valueOf(ta))) !== loaded) P.push(key + ' has unsaved edits in this page');
    }
    let baseSettings = null;
    try { baseSettings = settingsOf(JSON.parse(document.querySelector('#js-theme-json').defaultValue.trim())); }
    catch (e) { P.push('the theme JSON does not parse'); }
    if (baseSettings && (await sha(canon(baseSettings))) !== plan.base.settingsHash) P.push('the Style Settings changed since the preflight read');
    const saves = Array.from(document.querySelectorAll('#revert-save-select option'), o => o.value);
    if (canon(saves) !== canon(plan.base.saves)) P.push('someone saved this theme since the preflight read');

    // Rebuild every new value before touching the page.
    const next = {};
    for (const key of Object.keys(plan.fields || {})) {
      const f = plan.fields[key];
      let text;
      try {
        if (!tas[key]) throw new Error('no such field');
        if (f.via === 'chunks') {
          text = f.parts.map(i => {
            const b = (window.__koioBuf || {})[i];
            if (b == null) throw new Error('chunk ' + i + ' is missing; run its put() call first');
            return b;
          }).join('');
        } else if (f.via === 'patch') text = applyEdits(norm(tas[key].defaultValue), f.edits);
        else if (f.via === 'from') {
          const src = await readStyle(f.pid);
          if (src.problems.length) throw new Error(src.problems.join('; '));
          text = src.texts[key];
        } else throw new Error('unknown transfer ' + f.via);
      } catch (e) { P.push(key + ': ' + e.message); continue; }
      text = norm(text);
      const got = await sha(text);
      if (got !== f.to) { P.push(key + ': the rebuilt value hashes to ' + got + ', not ' + f.to); continue; }
      next[key] = text;
    }
    const S = plan.settings || {};
    let logoUrl = null;
    if (S.logo && S.logo.name) {
      try {
        const found = await findFiles(plan.pid, S.logo.name);
        if (found.exact.length !== 1) P.push('logo: this KB has ' + found.exact.length + ' File Library images named ' + S.logo.name + ' (needs exactly one; upload it to this KB first)');
        else logoUrl = found.exact[0].url;
      } catch (e) { P.push('logo: ' + e.message); }
    }
    Object.keys(S.colors || {}).forEach(k => {
      if (!document.getElementById('color' + k)) P.push('no color picker for ' + k);
      if (!/^#[0-9a-f]{6}$/i.test(S.colors[k])) P.push('color ' + k + ' is not #rrggbb: ' + S.colors[k]);
    });
    Object.keys(S.font || {}).forEach(k => {
      const b = document.querySelector('.js-font-choice[data-key="' + k + '"]'), f = S.font[k];
      if (!b) { P.push('no font block ' + k); return; }
      [['family', '.js-title-font'], ['size', '.js-font-size'], ['weight', '.js-font-weight']].forEach(([p, sel]) => {
        if (f[p] != null && !Array.from(b.querySelector(sel).options).some(o => o.value === String(f[p]))) P.push('font ' + k + ': no ' + p + ' option ' + f[p]);
      });
    });
    if (P.length) return fail(P);

    // Write. Past this point any failure blocks the page until it is reloaded.
    const $ = window.jQuery;
    try {
      Object.keys(next).forEach(key => {
        const ta = tas[key], cm = cmFor(ta);
        if (cm) { cm.setValue(next[key]); cm.save(); } else ta.value = next[key];
      });
      Object.keys(S.colors || {}).forEach(k => { $('#color' + k).minicolors('value', S.colors[k].toLowerCase()); });
      Object.keys(S.font || {}).forEach(k => {
        const $b = $('.js-font-choice[data-key="' + k + '"]'), f = S.font[k];
        if (f.size != null) $('.js-font-size', $b).val(String(f.size));
        if (f.weight != null) $('.js-font-weight', $b).val(String(f.weight));
        if (f.family != null) $('.js-title-font', $b).val(String(f.family));
        $('.js-title-font', $b).trigger('change');
      });
      if (logoUrl) {
        $('#file-name').val(logoUrl);
        $('#hg-add-file-button').removeClass('disabled').prop('disabled', false).trigger('click');
      }
    } catch (e) { block(['staging failed part way: ' + e.message]); return fail(K.problems, { blocked: true }); }

    // Read back what will be posted, then arm the gate.
    const expectFields = {};
    for (const [key] of FIELDS) {
      expectFields[key] = key in next ? await sha(next[key]) : plan.base.fields[key];
      const now = await hash(valueOf(tas[key]));
      if (now !== expectFields[key]) P.push(key + ': the editor holds ' + now + ', expected ' + expectFields[key]);
    }
    const expectSettings = JSON.parse(JSON.stringify(baseSettings));
    Object.keys(S.colors || {}).forEach(k => {
      expectSettings.colors[k] = S.colors[k].toLowerCase();
      const v = String($('#color' + k).val() || '').toLowerCase();
      if (v !== expectSettings.colors[k]) P.push('color ' + k + ' reads back as ' + v);
    });
    Object.keys(S.font || {}).forEach(k => {
      const b = document.querySelector('.js-font-choice[data-key="' + k + '"]'), f = S.font[k];
      const now = {
        family: b.querySelector('.js-title-font').value, size: b.querySelector('.js-font-size').value,
        weight: b.querySelector('.js-font-weight').value, custom_name: '', custom_url: ''
      };
      ['family', 'size', 'weight'].forEach(p => { if (f[p] != null && now[p] !== String(f[p])) P.push('font ' + k + ' ' + p + ' reads back as ' + now[p]); });
      expectSettings.font[k] = now;
    });
    if (logoUrl) expectSettings.logo = logoUrl;
    if (P.length) { block(P); return fail(P, { blocked: true }); }
    const koWillWarn = FIELDS.filter(([key]) => koFlags(valueOf(tas[key]))).map(([key]) => key);
    K.pid = plan.pid;
    K.base = { fields: plan.base.fields, settingsHash: plan.base.settingsHash, saves: plan.base.saves };
    K.expect = { fields: expectFields, settings: expectSettings, settingsHash: await sha(canon(expectSettings)) };
    arm(form);
    K.armed = true;
    const settings = Object.keys(S.colors || {}).map(k => 'colors.' + k)
      .concat(Object.keys(S.font || {}).map(k => 'font.' + k), logoUrl ? ['logo'] : []);
    return out({ ok: true, staged: Object.keys(next), settings, koWillWarn, armed: true });
  };

  // save(): clicks Save. Only after the user's yes. The gate runs either way.
  K.save = function () {
    if (!K.armed) return fail('not staged; run stage() first');
    if (K.blocked) return fail(K.problems, { blocked: true });
    const btn = document.querySelector('.save-bar input[type=submit]');
    setTimeout(() => btn.click(), 300);
    return out({ ok: true, clicking: true });
  };

  // status(): use when a Save did not navigate. koDialog is KO's own dialog text.
  K.status = function () {
    const box = document.querySelector('.bootbox.in, .bootbox.show');
    return out({
      url: location.pathname + location.search, armed: K.armed, blocked: K.blocked, pending: K.pending,
      problems: K.problems, koDialog: box ? box.textContent.replace(/\s+/g, ' ').trim().slice(0, 500) : null
    });
  };

  K.norm = norm;
  K.sha = sha;
  return K;
}
(async () => {
  const k = koioFactory();
  k.self = await k.sha(k.norm(koioFactory.toString()));
  window.koIO = k;
  return JSON.stringify({ koio: k.v, self: k.self, page: location.pathname });
})();
