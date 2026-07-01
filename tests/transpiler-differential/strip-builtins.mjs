// Preload (`node --import`) that removes the LEAF builtins core-js polyfills, BEFORE any @core-js
// module loads in the worker. Running a polyfilled output here proves two things at once:
//   1. the polyfill stands alone (it must, since the native is gone) - a polyfill that secretly
//      leaned on the native would throw;
//   2. the injection actually happened - a MISSED injection leaves a native call which now throws
//      (in a full Node realm it would silently succeed and mask the bug).
// The full-environment native run (in the parent) supplies the reference value; the stripped run
// must reproduce it.
//
// Strip ONLY leaf feature methods/statics that core-js IMPLEMENTS and never consumes internally.
// NOT foundational primitives (slice / push / indexOf / Function.prototype.call / defineProperty),
// NOT constructors (Promise / Map / Set), NOT Symbol / Symbol.iterator - removing those would break
// core-js's own internals or the realm itself, not exercise a polyfill.

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

dropProto(Array, [
  'at', 'flat', 'flatMap', 'includes', 'findLast', 'findLastIndex',
  'toReversed', 'toSorted', 'toSpliced', 'with',
]);
dropProto(String, ['at', 'padStart', 'padEnd', 'replaceAll', 'trimStart', 'trimEnd']);
dropStatic(Array, ['from', 'of', 'fromAsync']);
dropStatic(Object, ['fromEntries', 'groupBy', 'hasOwn']);
dropStatic(Map, ['groupBy']);
// Number.isInteger: the pure static stands alone (is-integral-number falls back to its own impl when
// the native is absent - evaluated at load, after this preload), so a missed injection surfaces here
dropStatic(Number, ['isInteger']);
// the new-Set-methods leaf ops: core-js implements each on its own pure Set and never consumes them
// internally, so removing them from the native prototype (the constructor stays) only forces a missed
// `new Set` -> pure-Set rewrite to surface (the native op is now gone) instead of silently using native
dropProto(Set, [
  'union', 'intersection', 'difference', 'symmetricDifference',
  'isSubsetOf', 'isSupersetOf', 'isDisjointFrom',
]);

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
delete GLOBAL.Iterator;
delete GLOBAL.globalThis;
