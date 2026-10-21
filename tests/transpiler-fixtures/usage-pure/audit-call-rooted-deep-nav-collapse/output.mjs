import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4;
// Call-rooted quiet navigation retains its existing collapse. Effectful realm keys stay native, including under a symbol receiver.
typeof _getIteratorMethod(_globalThis.foo);
typeof (null == (_ref = _globalThis.foo) ? void 0 : _getIteratorMethod(_ref));
typeof (null == (_ref2 = _globalThis.foo) ? void 0 : _getIteratorMethod(_ref2));
let c = 0;
typeof (null == (_ref3 = (() => _globalThis)()[c++, 'window'].foo) ? void 0 : _getIteratorMethod(_ref3));
typeof (null == (_ref4 = (() => _globalThis)()[c++, 'window']['foo-bar']) ? void 0 : _getIteratorMethod(_ref4));
export const viaDefinedCallRoot = _self.userSlot;
export const viaDefinedCallRootClaim = _Array$of(3);
let sq = 0;
export const viaSeqDefinedCallRoot = (sq++, _self).userSlot;
export { sq };
const dhProbeYield = () => _globalThis.window;
export const viaProbeYieldPlainNav = _self.userSlot;
export const viaIdentRootTwin = _self.userSlot;
let se = 0;
const dhSeYield = () => {
  se++;
  return _globalThis;
};
export const viaEffectfulCallRoot = (dhSeYield(), _self).userSlot;
export { se };