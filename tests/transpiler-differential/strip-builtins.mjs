// Preload (`node --import`) that removes the LEAF builtins core-js polyfills, BEFORE any @core-js
// module loads in the worker. Running a polyfilled output here proves two things at once:
//   1. the polyfill stands alone (it must, since the native is gone) - a polyfill that secretly
//      leaned on the native would throw;
//   2. the injection actually happened - a MISSED injection leaves a native call which now throws
//      (in a full Node realm it would silently succeed and mask the bug).
// The full-environment native run (in the parent) supplies the reference value; the stripped run
// must reproduce it. WHAT gets stripped (and the strip criterion) lives in strip-manifest.mjs -
// the shared source this preload applies and generate.mjs derives the per-snippet arming from.

// NOTE: `Array.prototype[Symbol.iterator]` is deliberately NOT stripped, although the
// `symbol-iter-alias` / `getiterator-key-se` observables read it (their strip legs are
// therefore vacuous and those cells carry `strip:false`): the transpiled OUTPUTS themselves
// use array destructuring / spread, which needs the native array iterator to run at all -
// deleting it fails the "never consumed" criterion at the language level (verified: the
// polyfilled destructure-default legs TypeError realm-wide with the slot gone)

// NOTE: the Iterator-helper LEAF methods (map / filter / take / drop / toArray ...) on %IteratorPrototype%
// are deliberately NOT stripped. core-js's pure `array/instance/values` helper returns an iterator that
// INHERITS %IteratorPrototype% and relies on those helpers being present (it does not reimplement them on
// its own prototype) - deleting them throws in the polyfilled output too, so they fail the "never consumed
// internally" strip criterion. Iterator-helper receivers stay full-env (a missed injection is import-parity
// caught), while Set's leaf ops ARE reimplemented per-pure-Set and remain strippable above.

// usage-pure also rewrites the `Iterator` constructor and every `globalThis` reference to pure
// imports, so they belong in the strip set. the applier reaches the realm global via
// `Function('return this')()` - deliberately NOT the `globalThis` binding (which it deletes),
// the same indirect lookup core-js's own global-this internal uses, so core-js still bootstraps
// once the binding is gone (verified). a MISSED globalThis / Iterator injection then throws
// (binding / constructor gone) instead of silently resolving to the native.
// the strip itself is the manifest's ONE applier (shared with the e2e/unit stripped-realm
// runner, canary included); `runInThisContext` runs it at global scope in THIS worker realm
import { runInThisContext } from 'node:vm';
import { STRIP_GLOBALS, buildStripScript } from './strip-manifest.mjs';

runInThisContext(buildStripScript(STRIP_GLOBALS));
