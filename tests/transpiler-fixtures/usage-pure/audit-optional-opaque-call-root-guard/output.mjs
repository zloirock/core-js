import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref, _ref2, _ref3;
// an OPAQUE inline-call proxy-nav root (`f()?.window`, `f = () => globalThis`) navigating an unponyfilled
// window hop: no resolver collapses a call root, so the guard test is the RAW source with any internal
// proxy-global substituted (`null == f()?.window ? void 0 : _Array$from`), and the static / fallback GUARDS
// rather than bailing to the raw un-polyfilled chain (native `from` on ie11 = missed polyfill) or folding +
// dropping the receiver nav (its SE + short-circuit). covers a known static, a ctor-static, a prototype
// method, an unknown-static fallback swap, and an instance dispatch. distinct method per line.
const f = () => _globalThis;
const g = () => _globalThis;
export const knownStatic = (null == f()?.window ? void 0 : _Array$from)?.([1]);
export const ctorStatic = null == (_ref = g()?.window) ? void 0 : _toFixedMaybeNumber(_ref2 = _ref.Number.MAX_SAFE_INTEGER).call(_ref2, 2);
export const protoMethod = null == f()?.window ? void 0 : _Set.prototype.has.call(new _Set([1]), 1);
export const fallbackSwap = null == f()?.window ? void 0 : _Promise.noSuchStatic?.then(x => x);
export const instanceMethod = null == (_ref3 = g()?.window) ? void 0 : _includesMaybeArray(_ref3.Array.prototype).call([1, 2], 2);