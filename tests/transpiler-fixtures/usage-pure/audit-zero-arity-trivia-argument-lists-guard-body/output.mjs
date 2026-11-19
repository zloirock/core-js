import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
const o = {
  m: () => [[1]]
};
export const guardBody = null == (_ref = o.m) ? void 0 : _flatMaybeArray(_ref2 = _ref.call(o) /* none */).call(_ref2);