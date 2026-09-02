import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4;
// a deeper nav under a non-proxy leaf chain with a CALL root: the receiver plan's member
// recursion must reach the call-rooted collapse exactly like the identifier-rooted twin
// (`_globalThis.foo`), never leave the raw `.window` hop standing over the inlined call
typeof _getIteratorMethod(_globalThis.foo);
typeof (null == (_ref = _globalThis.foo) ? void 0 : _getIteratorMethod(_ref));
typeof (null == (_ref2 = _globalThis.foo) ? void 0 : _getIteratorMethod(_ref2));
// boundary forms of the same collapse: an SE-bearing computed hop key keeps its effect as the
// collapsed base's prefix, and a computed user leaf keeps its own spelling over the folded base
let c = 0;
typeof (null == (_ref3 = (c++, _globalThis).foo) ? void 0 : _getIteratorMethod(_ref3));
typeof (null == (_ref4 = (c++, _globalThis)['foo-bar']) ? void 0 : _getIteratorMethod(_ref4));

// a claimless nav on a DEFINED-yield call root collapses onto the ROOT ponyfill - the
// identifier twin's canon - with a sequence prefix re-emitted ahead of the base; the
// PROBE-yield twin keeps the leaf collapse (its value never reached the root), and an
// effect-bearing call keeps the leaf too - the fold has no slot to replay what it did
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