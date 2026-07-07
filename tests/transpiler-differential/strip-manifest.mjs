// The strip-oracle MANIFEST: the single source of truth for which leaf builtins the stripped
// realm removes. Consumed by BOTH sides of the oracle contract:
//   - strip-builtins.mjs (the `--import` preload) APPLIES it to the worker realm;
//   - generate.mjs DERIVES the per-snippet `strip` flag from it (a snippet reading one of these
//     is a provable-injection case, so its stripped run must reproduce the full-env reference).
// Keeping them in one place is the point - the previous hand-mirrored lists let the two sides
// disagree (a strip:true family whose target was never stripped ran a vacuous leg).
// Strip ONLY leaf feature methods/statics that core-js IMPLEMENTS and never consumes internally,
// and that the transpiled OUTPUTS themselves don't need to run. NOT foundational primitives
// (slice / push / indexOf / Function.prototype.call / defineProperty), NOT constructors
// (Promise / Map / Set), NOT Symbol / Symbol.iterator - removing those would break core-js's own
// internals or the realm itself, not exercise a polyfill (see the array-iterator note in
// strip-builtins.mjs for a language-level counterexample).

export const STRIP_PROTO = {
  Array: [
    'at', 'flat', 'flatMap', 'includes', 'findLast', 'findLastIndex',
    'toReversed', 'toSorted', 'toSpliced', 'with',
  ],
  String: ['at', 'includes', 'padStart', 'padEnd', 'replaceAll', 'trimStart', 'trimEnd'],
  // the new-Set-methods leaf ops: core-js implements each on its own pure Set and never consumes
  // them internally, so removing them from the native prototype (the constructor stays) only
  // forces a missed `new Set` -> pure-Set rewrite to surface instead of silently using native
  Set: [
    'union', 'intersection', 'difference', 'symmetricDifference',
    'isSubsetOf', 'isSupersetOf', 'isDisjointFrom',
  ],
};

export const STRIP_STATIC = {
  Array: ['from', 'of', 'fromAsync'],
  Object: ['fromEntries', 'groupBy', 'hasOwn'],
  Map: ['groupBy'],
  // Number.isInteger: the pure static stands alone (is-integral-number falls back to its own
  // impl when the native is absent - evaluated at load, after the preload)
  Number: ['isInteger'],
};

// usage-pure also rewrites the `Iterator` constructor and every `globalThis` reference to pure
// imports, so they belong in the strip set too (deleted as GLOBAL bindings by the preload)
export const STRIP_GLOBALS = ['Iterator', 'globalThis'];
