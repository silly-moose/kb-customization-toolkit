#!/usr/bin/env python3
"""kb_io.py: the local half of the KB Customization Toolkit's browser capture
and deploy. Standard library only. Procedure and rules:
process-docs/05-BROWSER_CAPTURE_AND_DEPLOY.md

  have <build-root>
      Hash every captured file in the build's dated folders, plus the
      Minimalist defaults, and print the HAVE argument for koIO.read().
  unpack <result> [--into DIR | --snapshot FILE] [--expect] [--record FILE]
      Decode a koIO.read() result (a spilled tool-result file, or an inline
      result saved verbatim) and report where each live field came from.
      --into writes a capture folder, --snapshot writes an HTML snapshot,
      --expect checks a save against the last plan, --record appends a row
      to DEPLOYMENTS.md.
  plan <version-folder> [--from FILE] [--overwrite KEY ...]
      Compare a version folder with the last read of the live KB, run the
      content checks, and write the page calls plus the yes-request.

Summaries only go to stdout. Payloads are written under work/ next to this file.
"""
import argparse
import difflib
import hashlib
import json
import re
import subprocess
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORK = HERE / 'work'
DEFAULTS_URL = ('https://raw.githubusercontent.com/silly-moose/kb-customization-toolkit/main/'
                'process-docs/minimalist-theme-defaults/')
FIELDS = [
    ('css', 'custom-css.css', 'Custom CSS'),
    ('head', 'custom-head.html', 'Custom <head>'),
    ('body', 'custom-html-1-body.html', 'Custom HTML > Body'),
    ('nav', 'custom-html-2-top-navigation.html', 'Custom HTML > Top Navigation'),
    ('article', 'custom-html-3-article.html', 'Custom HTML > Article'),
    ('articleversion', 'custom-html-4-article-version.html', 'Custom HTML > Article Version'),
    ('homepage', 'custom-html-5-homepage.html', 'Custom HTML > Homepage'),
    ('login', 'custom-html-6-login.html', 'Custom HTML > Login'),
    ('readersub', 'custom-html-7-manage-reader-subs.html', 'Custom HTML > Manage Reader Subscriptions'),
    ('error404', 'custom-html-8-404-page.html', 'Custom HTML > 404 Page'),
    ('noaccess', 'custom-html-9-restricted-access-page.html', 'Custom HTML > Restricted Access Page'),
    ('rcol', 'custom-html-10-right-column.html', 'Custom HTML > Right Column'),
]
LABEL = {k: label for k, _, label in FIELDS}
LEGACY = 'homepage-custom-content.html'
COLORS = [
    ('header', 'Top navigation bar / Header background'),
    ('headerText', 'Top navigation text / Header text'),
    ('headers', 'H1s, H2s, H3s, etc. / Header tags'),
    ('content', 'Table of contents / Column background'),
    ('bodyText', 'Table of contents text / Column text'),
    ('accent', 'Highlights & Accents'),
    ('categoryIcon', 'Default category icon colors: Icon color'),
    ('categoryIconBackground', 'Default category icon colors: Icon background'),
]
FONTS = [('title', 'Headers font'), ('body', 'Article text font')]
# Merge codes KO adds on save when they are missing, which would silently change the saved field.
REQUIRED = {
    'body': [['[template("layout")]', '[template("contents")]']],
    'article': [['[article("body")]']],
    'homepage': [['[homepage("body")]']],
    'login': [['[template("login-page")]']],
}
NEVER_EMPTY = ('body', 'nav', 'article', 'homepage', 'login')   # KO fills its default into these when empty
DATED = re.compile(r'^\d{4}\.\d{2}\.\d{2}-')
CHUNK = 25000
COMMENTS = re.compile(r'<!--.*?-->|/\*.*?\*/', re.S)
CAPTURE_HEADER = re.compile(r'\A(?:<!--\n(?: \*[^\n]*\n)+-->\n\n|/\*\*\n(?: \*[^\n]*\n)+ \*/\n\n)')
GUARD = re.compile(r'\n/\* =+\n[ \t]*EDITOR READABILITY GUARD')
PLACEHOLDER_TAG = ' (placeholder, read as empty)'


