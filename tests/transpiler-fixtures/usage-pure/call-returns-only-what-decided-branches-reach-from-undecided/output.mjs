import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
function undecided() {
  if (_globalThis.flag) return 'abc';
  return [1];
}
export const fromUndecided = _sliceMaybeArray(_ref = undecided()).call(_ref, 1);
_at(_ref2 = undecided()).call(_ref2, 1);
function arrayOnly() {
  if (_globalThis.flag) return [2];
  return [1];
}
export const fromArray = _atMaybeArray(_ref3 = arrayOnly()).call(_ref3, 0);