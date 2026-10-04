import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref;
// A call returning the proxy global keeps its optional window guard.
// Static, prototype and fallback reads resolve to ponyfills in the guarded branch.
// MAX_SAFE_INTEGER must remain available on IE11; instance dispatch retains the selected
// window value for its prototype navigation. Each row uses a distinct method.
const f = () => _globalThis;
const g = () => _globalThis;
export const knownStatic = (null == f().window ? void 0 : _Array$from)?.([1]);
export const ctorStatic = null == g()?.window ? void 0 : _toFixedMaybeNumber(_Number$MAX_SAFE_INTEGER).call(_Number$MAX_SAFE_INTEGER, 2);
export const protoMethod = null == f().window ? void 0 : _Set.prototype.has.call(new _Set([1]), 1);
export const fallbackSwap = null == f().window ? void 0 : _Promise.noSuchStatic?.then(x => x);
export const instanceMethod = null == (_ref = g()?.window) ? void 0 : _includesMaybeArray(_ref.Array.prototype).call([1, 2], 2);