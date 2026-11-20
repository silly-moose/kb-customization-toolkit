#!/usr/bin/env python3
"""kb_io.py: the local half of the KB Customization Toolkit's browser capture
and deploy. Standard library only. Procedure and rules:
process-docs/05-BROWSER_CAPTURE_AND_DEPLOY.md

  have <build-root>
      Hash every captured file in the build's dated folders, plus the
      Minimalist defaults and the deployed copies under work/deployed/,
      and print the HAVE argument for koIO.read().
  unpack <result> [--into DIR | --snapshot FILE] [--expect] [--record FILE]
      Decode a koIO.read() result (a spilled tool-result file, or an inline
      result saved verbatim) and report where each live field came from.
      --into writes a capture folder, --snapshot writes an HTML snapshot,
      --expect checks a save against the last plan and, on a pass, keeps a
      copy of each deployed field under work/deployed/, --record appends a row
      to DEPLOYMENTS.md. Each field's text is kept in work/live-<pid>/, where
      plan finds another KB's field to build from.
  plan <version-folder> [--live FILE] [--from FILE] [--overwrite KEY ...]
      Compare a version folder with the last read of the live KB, run the
      content checks, choose how each field travels (a copy from another KB,
      a patch, a build in the page, or chunks), and write the page calls plus
      the yes-request.
  inject
      Print the page call that fetches ko-style-io.js from the toolkit's
      GitHub repo at the last commit that changed it and runs it only if its
      SHA-256 matches the local file. Also saved as work/inject.js.

Summaries only go to stdout. Payloads are written under work/ next to this file.
"""
import argparse
import bisect
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
REPO = 'silly-moose/kb-customization-toolkit'
RAW = f'https://raw.githubusercontent.com/{REPO}/'
DEFAULTS_URL = RAW + 'main/process-docs/minimalist-theme-defaults/'
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
# Theme::cleanCodeOptions (service/models/Theme.php) writes these into `options` on every Style save,
# so a theme last saved before they existed gains them on its next save with nothing visible changing.
KO_FILLED_OPTIONS = ('code_theme', 'code_line_numbers', 'code_copy_button')
DATED = re.compile(r'^\d{4}\.\d{2}\.\d{2}-')
CHUNK = 25000
PATCH_MAX = 60000   # a patch travels inside the stage call; one of about 34 KB staged and saved fine
BUILD_MIN = 80      # a build reuses a stretch of text only when it is longer than describing it
BLOCK = 48          # the length of the source blocks a build looks for in the version's text
TYPED_MAX = 20000   # a build's typed parts beyond this travel as put() chunks, largest first
TOOLKIT_RAW = re.compile(r'https://raw\.githubusercontent\.com/silly-moose/kb-customization-toolkit/[0-9a-f]{40}/[\w./-]+', re.A)
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


def get_url(url):
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            return r.read()
    except Exception:   # some Python installs lack CA certificates; curl uses the system's
        return subprocess.run(['curl', '-fsSL', url], capture_output=True, check=True, timeout=30).stdout


def commits_of(path, n):
    """The last n commits on main that changed one toolkit file, newest first."""
    return [c['sha'] for c in json.loads(get_url(f'https://api.github.com/repos/{REPO}/commits?sha=main&per_page={n}&path={path}'))]


