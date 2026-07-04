import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// `this.X?.()` in a static method of a subclass of Array resolves through the same
// inherited-static machinery as `super.X?.()` (`this` in static context is the constructor):
// the polyfill is always defined, so the optional call DEOPTIMIZES (`_Array$from.call(this, ...)`,
// no `null ==` guard) and the trailing instance polys wrap the result - even with TWO trailing
// polys, where the chain-combine would otherwise take over and strand the static un-polyfilled
class C extends Array {
  static make() {
    var _ref, _ref2;
    return _at(_ref = _flatMaybeArray(_ref2 = _Array$from.call(this, [1, 2])).call(_ref2)).call(_ref, 0);
  }
}
export const r = C.make();