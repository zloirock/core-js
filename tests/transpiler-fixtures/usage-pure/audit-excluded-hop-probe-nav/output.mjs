import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// `exclude` is a refusal the USER writes, and it lands INSIDE the family: with `web.self` filtered
// out the nav keeps that hop native while the rest of the chain still resolves. the guard must
// stand down for exactly the refused hop and no more - a per-name refusal, unlike `targets`, which
// refuses by engine support
_globalThis.excludeBox = {
  list: ['ab', 'cd'],
  n: 4
};
let k = 0;
export const plain = null == (_ref = _globalThis.window?.self.excludeBox.list) ? void 0 : _at(_ref).call(_ref, 0);
export const layer = null == (_ref2 = (_globalThis.window?.self.excludeBox).list) ? void 0 : _at(_ref2).call(_ref2, 0);
export const seq = null == (_ref3 = ('x', _globalThis.window?.self.excludeBox.list)) ? void 0 : _at(_ref3).call(_ref3, 0);
export const claim = null == _globalThis.window ? void 0 : _atMaybeArray(_ref4 = _Array$of(1)).call(_ref4, 0);
export const key = null == (_ref5 = _globalThis.window) ? void 0 : (_ref6 = _ref5.excludeBox.list, k++, _at(_ref6).call(_ref6, 0));
export const value = _globalThis.window?.self.excludeBox.n;
export { k };