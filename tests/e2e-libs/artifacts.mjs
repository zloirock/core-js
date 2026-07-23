// Tier-2 emitter: for each runtime-tier library x method, build an ES5 UMD bundle (Babel syntax +
// unplugin stdlib), run a node PRE-FLIGHT (does it execute and do all self-checks pass?), then
// write a self-contained index.html that reruns the checks in-browser and paints a green/red
// banner. A manifest.json lists everything for manual upload to BrowserStack/SauceLabs.
//
// The pre-flight runs each bundle in a FRESH child node process (isolation: core-js mode:full
// permanently patches globals, so running methods in the same process would let one method's
// injection mask another's missing one). It is NOT a stripped realm - native stdlib is present -
// so it proves the bundle executes and computes correctly. Several gates cover what it cannot: the
// bundle and its MINIFIED form (the wire size manifest.json publishes as shippable) must parse as
// ES5; `assertPayload` (inside `runtimeBuild`) requires real core-js BYTES in the chunk, since
// `injections > 0` only proves the specifier TEXT was seen and that survives tree-shaking; nothing
// may be left external; and the pre-flight must come back with a non-empty `checks`. The generated
// in-page harness is parsed once at load rather than per cell (see below). The authoritative list is
// spec §9 - deliberately kept in ONE place, because maintaining a count here as well is what once
// produced three documents with three different numbers. None of this proves every individual
// polyfill is load-bearing (that needs a stripped realm / real IE11 - the manual BrowserStack step).
// Nor does a green pre-flight prove per-site DETECTION: it runs in a modern realm where the native is
// present either way. On real IE11 a global polyfill still patches the prototype once, so one detected
// use masks a missed sibling use of the same feature; usage-pure has no such masking (each site is
// rewritten to a local import, so a missed site stays a native call and dies on IE11) - which is why
// karma-bundles.mjs runs the usage-pure bundles in actual IE11. The global methods stay masked; their
// per-site detection lives in the unplugin unit tests (tests/unplugin/unit.mjs). This tier proves the
// exercise still executes.
import { runtimeBuild, assertES5, wireSize, errorReason, BABEL_VERSIONS, HERE } from './build.mjs';
import { bannerHarness } from './harness.mjs';
import { runnerArgs } from './args.mjs';
import { librariesIn } from './libraries.mjs';
import { execFile } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);
// surplus positionals are rejected, not dropped: `artifacts.mjs three usage-pure` is a natural
// thing to type (pipeline.mjs does take that pair) and would otherwise build all three methods
const [libFilter, ...surplus] = runnerArgs(import.meta.url);
if (surplus.length) throw new Error(`unexpected argument(s): ${ surplus.join(' ') } — artifacts.mjs takes only [libFilter]`);
const libs = librariesIn('runtime', libFilter);
const ART = join(HERE, 'artifacts');
const TMP = join(HERE, '.tmp');

// runs in the child: require the UMD bundle (argv[1]), call run(), print its checks as JSON
const PREFLIGHT = 'const m = require(process.argv[1]); const run = m.run || (m.default && m.default.run) || m.default;'
  + ' Promise.resolve(run()).then(function (r) { process.stdout.write(JSON.stringify(r.checks)); })'
  + ' .catch(function (e) { process.stderr.write(String((e && e.stack) || e)); process.exit(1); });';

// Run a UMD bundle in a fresh node process (full realm, isolated) and return its `run()` checks.
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

