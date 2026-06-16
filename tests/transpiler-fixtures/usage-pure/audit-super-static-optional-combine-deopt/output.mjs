import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
// A STATIC super method (`super.of` in a static method, resolving to the polyfillable static
// `Array.of`) must be DEOPTIMIZED like the standalone path - the polyfill is always defined, so the
// optional `?.()` drops its guard (`_Array$of.call(this, 1)`, no `null ==` test) and the trailing
// `.map` / `.at` polys combine on the result. distinct from an INSTANCE super method (`super.flat`),
// which stays native and keeps its guard
class Wrapped extends Array {
  static build() {
    var _ref, _ref2;
    return _at(_ref = _mapMaybeArray(_ref2 = _Array$of.call(this, 1)).call(_ref2, x => x)).call(_ref, 0);
  }
}