def cmd_inject(a):
    path = 'process-docs/kb-io/ko-style-io.js'
    want = hashlib.sha256((HERE / 'ko-style-io.js').read_bytes()).hexdigest()
    try:
        commit = commits_of(path, 1)[0]
        url = f'{RAW}{commit}/{path}'
        same = hashlib.sha256(get_url(url)).hexdigest() == want
    except Exception as e:
        die(f'Could not reach GitHub ({e}). Paste the helper whole instead: cat .claude/kb-io/ko-style-io.js')
    if not same:
        die(f'The local ko-style-io.js is not the toolkit\'s copy at {commit[:7]}, the last commit that changed it. '
            'Run the session-start sync again, or paste the helper whole.')
    call = ("(async()=>{const t=await(await fetch('" + url + "')).text();"
            "const d=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t))),"
            "b=>b.toString(16).padStart(2,'0')).join('');"
            "if(d!=='" + want + "')return 'NOT INJECTED: the fetched helper hashes to '+d;"
            "return await(0,eval)(t);})()")
    write(WORK / 'inject.js', call + '\n')
    print(call)
    print(f'Fetches ko-style-io.js at {commit[:7]} and runs it only if it matches the local file. '
          f'Saved as work/inject.js. It should return self-hash {helper_self()}.')


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
    """The normalized text behind one `have` source: a build file, a Minimalist default or a deployed copy."""
    if src.endswith(PLACEHOLDER_TAG):
        return ''
    if src.startswith('defaults/'):
        text = read(WORK / 'defaults' / src.split('/')[1].split(' ')[0])
        return without_guard(text) if src.endswith('(without the guard)') else text
    if src.startswith('deployed/'):
        return read(WORK / src)
    return strip_capture_header(read(Path(have['root']) / src))


def label_of(sources):
    real = [s for s in sources if not s.endswith(PLACEHOLDER_TAG)]
    if not real:
        return 'empty' if sources else 'NEW'
    if all(s.startswith('defaults/') for s in real):
        return 'stock default'
    named = [s for s in real if not s.startswith('defaults/')]
    files = [s for s in named if not s.startswith('deployed/')]
    if files:
        return sorted(Path(s).parent.name for s in files)[-1]
    # Only the copy kept at read-back matches: the version folder was corrected in place since.
    return sorted(Path(s).parent.name for s in named)[-1] + ' (as deployed)'


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
    # Fields as they were deployed, kept by `unpack --expect`, so a version folder corrected
    # in place after its deploy still knows the live text and can be patched against it.
    deployed = sorted((WORK / 'deployed').glob('*/*'))
    for f in deployed:
        key = next((k for k, fn, _ in FIELDS if fn == f.name), None)
        if key:
            index[key].setdefault(h12(read(f)), []).append(f.relative_to(WORK).as_posix())
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
    print(f'{sum(len(v) for v in index.values())} known hashes from {len(folders)} dated folders, '
          f'{len(deployed)} deployed cop{"y" if len(deployed) == 1 else "ies"} and the Minimalist defaults. '
          f'Helper self-hash {me}.')
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
        # A result returned through browser_batch arrives as a JSON string literal
        # ("KOIO1{\"kind\"...}") inside the batch's results file, with other text
        # around it: decode that string and look again. Skip an escaped \"KOIO1: that
        # is a string literal inside another one (a spilled result whose content
        # part's text is the literal plus "(captured at origin ...)"), and the
        # leading-literal decode below unwraps the outer layer first.
        j = s.find('"KOIO1')
        while j > 0 and s[j - 1] == '\\':
            j = s.find('"KOIO1', j + 1)
        if j >= 0:
            try:
                v, _ = dec.raw_decode(s, j)
                if isinstance(v, str) and v.find('KOIO1') >= 0 and v != s:
                    s = v
                    continue
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
        'or read fewer fields per call. A result run inside browser_batch is decoded too; if this '
        'still fails, run the snippet as a single javascript_tool call.')


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
    if obj.get('logoLookup'):
        print(f'PROBLEM: the logo\'s File Library lookup {obj["logoLookup"]}, so this read cannot say which image the logo is.')
    s = obj.get('settings') or {}
    if s:
        print(f'Theme: {s.get("theme_name") or "?"}{" (locked)" if s.get("__themeLocked") else ""}.')
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
    # The text of each field, so that a later plan can build another KB's version from this one.
    for key, fn, _ in FIELDS:
        kept = WORK / f'live-{obj.get("pid", "unknown")}' / fn
        if key in texts and h12(texts[key]) == obj['fields'][key]['h']:
            write(kept, as_file(texts[key]))
        elif kept.is_file():
            kept.unlink()
    new = [k for k in prov if prov[k] == 'NEW']
    if home and c['n'] and label_of(src) == 'NEW':
        new.append('legacy')
    if new and not a.expect:
        print(f'Time of current save: {obj.get("curSave") or "?"}. Previous saves, as KO lists them (local time, author):')
        for lbl in obj.get('saveLabels', []):
            print('  ' + lbl)
    if a.expect:
        return check_expect(obj, a, target, texts)
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
    if a.record:
        changed = 'none' if not new else 'drift: ' + ', '.join(new)
        result = ('no drift' if not new else 'current-state needed') if not a.into else f'captured to {Path(a.into).name}'
        record(a.record, now(), '(drift check)' if not a.into else '(capture)', obj.get('host', '?'), changed, '-', result)


