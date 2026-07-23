// CI IE11 leg: build the real-IE11 bundles that a detection miss cannot hide from, and run them in
// actual IE11 through Karma. Only `usage-pure` under Babel 7 — that is the one (method, engine)
// combination where a green run genuinely validates per-site DETECTION: pure rewrites each call site
// to a local import, so a missed site stays a native call and dies on IE11, whereas the global
// methods patch the prototype once and one detected use masks a missed sibling (see README /
// artifacts.mjs). usage-global / entry-global and Babel 8 stay on artifacts.mjs's node pre-flight;
// running them here would double browser time for a strictly weaker signal.
//
// Each bundle is a self-contained UMD from `runtimeBuild` (the exact artifact artifacts.mjs ships to
// the manual BrowserStack step, and rollup-produced — so this also exercises unplugin's ROLLUP
// adapter in real IE11, complementing the webpack e2e leg in tests/unit-karma) with a QUnit driver
// appended. runtimeBuild already gates the bundle (assertPayload / assertNoExternals / non-zero
// injections); assertES5 is the caller's to run, and does below.
//
// Off a machine with IE11 (and outside CI) the bundles are still built — that alone runs every gate
// above — but Karma is skipped: there is no IE to capture. karma.conf.cjs makes the same check.
//
// Usage:  node karma-bundles.mjs [libFilter]   ->  builds .tmp/karma/*.js, runs Karma when IE present
import { runtimeBuild, assertES5, errorReason, HERE } from './build.mjs';
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

const METHOD = 'usage-pure';
const BABEL = '7';
const OUT = join(HERE, '.tmp', 'karma');

const [libFilter, ...surplus] = runnerArgs(import.meta.url);
if (surplus.length) throw new Error(`unexpected argument(s): ${ surplus.join(' ') } — karma-bundles.mjs takes only [libFilter]`);
const libs = librariesIn('runtime', libFilter);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const files = [];
for (const lib of libs) {
  const label = `${ lib.name }/${ METHOD }`;
  try {
    const { code, injections } = await runtimeBuild(lib.exercise, METHOD, BABEL);
    // runtimeBuild asserts payload / no-externals; the ES5 down-compile is the caller's to assert,
    // and it is the whole premise of an IE11 bundle — nothing downstream would catch a miss (the
    // browser page IS the check, and a non-ES5 bundle would just SyntaxError with no QUnit verdict).
    assertES5(code, label);
    if (!injections) throw new Error('unplugin injected 0 polyfills');
    // UMD exposes global `E2E`; the appended driver (ES5, parsed at harness.mjs load) calls E2E.run()
    const file = join(OUT, `e2e-libs-${ lib.name }-${ METHOD }.js`);
    await writeFile(file, `${ code }\n${ qunitHarness(label) }`);
    files.push(file);
    console.log(`✓ built ${ label }: ${ injections } inj → ${ file }`);
  } catch (err) {
    console.log(`✗ ${ label }: ${ errorReason(err) }`);
    process.exitCode = 1;
  }
}

if (!files.length) throw new Error('no bundles built — nothing to run in IE11');

// Only start Karma where IE11 actually exists: the windows CI runner (CI set) or a dev box with
// iexplore. Elsewhere the build above already ran every gate; the browser run is the CI-only part.
if (!(process.env.CI || which.sync('iexplore.exe', { nothrow: true }))) {
  console.log(`\n${ files.length } bundle(s) built in ${ OUT }. IE11 not present and not CI — skipping Karma.`);
} else {
  const karmaBin = req.resolve('karma/bin/karma');
  const conf = join(HERE, 'karma.conf.cjs');
  console.log(`\nrunning Karma over ${ files.length } bundle(s) in real IE11 — each reruns its library's`);
  console.log('exercise (the same deterministic self-checks as e2e-libs / artifacts) via QUnit; a red check');
  console.log('(a polyfill missing or misbehaving on IE11) fails the job. Per-library counts print as');
  console.log('"[e2e-libs] <lib>/usage-pure: N/N checks passed in this IE11".');
  // forward slashes: this leg runs on windows-2022, and Karma matches `files` through glob, where a
  // backslash is an escape — native Windows paths would silently match nothing
  const fArg = files.map(f => f.replaceAll('\\', '/')).join(',');
  const code = await new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [karmaBin, 'start', conf, `-f=${ fArg }`], { cwd: HERE, stdio: 'inherit' });
    p.on('error', reject);
    p.on('close', resolve);
  });
  if (code !== 0) process.exitCode = code || 1;
}
