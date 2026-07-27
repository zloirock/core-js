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
// Karma runs ONE BUNDLE PER PAGE — a separate IE11 run per cell, never co-loading two bundles in one
// realm. Correctness is why: entry-global / usage-global bundles patch global prototypes at script
// load, before any test runs, so a co-loaded sibling could mask another cell's usage-pure or `pre` gap
// into a false green (a `pre` bundle's whole point is that it may be MISSING a polyfill). One bundle
// per page makes that impossible by construction — maximal isolation — and keeps each page to a single
// library copy (three's is ~1.4 MB) rather than stacking them (which also stops three's runtime
// "multiple instances" warning). The cost is a fresh IE launch per cell, ~30 s over the whole leg —
// dwarfed by the ~6 min the 42 rollup builds take.
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

// build the full matrix. Each cell is its own bundle file, run on its own IE11 page (see the run loop),
// so there is nothing to group. A 4-deep build loop (lib × method × phase × babel) plus one try/if body
// would nest too deep; flatten first so the processing loop stays shallow. entry-global -> [undefined];
// usage-* -> pre / post / pre+post.
const cells = [];
for (const lib of libs) {
  for (const method of lib.methods) {
    for (const phase of phasesFor(method)) {
      for (const babelVersion of BABEL_VERSIONS) cells.push({ lib, method, phase, babelVersion });
    }
  }
}
const built = [];
for (const { lib, method, phase, babelVersion } of cells) {
  const label = `${ lib.name }/${ method }${ phase ? `/${ phase }` : '' }/babel${ babelVersion }`;
  try {
    const { code, injections } = await runtimeBuild(lib.exercise, method, babelVersion, phase);
    // runtimeBuild asserts payload / no-externals; the ES5 down-compile is the caller's to assert, and
    // it is the whole premise of an IE11 bundle — nothing downstream would catch a miss (the browser
    // page IS the check, and a non-ES5 bundle would just SyntaxError with no QUnit verdict).
    assertES5(code, label);
    if (!injections) throw new Error('unplugin injected 0 polyfills');
    const file = join(OUT, `e2e-libs-${ lib.name }-${ method }-${ phase ?? 'noph' }-babel${ babelVersion }.js`);
    await writeFile(file, `${ code }\n${ qunitHarness(label) }`);
    built.push({ file, label, gating: phase !== 'pre' }); // `pre` is a non-gating diagnostic (see header)
    console.log(`✓ built ${ label }: ${ injections } inj`);
  } catch (err) {
    console.log(`✗ ${ label }: ${ errorReason(err) }`);
    process.exitCode = 1;
  }
}

if (!built.length) throw new Error('no bundles built — nothing to run in IE11');

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

// Only start Karma where IE11 actually exists: the windows CI runner (CI set) or a dev box with
// iexplore. Elsewhere the build above already ran every gate; the browser run is the CI-only part.
if (!(process.env.CI || which.sync('iexplore.exe', { nothrow: true }))) {
  console.log(`\n${ built.length } bundle(s) built in ${ OUT }. IE11 not present and not CI — skipping Karma.`);
} else {
  const karmaBin = req.resolve('karma/bin/karma');
  const conf = join(HERE, 'karma.conf.cjs');
  console.log(`\nrunning Karma in real IE11 over the full matrix — ONE bundle per page (${ built.length } pages),`);
  console.log('so no sibling shares a realm: a global-patching method can never mask the usage-pure or pre gap of');
  console.log('another cell, and each page holds a single library copy. post + pre+post (and entry-global) GATE the');
  console.log('job; the `pre` phase is a NON-GATING per-library diagnostic (pre runs unplugin before Babel, so it');
  console.log('can miss Babel-helper polyfills — expected to fail for some libraries, which is the signal we want,');
  console.log('not a job failure). Per-cell counts print as "[e2e-libs] <lib>/<method>/<phase>/babel<v>: N/N passed".');
  let failCode = 0;
  for (const { file, label, gating } of built) {
    console.log(`\n— IE11: ${ label }${ gating ? '' : ' [pre diagnostic, non-gating]' } —`);
    // one IE11 page at a time, on purpose (see header) — sequential await is intended here
    const code = await runKarma(karmaBin, conf, file);
    if (code === 0) continue;
    if (gating) failCode = code || 1;
    else console.log(`  pre diagnostic ${ label }: Karma exit ${ code } — an expected-possible pre failure; not gating the job`);
  }
  if (failCode) process.exitCode = failCode;
}
