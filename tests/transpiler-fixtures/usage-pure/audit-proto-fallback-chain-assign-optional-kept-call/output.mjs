import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// a call tail with NO polyfillable meta above the fallback still keeps the root guard: the
// fold ate it before (`(c = gw, _Set).prototype.has.call(x)` returned a live value where
// native short-circuits to undefined on the absent window)
let c;
export const optionalKeptCall = null == (c = _globalThis.window) ? void 0 : _Set.prototype.has.call(new _Set([1]), 1);