# ---- the hash rule, identical in ko-style-io.js --------------------------------
def norm(s):
    if s.startswith('\ufeff'):
        s = s[1:]
    return s.replace('\r\n', '\n').replace('\r', '\n').strip(' \t\n\v\f\r')


def h12(s):
    return hashlib.sha256(norm(s).encode('utf-8')).hexdigest()[:12]


def raw12(s):
    return hashlib.sha256(s.encode('utf-8')).hexdigest()[:12]


# ---- small helpers ---------------------------------------------------------------
def die(msg):
    print(msg)
    sys.exit(1)


def read(p):
    return Path(p).read_text(encoding='utf-8')


def write(p, text):
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding='utf-8')


def save_json(p, obj):
    write(p, json.dumps(obj, indent=1, ensure_ascii=False))


def load_json(p, missing=None):
    p = Path(p)
    if not p.is_file():
        if missing is not None:
            return missing
        die(f'{p} not found. {"Run `have` first." if p.name == "have.json" else ""}')
    return json.loads(read(p))


def as_file(text):
    """What a captured field looks like on disk: normalized, one final newline, 0 bytes if empty."""
    t = norm(text)
    return t + '\n' if t else ''


def is_placeholder(s):
    """A template placeholder ("<!-- Paste customer's ... -->") means the field was never captured."""
    return bool(re.search(r'\bPaste\b', s)) and not COMMENTS.sub('', s).strip()


def strip_capture_header(s):
    """ko-code-capture prepends a comment header to every file; it is not KB content."""
    m = CAPTURE_HEADER.match(s)
    return s[m.end():] if m and ' * Section: Customize > ' in m.group(0) else s


def without_guard(css):
    m = GUARD.search(css)
    return css[:m.start()] if m else None


def helper_self():
    src = read(HERE / 'ko-style-io.js')
    i = src.index('function koioFactory()')
    return h12(src[i:src.index('\n}\n', i) + 2])


def fetch_default(fn):
    cache = WORK / 'defaults' / fn
    text = None
    try:
        with urllib.request.urlopen(DEFAULTS_URL + fn, timeout=20) as r:
            text = r.read().decode('utf-8')
    except Exception:
        try:   # some Python installs lack CA certificates; curl uses the system's
            text = subprocess.run(['curl', '-fsSL', DEFAULTS_URL + fn], capture_output=True, check=True,
                                  timeout=30).stdout.decode('utf-8')
        except Exception:
            pass
    if text is not None:
        write(cache, text)
        return text
    return read(cache) if cache.is_file() else None


def logo_file_name(read_obj):
    """The File Library name of the live logo, as koIO.read() looked it up ('' when there is none)."""
    f = read_obj.get('logoFile') or {}
    return f.get('name', '')


def selectors(css):
    body = COMMENTS.sub('', css)
    return {re.sub(r'\s+', ' ', s).strip() for s in re.findall(r'([^{}]+)\{', body) if s.strip()}


def now():
    return datetime.now().strftime('%Y.%m.%d %H:%M')


# ---- the HAVE index ----------------------------------------------------------------
def dated_folders(root):
    skip = {'.claude', 'Reference', 'preview'}
    return sorted(p for p in root.rglob('*')
                  if p.is_dir() and DATED.match(p.name) and not skip & set(p.relative_to(root).parts))


def source_text(have, src):
    """The normalized text behind one `have` source: a build file or a Minimalist default."""
    if src.endswith(PLACEHOLDER_TAG):
        return ''
    if src.startswith('defaults/'):
        text = read(WORK / 'defaults' / src.split('/')[1].split(' ')[0])
        return without_guard(text) if src.endswith('(without the guard)') else text
    return strip_capture_header(read(Path(have['root']) / src))


def label_of(sources):
    real = [s for s in sources if not s.endswith(PLACEHOLDER_TAG)]
    if not real:
        return 'empty' if sources else 'NEW'
    if all(s.startswith('defaults/') for s in real):
        return 'stock default'
    return sorted(Path(s).parent.name for s in real if not s.startswith('defaults/'))[-1]


