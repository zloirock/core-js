import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A retained effectful realm read must not invalidate a later independent alias claim.
let v, g, w, out;
function eff() {}
out = (g = _globalThis, v = g[eff(), 'window'].self)?.noSuchStatic;
export const laterRead = _atMaybeArray((g = _globalThis, w = _self).Array.prototype);
export { v, w, out };