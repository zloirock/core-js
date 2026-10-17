import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
function undecided() {
  if (_globalThis.flag) return 'abc';
  return [1];
}
export const fromUndecided = _sliceMaybeArray(_ref = undecided()).call(_ref, 1);