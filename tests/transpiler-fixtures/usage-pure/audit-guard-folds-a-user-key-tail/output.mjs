import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// steps past the planned run (non-proxy names) read off the value the guard's alternate produces:
// while that value is provably defined they move INSIDE the alternate - plain steps and the first
// `?.` alike, so no `?.` is left for an ES5 lowering to memoize - and a later live `?.` stays outside,
// over the ternary. a computed key without effects folds like any other step.
const ut = () => _globalThis;
export const unplannedOptionalTail = null == (_ref = null == ut().window ? void 0 : _self.chrome) ? void 0 : _at(_ref2 = _ref.Array.of(13)).call(_ref2, 0);
export const unplannedPlainTail = null == ut().window ? void 0 : _self.chrome.Array;
export const unplannedComputedTail = null == ut().window ? void 0 : _self['chrome'];
export const unplannedTwoTails = (null == ut().window ? void 0 : _self.chrome)?.foo?.Array;
export const unplannedPlainChain = null == ut().window ? void 0 : _self.chrome.foo.Array;
const pf = () => _globalThis;
export const plainThenLiveOptional = null == pf().window ? void 0 : _self.chrome?.foo.bar;
_globalThis.metaHost = {
  a: 1,
  b: 2
};
const mt = () => _globalThis;
export const opaqueKeyNoEffects = null == mt().window ? void 0 : _self.metaHost[_globalThis.flag ? 'a' : 'b'];
export const opaqueKeyRuntimeValue = null == mt().window ? void 0 : _self.metaHost[String('a')];