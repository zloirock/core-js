// A retained effectful realm read must not invalidate a later independent alias claim.
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";

let v, g, w, out;

function eff() {}

out = (g = _globalThis, v = g[(eff(), 'window')].self)?.window.noSuchStatic;

export const laterRead = _atMaybeArray((g = _globalThis, w = _self).Array.prototype);
export { v, w, out };