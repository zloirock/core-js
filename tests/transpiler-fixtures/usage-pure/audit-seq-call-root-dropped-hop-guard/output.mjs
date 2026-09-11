import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// a dropped backed hop under a live `?.` whose base is a PROVEN named call (bare or behind an
// effect-free sequence): the `?.` is dead, so the memo folds straight onto the ponyfill,
// keeping only what the base observably did - the seq-prefix effects, and the call itself when
// its body or arguments carry any. the kept-write question is the chain-assign canon's `outer`
// answer: the identity spelling read the peeled sequence as a write and lost `_self` outright
const dh = () => _globalThis;
export const seq = null == _self ? void 0 : _atMaybeArray(_ref = _Array$of(1)).call(_ref, 0);
export const bare = null == _self ? void 0 : _atMaybeArray(_ref2 = _Array$of(1)).call(_ref2, 0);
let c = 0;
const eff = () => {
  c++;
  return _globalThis;
};
export const seCallee = null == (eff(), _self) ? void 0 : _atMaybeArray(_ref3 = _Array$of(1)).call(_ref3, 0);
export const seArg = null == (dh(c++), _self) ? void 0 : _atMaybeArray(_ref4 = _Array$of(1)).call(_ref4, 0);
export const sePrefix = null == (c++, _self) ? void 0 : _atMaybeArray(_ref5 = _Array$of(1)).call(_ref5, 0);
// negative: a call yielding the environment PROBE proves WHICH global, not that it is
// defined - its `?.` stays load-bearing and the guard render survives
const dw = () => _globalThis.window;
export const probeYield = null == (_ref6 = null == dw() ? void 0 : _Array$of(1)) ? void 0 : _atMaybeArray(_ref6).call(_ref6, 0);