def cmd_have(a):
    root = Path(a.root).resolve()
    index = {k: {} for k, _, _ in FIELDS}
    index['legacy'] = {}
    folders = dated_folders(root)
    for d in folders:
        for key, fn in [(k, f) for k, f, _ in FIELDS] + [('legacy', LEGACY)]:
            f = d / fn
            if not f.is_file():
                continue
            try:
                s = strip_capture_header(read(f))
            except UnicodeDecodeError:
                print(f'skipped (not UTF-8): {f.relative_to(root)}')
                continue
            if not is_placeholder(s):
                index[key].setdefault(h12(s), []).append(str(f.relative_to(root)))
            else:   # older projects kept a placeholder to record "empty at project start"
                index[key].setdefault(h12(''), []).append(str(f.relative_to(root)) + PLACEHOLDER_TAG)
    offline = []
    for key, fn, _ in FIELDS:
        s = fetch_default(fn)
        if s is None:
            offline.append(fn)
            continue
        if not is_placeholder(s):
            index[key].setdefault(h12(s), []).append('defaults/' + fn)
        if key == 'css' and without_guard(s):
            index['css'].setdefault(h12(without_guard(s)), []).append('defaults/custom-css.css (without the guard)')
    me = helper_self()
    save_json(WORK / 'have.json', {'root': str(root), 'self': me, 'fields': index})
    arg = {'self': me}
    arg.update({k: sorted(v) for k, v in index.items() if v})
    print('HAVE=' + json.dumps(arg, separators=(',', ':')))
    print(f'{sum(len(v) for v in index.values())} known hashes from {len(folders)} dated folders '
          f'and the Minimalist defaults. Helper self-hash {me}.')
    if offline:
        print('Minimalist defaults not fetched (offline?): ' + ', '.join(offline))


# ---- decoding a koIO result --------------------------------------------------------
def decode_result(p):
    s = read(p)
    dec = json.JSONDecoder()
    for _ in range(8):
        i = s.find('KOIO1')
        if i >= 0:
            try:
                obj, _ = dec.raw_decode(s, i + 5)
                if isinstance(obj, dict):
                    return obj
            except json.JSONDecodeError:
                pass
        t = s.lstrip()
        try:
            v, _ = dec.raw_decode(t)
        except json.JSONDecodeError:
            break
        if isinstance(v, str):
            s = v
        elif isinstance(v, list):
            s = ''.join(x.get('text', '') if isinstance(x, dict) else str(x) for x in v)
        elif isinstance(v, dict) and isinstance(v.get('text'), str):
            s = v['text']
        else:
            break
    die(f'No KOIO1 result found in {p}. Save the javascript_tool result exactly as returned, '
        'or read fewer fields per call.')


def resolve_fields(obj, have):
    """Each live field's text and provenance: from the result itself, or from the local file with its hash."""
    texts, prov, problems = {}, {}, []
    for key, _, _ in FIELDS:
        f = obj.get('fields', {}).get(key)
        if f is None:
            problems.append(f'{key}: missing from the result')
            continue
        sources = have['fields'].get(key, {}).get(f['h'], []) if have else []
        if 'text' in f:
            if h12(f['text']) != f['h']:
                problems.append(f'{key}: the text arrived altered (hash mismatch); read it again')
                continue
            texts[key] = f['text']
        elif sources:
            texts[key] = source_text(have, sources[0])
            if h12(texts[key]) != f['h']:
                problems.append(f'{key}: local file {sources[0]} changed since `have`; run `have` again')
        else:
            problems.append(f'{key}: no text and no local match; read it again with have omitted for that field')
        prov[key] = label_of(sources)
    return texts, prov, problems


def settings_md(settings, host, when, logo_file=''):
    rows = [f'| {label} | `colors.{k}` | `{settings.get("colors", {}).get(k, "")}` |' for k, label in COLORS]
    for k, label in FONTS:
        f = settings.get('font', {}).get(k, {})
        if f.get('custom_name'):
            v = f'custom: {f["custom_name"]} {f.get("custom_url", "")} {f.get("size", "")} {f.get("weight", "")}'.strip()
        else:
            v = ' '.join(x for x in (f.get('family', ''), f.get('size', ''), f.get('weight', '')) if x)
        rows.append(f'| {label} | `font.{k}` | `{v}` |')
    logo = settings.get('logo', '')
    rows.append(f'| Logo (File Library name) | `logo.file` | `{logo_file}` |')
    return (SETTINGS_HEAD + '\n'.join(rows) + '\n\n'
            f'Read {when} from {host}.' + (f' Logo as saved: `{logo}`' if logo else ' No logo set.') + '\n\n'
            + SETTINGS_DEFAULTS)


