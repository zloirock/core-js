import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _forEach from "@core-js/pure/actual/instance/for-each";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10;
// a DENSE spelling of the guard family: no spaces around operators, statements packed onto one
// line, the export list carried by ASI. the same source must render the same guard whether or
// not a human formatted it - every other fixture here is formatted, which would hide a
// whitespace assumption
_globalThis.denseBox = {
  list: ['ab', 'cd'],
  n: 4
};
let k = 0;
export const plain = null == (_ref = null == _globalThis.window ? void 0 : _self.denseBox.list) ? void 0 : _at(_ref).call(_ref, 0);
export const layer = null == (_ref2 = (null == _globalThis.window ? void 0 : _self.denseBox).list) ? void 0 : _at(_ref2).call(_ref2, 0);
export const seq = null == (_ref3 = ('x', null == _globalThis.window ? void 0 : _self.denseBox.list)) ? void 0 : _at(_ref3).call(_ref3, 0);
export const key = null == (_ref4 = _globalThis.window) ? void 0 : (_ref5 = _ref4.denseBox.list, k++, _at(_ref5).call(_ref5, 0));
export const claim = null == (_ref6 = _globalThis.window) ? void 0 : _atMaybeArray(_ref7 = _Array$of(1)).call(_ref7, 0);
export const chain = null == (_ref8 = null == (_ref9 = null == _globalThis.window ? void 0 : _self.denseBox.list) ? void 0 : _at(_ref9).call(_ref9, 0)) ? void 0 : _sliceMaybeArray(_ref8).call(_ref8, 0).length;
let a = [1];
a;
_forEach(_ref10 = (null == _globalThis.window ? void 0 : _self.denseBox.list) ?? []).call(_ref10, function () {});
export { k, a };