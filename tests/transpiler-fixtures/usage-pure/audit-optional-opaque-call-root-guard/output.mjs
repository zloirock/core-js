import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref, _ref2;
// an OPAQUE inline-call proxy-nav root (`f()?.window`, `f = () => globalThis`) navigating an unponyfilled
// window hop: the guard test keeps the RAW source (its SE + short-circuit), while the guarded branch
// COLLAPSES onto the ponyfill - a memoized ref that provably holds the proxy-global carries the
// provenance, so a ctor-static / prototype / fallback chain resolves instead of reading native off
// the ref (native `MAX_SAFE_INTEGER` on ie11 = undefined). the instance dispatch keeps its
// prototype-navigated receiver off the ref by placement design. distinct method per line.
const f = () => _globalThis;
const g = () => _globalThis;
export const knownStatic = (null == f().window ? void 0 : _Array$from)?.([1]);
export const ctorStatic = null == g()?.window ? void 0 : _toFixedMaybeNumber(_ref = _Number$MAX_SAFE_INTEGER).call(_ref, 2);
export const protoMethod = null == f().window ? void 0 : _Set.prototype.has.call(new _Set([1]), 1);
export const fallbackSwap = null == f().window ? void 0 : _Promise.noSuchStatic?.then(x => x);
export const instanceMethod = null == (_ref2 = g()?.window) ? void 0 : _includesMaybeArray(_ref2.Array.prototype).call([1, 2], 2);