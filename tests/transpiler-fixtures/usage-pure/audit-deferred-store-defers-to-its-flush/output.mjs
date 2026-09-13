import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
// Deferred and straight-line carriers preserve identical source stores and key effects.
// Their plain run ends at backed self, so the outer optional is redundant in both contexts.
// Separate bindings prevent a second write from hiding the comparison.
let a1, a2, b1, b2, out;
function eff() {}
out = () => (a1 = _globalThis, a2 = (eff(), _self), _Promise).noSuchStatic;
export const straightLine = (b1 = _globalThis, b2 = (eff(), _self), _Promise).noSuchStatic;
export const read = out;