# Same wording as project-template/TEMPLATE-no-changes/style-settings-colors.md.
SETTINGS_HEAD = (
    '# Style Settings\n\n'
    '<!-- Filled by Claude from the Style page (kb_io.py unpack). In a version folder this table is\n'
    '     what that version deploys: change a Value and the next deploy sets it. Without the\n'
    '     built-in browser, read each swatch in Customize > Style > Style Settings by hand (the\n'
    '     picker reveals one hex at a time) and type it in; leave a Value blank to leave that\n'
    '     setting alone. KnowledgeOwl labels some swatches differently by theme ("common /\n'
    '     variant"); the order is the same. Fonts are "Family size weight", e.g. `Lato 48 700`.\n'
    '     logo.file is the logo\'s File Library name. -->\n\n'
    '## Values\n\n| Setting | Key | Value |\n|---|---|---|\n')
SETTINGS_DEFAULTS = (
    '## Minimalist theme defaults (reference)\n\n'
    'A stock Minimalist KB ships with: top navigation bar `#ffffff`, top navigation text `#1d284f`, '
    'headings `#212121`, table of contents `#f8f4f1`, table of contents text `#1d284f`, '
    'highlights & accents `#f8b88b`, icon color `#69b2f0`, icon background `#ffffff`; '
    'fonts `Lato 48 700` (headers) and `Lato 16 400` (article text). Also in '
    '`Reference/knowledgeowl-css-defaults.md`. Always confirm against the live KB; these are the '
    'baseline for reverting a KB to its original theme.\n')


def parse_settings_md(p):
    """The Values table of style-settings-colors.md, or None for an old-format file."""
    if not p.is_file():
        return None
    vals = {}
    for line in read(p).splitlines():
        m = re.match(r'^\|[^|]*\|\s*`([A-Za-z.]+)`\s*\|\s*`?([^|`]*)`?\s*\|\s*$', line)
        if m:
            vals[m.group(1)] = m.group(2).strip()
    return vals or None


def record(path, when, version, target, changed, clicked, readback):
    p = Path(path)
    head = ('# Deployments\n\nOne row per save or drift check, newest last. Written by `kb_io.py unpack --record`.\n\n'
            '| When | Version | Target | Changed | Clicked by | Read-back |\n|---|---|---|---|---|---|\n')
    text = read(p) if p.is_file() else head
    if not text.endswith('\n'):
        text += '\n'
    write(p, text + f'| {when} | {version} | {target} | {changed} | {clicked} | {readback} |\n')