function esc(s) {
  return String(s).replaceAll(/["&'<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// The in-page harness (banner target) lives in harness.mjs, shared with the Karma/IE11 runner and
// parsed as ES5 at that module's load. `bannerHarness(count)` bakes the pre-flight count in, so a
// page whose in-browser run returns fewer checks than node did cannot paint itself green.
function html(title, method, checks) {
  const rows = checks.map(c => `<tr class="${ c.pass ? 'ok' : 'bad' }"><td>${ esc(c.label) }</td><td>${ c.pass ? 'PASS' : 'FAIL' }</td></tr>`).join('');
  const failing = checks.filter(c => !c.pass).length;
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>e2e-libs ${ esc(title) }/${ esc(method) }</title>
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
  <h1>${ esc(title) } — <code>${ esc(method) }</code></h1>
  <div id="banner" class="wait">running…</div>
  <p>Pre-flight in node recorded ${ checks.length - failing }/${ checks.length } passing. This page reruns the same checks in <em>this</em> browser.</p>
  <table id="tbl"><thead><tr><th>check</th><th>result</th></tr></thead><tbody>${ rows }</tbody></table>
  <script src="bundle.js"></script>
  <script>${ bannerHarness(checks.length) }  </script>
</body></html>
`;
}

// Build + pre-flight one (lib x method x Babel version) cell. Returns its manifest entry and `ok`.
async function buildCell(lib, method, babelVersion) {
  const label = `${ lib.name }/babel${ babelVersion }/${ method }`;
  try {
    // `injections` is recorded inside this very build. Counting it with a separate captureInjections
    // pass would gate on a different unplugin configuration (that pass runs at the default phase and
    // without Babel), so a build whose own injection had silently become a no-op would still show a
    // healthy number - and the pre-flight, which runs in a full node realm, would stay green too.
    const { code, injections } = await runtimeBuild(lib.exercise, method, babelVersion);
    if (!injections) throw new Error('unplugin injected 0 polyfills — preflight would validate nothing');
    // the artifact's whole premise is "ES5 for IE11", and nothing else here would notice if it were
    // not: the pre-flight runs in a modern node realm, and the browser page in a modern browser
    assertES5(code, label);
    const checks = await preflight(code);
    if (!checks.length) throw new Error('exercise produced 0 checks — nothing verified');
    const bad = checks.filter(c => !c.pass);
    const bytes = Buffer.byteLength(code);
    const { min, gz } = await wireSize(code, label);
    const rel = join(lib.name, `babel${ babelVersion }`, method);
    const dir = join(ART, rel);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'bundle.js'), code);
    await writeFile(join(dir, 'index.html'), html(`${ lib.name } (Babel ${ babelVersion })`, method, checks));
    console.log(`${ bad.length ? '✗' : '✓' } ${ label }: ${ checks.length - bad.length }/${ checks.length } preflight, ${ injections } inj (${ bytes }b raw / ${ (gz / 1024).toFixed(0) }KB gz)`);
    for (const c of bad) console.log(`    FAIL ${ c.label } actual=${ JSON.stringify(c.actual) }`);
    return {
      ok: !bad.length,
      entry: { lib: lib.name, babel: babelVersion, method, dir: rel, bytes, min, gz, injections, checks: checks.length, preflightFailing: bad.length },
    };
  } catch (err) {
    const reason = errorReason(err);
    console.log(`✗ ${ label }: ${ reason }`);
    return { ok: false, entry: { lib: lib.name, babel: babelVersion, method, error: reason } };
  }
}

// Cells are only written on the success path, so without a wipe a cell that fails leaves yesterday's
// all-green page on disk while the manifest records the failure — and the operator is told below to
// upload whatever is in those directories. An unfiltered run therefore clears everything; a filtered
// one clears only what it is about to rebuild, and merges into the existing manifest below, so the
// manifest never stops describing the libraries actually present on disk.
const manifest = [];
let failed = 0;
if (libFilter) {
  for (const lib of libs) await rm(join(ART, lib.name), { recursive: true, force: true });
} else {
  await rm(ART, { recursive: true, force: true });
}
for (const lib of libs) {
  for (const method of lib.methods) {
    // one artifact per (method x Babel version): both Babel majors are down-compiled and pre-flighted
    // to match the repo's dual-Babel convention. Raw and minified SIZES come out identical for these
    // fixtures, but the bytes only match on rxjs - codemirror and three differ in the order Babel
    // emits its helpers. The post phase consumes that helper output, which is where a 7-vs-8
    // divergence would surface.
    for (const babelVersion of BABEL_VERSIONS) {
      const { ok, entry } = await buildCell(lib, method, babelVersion);
      manifest.push(entry);
      if (!ok) failed++;
    }
  }
}

await mkdir(ART, { recursive: true });
// a filtered run keeps the entries of the libraries it did not touch — their pages are still on disk
const rebuilt = new Set(libs.map(l => l.name));
let previous = [];
if (libFilter) {
  try {
    previous = JSON.parse(await readFile(join(ART, 'manifest.json'), 'utf8')).filter(e => !rebuilt.has(e.lib));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err; // a corrupt manifest must not be silently discarded
  }
}
await writeFile(join(ART, 'manifest.json'), `${ JSON.stringify([...previous, ...manifest], null, 2) }\n`);
console.log(`\nartifacts → ${ ART }\nmanifest → ${ join(ART, 'manifest.json') }`);
console.log('Upload each <lib>/babel{7,8}/<method>/index.html (+ bundle.js beside it) to BrowserStack/SauceLabs IE11 for the real-engine check.');
if (failed) process.exitCode = 1;
