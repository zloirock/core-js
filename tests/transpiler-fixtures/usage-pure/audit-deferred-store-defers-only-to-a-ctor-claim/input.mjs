// A deferred store whose plain realm run ends at backed self stores that ponyfill.
// Constructor, instance, unclaimed, and hop-tail consumers preserve the same store and key effects.
// Separate bindings keep later writes from deoptimizing the comparison.
let c1, c2, n1, n2, h1, h2, i1, i2, out;
function eff() {}
const ctorClaim = () => (c1 = globalThis, c2 = c1[(eff(), 'window')].self)?.Promise.noSuchStatic;
const noClaim = () => (n1 = globalThis, n2 = n1[(eff(), 'window')].self).noSuchStatic;
const hopTail = () => (h1 = globalThis, h2 = h1[(eff(), 'window')].self)?.window.noSuchStatic;
const instanceClaim = () => (i1 = globalThis, i2 = i1[(eff(), 'window')].self)?.Array.prototype.at;
out = [ctorClaim, noClaim, hopTail, instanceClaim];
export const read = out;
