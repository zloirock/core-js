// Preload (`node --import`) that removes the LEAF builtins core-js polyfills, BEFORE any @core-js
// module loads in the worker. Running a polyfilled output here proves two things at once:
//   1. the polyfill stands alone (it must, since the native is gone) - a polyfill that secretly
//      leaned on the native would throw;
//   2. the injection actually happened - a MISSED injection leaves a native call which now throws
//      (in a full Node realm it would silently succeed and mask the bug).
// The full-environment native run (in the parent) supplies the reference value; the stripped run
// must reproduce it. WHAT gets stripped (and the strip criterion) lives in strip-manifest.mjs -
// the shared source this preload applies and generate.mjs derives the per-snippet arming from.

import { STRIP_PROTO, STRIP_STATIC, STRIP_GLOBALS } from './strip-manifest.mjs';

function dropProto(ctor, names) {
  for (const n of names) {
    try { delete ctor.prototype[n]; } catch { /* frozen intrinsic - skip */ }
  }
}
function dropStatic(ctor, names) {
  for (const n of names) {
    try { delete ctor[n]; } catch { /* skip */ }
  }
}

// the CTORS map keys the manifest's names onto this realm's live constructors; the manifest
// (strip-manifest.mjs) is the single source both for what gets deleted here and for what
// generate.mjs arms - per-ctor rationales live next to the lists there
const CTORS = { Array, String, Set, Object, Map, Number };
for (const [name, methods] of Object.entries(STRIP_PROTO)) dropProto(CTORS[name], methods);
for (const [name, statics] of Object.entries(STRIP_STATIC)) dropStatic(CTORS[name], statics);

// NOTE: `Array.prototype[Symbol.iterator]` is deliberately NOT stripped, although the
// `symbol-iter-alias` / `getiterator-key-se` observables read it (their strip legs are
// therefore vacuous and those cells carry `strip:false`): the transpiled OUTPUTS themselves
// use array destructuring / spread, which needs the native array iterator to run at all -
// deleting it fails the "never consumed" criterion at the language level (verified: the
// polyfilled destructure-default legs TypeError realm-wide with the slot gone)

// usage-pure also rewrites the `Iterator` constructor and every `globalThis` reference to pure
// imports, so they belong in the strip set too. `GLOBAL` is the realm global via
// `Function('return this')()` - deliberately NOT the `globalThis` binding (which is deleted below),
// the same indirect lookup core-js's own global-this internal uses, so core-js still bootstraps once
// the binding is gone (verified). a MISSED globalThis / Iterator injection then throws (binding /
// constructor gone) instead of silently resolving to the native.
const GLOBAL = Function('return this')();
// NOTE: the Iterator-helper LEAF methods (map / filter / take / drop / toArray ...) on %IteratorPrototype%
// are deliberately NOT stripped. core-js's pure `array/instance/values` helper returns an iterator that
// INHERITS %IteratorPrototype% and relies on those helpers being present (it does not reimplement them on
// its own prototype) - deleting them throws in the polyfilled output too, so they fail the "never consumed
// internally" strip criterion. Iterator-helper receivers stay full-env (a missed injection is import-parity
// caught), while Set's leaf ops ARE reimplemented per-pure-Set and remain strippable above.
for (const name of STRIP_GLOBALS) delete GLOBAL[name];
