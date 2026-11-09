import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// Combining instance calls retains an optional method in the surviving tail.
export function read(a) {
  var _ref, _ref2;
  return null == (_ref = _flatMaybeArray(a)) ? void 0 : _at(_ref2 = _ref.call(a)).call(_ref2, 0).foo?.().bar;
}