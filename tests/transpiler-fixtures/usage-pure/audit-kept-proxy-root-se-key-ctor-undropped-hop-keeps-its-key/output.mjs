import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// An SE-bearing hop key MIGRATES into the next surviving key when the pristine hop over a kept proxy root drops.
let c = 0;
// NEGATIVE: no pure ctor AND no kept write - nothing drops, and the hop keeps its own key
export const undroppedHopKeepsItsKey = null == (_ref = _globalThis.window) ? void 0 : _nameMaybeFunction((c++, _ref).Array);
export { c };