def check_expect(obj, a, target, texts):
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
    if exp.get('logo_name') is not None and obj.get('logoLookup'):
        fails.append(f'logo: the File Library lookup {obj["logoLookup"]}; read again from the article list tab')
    elif exp.get('logo_name') is not None and logo_file_name(obj) != exp['logo_name']:
        fails.append(f'logo: live {live_s.get("logo") or "none"}, expected the File Library image {exp["logo_name"]}')
    if exp.get('logo_url') is not None and live_s.get('logo', '') != exp['logo_url']:
        fails.append(f'logo: live {live_s.get("logo") or "none"}, expected it unchanged ({exp["logo_url"] or "none"})')
    notes, same = [], lambda x, y: json.dumps(x, sort_keys=True) == json.dumps(y, sort_keys=True)
    for k, was in exp.get('same', {}).items():
        now_v = live_s.get(k)
        if isinstance(now_v, dict) and (isinstance(was, dict) or was in ([], None)):
            was = was if isinstance(was, dict) else {}   # PHP stores an empty map as []
            diff = sorted(x for x in set(was) | set(now_v) if not same(was.get(x), now_v.get(x)))
            filled = [x for x in diff if x not in was and x in KO_FILLED_OPTIONS]
            if filled:
                notes.append(f'KO filled in setting {k}: ' + ', '.join(f'{x}={json.dumps(now_v[x])}' for x in filled)
                             + ' (written on every save; nothing visible changes)')
            if [x for x in diff if x not in filled]:
                fails.append(f'setting {k} changed: ' + ', '.join(x for x in diff if x not in filled))
        elif not same(now_v, was):
            fails.append(f'setting {k} changed')
    added = [s for s in obj.get('saves', []) if s not in plan['page']['base']['saves']]
    if len(added) != 1:
        fails.append(f'the Revert list gained {len(added)} entries, expected exactly 1 (another save interleaved?)')
    verdict = 'PASS' if not fails else 'FAIL'
    print(f'Read-back {verdict} for {plan["check"]["version"]} on {target}.')
    for f in fails:
        print('  ' + f)
    for n in notes:
        print('  Note: ' + n)
    if not fails:
        kept = []
        for key, fn, _ in FIELDS:
            if key in plan['page']['fields'] and h12(texts.get(key, '')) == check['fields'][key]:
                write(WORK / 'deployed' / plan['check']['version'] / fn, as_file(texts[key]))
                kept.append(key)
        if kept:
            print(f'Kept the deployed text of {", ".join(kept)} in work/deployed/{plan["check"]["version"]}/ for `have`.')
    if a.record:
        record(a.record, now(), plan['check']['version'], obj.get('host', '?'), plan['check']['summary'],
               a.clicked_by, ('PASS' + ''.join('; ' + n for n in notes))[:300] if not fails else 'FAIL: ' + '; '.join(fails)[:300])
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
    # KO's body class names the page type; category pages also carry hg-article-page, so it is checked last.
    body = re.search(r'<body[^>]*class=["\']([^"\']*)', text)
    classes = body.group(1).split() if body else []
    kind = next((k for k in ('home', 'search', 'contact', 'login', 'glossary', 'blog', 'category', 'widget', 'article')
                 if f'hg-{k}-page' in classes), None)
    print(f'Wrote {a.snapshot} ({len(text.encode("utf-8")):,} bytes) from {obj.get("url")}. '
          f'Canonical: {canon.group(1) if canon else "none found"}. '
          f'{"Author view (editor bar present)." if author else "Reader view."} '
          f'Page type: {kind or "unknown"}.')
    named = re.search(r'snapshot-(homepage|article|category|search|contact)\b', Path(a.snapshot).name)
    if named and kind and {'homepage': 'home'}.get(named.group(1), named.group(1)) != kind:
        print(f'WARNING: the file name says {named.group(1)}, but the page is a {kind} page '
              f'(hg-{kind}-page). Pick another link and capture again.')


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


