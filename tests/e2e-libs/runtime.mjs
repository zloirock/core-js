// The runtime tier, in ONE pass: for every (library x method x provider x phase) cell it builds the
// real IE11 bundle exactly once and hands that single build to every consumer - the gates, the
// injection snapshot, the node pre-flight, the artifact page and Karma. Keeping it that way is the
// whole design, and the rest of the reasoning - why the providers are paired as reference and delta,
// what gates and what only informs - is in AGENTS.md rather than repeated here.
//
// Usage:  npm run test-e2e-libs-runtime [libFilter]    OVERWRITE=1 rewrites the snapshot baselines
import { runtimeBuild, assertES5, wireSize, errorReason, METHODS, PROVIDERS, phasesFor, TS_SOURCE_PACKAGES, HERE } from './build.mjs';
import { bannerHarness, qunitHarness } from './harness.mjs';
import { librariesIn } from './libraries.mjs';
import { fileURLToPath } from 'node:url';

const { mkdir, readFile, rm, writeFile } = fs;
const { join, relative } = path;
const { OVERWRITE } = process.env;

const ART = join(HERE, 'artifacts');
const MANIFEST = join(ART, 'manifest.json');
const SNAP = join(HERE, 'snapshots');
const TMP = join(HERE, '.tmp');
const KARMA_OUT = join(TMP, 'karma');

const [libFilter, ...surplus] = argv._;
if (surplus.length) throw new Error(`unexpected argument(s): ${ surplus.join(' ') } - runtime.mjs takes [libFilter]`);
const libs = librariesIn('runtime', libFilter);

// -------- consumers --------

async function baseline(file) {
  try {
    return (await readFile(file, 'utf8')).split('\n').map(l => l.trim()).filter(Boolean);
  } catch (err) {
    if (err.code === 'ENOENT') return null; // no baseline yet - first run
    throw err; // a real read error must not masquerade as "no baseline" and silently overwrite
  }
}

function snapPath(lib, provider, method, phase) {
  return join(SNAP, `${ lib.name }.${ provider }.${ method }${ phase ? `.${ phase }` : '' }.txt`);
}

// What a cell contributes to version control depends on which provider produced it.
//
// babel-plugin is the REFERENCE: it has no phase, so its file is simply the set it injected.
// unplugin is a DELTA against the reference for the same (library, method): `-spec` for what
// babel-plugin injected and this phase did not, `+spec` for the other direction. Storing the delta
// rather than a second full set is the point of the pairing - the three unplugin phases of a library
// differ from the reference by a handful of specifiers each, and it is exactly those handfuls that
// carry the information. A full-set snapshot buries them in a wall of identical lines, and a phase
// regression then has to be found by eye across two files.
//
// Missing first, extra second, each group sorted: stable output, and the two directions read
// differently enough that they should not interleave.
function deltaLines(reference, injected) {
  const ref = new Set(reference);
  const now = new Set(injected);
  return [
    ...reference.filter(s => !now.has(s)).sort().map(s => `-${ s }`),
    ...injected.filter(s => !ref.has(s)).sort().map(s => `+${ s }`),
  ];
}

// Compare (or author) a cell's snapshot lines. Returns 'ok' | 'updated' | 'drift' | 'missing'.
//
// A drift prints WHERE, not just what. The lines alone ("`es.iterator.filter` is new") cannot be
// acted on: the interesting question is always which module the provider decided to inject it into,
// because that is what identifies the detection site that changed its mind. `origins` comes free out
// of the same build (see build.mjs::recorder), so this costs nothing on the passing path.
async function snapshot(file, lines, origins) {
  const base = await baseline(file);
  if (OVERWRITE) {
    // a delta can legitimately be EMPTY (the phase agrees with the reference exactly). The file is
    // still written, so "agrees" is a recorded state rather than an absent one - otherwise a
    // vanished baseline and a perfect match would look identical on the next run.
    await writeFile(file, lines.length ? `${ lines.join('\n') }\n` : '');
    echo(`    snapshot ${ base ? 'updated' : 'created' } (${ lines.length })`);
    return 'updated';
  }
  // only an explicit OVERWRITE may author a baseline. Auto-creating one here would make a new library
  // (or a baseline lost in a merge) report success while having verified nothing.
  if (!base) {
    echo(`    FAIL no baseline at ${ file } - rerun with OVERWRITE=1 to author it`);
    return 'missing';
  }
  const now = new Set(lines);
  const old = new Set(base);
  const added = lines.filter(s => !old.has(s));
  const removed = base.filter(s => !now.has(s));
  if (!added.length && !removed.length) return 'ok';
  // quoted because a delta line carries its own leading `-`/`+`, which would otherwise read as part
  // of the drift marker: `+ -core-js/modules/web.self` is two signs meaning different things
  for (const s of added) {
    echo(`    + "${ s }"  (new)`);
    // a specifier can land in several modules; all of them are candidates for the changed decision.
    // strip a delta sign before the lookup - `origins` is keyed by the bare specifier
    for (const where of origins.get(s.replace(/^[+-]/, '')) ?? []) echo(`        injected into ${ where }`);
  }
  // no origins for a removed one - by definition this build never injected it
  for (const s of removed) echo(`    - "${ s }"  (gone)`);
  return 'drift';
}

