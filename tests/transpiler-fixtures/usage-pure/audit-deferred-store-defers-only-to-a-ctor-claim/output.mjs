import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
// A deferred store whose plain realm run ends at backed self stores that ponyfill.
// Constructor, instance, unclaimed, and hop-tail consumers preserve the same store and key effects.
// Separate bindings keep later writes from deoptimizing the comparison.
let c1, c2, n1, n2, h1, h2, i1, i2, out;
function eff() {}
const ctorClaim = () => (c1 = _globalThis, c2 = (eff(), _self), _Promise).noSuchStatic;
const noClaim = () => (n1 = _globalThis, n2 = (eff(), _self)).noSuchStatic;
const hopTail = () => (h1 = _globalThis, h2 = (eff(), _self))?.noSuchStatic;
const instanceClaim = () => _atMaybeArray((i1 = _globalThis, i2 = (eff(), _self)).Array.prototype);
out = [ctorClaim, noClaim, hopTail, instanceClaim];
export const read = out;