def js_json(obj):
    return js_str(obj) if isinstance(obj, str) else \
        json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')


def put_line(n, piece):
    return f'koIO.put({n},{js_str(piece)},"{raw12(piece)}")'


def nbytes(s):
    return len(s.encode('utf-8'))


# ---- the build transfer: a field assembled in the page from text it can already reach -----
def utf16(text):
    """Turns a character offset in text into the UTF-16 offset JavaScript's slice() uses."""
    astral = [m.start() for m in re.finditer('[\U00010000-\U0010ffff]', text)]
    return lambda i: i + bisect.bisect_left(astral, i)


def same_ahead(x, i, y, j):
    """How many characters x[i:] and y[j:] have in common at their start."""
    lim, n, step = min(len(x) - i, len(y) - j), 0, 1
    while n + step <= lim and x[i + n:i + n + step] == y[j + n:j + n + step]:
        n += step
        step *= 2
    while step > 1:
        step //= 2
        if n + step <= lim and x[i + n:i + n + step] == y[j + n:j + n + step]:
            n += step
    return n


def same_behind(x, i, y, j, floor):
    """How many characters x[:i] and y[:j] have in common at their end, not reaching below x[floor]."""
    lim, n, step = min(i - floor, j), 0, 1
    while n + step <= lim and x[i - n - step:i - n] == y[j - n - step:j - n]:
        n += step
        step *= 2
    while step > 1:
        step //= 2
        if n + step <= lim and x[i - n - step:i - n] == y[j - n - step:j - n]:
            n += step
    return n


def cover(target, texts):
    """target as a list of slices of texts, (k, start, end) in characters, and typed strings.
    Each text is cut into fixed blocks; every place the target holds one is grown both ways, the
    longest growth wins (ties go to the earlier text), and stretches no text holds are typed."""
    index = {}
    for k, s in enumerate(texts):
        for p in range(0, len(s) - BLOCK + 1, BLOCK):
            index.setdefault(s[p:p + BLOCK], []).append((k, p))
    out, done, t = [], 0, 0
    while t + BLOCK <= len(target):
        cands = index.get(target[t:t + BLOCK], ())
        best = None
        if len(cands) <= 64:   # a block found everywhere (a run of spaces) is no guide
            for k, p in cands:
                back = same_behind(target, t, texts[k], p, done)
                n = back + same_ahead(target, t, texts[k], p)
                if best is None or n > best[0]:
                    best = (n, k, p - back, t - back)
        if best and best[0] >= BUILD_MIN:
            n, k, a, start = best
            if start > done:
                out.append(target[done:start])
            out.append((k, a, a + n))
            done = t = start + n
        else:
            t += 1
    if done < len(target):
        out.append(target[done:])
    return out


def kb_text(pid, key, fn, h, have):
    """Another KB's saved field, normalized, from the last unpack of that KB or a local file; None
    when neither hashes to h."""
    kept = WORK / f'live-{pid}' / fn
    if kept.is_file() and h12(read(kept)) == h:
        return norm(read(kept))
    for src in have['fields'].get(key, {}).get(h, []):
        text = source_text(have, src)
        if h12(text) == h:
            return norm(text)
    return None


