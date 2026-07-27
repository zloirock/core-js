// CI IE11 leg: build the real-IE11 bundles and run them in actual IE11 through Karma — the FULL
// runtime matrix, every (library × method × Babel version), matching what artifacts.mjs emits for the
// manual BrowserStack step. usage-pure is the method whose green run also validates per-site DETECTION
// (each call site is rewritten to a local import, so a missed site stays a native call and dies on
// IE11); the global methods only prove the exercise still EXECUTES on IE11 (a global polyfill patches
// the prototype once, so one detected use masks a missed sibling — see README / artifacts.mjs). Both
// are worth running on the real engine; the node pre-flight in artifacts covers a modern realm only.
//
// Each bundle is a self-contained UMD from `runtimeBuild` (the exact artifact artifacts.mjs ships, and
// rollup-produced — so this also exercises unplugin's ROLLUP adapter in real IE11, complementing the
// webpack e2e leg in tests/unit-karma) with a QUnit driver appended. runtimeBuild already gates the
// bundle (assertPayload / assertNoExternals / non-zero injections); assertES5 is the caller's to run,
// and does below.
//
// Karma runs ONCE PER LIBRARY, not once over the whole matrix: every bundle inlines its whole library
// (three's is ~1.4 MB) and Karma loads a run's bundles into a single IE11 page, so mixing all three
// libraries would put ~16 MB of JS on one page. Per-library keeps each page to that library's 6 cells.
//
// Off a machine with IE11 (and outside CI) the bundles are still built — that alone runs every gate
// above — but Karma is skipped: there is no IE to capture. karma.conf.cjs makes the same check.
//
// Usage:  node karma-bundles.mjs [libFilter]   ->  builds .tmp/karma/*.js, runs Karma when IE present
import { runtimeBuild, assertES5, errorReason, BABEL_VERSIONS, HERE } from './build.mjs';
import { qunitHarness } from './harness.mjs';
import { runnerArgs } from './args.mjs';
import { librariesIn } from './libraries.mjs';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// resolve from this dir: `which` (CJS-interop, matching tests/unit-karma) and karma's bin below
const req = createRequire(import.meta.url);
const which = req('which');

const OUT = join(HERE, '.tmp', 'karma');

const [libFilter, ...surplus] = runnerArgs(import.meta.url);
if (surplus.length) throw new Error(`unexpected argument(s): ${ surplus.join(' ') } — karma-bundles.mjs takes only [libFilter]`);
const libs = librariesIn('runtime', libFilter);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

// build the full matrix, grouped by library (one Karma page per library, see the header)
const byLib = new Map();
for (const lib of libs) {
  const cellFiles = [];
  for (const method of lib.methods) {
    for (const babelVersion of BABEL_VERSIONS) {
      const label = `${ lib.name }/${ method }/babel${ babelVersion }`;
      try {
        const { code, injections } = await runtimeBuild(lib.exercise, method, babelVersion);
        // runtimeBuild asserts payload / no-externals; the ES5 down-compile is the caller's to assert,
        // and it is the whole premise of an IE11 bundle — nothing downstream would catch a miss (the
        // browser page IS the check, and a non-ES5 bundle would just SyntaxError with no QUnit verdict).
        assertES5(code, label);
        if (!injections) throw new Error('unplugin injected 0 polyfills');
        // UMD exposes global `E2E`; the appended driver captures it at load (harness.mjs) so the
        // shared global name does not make every test run the last-loaded bundle.
        const file = join(OUT, `e2e-libs-${ lib.name }-${ method }-babel${ babelVersion }.js`);
        await writeFile(file, `${ code }\n${ qunitHarness(label) }`);
        cellFiles.push(file);
        console.log(`✓ built ${ label }: ${ injections } inj`);
      } catch (err) {
        console.log(`✗ ${ label }: ${ errorReason(err) }`);
        process.exitCode = 1;
      }
    }
  }
  if (cellFiles.length) byLib.set(lib.name, cellFiles);
}

const total = [...byLib.values()].reduce((n, f) => n + f.length, 0);
if (!total) throw new Error('no bundles built — nothing to run in IE11');

// Only start Karma where IE11 actually exists: the windows CI runner (CI set) or a dev box with
// iexplore. Elsewhere the build above already ran every gate; the browser run is the CI-only part.
if (!(process.env.CI || which.sync('iexplore.exe', { nothrow: true }))) {
  console.log(`\n${ total } bundle(s) built in ${ OUT }. IE11 not present and not CI — skipping Karma.`);
} else {
  const karmaBin = req.resolve('karma/bin/karma');
  const conf = join(HERE, 'karma.conf.cjs');
  console.log(`\nrunning Karma in real IE11 over the full matrix (${ total } bundle(s), one page per library).`);
  console.log('Each bundle reruns its library\'s exercise (the same deterministic self-checks as e2e-libs /');
  console.log('artifacts) via QUnit; a red check (a polyfill missing or misbehaving on IE11) fails the job.');
  console.log('Per-cell counts print as "[e2e-libs] <lib>/<method>/babel<v>: N/N checks passed in this IE11".');
  let failCode = 0;
  for (const [libName, files] of byLib) {
    console.log(`\n— IE11: ${ libName } (${ files.length } bundle(s)) —`);
    // forward slashes: this leg runs on windows-2022, and Karma matches `files` through glob, where a
    // backslash is an escape — native Windows paths would silently match nothing
    const fArg = files.map(f => f.replaceAll('\\', '/')).join(',');
    // one IE11 page at a time, on purpose (see header) — sequential await is intended here
    const code = await new Promise((resolve, reject) => {
      const p = spawn(process.execPath, [karmaBin, 'start', conf, `-f=${ fArg }`], { cwd: HERE, stdio: 'inherit' });
      p.on('error', reject);
      p.on('close', resolve);
    });
    if (code !== 0) failCode = code || 1;
  }
  if (failCode) process.exitCode = failCode;
}
