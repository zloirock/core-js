import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// a namespaced class type referenced multiple times recovers its declaration NodePath once (memoized
// per node) and resolves identically each time. distinct methods per use prove the memo returns the
// correct path for the repeated reference, not a stale or wrong one.
declare namespace NS {
  class Box {
    items(): number[];
  }
}
function first(x: NS.Box) {
  var _ref;
  return _atMaybeArray(_ref = x.items()).call(_ref, 0);
}
function second(y: NS.Box) {
  var _ref2;
  return _includesMaybeArray(_ref2 = y.items()).call(_ref2, 1);
}