class Toolkit:
    """Toolkit files a build can fetch: each local copy is matched to the toolkit's file at one of
    its last ten commits on main by SHA-256, the same check `inject` makes. Matches are kept in
    work/toolkit-pins.json, since a file at a commit never changes."""

    def __init__(self):
        self.pins = load_json(WORK / 'toolkit-pins.json', missing={})
        self.tree, self.problem = None, None

    def pin(self, local, path=None):
        data = Path(local).read_bytes()
        want = hashlib.sha256(data).hexdigest()
        if want in self.pins:
            return self.pins[want]
        if self.problem:
            return None
        try:
            if path is None:
                if self.tree is None:
                    tree = json.loads(get_url(f'https://api.github.com/repos/{REPO}/git/trees/main?recursive=1'))
                    self.tree = [x['path'] for x in tree.get('tree', []) if x.get('type') == 'blob']
                found = [p for p in self.tree if p.startswith('process-docs/') and p.rsplit('/', 1)[-1] == Path(local).name]
                if len(found) != 1:
                    return None
                path = found[0]
            for commit in commits_of(path, 10):
                url = f'{RAW}{commit}/{path}'
                if TOOLKIT_RAW.fullmatch(url) and '..' not in url and hashlib.sha256(get_url(url)).hexdigest() == want:
                    self.pins[want] = {'url': url, 'sha': want}
                    save_json(WORK / 'toolkit-pins.json', self.pins)
                    return self.pins[want]
        except Exception as e:
            self.problem = f'GitHub could not be reached ({e}), so no build fetches a toolkit file'
        return None


