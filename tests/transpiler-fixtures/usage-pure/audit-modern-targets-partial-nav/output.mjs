import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// on a target where `self` is native but `globalThis` is not, only PART of the nav is ponyfillable:
// the guard must not render a collapse for a hop the resolver refuses, and the hops it does own
// still resolve. every fixture around this one pins `ie: 11`, where everything is polyfilled at once
_globalThis.modernBox = {
  list: ['ab', 'cd'],
  n: 4
};
let k = 0;
export const plainDispatch = null == (_ref = _globalThis.window?.self.modernBox.list) ? void 0 : _at(_ref).call(_ref, 0);
export const layeredDispatch = null == (_ref2 = (_globalThis.window?.self.modernBox).list) ? void 0 : _at(_ref2).call(_ref2, 0);
export const sequenceDispatch = null == (_ref3 = ('x', _globalThis.window?.self.modernBox.list)) ? void 0 : _at(_ref3).call(_ref3, 0);
export const staticClaim = null == (_ref4 = _globalThis.window) ? void 0 : _atMaybeArray(_ref5 = _ref4.Array.of(1)).call(_ref5, 0);
export const keyEffect = null == (_ref6 = _globalThis.window) ? void 0 : (_ref7 = _ref6.modernBox.list, k++, _at(_ref7).call(_ref7, 0));
export const plainValue = _globalThis.window?.self.modernBox.n;
export { k };