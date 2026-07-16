// Tier-2 emitter: for each runtime-tier library x method, build an ES5 UMD bundle (Babel syntax +
// unplugin stdlib), run a node PRE-FLIGHT (does it execute and do all self-checks pass, full
// realm), then write a self-contained index.html that reruns the checks in-browser and paints a
// green/red banner. A manifest.json lists everything for manual upload to BrowserStack/SauceLabs.
//
// The node pre-flight is NOT a stripped realm - it only proves the ES5 bundle runs and computes
// correctly at all, catching gross breakage before a manual IE11 pass.
//
// Usage:  node artifacts.mjs [libFilter]
import { runtimeBuild, HERE } from './build.mjs';
import { librariesIn } from './libraries.mjs';
import { createRequire } from 'node:module';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const [libFilter] = process.argv.slice(2);
const libs = librariesIn('runtime').filter(l => !libFilter || l.name === libFilter);
const ART = join(HERE, 'artifacts');
const TMP = join(HERE, '.tmp');

// Load a UMD bundle in node (full realm) via a temp .cjs and return its `run()` result.
async function preflight(code) {
  await mkdir(TMP, { recursive: true });
  const f = join(TMP, `preflight-${ process.hrtime.bigint() }.cjs`);
  await writeFile(f, code);
  try {
    const mod = require(f);
    return await mod.run();
  } finally {
    delete require.cache[require.resolve(f)];
    await rm(f, { force: true });
  }
}

function html(lib, method, checks) {
  const rows = checks.map(c =>
    `<tr class="${ c.pass ? 'ok' : 'bad' }"><td>${ c.label }</td><td>${ c.pass ? 'PASS' : 'FAIL' }</td></tr>`).join('');
  const failing = checks.filter(c => !c.pass).length;
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>e2e-libs ${ lib }/${ method }</title>
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
  <h1>${ lib } — <code>${ method }</code></h1>
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
      var body = checks.map(function (c) {
        return '<tr class="' + (c.pass ? 'ok' : 'bad') + '"><td>' + c.label + '</td><td>' + (c.pass ? 'PASS' : 'FAIL') + '</td></tr>';
      }).join('');
      document.querySelector('#tbl tbody').innerHTML = body;
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
      const { checks } = await preflight(code);
      const bad = checks.filter(c => !c.pass);
      const dir = join(ART, lib.name, method);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, 'bundle.js'), code);
      await writeFile(join(dir, 'index.html'), html(lib.name, method, checks));
      manifest.push({ lib: lib.name, method, dir: join(lib.name, method), bytes: Buffer.byteLength(code), checks: checks.length, preflightFailing: bad.length });
      console.log(`${ bad.length ? '✗' : '✓' } ${ label }: ${ checks.length - bad.length }/${ checks.length } preflight (${ Buffer.byteLength(code) }b)`);
      if (bad.length) { failed++; for (const c of bad) console.log(`    FAIL ${ c.label } actual=${ JSON.stringify(c.actual) }`); }
    } catch (err) {
      failed++;
      manifest.push({ lib: lib.name, method, error: (err.message || String(err)).split('\n')[0].slice(0, 200) });
      console.log(`✗ ${ label }: ${ (err.message || err).split('\n')[0].slice(0, 200) }`);
    }
  }
}

await mkdir(ART, { recursive: true });
await writeFile(join(ART, 'manifest.json'), `${ JSON.stringify(manifest, null, 2) }\n`);
console.log(`\nartifacts → ${ ART }\nmanifest → ${ join(ART, 'manifest.json') }`);
console.log('Upload each <lib>/<method>/index.html (+ bundle.js beside it) to BrowserStack/SauceLabs IE11 for the real-engine check.');
if (failed) process.exitCode = 1;