// runs in the child, where `-e` has no module path of its own: the bundle is resolved against the cwd,
// since a bare `.tmp/x` would be read as a package name
const PREFLIGHT = 'const m = require(require("node:path").resolve(process.argv[1]));'
  + ' const run = m.run || (m.default && m.default.run) || m.default;'
  + ' Promise.resolve(run()).then(function (r) { process.stdout.write(JSON.stringify(r.checks)); })'
  + ' .catch(function (e) { process.stderr.write(String((e && e.stack) || e)); process.exit(1); });';

// Run a UMD bundle in a fresh node process (full realm, isolated) and return its `run()` checks.
// Isolation is required, not tidiness: core-js mode:full permanently patches globals, so running two
// methods in one process would let one method's injection mask another's missing one.
async function preflight(code) {
  await mkdir(TMP, { recursive: true });
  // pid as well as hrtime: hrtime reads the same monotonic clock in every process, so two concurrent
  // runs sharing this checkout could land on one path - and this file is executed, not just read
  const f = join(TMP, `preflight-${ process.pid }-${ process.hrtime.bigint() }.cjs`);
  await writeFile(f, code);
  try {
    // `node` by name and a relative path: on windows `$` runs through bash, which cannot execute an
    // absolute `C:\...`. An unsettled `run()` exits 0 with empty stdout, hence the guard below.
    const { stdout } = await $({ cwd: HERE, quiet: true, timeout: '120s' })`node -e ${ PREFLIGHT } ${ relative(HERE, f).replaceAll('\\', '/') }`;
    if (!stdout.trim()) throw new Error('preflight child produced no output - run() likely never settled');
    try {
      return JSON.parse(stdout);
    } catch {
      throw new Error(`preflight stdout is not JSON: ${ stdout.slice(0, 200) }`);
    }
  } finally {
    await rm(f, { force: true });
  }
}

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const HTML_ESCAPE_RE = /["&'<>]/g;
function esc(s) {
  return String(s).replaceAll(HTML_ESCAPE_RE, c => HTML_ESCAPES[c]);
}

// The in-page harness (banner target) lives in harness.mjs, shared with the Karma driver and parsed
// as ES5 at that module's load. `bannerHarness(count)` bakes the pre-flight count in, so a page whose
// in-browser run returns fewer checks than node did cannot paint itself green.
function html(title, subtitle, checks) {
  const rows = checks.map(c => `<tr class="${ c.pass ? 'ok' : 'bad' }"><td>${ esc(c.label) }</td><td>${ c.pass ? 'PASS' : 'FAIL' }</td></tr>`).join('');
  const failing = checks.filter(c => !c.pass).length;
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>e2e-libs ${ esc(title) }/${ esc(subtitle) }</title>
<style>
  body{font:14px/1.5 system-ui,sans-serif;margin:2rem;max-width:720px}
  #banner{padding:1rem;border-radius:8px;font-weight:700;font-size:18px;color:#fff}
  .green{background:#166534}.red{background:#991b1b}.wait{background:#525252}
  table{border-collapse:collapse;margin-top:1rem;width:100%}
  td{border:1px solid #ccc;padding:4px 8px}
  tr.ok td:nth-child(2){color:#166534;font-weight:700}
  tr.bad td:nth-child(2){color:#991b1b;font-weight:700}
</style></head>
<body>
  <h1>${ esc(title) } - <code>${ esc(subtitle) }</code></h1>
  <div id="banner" class="wait">running...</div>
  <p>Pre-flight in node recorded ${ checks.length - failing }/${ checks.length } passing. This page reruns the same checks in <em>this</em> browser.</p>
  <table id="tbl"><thead><tr><th>check</th><th>result</th></tr></thead><tbody>${ rows }</tbody></table>
  <script src="bundle.js"></script>
  <script>${ bannerHarness(checks.length) }  </script>
</body></html>
`;
}

// -------- the single pass --------

// A filtered run merges into the existing manifest, so read and validate it FIRST: discovering a
// corrupt one after the wipe would destroy the artifacts it describes and every rebuilt cell with it.
const rebuilt = new Set(libs.map(l => l.name));
let previous = [];
if (libFilter) {
  try {
    const parsed = JSON.parse(await readFile(MANIFEST, 'utf8'));
    if (!Array.isArray(parsed)) throw new Error('manifest.json is not an array');
    previous = parsed.filter(e => !rebuilt.has(e.lib));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err; // a corrupt manifest must not be silently discarded
  }
}

// Cells are only written on the success path, so without a wipe a failed cell leaves yesterday's
// all-green page on disk while the manifest records the failure - and the operator is told to upload
// whatever is in those directories. An unfiltered run therefore clears everything; a filtered one
// clears only what it is about to rebuild, and keeps the rest through `previous` above.
if (libFilter) {
  for (const lib of libs) await rm(join(ART, lib.name), { recursive: true, force: true });
} else {
  await rm(ART, { recursive: true, force: true });
}
await rm(KARMA_OUT, { recursive: true, force: true });
await mkdir(KARMA_OUT, { recursive: true });
await mkdir(SNAP, { recursive: true });

// Printed unconditionally, because the expensive question to answer after the fact is "was this the
// same input?" - and a snapshot that drifts between two machines is answered almost entirely by this
// line plus the injection origins above. `oxc-parser` earns its place: unplugin parses through it and
// it ships per-platform native bindings, so it is the one dependency whose behaviour could plausibly
// differ across runners at an identical version.
async function version(pkg) {
  // resolving `<pkg>/package.json` is the direct route and finds a hoisted or nested copy too, but it
  // fails for packages whose `exports` map does not list it (three, @codemirror/state) - fall back to
  // the flat path under this suite before giving up
  for (const file of [
    () => fileURLToPath(import.meta.resolve(`${ pkg }/package.json`)),
    () => join(HERE, 'node_modules', pkg, 'package.json'),
  ]) {
    try {
      return JSON.parse(await readFile(file())).version;
    } catch { /* try the next route */ }
  }
  return '?'; // a missing version is diagnostic noise, never a reason to abort a run
}
const [vOxc, vCoreJs, vRxjs, vThree, vCm] = await Promise.all(
  ['oxc-parser', 'core-js', 'rxjs', 'three', '@codemirror/state'].map(p => version(p)));
echo(`environment: ${ process.platform }/${ process.arch } node ${ process.version }`
  + ` | oxc-parser ${ vOxc } | core-js ${ vCoreJs } | rxjs ${ vRxjs } | three ${ vThree } | @codemirror/state ${ vCm }`);
// The TS-source stack gets its own line: every package in it feeds the htmlparser2 cells and any of
// them can move those snapshots, so naming only the one the fixture is called after would answer "was
// this the same input?" with a fraction of the answer. domhandler / domelementtype / boolbase ship no sources
// and are therefore not listed - they are ordinary JS dependencies like every other fixture's.
const tsPackages = [...TS_SOURCE_PACKAGES];
const tsVersions = await Promise.all(tsPackages.map(p => version(p)));
echo(`TS sources: ${ tsPackages.map((p, i) => `${ p } ${ tsVersions[i] }`).join(' | ') }`);

// PROVIDERS is ordered babel-plugin first, and the loop nests provider INSIDE method, so every
// unplugin cell runs after the reference it is diffed against - no second pass, no cross-library
// bookkeeping. Changing either the order of PROVIDERS or this nesting breaks that guarantee, which
// `reference()` below turns into a thrown error rather than a silently empty diff.
const cells = [];
for (const lib of libs) {
  for (const method of METHODS) {
    for (const provider of PROVIDERS) {
      for (const phase of phasesFor(method, provider)) cells.push({ lib, method, provider, phase });
    }
  }
}

const manifest = [];
const karmaFiles = [];
const references = new Map();
function refKey(lib, method) {
  return `${ lib.name }/${ method }`;
}
function referenceFor(lib, method) {
  const set = references.get(refKey(lib, method));
  if (!set) throw new Error(`no babel-plugin reference for ${ refKey(lib, method) } - cell ordering is wrong`);
  return set;
}
let failed = 0;
let drift = 0;
let missing = 0;

for (const { lib, method, provider, phase } of cells) {
  const label = `${ lib.name }/${ provider }/${ method }${ phase ? `/${ phase }` : '' }`;
  try {
    // ONE build. Everything below reads from it - the set that gets snapshotted is the set inside the
    // bundle that gets pre-flighted, measured and shipped to IE11.
    const t0 = process.hrtime.bigint();
    const { code, injected, origins } = await runtimeBuild(lib.exercise, method, phase, provider);
    // the build alone - everything below this line is deliberately outside the measurement
    const buildMs = Number(process.hrtime.bigint() - t0) / 1e6;
    // runtimeBuild asserts payload / no-externals. The ES5 down-compile is the caller's to assert and
    // is the whole premise of an IE11 bundle: the pre-flight runs in a modern node realm and the
    // browser page in a modern browser, so nothing else here would notice a skipped down-compile.
    assertES5(code, label);
    if (!injected.length) throw new Error(`${ provider } injected 0 polyfills`);

    const isReference = provider === 'babel-plugin';
    if (isReference) references.set(refKey(lib, method), injected);
    // the delta this cell diverges from the reference by. Computed for every unplugin cell - the
    // entry-global one is not snapshotted but IS asserted below, so it may not be skipped here.
    const delta = isReference ? null : deltaLines(referenceFor(lib, method), injected);

    // `entry-global` expands `import 'core-js'` into a function of `targets`/`version`/`mode` alone -
    // it never reads the library, so a per-library baseline would pin the same text four times over
    // (that set is pinned exactly, once, in tests/transpiler-fixtures/entry-global). What IS
    // library-independent and worth asserting is that the two providers agree on that expansion:
    // same inputs, same compat data, so any divergence is a bug in one of them rather than a
    // baseline to bless.
    // NB the discriminator is the METHOD, not the absence of a phase - babel-plugin's `usage-*` cells
    // carry no phase either, and those very much are snapshotted.
    let snap = 'skipped';
    if (method === 'entry-global') {
      if (!isReference) {
        if (delta.length) {
          throw new Error(`entry-global disagrees between providers (${ delta.length }): ${ delta.slice(0, 6).join(' ') }`);
        }
        snap = 'providers agree';
      }
    } else {
      snap = await snapshot(snapPath(lib, provider, method, phase), isReference ? injected : delta, origins);
      if (snap === 'drift') drift++;
      else if (snap === 'missing') missing++;
    }

    const checks = await preflight(code);
    if (!checks.length) throw new Error('exercise produced 0 checks - nothing verified');
    const bad = checks.filter(c => !c.pass);

    const bytes = Buffer.byteLength(code);
    const { min, gz } = await wireSize(code, label);

    const rel = phase ? join(lib.name, provider, method, phase) : join(lib.name, provider, method);
    const dir = join(ART, rel);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'bundle.js'), code);
    await writeFile(join(dir, 'index.html'), html(lib.name, `${ provider } / ${ method }${ phase ? ` / ${ phase }` : '' }`, checks));

    // UMD exposes global `E2E`; each bundle gets its OWN Karma page (one file per run below), so the
    // shared global name cannot make one cell's test execute another cell's bundle.
    const karmaFile = join(KARMA_OUT, `e2e-libs-${ lib.name }-${ provider }-${ method }-${ phase ?? 'noph' }.js`);
    await writeFile(karmaFile, `${ code }\n${ qunitHarness(label, checks.length) }`);
    // `pre` is unplugin's known-incomplete phase and stays advisory (see the header). Every
    // babel-plugin cell gates: it has no phase axis, so it has no expected-to-fail configuration.
    karmaFiles.push({ file: karmaFile, label, gating: phase !== 'pre' });

    const ok = !bad.length;
    if (!ok) failed++;
    echo(`${ ok ? 'ok' : 'FAIL' } ${ label }: ${ checks.length - bad.length }/${ checks.length } preflight, `
      + `${ injected.length } inj${ delta ? ` (delta vs reference ${ delta.length })` : '' }`
      + `${ snap === 'skipped' ? '' : `, ${ snap }` } `
      + `(${ bytes }b raw / ${ (gz / 1024).toFixed(0) }KB gz, built in ${ buildMs.toFixed(0) }ms)`);
    for (const c of bad) echo(`    FAIL ${ c.label } actual=${ JSON.stringify(c.actual) }`);
    manifest.push({
      lib: lib.name, provider, method, phase: phase ?? null, dir: rel, bytes, min, gz,
      // diagnostic, not comparable across cells - see the header
      buildMs: +buildMs.toFixed(0),
      injections: injected.length,
      // null for the reference itself; otherwise how far this phase sits from it
      deltaFromReference: delta ? delta.length : null,
      checks: checks.length, preflightFailing: bad.length,
    });
  } catch (err) {
    failed++;
    const reason = errorReason(err);
    echo(`FAIL ${ label }: ${ reason }`);
    manifest.push({ lib: lib.name, provider, method, phase: phase ?? null, error: reason });
  }
}

if (!manifest.length) throw new Error('no cells ran - the registry or METHODS is empty');

await mkdir(ART, { recursive: true });
// `previous` was read before the wipe above - a filtered run keeps the entries of the libraries it
// did not touch, whose pages are still on disk
await writeFile(MANIFEST, `${ JSON.stringify([...previous, ...manifest], null, 2) }\n`);
echo(`\nartifacts -> ${ ART }\nmanifest -> ${ MANIFEST }`);
echo('Upload each <lib>/<provider>/<method>[/<phase>]/index.html (+ bundle.js beside it) to BrowserStack/SauceLabs IE11 for a manual real-engine check.');

// -------- real IE11, where one exists --------

// Only start Karma where IE11 actually exists: the windows CI runner (CI set) or a dev box with
// iexplore. Elsewhere every gate above has already run; the browser run is the CI-only part.
if (!(process.env.CI || await which('iexplore.exe', { nothrow: true }))) {
  echo(`\n${ karmaFiles.length } bundle(s) also written to ${ KARMA_OUT }. IE11 not present and not CI - skipping Karma.`);
} else {
  echo(`\nrunning Karma in real IE11 - ONE bundle per page (${ karmaFiles.length } pages), so no sibling shares a`);
  echo('realm: a global-patching method can never mask the usage-pure or pre gap of another cell, and each');
  echo('page holds a single library copy. post + pre+post (and entry-global) GATE the job; the `pre` phase is');
  echo('a NON-GATING per-library diagnostic (pre runs unplugin before Babel, so it can miss Babel-helper');
  echo('polyfills - expected to fail for some libraries, which is the signal we want, not a job failure).');
  echo('Per-cell counts print as "[e2e-libs] <lib>/<method>/<phase>: N/N checks passed".');
  for (const { file, label, gating } of karmaFiles) {
    echo(`\n-- IE11: ${ label }${ gating ? '' : ' [pre diagnostic, non-gating]' } --`);
    // both paths stay relative to the suite directory and forward-slashed: this leg runs on windows,
    // where `$` goes through bash - a native `D:\...` reaches it as an unquotable word - and Karma
    // matches `files` through glob, where a backslash is an escape and would match nothing
    // one IE11 page at a time, on purpose (see header) - sequential await is intended here
    const bundle = relative(HERE, file).replaceAll('\\', '/');
    const { exitCode } = await $({ cwd: HERE, nothrow: true })`karma start karma.conf.cjs -f=${ bundle }`;
    if (exitCode === 0) continue;
    // named on both branches: Karma prints its own failure above, but the tally at the end of a
    // forty-cell log has to be traceable to the cells that produced it
    if (gating) {
      failed++;
      echo(`  FAIL ${ label }: Karma exit ${ exitCode } in real IE11`);
    } else echo(`  pre diagnostic ${ label }: Karma exit ${ exitCode } - an expected-possible pre failure; not gating`);
  }
}

if (drift) echo(`\nFAIL injection snapshot drifted in ${ drift } cell(s) - rerun with OVERWRITE=1 if intended`);
if (missing) echo(`\nFAIL ${ missing } cell(s) have no snapshot baseline - rerun with OVERWRITE=1 to author them`);
if (failed) echo(`\nFAIL ${ failed } cell(s) failed`);
if (failed || drift || missing) process.exitCode = 1;
else echo(`\nruntime tier green - ${ manifest.length } cell(s)`);
