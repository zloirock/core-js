// The runtime tier, in ONE pass. For every (library × method × phase) cell this builds the real IE11
// bundle exactly once and then hands that single build to every consumer that wants it:
//
//   gates      - ES5 parse, core-js payload present, nothing external, non-empty injection set
//   snapshot   - the injected specifier SET vs snapshots/<lib>.<method>.<phase>.txt (usage-* only)
//   pre-flight - the bundle executed in a fresh node process, all self-checks passing
//   artifact   - bundle.js + a self-checking index.html + a manifest row (raw / min / gzip sizes)
//   karma      - the same bundle + a QUnit driver, run in REAL IE11 where one is present
//
// One build per cell is the point. These consumers used to be three runners (snapshot.mjs,
// artifacts.mjs, karma-bundles.mjs) that each rebuilt the same configurations - 48 builds for 21
// distinct cells - and, worse, each gated on a build of its own. A snapshot that pins the set of one
// build while a different build ships is a gate describing something other than what it guards; here
// the set that is snapshotted, the bytes that are measured and the bundle that runs in IE11 all come
// out of the same rollup call, by construction rather than by convention.
//
// What is deliberately NOT here: TIMINGS. Measuring build time in this pass would be dishonest -
// minification, node pre-flight child processes and file writes land between consecutive builds and
// move the CPU state each one starts from, so the cross-cell comparison the numbers exist for is the
// first thing to rot. pipeline.mjs measures instead, in its own quiet process with a warm-up, and
// rebuilds its [C] stage on purpose. Sizes (raw / min / gzip) and injection counts ARE reported here:
// they are deterministic and unaffected by whatever ran before them.
//
// `entry-global` carries no phase and is not snapshotted (it expands `import 'core-js'` into whatever
// `targets` selects, so its set is a function of the options alone - see snapshots' note in README).
// The `pre` phase is a NON-GATING per-library diagnostic in IE11: it runs unplugin before Babel and
// so can miss the polyfills Babel's own helpers pull in, which some libraries survive and others do
// not. Its build-time gates still apply; only its IE11 verdict is advisory.
//
// Usage:  node runtime.mjs [libFilter] [--update]    --update rewrites the snapshot baselines
import { runtimeBuild, assertES5, wireSize, errorReason, METHODS, phasesFor, TS_SOURCE_PACKAGES, HERE } from './build.mjs';
import { bannerHarness, qunitHarness } from './harness.mjs';
import { runnerArgs } from './args.mjs';
import { librariesIn } from './libraries.mjs';
import { execFile, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);
// resolve from this dir: `which` (CJS-interop, matching tests/unit-karma) and karma's bin below
const req = createRequire(import.meta.url);
const which = req('which');

const ART = join(HERE, 'artifacts');
const MANIFEST = join(ART, 'manifest.json');
const SNAP = join(HERE, 'snapshots');
const TMP = join(HERE, '.tmp');
const KARMA_OUT = join(TMP, 'karma');

const argv = runnerArgs(import.meta.url);
const UPDATE = argv.includes('--update');
// every runner rejects an argument it does not understand; without this, `--updte` would silently run
// a COMPARE pass and report success, and a stray third positional would be dropped in silence
const [libFilter, ...surplus] = argv.filter(a => a !== '--update');
if (surplus.length) throw new Error(`unexpected argument(s): ${ surplus.join(' ') } — runtime.mjs takes [libFilter] [--update]`);
const libs = librariesIn('runtime', libFilter);

// -------- consumers --------

async function baseline(file) {
  try {
    return (await readFile(file, 'utf8')).split('\n').map(l => l.trim()).filter(Boolean);
  } catch (err) {
    if (err.code === 'ENOENT') return null; // no baseline yet — first run
    throw err; // a real read error must not masquerade as "no baseline" and silently overwrite
  }
}

