// Stripped-realm leg for a prebuilt test bundle (argv[2]: e2e-usage-pure / unit-pure) - the
// runtime twin of the differential's stripped worker, COMPLEMENTING the regular full-env run
// of the same bundle (both legs run; the full-env one stays the primary). The bundle evaluates
// inside a FRESH `node:vm` realm whose leaf builtins and engine-absent constructors
// (strip-manifest.mjs: the differential sets + E2E_STRIP_GLOBALS) are deleted BEFORE the pure
// modules initialize, so the run proves at once that:
//   1. every ponyfill stands alone (the native is gone - one leaning on it throws);
//   2. nothing silently reaches a native: for e2e a MISSED substitution leaves a raw read that
//      now throws; for unit-pure a test violating the "never touch the modern stdlib" rule
//      surfaces the same way. the full-env legs keep proving the natives-present behavior.
// The harness (QUnit + reporter) lives OUTSIDE the realm with its natives intact - only the
// bundle sees the gaps. `assert.throws(fn, Ctor)` stays realm-coherent: both the thrown error
// and the expected constructor are inner-realm values.
import { readFile } from 'node:fs/promises';
import { createContext, runInContext } from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { E2E_STRIP_REALM_GLOBALS, ITERATOR_PROTO_HELPERS, buildStripScript } from '../transpiler-differential/strip-manifest.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const QUnit = require('qunit');

const sandbox = {
  QUnit,
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  queueMicrotask,
  process,
};
const context = createContext(sandbox);

// the realm is deliberately BARE of Node's host globals (DOMException / URL / structuredClone
// / atob / ...): their pure ponyfills then run their standalone paths, which is exactly the
// coverage this leg exists for. copying host natives across the realm boundary is NOT an
// option - cross-realm brand checks break in both directions (an outer structuredClone
// returns outer-realm clones, an outer DOMException fails the inner `instanceof Error`
// detection). `global` maps to the inner realm for webpack-style references
runInContext('Function("return this")().global = Function("return this")();', context);

// strip the realm via the manifest's ONE applier (shared with the differential preload):
// the vm context owns pristine copies of every intrinsic, so deleting here never touches the
// harness realm. `globalThis` (in STRIP_GLOBALS) goes too - the realm global stays reachable
// inside via `Function('return this')()`. the applier's tail CANARY throws if the strip
// silently failed to apply - a vacuous full-env pass must never wear the stripped label
runInContext(buildStripScript(E2E_STRIP_REALM_GLOBALS, ITERATOR_PROTO_HELPERS), context);

QUnit.config.autostart = false;
QUnit.reporters.tap.init(QUnit);

const { 2: name } = process.argv;
const bundle = await readFile(join(HERE, `../bundles/${ name }.js`), 'utf8');
runInContext(bundle, context, { filename: `${ name }.js` });

QUnit.on('runEnd', run => {
  const { passed, failed, total } = run.testCounts;
  console.log(`# stripped-realm ${ name }: ${ passed }/${ total } passed, ${ failed } failed`);
  if (failed > 0 || run.status === 'failed') process.exitCode = 1;
});
QUnit.start();
