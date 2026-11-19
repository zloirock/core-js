// A `delete` folds the guards of the navigation it reaches its slot through, except a live `?.` over
// the `window` probe itself: that one decides whether the delete happens at all (with no `window` the
// source leaves `chrome` alone), so its guard stays and takes the whole operator. A `?.` over a hop
// pure always spells (`self`) folds with the rest.
globalThis.chrome = { probeSlot: 1 };
globalThis.deleteBox = { slot: 1, nested: { slot: 2 } };
const ut = () => globalThis;
let st;
// KEPT: the `?.` guards the `window` probe read
export const probeGuarded = delete ut()?.window?.self?.chrome;
// ... whatever tail the deleted member hangs off
export const probeGuardedPlainTail = delete ut()?.window?.self.deleteBox;
export const probeGuardedDeepTail = delete ut()?.window?.self.deleteBox.nested.slot;
// FOLDED: the `?.` is over `self`, a hop the pure package spells - always defined after the swap
export const resolvableHopFolds = delete globalThis.window.self?.Promise;
// KEPT: the probe read off a span pure lands always-defined is the environment probe too, and a
// seal changes nothing about that - the delete happens exactly where the source's `?.` says
export const sealedDeepProbeKeeps = delete (globalThis.self.window?.self).deleteBox;
// ... a STORE at the run's root spells the same span and keeps it, running once inside the test
export const storedRootProbeKeeps = delete (st = globalThis).self.window?.self.deleteBox;
// ... and so does a deeper tail, the second one ending on a method name (`at`) off a container the
// file never writes
export const deepTailProbeKeeps = delete globalThis.self.window?.self.deleteBox.nested.slot;
export const deepTailClaimedName = delete globalThis.self.window?.self.untouchedBox.at;
export { st };