// Compare (or author) the injected set. Returns 'ok' | 'updated' | 'drift' | 'missing'.
//
// A drift prints WHERE, not just what. The set alone ("`es.iterator.filter` is new") cannot be acted
// on: the interesting question is always which module unplugin decided to inject it into, because
// that is what identifies the detection site that changed its mind. `origins` comes free out of the
// same build (see build.mjs::recorder), so this costs nothing on the passing path.
async function snapshot(lib, method, phase, injected, origins) {
  const file = join(SNAP, `${ lib.name }.${ method }.${ phase }.txt`);
  const base = await baseline(file);
  if (UPDATE) {
    await writeFile(file, `${ injected.join('\n') }\n`);
    console.log(`    snapshot ${ base ? 'updated' : 'created' } (${ injected.length })`);
    return 'updated';
  }
  // only an explicit --update may author a baseline. Auto-creating one here would make a new library
  // (or a baseline lost in a merge) report success while having verified nothing.
  if (!base) {
    console.log(`    ✗ no baseline at ${ file } — rerun with --update to author it`);
    return 'missing';
  }
  const now = new Set(injected);
  const old = new Set(base);
  const added = injected.filter(s => !old.has(s));
  const removed = base.filter(s => !now.has(s));
  if (!added.length && !removed.length) return 'ok';
  for (const s of added) {
    console.log(`    + ${ s }  (new)`);
    // a specifier can land in several modules; all of them are candidates for the changed decision
    for (const where of origins.get(s) ?? []) console.log(`        injected into ${ where }`);
  }
  // no origins for a removed one — by definition this build never injected it
  for (const s of removed) console.log(`    - ${ s }  (gone)`);
  return 'drift';
}

// runs in the child: require the UMD bundle (argv[1]), call run(), print its checks as JSON
const PREFLIGHT = 'const m = require(process.argv[1]); const run = m.run || (m.default && m.default.run) || m.default;'
  + ' Promise.resolve(run()).then(function (r) { process.stdout.write(JSON.stringify(r.checks)); })'
  + ' .catch(function (e) { process.stderr.write(String((e && e.stack) || e)); process.exit(1); });';

