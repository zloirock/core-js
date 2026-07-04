import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _Object$entries from "@core-js/pure/actual/object/entries";
// an SE-prefixed computed key folding to a KNOWN static deopts the optional call exactly like
// the dotted form: the resolved polyfill is always defined, so the `?.` drops while the key's
// effect stays in place and runs exactly once ahead of the injected static. covers the three
// receiver families - static-context `this`, `super`, and a bare global - each with trailing
// instance polyfills (the shape that previously left the callee raw or emitted overlapping
// rewrites instead of the injected static). a static that resolves NO polyfill on the targets
// (native-only `Array.isArray`) keeps its guard - the deopt premise is the injected binding
let viaThis = 0;
let viaSuper = 0;
let viaGlobal = 0;
class C extends Array {
  static thisForm() {
    var _ref, _ref2;
    return _at(_ref = _flatMaybeArray(_ref2 = (viaThis++, _Array$from.call(this, [1, 2]))).call(_ref2)).call(_ref, 0);
  }
  static superForm() {
    var _ref3, _ref4;
    return _at(_ref3 = _flatMaybeArray(_ref4 = (viaSuper++, _Array$of.call(this, 1, 2))).call(_ref4)).call(_ref3, 0);
  }
}
export const fromGlobal = (viaGlobal++, _Object$entries)({
  a: 1
});
export const guarded = Array[0, 'isArray']?.([1]);
export const r = [C.thisForm(), C.superForm()];