import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
// a user-PATCHED inherited static must not deopt through the optional rescue: the patch owns
// the slot, so no pure static injects and the chain-combine keeps the guard - the raw method-GET
// dispatches to the patch at runtime while the trailing instance methods still polyfill.
// bailing to the standalone path instead would strand the two trailing polys as overlapping
// rewrites over the shared guard (composition crash). the gate is PER-KEY: the sibling
// `super.of?.()` chain (of is NOT patched) still deoptimizes to the injected static
Array.from = function (x) {
  return [8];
};
class C extends Array {
  static viaPatched() {
    var _ref, _ref2, _ref3;
    return null == (_ref = this.from) ? void 0 : _at(_ref2 = _flatMaybeArray(_ref3 = _ref.call(this, [1, 2])).call(_ref3)).call(_ref2, 0);
  }
  static viaUnpatched() {
    var _ref4, _ref5;
    return _at(_ref4 = _flatMaybeArray(_ref5 = _Array$of.call(this, 1, 2)).call(_ref5)).call(_ref4, 0);
  }
}
export const r = [C.viaPatched(), C.viaUnpatched()];