def cmd_unpack(a):
    obj = decode_result(a.result)
    if obj.get('kind') == 'snapshot':
        return unpack_snapshot(obj, a)
    if obj.get('ok') is False and not obj.get('fields'):
        die('The read failed: ' + '; '.join(obj.get('problems', [])))
    have = load_json(WORK / 'have.json', missing={})
    if not have:
        print('No work/have.json: every field needs its text in the result. Run `have` first next time.')
    texts, prov, problems = resolve_fields(obj, have)
    target = f'{obj.get("host", "?")} (project {obj.get("pid", "?")})'
    print(f'KB: {obj.get("kbName") or "?"}, {target}. Admin: {"yes" if obj.get("admin") else "NO"}. '
          f'Save label: {obj.get("saveLabel") or "?"}. Previous saves: {len(obj.get("saves", []))}.')
    for p in obj.get('problems', []) + problems:
        print('PROBLEM: ' + p)
    for key, _, label in FIELDS:
        if key in prov:
            f = obj['fields'][key]
            print(f'  {key:15} {prov[key]:28} {f["n"]:>7} bytes  {label}')
    home = obj.get('home')
    if home:
        c = home['content']
        src = have.get('fields', {}).get('legacy', {}).get(c['h'], []) if have else []
        state = 'empty' if c['n'] == 0 else label_of(src)
        print(f'  {"legacy":15} {state:28} {c["n"]:>7} bytes  Homepage > Custom content (legacy); title: {home.get("title", "")}')
    live = {k: v for k, v in obj.items() if k not in ('fields', 'home')}
    live['fields'] = {k: {'h': f['h'], 'n': f['n'], 'from': prov.get(k, '?')} for k, f in obj.get('fields', {}).items()}
    if home:
        live['home'] = {'title': home.get('title', ''), 'h': home['content']['h'], 'n': home['content']['n']}
    save_json(WORK / 'live.json', live)
    save_json(WORK / f'live-{obj.get("pid", "unknown")}.json', live)
    new = [k for k in prov if prov[k] == 'NEW']
    if a.expect:
        return check_expect(obj, a, target)
    if a.into:
        if problems:
            die('Not written: fix the problems above first.')
        d = Path(a.into)
        d.mkdir(parents=True, exist_ok=True)
        for key, fn, _ in FIELDS:
            write(d / fn, as_file(texts[key]))
        if home:
            c = home['content']
            if 'text' in c:
                write(d / LEGACY, as_file(c['text']))
            elif src:
                write(d / LEGACY, as_file(source_text(have, src[0])))
        if obj.get('settings'):
            if obj['settings'].get('logo') and not logo_file_name(obj):
                print('Note: the logo is not an image in this KB\'s File Library, so logo.file is left blank.')
            write(d / 'style-settings-colors.md',
                  settings_md(obj['settings'], obj.get('host', '?'), now(), logo_file_name(obj)))
        for key, fn, _ in FIELDS:
            if h12(read(d / fn)) != obj['fields'][key]['h']:
                die(f'{fn} does not hash to the live value after writing; do not lock this folder.')
        print(f'Wrote the 12 fields{", the legacy field" if home else ""} and style-settings-colors.md to {d}. '
              'Every file re-hashes to the live value.')
    if a.into:
        if new:
            print(f'Taken from the live text (no local match): {", ".join(new)}.')
    elif new:
        print(f'DRIFT: no local file matches {", ".join(new)}.')
    else:
        print('No drift: every live field matches a local file.')
    if a.record and not a.into:
        changed = 'none' if not new else 'drift: ' + ', '.join(new)
        record(a.record, now(), '(drift check)', obj.get('host', '?'), changed, '-', 'no drift' if not new else 'current-state needed')


def check_expect(obj, a, target):
    plan = load_json(WORK / 'plan.json')
    check, fails = plan['check'], []
    if obj.get('pid') != plan['page']['pid']:
        die(f'This read is for project {obj.get("pid")}, the plan was for {plan["page"]["pid"]}.')
    for key, _, label in FIELDS:
        got = obj.get('fields', {}).get(key, {}).get('h')
        if got != check['fields'][key]:
            fails.append(f'{label}: live {got}, expected {check["fields"][key]}')
    live_s, exp = obj.get('settings', {}), check['settings']
    for k, v in exp.get('colors', {}).items():
        if live_s.get('colors', {}).get(k, '') != v:
            fails.append(f'colors.{k}: live {live_s.get("colors", {}).get(k)}, expected {v}')
    for k, f in exp.get('font', {}).items():
        for p in ('family', 'size', 'weight'):
            if live_s.get('font', {}).get(k, {}).get(p, '') != f.get(p, ''):
                fails.append(f'font.{k}.{p}: live {live_s.get("font", {}).get(k, {}).get(p)}, expected {f[p]}')
    if exp.get('logo_name') is not None and logo_file_name(obj) != exp['logo_name']:
        fails.append(f'logo: live {live_s.get("logo") or "none"}, expected the File Library image {exp["logo_name"]}')
    if exp.get('logo_url') is not None and live_s.get('logo', '') != exp['logo_url']:
        fails.append(f'logo: live {live_s.get("logo") or "none"}, expected it unchanged ({exp["logo_url"] or "none"})')
    for k in exp.get('same', {}):
        if json.dumps(live_s.get(k), sort_keys=True) != json.dumps(exp['same'][k], sort_keys=True):
            fails.append(f'setting {k} changed')
    added = [s for s in obj.get('saves', []) if s not in plan['page']['base']['saves']]
    if len(added) != 1:
        fails.append(f'the Revert list gained {len(added)} entries, expected exactly 1 (another save interleaved?)')
    verdict = 'PASS' if not fails else 'FAIL'
    print(f'Read-back {verdict} for {plan["check"]["version"]} on {target}.')
    for f in fails:
        print('  ' + f)
    if a.record:
        record(a.record, now(), plan['check']['version'], obj.get('host', '?'), plan['check']['summary'],
               a.clicked_by, 'PASS' if not fails else 'FAIL: ' + '; '.join(fails)[:300])
    if fails:
        sys.exit(1)


