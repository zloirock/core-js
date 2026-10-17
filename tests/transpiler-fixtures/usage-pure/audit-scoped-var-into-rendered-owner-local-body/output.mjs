import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref2;
let effectCount = 0;
export const localBody = null == (() => {
  var _ref;
  const inner = _flatMaybeArray(_ref = [1, [2]]).call(_ref);
  effectCount += inner.length;
  return _globalThis;
})() ? void 0 : _atMaybeArray(_ref2 = _Array$of(5)).call(_ref2, 0);