def make_build(key, fn, target, vdir, live_text, src, toolkit):
    """A build of target, as (entry, typed parts that go by put(), bytes to send, a description,
    whether it draws on the live text alone), or None when nothing reachable is worth reusing.
    Sources: this field's live text, the same field saved on the --from KB, and toolkit files
    (copies in the version folder, and the Minimalist default)."""
    cands = []   # (what the page fetches, normalized text, how the plan names it)
    if live_text is not None:
        cands.append(({'live': True}, live_text, 'the live text'))
    if src:
        cands.append(({'from': src['pid'], 'h': src['h']}, src['text'], f'the field saved on {src["host"]}'))
    files = [(p, None) for p in sorted(vdir.iterdir()) if p.is_file() and p.suffix in ('.js', '.css', '.html', '.htm')
             and p.name not in {f for _, f, _ in FIELDS} | {LEGACY}]
    if (WORK / 'defaults' / fn).is_file():
        files.append((WORK / 'defaults' / fn, 'process-docs/minimalist-theme-defaults/' + fn))
    for p, path in files:
        try:
            text = norm(read(p))
        except UnicodeDecodeError:
            continue
        if len(text) >= BUILD_MIN:
            cands.append(({'file': p, 'path': path}, text, p.name if path is None else f'the Minimalist default {fn}'))
    while True:
        pieces = cover(target, [c[1] for c in cands])
        used = sorted({p[0] for p in pieces if isinstance(p, tuple)})
        unpinned = [k for k in used if 'file' in cands[k][0] and not toolkit.pin(cands[k][0]['file'], cands[k][0]['path'])]
        if not unpinned:
            break
        cands = [c for k, c in enumerate(cands) if k not in unpinned]
    if not used:
        return None
    srcs, names = [], []
    for k in used:
        what, _, name = cands[k]
        if 'file' in what:
            pin = toolkit.pin(what['file'], what['path'])
            what, name = {'url': pin['url'], 'sha': pin['sha']}, f'{name} at {pin["url"][len(RAW):len(RAW) + 7]}'
        srcs.append(what)
        names.append(name)
    at = {k: n for n, k in enumerate(used)}
    off = {k: utf16(cands[k][1]) for k in used}
    out, typed = [], {}
    for p in pieces:
        if isinstance(p, tuple):
            k, a, b = p
            out.append({'s': at[k], 'a': off[k](a), 'b': off[k](b), 'h': raw12(cands[k][1][a:b])})
        else:
            out.append({'text': p, 'h': raw12(p)})
    # The typed parts ride in the stage call; the largest move to put() chunks until the rest fits.
    rest = sum(nbytes(js_str(p['text'])) for p in out if 'text' in p)
    for i in sorted((i for i, p in enumerate(out) if 'text' in p), key=lambda i: -len(out[i]['text'])):
        if rest <= TYPED_MAX:
            break
        typed[i] = out[i].pop('text')
        out[i]['put'] = []
        rest -= nbytes(js_str(typed[i]))
    entry = {'via': 'build', 'src': srcs, 'pieces': out, 'to': h12(target)}
    chunks = [t[c:c + CHUNK] for t in typed.values() for c in range(0, len(t), CHUNK)]
    sent = nbytes(js_json(entry)) + sum(nbytes(put_line(0, c)) for c in chunks)
    n_typed = sum(nbytes(p) for p in pieces if isinstance(p, str))
    how = 'build from ' + (', '.join(names[:-1]) + ' and ' + names[-1] if len(names) > 1 else names[0])
    if n_typed:
        how += f', plus {n_typed:,} typed bytes'
    if chunks:
        how += (f' ({sum(nbytes(t) for t in typed.values()):,} of them in {len(chunks)} put() '
                f'chunk{"s" if len(chunks) != 1 else ""})')
    only_live = all('live' in s for s in srcs)
    return entry, typed, sent, how, only_live


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
    chunk_no, toolkit, no_src = 0, Toolkit(), []
    # Switching on Image / file security rewrites the theme's File Library links to
    # /files/<account>/<file>/<name>; the old public /app/image/ links then return 401.
    secured = any(re.search(r'/files/[0-9a-f]{24}/[0-9a-f]{24}/', source_text(have, s[0]))
                  for s in (have['fields'].get(k, {}).get(live['fields'][k]['h'], []) for k, _, _ in FIELDS) if s)
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
        entry, how, weighed = None, '', []
        if src_live and src_live['fields'].get(key, {}).get('h') == th:
            entry = {'via': 'from', 'pid': src_live['pid'], 'to': th}
            how = f'copied from {src_live.get("host")} in the page'
        else:
            # Weigh the ways this field can travel by the bytes each sends through the conversation.
            base = norm(source_text(have, sources[0])) if sources else None
            chunked = [target[i:i + CHUNK] for i in range(0, len(target), CHUNK)]
            best = (sum(nbytes(put_line(0, c)) for c in chunked), 'chunks', None)
            weighed.append(f'chunks {best[0]:,}')
            patched = False
            if base is not None:
                edits = make_edits(base, target)
                size = len(js_str(edits)) if edits is not None else 0
                if edits is None:
                    weighed.append('patch not possible (no anchor occurs once)')
                elif size < min(PATCH_MAX, len(target) // 2):
                    best, patched = (nbytes(js_str(edits)), 'patch', edits), True
                    weighed.append(f'patch {best[0]:,}')
                else:
                    weighed.append(f'patch {nbytes(js_str(edits)):,} (over '
                                   f'{"half the field" if size >= len(target) // 2 else f"{PATCH_MAX:,} characters"})')
            src = None
            if src_live and src_live['fields'].get(key, {}).get('h'):
                sh = src_live['fields'][key]['h']
                st = kb_text(src_live['pid'], key, fn, sh, have)
                if st is None:
                    no_src.append(key)
                else:
                    src = {'pid': src_live['pid'], 'h': sh, 'host': src_live.get('host'), 'text': st}
            built = make_build(key, fn, target, vdir, base, src, toolkit)
            # A build from the live text alone is a patch by offsets; the patch is used where it can be.
            if built and not (built[4] and patched):
                weighed.append(f'build {built[2]:,}')
                if built[2] < best[0]:
                    best = (built[2], 'build', built)
            if best[1] == 'build':
                entry, typed, _, how, _ = best[2]
                for i in sorted(typed):
                    ids = []
                    for c in range(0, len(typed[i]), CHUNK):
                        puts.append(put_line(chunk_no, typed[i][c:c + CHUNK]))
                        ids.append(chunk_no)
                        chunk_no += 1
                    entry['pieces'][i]['put'] = ids
            elif best[1] == 'patch':
                entry = {'via': 'patch', 'edits': best[2], 'to': th}
                how = f'patch, {len(best[2])} edit{"s" if len(best[2]) != 1 else ""}'
            else:
                parts = []
                for piece in chunked:
                    puts.append(put_line(chunk_no, piece))
                    parts.append(chunk_no)
                    chunk_no += 1
                entry = {'via': 'chunks', 'parts': parts, 'to': th}
                how = f'{len(parts)} chunk{"s" if len(parts) != 1 else ""}'
        fields[key] = entry
        check[key] = th
        was = label_of(sources) if sources else 'an outside edit (overwrite approved)'
        lines.append(f'{label}: live is {was}, becomes {vdir.name} ({how}, {len(target.encode("utf-8")):,} bytes)')
        if len(weighed) > 1:
            lines.append('  weighed, in bytes to send: ' + ', '.join(weighed))
        if key == 'css':
            rem = re.findall(r'(?<![\w.-])\d*\.?\d+rem\b', target)
            if rem:
                lines.append(f'WARNING: Custom CSS uses rem {len(rem)} time{"s" if len(rem) != 1 else ""} '
                             f'({", ".join(sorted(set(rem))[:6])}); 1rem is 10px on KO reader pages, not 16px '
                             '(quirks-doc 52). Use px or em.')
        if key == 'css' and sources:
            dropped = sorted(selectors(norm(source_text(have, sources[0]))) - selectors(target))
            base_n = len(selectors(norm(source_text(have, sources[0]))))
            lines.append(f'Selector check: {len(dropped)} of {base_n} live selectors dropped'
                         + (': ' + '; '.join(dropped[:15]) + (' ...' if len(dropped) > 15 else '') if dropped else ''))
        # Only links the version adds: one the live text already holds is not this version's doing,
        # and can be another account's public file, which still returns 200.
        app_link = r'/app/image/id/[0-9a-f]{24}/'
        new_app = set(re.findall(app_link, target)) - \
            (set(re.findall(app_link, source_text(have, sources[0]))) if sources else set())
        if secured and new_app:
            lines.append(f'WARNING: {label} adds {len(new_app)} File Library link{"s" if len(new_app) != 1 else ""} '
                         'by the public /app/image/ address, but the live theme uses /files/ links (Image / file '
                         'security is on), and the public links return 401. Take the /files/ addresses from the '
                         'live text (quirks-doc 60).')
        image_ref = r'/app/image/id/[0-9a-f]{24}/n/[^\s"\')]+'
        before = set(re.findall(image_ref, source_text(have, sources[0]))) if sources else set()
        images += [i for i in re.findall(image_ref, target) if i not in before]
    page_settings, expect_settings, setting_lines = settings_plan(vdir, live, fail)
    lines += setting_lines
    if toolkit.problem:
        notes.append(toolkit.problem)
    if no_src:
        notes.append(f'the text of {", ".join(no_src)} as saved on {src_live.get("host")} is not on disk, so no build '
                     'draws on it; read that KB and unpack the result again')
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
        print('  New KB-hosted image references (each must be in this KB\'s File Library, or the live KB\'s on a sandbox build): ' + ', '.join(sorted(set(images))[:8]))
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
    sub.add_parser('inject')
    a = ap.parse_args()
    {'have': cmd_have, 'unpack': cmd_unpack, 'plan': cmd_plan, 'inject': cmd_inject}[a.cmd](a)


if __name__ == '__main__':
    main()