def unpack_snapshot(obj, a):
    text = obj.get('text', '')
    if h12(text) != obj.get('h'):
        die('The snapshot arrived altered (hash mismatch); capture it again.')
    if '<title>Warmup Page</title>' in text:
        die('KO served its Warmup Page. Load the page once, wait, and capture again.')
    if not a.snapshot:
        die('Give --snapshot FILE for a snapshot result.')
    write(a.snapshot, as_file(text))
    canon = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)', text) or \
        re.search(r'<link[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']canonical["\']', text)
    author = bool(re.search(r'<body[^>]*class=["\'][^"\']*\bis-author\b', text))
    print(f'Wrote {a.snapshot} ({len(text.encode("utf-8")):,} bytes) from {obj.get("url")}. '
          f'Canonical: {canon.group(1) if canon else "none found"}. '
          f'{"Author view (editor bar present)." if author else "Reader view."}')


# ---- the deploy plan ----------------------------------------------------------------
def content_checks(key, text):
    probs = []
    low = text.lower()
    if key in NEVER_EMPTY and not text:
        probs.append(f'{LABEL[key]} is empty; KO would save its default instead')
    for alternatives in REQUIRED.get(key, []):
        if text and not any(x.lower() in low for x in alternatives):
            probs.append(f'{LABEL[key]} lacks {" or ".join(alternatives)}; KO would append it on save')
    if key == 'body' and '[template("rcol")]' in low:
        probs.append('Custom HTML > Body contains [template("rcol")], which KO strips on save')
    if re.search(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', text):
        probs.append(f'{LABEL[key]} contains a control character')
    return probs


def make_edits(base, target):
    """Anchored [old, new] pairs turning base into target, or None when a patch is not safe."""
    a, b = base.splitlines(keepends=True), target.splitlines(keepends=True)
    ops = [o for o in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes() if o[0] != 'equal']
    merged = []
    for _, i1, i2, j1, j2 in ops:
        if merged and i1 - merged[-1][1] <= 3:
            merged[-1] = (merged[-1][0], i2, merged[-1][2], j2)
        else:
            merged.append((i1, i2, j1, j2))
    edits = []
    for i1, i2, j1, j2 in merged:
        ctx = 0
        while True:
            lo, hi = max(0, i1 - ctx), min(len(a), i2 + ctx)
            old = ''.join(a[lo:hi])
            if old and base.count(old) == 1:
                break
            if lo == 0 and hi == len(a):
                return None
            ctx = ctx + 1 if ctx < 4 else ctx * 2
        edits.append([old, ''.join(a[lo:i1]) + ''.join(b[j1:j2]) + ''.join(a[i2:hi])])
    t = base
    for old, new in edits:
        if t.count(old) != 1:
            return None
        t = t.replace(old, new, 1)
    return edits if t == target else None


def js_str(s):
    return json.dumps(s, ensure_ascii=False).replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')


def settings_plan(vdir, live, fail):
    """The settings part of the page plan, and the full settings the read-back must find."""
    cur = live.get('settings', {})
    expect = {'colors': dict(cur.get('colors', {})),
              'font': {k: {p: f.get(p, '') for p in ('family', 'size', 'weight')} for k, f in cur.get('font', {}).items()},
              'logo_url': cur.get('logo', ''),
              'same': {k: v for k, v in cur.items() if k not in ('colors', 'font', 'logo')}}
    page, lines = {}, []
    vals = parse_settings_md(vdir / 'style-settings-colors.md')
    if vals is None:
        lines.append('Style Settings: style-settings-colors.md has no Values table, so none are deployed')
        return page, expect, lines
    colors = {}
    for k, label in COLORS:
        v = vals.get('colors.' + k, '').lower()
        if v in ('', '#'):
            continue
        if not re.fullmatch(r'#[0-9a-f]{6}', v):
            fail.append(f'style-settings-colors.md: colors.{k} is not #rrggbb ({v})')
        elif v != cur.get('colors', {}).get(k, ''):
            colors[k] = v
            lines.append(f'Style Settings: {label}: {cur.get("colors", {}).get(k) or "unset"} -> {v}')
    if colors:
        page['colors'] = colors
        expect['colors'].update(colors)
    fonts = {}
    for k, label in FONTS:
        v = vals.get('font.' + k, '')
        if not v:
            continue
        c = cur.get('font', {}).get(k, {})
        if v.startswith('custom:') or c.get('custom_name'):
            if v != settings_md_font(c):
                lines.append(f'Style Settings: {label} uses a custom web font; set it by hand (not automated yet)')
            continue
        m = re.fullmatch(r'(.+?)\s+(\d+)\s+(\d+)', v)
        want = {'family': m.group(1), 'size': m.group(2), 'weight': m.group(3)} if m else {'family': v}
        if any(c.get(p, '') != want[p] for p in want):
            fonts[k] = want
            lines.append(f'Style Settings: {label}: {settings_md_font(c) or "unset"} -> {v}')
    if fonts:
        page['font'] = fonts
        for k, want in fonts.items():
            expect['font'].setdefault(k, {}).update(want)
    name = vals.get('logo.file', '')
    if name and name != logo_file_name(live):
        page['logo'] = {'name': name}
        expect['logo_name'] = name
        expect.pop('logo_url')
        lines.append(f'Style Settings: logo -> the File Library image {name} (must already be uploaded to this KB)')
    return page, expect, lines


def settings_md_font(f):
    if f.get('custom_name'):
        return f'custom: {f["custom_name"]} {f.get("custom_url", "")} {f.get("size", "")} {f.get("weight", "")}'.strip()
    return ' '.join(x for x in (f.get('family', ''), f.get('size', ''), f.get('weight', '')) if x)


def cmd_plan(a):
    vdir = Path(a.version).resolve()
    live = load_json(a.live or WORK / 'live.json')
    have = load_json(WORK / 'have.json')
    src_live = load_json(a.source) if a.source else None
    if have.get('self') != helper_self():
        die('work/have.json is from another copy of the helper; run `have` again.')
    fields, puts, lines, fail, notes, images, check = {}, [], [], [], [], [], {}
    chunk_no = 0
    for key, fn, label in FIELDS:
        live_h = live['fields'][key]['h']
        check[key] = live_h
        f = vdir / fn
        if not f.is_file():
            continue
        text = strip_capture_header(read(f))
        if is_placeholder(text):
            notes.append(f'{fn} is a template placeholder, so it is not deployed (the field stays as live)')
            continue
        target = norm(text)
        th = h12(target)
        if th == live_h:
            continue
        probs = content_checks(key, target)
        if probs:
            fail.extend(probs)
            continue
        sources = have['fields'].get(key, {}).get(live_h, [])
        if not sources and key not in a.overwrite:
            fail.append(f'{label}: the live content matches no local file (an outside edit). Capture it first, '
                        f'or rerun with --overwrite {key} once the user has approved replacing it.')
            continue
        entry = None
        if src_live and src_live['fields'].get(key, {}).get('h') == th:
            entry = {'via': 'from', 'pid': src_live['pid'], 'to': th}
            how = f'copied from {src_live.get("host")} in the page'
        elif sources:
            edits = make_edits(norm(source_text(have, sources[0])), target)
            if edits is not None and len(js_str(edits)) < min(CHUNK, len(target) // 2):
                entry = {'via': 'patch', 'edits': edits, 'to': th}
                how = f'patch, {len(edits)} edit{"s" if len(edits) != 1 else ""}'
        if entry is None:
            parts = []
            for i in range(0, len(target), CHUNK):
                piece = target[i:i + CHUNK]
                puts.append(f'koIO.put({chunk_no},{js_str(piece)},"{raw12(piece)}")')
                parts.append(chunk_no)
                chunk_no += 1
            entry = {'via': 'chunks', 'parts': parts, 'to': th}
            how = f'{len(parts)} chunk{"s" if len(parts) != 1 else ""}'
        fields[key] = entry
        check[key] = th
        was = label_of(sources) if sources else 'an outside edit (overwrite approved)'
        lines.append(f'{label}: live is {was}, becomes {vdir.name} ({how}, {len(target.encode("utf-8")):,} bytes)')
        if key == 'css' and sources:
            dropped = sorted(selectors(norm(source_text(have, sources[0]))) - selectors(target))
            base_n = len(selectors(norm(source_text(have, sources[0]))))
            lines.append(f'Selector check: {len(dropped)} of {base_n} live selectors dropped'
                         + (': ' + '; '.join(dropped[:15]) + (' ...' if len(dropped) > 15 else '') if dropped else ''))
        image_ref = r'/app/image/id/[0-9a-f]{24}/n/[^\s"\')]+'
        before = set(re.findall(image_ref, source_text(have, sources[0]))) if sources else set()
        images += [i for i in re.findall(image_ref, target) if i not in before]
    page_settings, expect_settings, setting_lines = settings_plan(vdir, live, fail)
    lines += setting_lines
    if fail:
        print('NOT PLANNED. Fix these first:')
        for f in fail:
            print('  ' + f)
        sys.exit(1)
    if not fields and not page_settings:
        print(f'Nothing to deploy: {vdir.name} already matches the live KB.')
        return
    page = {'self': have['self'], 'pid': live['pid'], 'host': live['host'],
            'base': {'fields': {k: live['fields'][k]['h'] for k, _, _ in FIELDS},
                     'settingsHash': live['settingsHash'], 'saves': live['saves']},
            'fields': fields, 'settings': page_settings}
    changed = [k for k in fields] + [f'colors.{k}' for k in page_settings.get('colors', {})] + \
              [f'font.{k}' for k in page_settings.get('font', {})] + (['logo'] if 'logo' in page_settings else [])
    save_json(WORK / 'plan.json', {'page': page, 'check': {'fields': check, 'settings': expect_settings,
                                                          'version': vdir.name, 'summary': ', '.join(changed)}})
    calls = WORK / 'calls'
    if calls.exists():
        for old in calls.glob('*.js'):
            old.unlink()
    for n, line in enumerate(puts, 1):
        write(calls / f'{n:02d}-put.js', f'(async()=>{{return await {line};}})()\n')
    stage = 'koIO.stage(' + json.dumps(page, ensure_ascii=False, separators=(',', ':')) \
        .replace('\u2028', '\\u2028').replace('\u2029', '\\u2029') + ')\n'
    write(calls / f'{len(puts) + 1:02d}-stage.js', stage)
    if len(stage.encode('utf-8')) > 30000:
        print(f'Note: the stage call is {len(stage.encode("utf-8")):,} bytes; print it with `cat` and copy it whole.')
    print(f'Deploy {vdir.name} to {live["host"]} (KB "{live.get("kbName", "?")}", project {live["pid"]}):')
    for line in lines:
        print('  ' + line)
    for n in notes:
        print('  Note: ' + n)
    if images:
        print('  New KB-hosted image references (each must be in this KB\'s File Library): ' + ', '.join(sorted(set(images))[:8]))
    print(f'Page calls, in order: {", ".join(p.name for p in sorted(calls.glob("*.js")))}')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    p = sub.add_parser('have')
    p.add_argument('root')
    p = sub.add_parser('unpack')
    p.add_argument('result')
    p.add_argument('--into')
    p.add_argument('--snapshot')
    p.add_argument('--expect', action='store_true')
    p.add_argument('--record')
    p.add_argument('--clicked-by', default='Claude')
    p = sub.add_parser('plan')
    p.add_argument('version')
    p.add_argument('--live')
    p.add_argument('--from', dest='source')
    p.add_argument('--overwrite', nargs='*', default=[])
    a = ap.parse_args()
    {'have': cmd_have, 'unpack': cmd_unpack, 'plan': cmd_plan}[a.cmd](a)


if __name__ == '__main__':
    main()
