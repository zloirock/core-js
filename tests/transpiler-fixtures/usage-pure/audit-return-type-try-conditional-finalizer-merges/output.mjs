import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// try / finally with a CONDITIONAL finalizer return: per JS spec the finalizer
// overrides try's return ONLY when the finalizer terminates unconditionally.
// `finally { if (cond) return null }` may fall through (when cond is false), so
// the try's `return [1,2,3]` is still observable. previously the collector
// unconditionally replaced try-returns whenever any finalizer return existed,
// dropping Array<number> from the merge and degrading `.at()` to the generic
// polyfill. with `nodeAlwaysExits` gating the override, both branches merge -
// the explicit `return null` is skipped from the commonType fold but recorded as
// a nullable fallback that defers to the concrete Array
declare const cond: boolean;
function probe() {
  try {
    return [1, 2, 3];
  } finally {
    if (cond) return null;
  }
}
_atMaybeArray(_ref = probe()).call(_ref, -1);