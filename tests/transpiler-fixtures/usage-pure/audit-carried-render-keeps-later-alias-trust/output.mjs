import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a render that REPLACES a subtree while carrying a kept alias write must not cost the alias its
// trust at LATER reads: the write's cached ancestry died with the replaced span, and a placement
// judged over those dead edges refused the very trust the write still earns - the second statement
// then kept its store raw where the same statement alone collapses it
let v, g, w, out;
function eff() {}
out = (g = _globalThis, v = (eff(), _self))?.noSuchStatic;
export const laterRead = _atMaybeArray((g = _globalThis, w = _self).Array.prototype);
export { v, w, out };