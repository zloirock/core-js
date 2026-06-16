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

// usage-pure also rewrites the `Iterator` constructor and every `globalThis` reference to pure
// imports, so they belong in the strip set too. `GLOBAL` is the realm global via
// `Function('return this')()` - deliberately NOT the `globalThis` binding (which is deleted below),
// the same indirect lookup core-js's own global-this internal uses, so core-js still bootstraps once
// the binding is gone (verified). a MISSED globalThis / Iterator injection then throws (binding /
// constructor gone) instead of silently resolving to the native.
const GLOBAL = Function('return this')();
delete GLOBAL.Iterator;
delete GLOBAL.globalThis;
