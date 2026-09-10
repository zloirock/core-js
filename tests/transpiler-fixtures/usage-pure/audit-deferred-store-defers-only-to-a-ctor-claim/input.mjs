// inside a DEFERRED body the eager hook hands the store to the flush only when a CTOR / STATIC claim
// owns its value - that claim's channel is what renders the guard. a tail that claims nothing and a
// proxy hop keep the store's own value: neither has a channel that reads the store's absence. an
// INSTANCE dispatch does have one - the guard it builds IS that reader - so the store spells the
// guarded value there, or the user's variable holds the realm object on the very branch that guard
// calls absent. read from BOTH spellings of the claim, because
// which one stands there is pass order: still above the store, or already inside the built guard's
// alternate. each form gets its own bindings - a second write to one alias deopts the follow
let c1, c2, n1, n2, h1, h2, i1, i2, out;
function eff() {}
const ctorClaim = () => (c1 = globalThis, c2 = c1[(eff(), 'window')].self)?.Promise.noSuchStatic;
const noClaim = () => (n1 = globalThis, n2 = n1[(eff(), 'window')].self).noSuchStatic;
const hopTail = () => (h1 = globalThis, h2 = h1[(eff(), 'window')].self)?.window.noSuchStatic;
const instanceClaim = () => (i1 = globalThis, i2 = i1[(eff(), 'window')].self)?.Array.prototype.at;
out = [ctorClaim, noClaim, hopTail, instanceClaim];
export const read = out;