// Run a UMD bundle in a fresh node process (full realm, isolated) and return its `run()` checks.
// Isolation is required, not tidiness: core-js mode:full permanently patches globals, so running two
// methods in one process would let one method's injection mask another's missing one.
async function preflight(code) {
  await mkdir(TMP, { recursive: true });
  // pid as well as hrtime: hrtime reads the same monotonic clock in every process, so two concurrent
  // runs sharing this checkout could land on one path — and this file is executed, not just read
  const f = join(TMP, `preflight-${ process.pid }-${ process.hrtime.bigint() }.cjs`);
  await writeFile(f, code);
  try {
    // A bundle whose `run()` never settles (a plausible symptom of a broken Promise polyfill) lets
    // the child's event loop drain and exit 0 with EMPTY stdout, so without these guards the failure
    // surfaces as a bare `Unexpected end of JSON input` that names neither the child nor the bundle.
    const { stdout } = await execFileP(process.execPath, ['-e', PREFLIGHT, f],
      { timeout: 120_000, maxBuffer: 16 * 1024 * 1024 });
    if (!stdout.trim()) throw new Error('preflight child produced no output — run() likely never settled');
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
  <h1>${ esc(title) } — <code>${ esc(subtitle) }</code></h1>
  <div id="banner" class="wait">running…</div>
  <p>Pre-flight in node recorded ${ checks.length - failing }/${ checks.length } passing. This page reruns the same checks in <em>this</em> browser.</p>
  <table id="tbl"><thead><tr><th>check</th><th>result</th></tr></thead><tbody>${ rows }</tbody></table>
  <script src="bundle.js"></script>
  <script>${ bannerHarness(checks.length) }  </script>
</body></html>
`;
}

function runKarma(karmaBin, conf, file) {
  // forward slashes: this leg runs on windows-2022, and Karma matches `files` through glob, where a
  // backslash is an escape — a native Windows path would silently match nothing.
  const fArg = file.replaceAll('\\', '/');
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [karmaBin, 'start', conf, `-f=${ fArg }`], { cwd: HERE, stdio: 'inherit' });
    p.on('error', reject);
    p.on('close', resolve);
  });
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
// all-green page on disk while the manifest records the failure — and the operator is told to upload
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
// same input?" — and a snapshot that drifts between two machines is answered almost entirely by this
// line plus the injection origins above. `oxc-parser` earns its place: unplugin parses through it and
// it ships per-platform native bindings, so it is the one dependency whose behaviour could plausibly
// differ across runners at an identical version.
async function version(pkg) {
  // `require('<pkg>/package.json')` is the direct route but fails for packages whose `exports` map
  // does not list it (three, @codemirror/state) - fall back to reading it off disk before giving up
  try {
    return req(`${ pkg }/package.json`).version;
  } catch { /* fall through to the on-disk read */ }
  try {
    return JSON.parse(await readFile(join(HERE, 'node_modules', pkg, 'package.json'), 'utf8')).version;
  } catch {
    return '?'; // a missing version is diagnostic noise, never a reason to abort a run
  }
}
const [vOxc, vCoreJs, vRxjs, vThree, vCm] = await Promise.all(
  ['oxc-parser', 'core-js', 'rxjs', 'three', '@codemirror/state'].map(p => version(p)));
console.log(`environment: ${ process.platform }/${ process.arch } node ${ process.version }`
  + ` | oxc-parser ${ vOxc } | core-js ${ vCoreJs } | rxjs ${ vRxjs } | three ${ vThree } | @codemirror/state ${ vCm }`);
// The TS-source stack gets its own line: seven packages feed the htmlparser2 cells and any of them
// can move those snapshots, so naming only the one the fixture is called after would answer "was this
// the same input?" with a third of the answer. domhandler / domelementtype / boolbase ship no sources
// and are therefore not listed - they are ordinary JS dependencies like every other fixture's.
const tsPackages = [...TS_SOURCE_PACKAGES];
const tsVersions = await Promise.all(tsPackages.map(p => version(p)));
console.log(`TS sources: ${ tsPackages.map((p, i) => `${ p } ${ tsVersions[i] }`).join(' | ') }`);

const cells = [];
for (const lib of libs) {
  for (const method of METHODS) {
    for (const phase of phasesFor(method)) cells.push({ lib, method, phase });
  }
}

const manifest = [];
const karmaFiles = [];
let failed = 0;
let drift = 0;
let missing = 0;

for (const { lib, method, phase } of cells) {
  const label = `${ lib.name }/${ method }${ phase ? `/${ phase }` : '' }`;
  try {
    // ONE build. Everything below reads from it — the set that gets snapshotted is the set inside the
    // bundle that gets pre-flighted, measured and shipped to IE11.
    const { code, injected, origins } = await runtimeBuild(lib.exercise, method, phase);
    // runtimeBuild asserts payload / no-externals. The ES5 down-compile is the caller's to assert and
    // is the whole premise of an IE11 bundle: the pre-flight runs in a modern node realm and the
    // browser page in a modern browser, so nothing else here would notice a skipped down-compile.
    assertES5(code, label);
    if (!injected.length) throw new Error('unplugin injected 0 polyfills');

    // entry-global is not snapshotted — see the header
    let snap = 'skipped';
    if (phase) {
      snap = await snapshot(lib, method, phase, injected, origins);
      if (snap === 'drift') drift++;
      else if (snap === 'missing') missing++;
    }

    const checks = await preflight(code);
    if (!checks.length) throw new Error('exercise produced 0 checks — nothing verified');
    const bad = checks.filter(c => !c.pass);

    const bytes = Buffer.byteLength(code);
    const { min, gz } = await wireSize(code, label);

    const rel = phase ? join(lib.name, method, phase) : join(lib.name, method);
    const dir = join(ART, rel);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'bundle.js'), code);
    await writeFile(join(dir, 'index.html'), html(lib.name, phase ? `${ method } / ${ phase }` : method, checks));

    // UMD exposes global `E2E`; each bundle gets its OWN Karma page (one file per run below), so the
    // shared global name cannot make one cell's test execute another cell's bundle.
    const karmaFile = join(KARMA_OUT, `e2e-libs-${ lib.name }-${ method }-${ phase ?? 'noph' }.js`);
    await writeFile(karmaFile, `${ code }\n${ qunitHarness(label, checks.length) }`);
    karmaFiles.push({ file: karmaFile, label, gating: phase !== 'pre' });

    const ok = !bad.length;
    if (!ok) failed++;
    console.log(`${ ok ? '✓' : '✗' } ${ label }: ${ checks.length - bad.length }/${ checks.length } preflight, `
      + `${ injected.length } inj${ phase ? `, snapshot ${ snap }` : '' } (${ bytes }b raw / ${ (gz / 1024).toFixed(0) }KB gz)`);
    for (const c of bad) console.log(`    FAIL ${ c.label } actual=${ JSON.stringify(c.actual) }`);
    manifest.push({
      lib: lib.name, method, phase: phase ?? null, dir: rel, bytes, min, gz,
      injections: injected.length, checks: checks.length, preflightFailing: bad.length,
    });
  } catch (err) {
    failed++;
    const reason = errorReason(err);
    console.log(`✗ ${ label }: ${ reason }`);
    manifest.push({ lib: lib.name, method, phase: phase ?? null, error: reason });
  }
}

if (!manifest.length) throw new Error('no cells ran — the registry or METHODS is empty');

await mkdir(ART, { recursive: true });
// `previous` was read before the wipe above — a filtered run keeps the entries of the libraries it
// did not touch, whose pages are still on disk
await writeFile(MANIFEST, `${ JSON.stringify([...previous, ...manifest], null, 2) }\n`);
console.log(`\nartifacts → ${ ART }\nmanifest → ${ MANIFEST }`);
console.log('Upload each <lib>/<method>[/<phase>]/index.html (+ bundle.js beside it) to BrowserStack/SauceLabs IE11 for a manual real-engine check.');

// -------- real IE11, where one exists --------

// Only start Karma where IE11 actually exists: the windows CI runner (CI set) or a dev box with
// iexplore. Elsewhere every gate above has already run; the browser run is the CI-only part.
if (!(process.env.CI || which.sync('iexplore.exe', { nothrow: true }))) {
  console.log(`\n${ karmaFiles.length } bundle(s) also written to ${ KARMA_OUT }. IE11 not present and not CI — skipping Karma.`);
} else {
  const karmaBin = req.resolve('karma/bin/karma');
  const conf = join(HERE, 'karma.conf.cjs');
  console.log(`\nrunning Karma in real IE11 — ONE bundle per page (${ karmaFiles.length } pages), so no sibling shares a`);
  console.log('realm: a global-patching method can never mask the usage-pure or pre gap of another cell, and each');
  console.log('page holds a single library copy. post + pre+post (and entry-global) GATE the job; the `pre` phase is');
  console.log('a NON-GATING per-library diagnostic (pre runs unplugin before Babel, so it can miss Babel-helper');
  console.log('polyfills — expected to fail for some libraries, which is the signal we want, not a job failure).');
  console.log('Per-cell counts print as "[e2e-libs] <lib>/<method>/<phase>: N/N checks passed".');
  for (const { file, label, gating } of karmaFiles) {
    console.log(`\n— IE11: ${ label }${ gating ? '' : ' [pre diagnostic, non-gating]' } —`);
    // one IE11 page at a time, on purpose (see header) — sequential await is intended here
    const code = await runKarma(karmaBin, conf, file);
    if (code === 0) continue;
    if (gating) failed++;
    else console.log(`  pre diagnostic ${ label }: Karma exit ${ code } — an expected-possible pre failure; not gating`);
  }
}

if (drift) console.log(`\n✗ injection snapshot drifted in ${ drift } cell(s) — rerun with --update if intended`);
if (missing) console.log(`\n✗ ${ missing } cell(s) have no snapshot baseline — rerun with --update to author them`);
if (failed) console.log(`\n✗ ${ failed } cell(s) failed`);
if (failed || drift || missing) process.exitCode = 1;
else console.log(`\n✓ runtime tier green — ${ manifest.length } cell(s)`);
