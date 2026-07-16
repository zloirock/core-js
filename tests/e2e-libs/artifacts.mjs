// Tier-2 emitter: for each runtime-tier library x method, build an ES5 UMD bundle (Babel syntax +
// unplugin stdlib), run a node PRE-FLIGHT (does it execute and do all self-checks pass?), then
// write a self-contained index.html that reruns the checks in-browser and paints a green/red
// banner. A manifest.json lists everything for manual upload to BrowserStack/SauceLabs.
//
// The pre-flight runs each bundle in a FRESH child node process (isolation: core-js mode:full
// permanently patches globals, so running methods in the same process would let one method's
// injection mask another's missing one). It is NOT a stripped realm - native stdlib is present -
// so it proves the bundle executes and computes correctly, and the `injections > 0` gate catches a
// total unplugin no-op; it cannot prove every individual polyfill is load-bearing (that needs a
// stripped realm / real IE11 - the manual BrowserStack step).
import { runtimeBuild, captureInjections, HERE } from './build.mjs';
import { librariesIn } from './libraries.mjs';
import { execFile } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);
const [libFilter] = process.argv.slice(2);
const libs = librariesIn('runtime').filter(l => !libFilter || l.name === libFilter);
if (!libs.length) throw new Error(`no runtime library matches filter '${ libFilter }'`);
const ART = join(HERE, 'artifacts');
const TMP = join(HERE, '.tmp');

// runs in the child: require the UMD bundle (argv[1]), call run(), print its checks as JSON
const PREFLIGHT = 'const m = require(process.argv[1]); const run = m.run || (m.default && m.default.run) || m.default;'
  + ' Promise.resolve(run()).then(function (r) { process.stdout.write(JSON.stringify(r.checks)); })'
  + ' .catch(function (e) { process.stderr.write(String((e && e.stack) || e)); process.exit(1); });';

// Run a UMD bundle in a fresh node process (full realm, isolated) and return its `run()` checks.
async function preflight(code) {
  await mkdir(TMP, { recursive: true });
  const f = join(TMP, `preflight-${ process.hrtime.bigint() }.cjs`);
  await writeFile(f, code);
  try {
    const { stdout } = await execFileP(process.execPath, ['-e', PREFLIGHT, f]);
    return JSON.parse(stdout);
  } finally {
    await rm(f, { force: true });
  }
}

function esc(s) {
  return String(s).replaceAll(/["&'<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function html(lib, method, checks) {
  const rows = checks.map(c => `<tr class="${ c.pass ? 'ok' : 'bad' }"><td>${ esc(c.label) }</td><td>${ c.pass ? 'PASS' : 'FAIL' }</td></tr>`).join('');
  const failing = checks.filter(c => !c.pass).length;
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>e2e-libs ${ esc(lib) }/${ esc(method) }</title>
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
  <h1>${ esc(lib) } — <code>${ esc(method) }</code></h1>
  <div id="banner" class="wait">running…</div>
  <p>Pre-flight in node recorded ${ checks.length - failing }/${ checks.length } passing. This page reruns the same checks in <em>this</em> browser.</p>
  <table id="tbl"><thead><tr><th>check</th><th>result</th></tr></thead><tbody>${ rows }</tbody></table>
  <script src="bundle.js"></script>
  <script>
    E2E.run().then(function (res) {
      var checks = res.checks, bad = checks.filter(function (c) { return !c.pass; });
      var b = document.getElementById('banner');
      b.className = bad.length ? 'red' : 'green';
      b.textContent = bad.length ? ('FAIL — ' + bad.length + '/' + checks.length + ' checks failed') : ('PASS — all ' + checks.length + ' checks green in this browser');
      var tbody = document.querySelector('#tbl tbody');
      tbody.innerHTML = '';
      checks.forEach(function (c) {
        var tr = document.createElement('tr');
        tr.className = c.pass ? 'ok' : 'bad';
        var name = document.createElement('td');
        name.textContent = c.label;
        var result = document.createElement('td');
        result.textContent = c.pass ? 'PASS' : 'FAIL';
        tr.appendChild(name);
        tr.appendChild(result);
        tbody.appendChild(tr);
      });
    }).catch(function (err) {
      var b = document.getElementById('banner');
      b.className = 'red';
      b.textContent = 'ERROR — ' + (err && err.message ? err.message : err);
    });
  </script>
</body></html>
`;
}

const manifest = [];
let failed = 0;
for (const lib of libs) {
  for (const method of lib.methods) {
    const label = `${ lib.name }/${ method }`;
    try {
      const code = await runtimeBuild(lib.exercise, method); // usage-* default to phase 'post'
      const injections = (await captureInjections(lib.exercise, method)).length;
      if (!injections) throw new Error('unplugin injected 0 polyfills — preflight would validate nothing');
      const checks = await preflight(code);
      if (!checks.length) throw new Error('exercise produced 0 checks — nothing verified');
      const bad = checks.filter(c => !c.pass);
      const dir = join(ART, lib.name, method);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, 'bundle.js'), code);
      await writeFile(join(dir, 'index.html'), html(lib.name, method, checks));
      manifest.push({ lib: lib.name, method, dir: join(lib.name, method), bytes: Buffer.byteLength(code), injections, checks: checks.length, preflightFailing: bad.length });
      console.log(`${ bad.length ? '✗' : '✓' } ${ label }: ${ checks.length - bad.length }/${ checks.length } preflight, ${ injections } inj (${ Buffer.byteLength(code) }b)`);
      if (bad.length) {
        failed++;
        for (const c of bad) console.log(`    FAIL ${ c.label } actual=${ JSON.stringify(c.actual) }`);
      }
    } catch (err) {
      failed++;
      // child-process failures carry the real reason on stderr, not message ("Command failed: ...")
      const reason = (err.stderr || err.message || String(err)).split('\n', 1)[0].slice(0, 200);
      manifest.push({ lib: lib.name, method, error: reason });
      console.log(`✗ ${ label }: ${ reason }`);
    }
  }
}

await mkdir(ART, { recursive: true });
await writeFile(join(ART, 'manifest.json'), `${ JSON.stringify(manifest, null, 2) }\n`);
console.log(`\nartifacts → ${ ART }\nmanifest → ${ join(ART, 'manifest.json') }`);
console.log('Upload each <lib>/<method>/index.html (+ bundle.js beside it) to BrowserStack/SauceLabs IE11 for the real-engine check.');
if (failed) process.exitCode = 1;
