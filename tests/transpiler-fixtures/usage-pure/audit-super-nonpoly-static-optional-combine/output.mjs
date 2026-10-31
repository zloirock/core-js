import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// a NON-poly static-context super method (`super.custom`, the parent's OWN static, no core-js
// polyfill) with >=2 trailing instance polys must COMBINE into one guard like an instance super
// (memoize the method-GET, call with `this`), not split into overlapping standalone transforms.
// only a polyfillable inherited STATIC super (`super.of` / `super.from`) deoptimizes via the
// standalone; a non-poly static super has no deopt, so the trailing chain must not overlap-crash.
class B {
  static custom() {
    return [];
  }
}
class C extends B {
  static build() {
    var _ref, _ref2, _ref3;
    return null == (_ref = super.custom) ? void 0 : _atMaybeArray(_ref2 = _mapMaybeArray(_ref3 = _ref.call(this)).call(_ref3, x => x)).call(_ref2, -1);
  }
}
export { C };