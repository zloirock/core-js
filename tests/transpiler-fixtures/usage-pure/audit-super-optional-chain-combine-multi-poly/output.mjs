import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
// A `super.method?.()` optional chain with >=2 trailing instance polyfills must combine into ONE
// guard, not overlapping standalone transforms (which crashed: "could not locate inner needle").
// the combine memoizes the method-GET `super.flat` (assignable, unlike the receiver `super`) and
// calls it with `this` (`_ref.call(this)`); the super method stays native, the trailing `.map` / `.at`
// polyfills thread on the result
class Wrapped extends Array {
  tail() {
    var _ref, _ref2, _ref3;
    return null == (_ref = super.flat) ? void 0 : _at(_ref2 = _mapMaybeArray(_ref3 = _ref.call(this)).call(_ref3, x => x)).call(_ref2, -1);
  }
}