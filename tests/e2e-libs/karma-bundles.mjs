// CI IE11 leg: build the real-IE11 bundles and run them in actual IE11 through Karma — the FULL
// runtime matrix, every (library × method × unplugin phase × Babel version). The Babel axis (7/8)
// tests the down-compile toolchain; the phase axis (pre / post / pre+post) tests unplugin's ordering
// relative to Babel. entry-global carries no phase. usage-pure is the method whose green run also
// validates per-site DETECTION; the global methods prove the exercise still EXECUTES on IE11.
//
// Each bundle is a self-contained UMD from `runtimeBuild` (the exact artifact artifacts.mjs ships, and
// rollup-produced — so this also exercises unplugin's ROLLUP adapter in real IE11, complementing the
// webpack e2e leg in tests/unit-karma) with a QUnit driver appended. runtimeBuild already gates the
// bundle (assertPayload / assertNoExternals / non-zero injections); assertES5 is the caller's to run,
// and does below.
//
// The `pre` phase is a NON-GATING per-library DIAGNOSTIC. In this pipeline Babel down-compiles first,
// then unplugin injects; `pre` runs unplugin BEFORE Babel, so it can miss the polyfills Babel's own
// helpers introduce (a for-of helper reaching for Symbol.iterator, etc.) — so `pre` is expected to
// fail for some libraries on real IE11, which is exactly the per-library signal we want to surface.
// It therefore does NOT fail the job; only `post` and `pre+post` (and entry-global) gate.
//
// Karma runs ONCE PER (library × isolation-class), never co-loading usage-pure with the global
// methods, and never co-loading a `pre` cell with anything else. Correctness is why: entry-global /
// usage-global bundles patch global prototypes at script load, before any test runs, and a `pre`
// bundle's whole point is that it may be MISSING a polyfill — a co-loaded sibling that patches that
// global would mask the gap into a false green. So each isolation-class × gate/diagnostic combination
// gets its own IE11 page. Size is a bonus: every bundle inlines its whole library (three's is ~1.4 MB),
// so splitting also keeps each page well under the ~16 MB an all-in-one page would be.
//
// Off a machine with IE11 (and outside CI) the bundles are still built — that alone runs every gate
// above — but Karma is skipped: there is no IE to capture. karma.conf.cjs makes the same check.
//
// Usage:  node karma-bundles.mjs [libFilter]   ->  builds .tmp/karma/*.js, runs Karma when IE present
import { runtimeBuild, assertES5, errorReason, BABEL_VERSIONS, phasesFor, HERE } from './build.mjs';
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

// build the full matrix, grouped for Karma by (library × isolation-class × gate/diagnostic). `global`
// = entry-global + usage-global (they patch prototypes); the `pre` phase forms its own diagnostic
// groups so a co-loaded sibling can't mask a `pre` gap (see header). Each group carries a `gating` flag.
const groups = new Map();
// flat cell list — a 4-deep build loop (lib × method × phase × babel) plus one try/if body would nest
// too deep; flatten first so the processing loop stays shallow. entry-global -> [undefined]; usage-* ->
// pre / post / pre+post.
const cells = [];
for (const lib of libs) {
  for (const method of lib.methods) {
    for (const phase of phasesFor(method)) {
      for (const babelVersion of BABEL_VERSIONS) cells.push({ lib, method, phase, babelVersion });
    }
  }
}
for (const { lib, method, phase, babelVersion } of cells) {
  const label = `${ lib.name }/${ method }${ phase ? `/${ phase }` : '' }/babel${ babelVersion }`;
  try {
    const { code, injections } = await runtimeBuild(lib.exercise, method, babelVersion, phase);
    // runtimeBuild asserts payload / no-externals; the ES5 down-compile is the caller's to assert, and
    // it is the whole premise of an IE11 bundle — nothing downstream would catch a miss (the browser
    // page IS the check, and a non-ES5 bundle would just SyntaxError with no QUnit verdict).
    assertES5(code, label);
    if (!injections) throw new Error('unplugin injected 0 polyfills');
    // UMD exposes global `E2E`; the appended driver captures it at load (harness.mjs) so the shared
    // global name does not make every test run the last-loaded bundle.
    const file = join(OUT, `e2e-libs-${ lib.name }-${ method }-${ phase ?? 'noph' }-babel${ babelVersion }.js`);
    await writeFile(file, `${ code }\n${ qunitHarness(label) }`);
    const isolation = method === 'usage-pure' ? 'usage-pure' : 'global';
    const gating = phase !== 'pre'; // `pre` is a non-gating diagnostic (see header)
    const key = `${ lib.name } (${ isolation }${ gating ? '' : ', pre-diagnostic' })`;
    let group = groups.get(key);
    if (!group) groups.set(key, group = { files: [], gating });
    group.files.push(file);
    console.log(`✓ built ${ label }: ${ injections } inj`);
  } catch (err) {
    console.log(`✗ ${ label }: ${ errorReason(err) }`);
    process.exitCode = 1;
  }
}

let total = 0;
for (const group of groups.values()) total += group.files.length;
if (!total) throw new Error('no bundles built — nothing to run in IE11');

function runKarma(karmaBin, conf, files) {
  // forward slashes: this leg runs on windows-2022, and Karma matches `files` through glob, where a
  // backslash is an escape — native Windows paths would silently match nothing
  const fArg = files.map(f => f.replaceAll('\\', '/')).join(',');
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [karmaBin, 'start', conf, `-f=${ fArg }`], { cwd: HERE, stdio: 'inherit' });
    p.on('error', reject);
    p.on('close', resolve);
  });
}

// Only start Karma where IE11 actually exists: the windows CI runner (CI set) or a dev box with
// iexplore. Elsewhere the build above already ran every gate; the browser run is the CI-only part.
if (!(process.env.CI || which.sync('iexplore.exe', { nothrow: true }))) {
  console.log(`\n${ total } bundle(s) built in ${ OUT }. IE11 not present and not CI — skipping Karma.`);
} else {
  const karmaBin = req.resolve('karma/bin/karma');
  const conf = join(HERE, 'karma.conf.cjs');
  console.log(`\nrunning Karma in real IE11 over the full matrix (${ total } bundle(s), one page per`);
  console.log('(library × isolation-class × gate/diagnostic) so nothing masks a usage-pure or pre gap).');
  console.log('post + pre+post (and entry-global) GATE the job; the `pre` phase is a NON-GATING per-');
  console.log('library diagnostic (pre runs unplugin before Babel, so it can miss Babel-helper polyfills');
  console.log('— expected to fail for some libraries, which is the signal we want, not a job failure).');
  console.log('Per-cell counts print as "[e2e-libs] <lib>/<method>/<phase>/babel<v>: N/N checks passed".');
  let failCode = 0;
  for (const [key, { files, gating }] of groups) {
    console.log(`\n— IE11: ${ key } (${ files.length } bundle(s))${ gating ? '' : ' [diagnostic, non-gating]' } —`);
    // one IE11 page at a time, on purpose (see header) — sequential await is intended here
    const code = await runKarma(karmaBin, conf, files);
    if (!gating) {
      console.log(`  pre diagnostic for ${ key }: Karma exit ${ code } (${ code === 0 ? 'all pre cells ran' : 'some pre cells failed — see above' }); not gating the job`);
    } else if (code !== 0) {
      failCode = code || 1;
    }
  }
  if (failCode) process.exitCode = failCode;
}
