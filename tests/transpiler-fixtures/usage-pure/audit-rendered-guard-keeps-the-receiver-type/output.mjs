import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
// A rendered quiet realm guard keeps its receiver type.
// A stored effectful realm key retains its source read and independent instance claim.
let v, g, out;
function eff() {}
out = _nameMaybeFunction(_atMaybeArray((eff(), null == _globalThis.window ? void 0 : _self).Array.prototype));
export const stored = null == (g = _globalThis, v = g[eff(), 'window']?.self) ? void 0 : _nameMaybeFunction(_at(v.Array.prototype));
export const read = out;