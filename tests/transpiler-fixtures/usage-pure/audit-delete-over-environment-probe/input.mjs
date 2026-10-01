// the `delete` canon and its one exception. a `delete` consumer reads nothing over its
// navigation, so the hops fold with their guards - EXCEPT where a live `?.` guards the
// ENVIRONMENT PROBE itself. That guard is not over a read: it decides whether the delete
// HAPPENS, and folding it removes a slot off the ponyfill the source never touches (measured on
// a realm with no `window`: the source leaves `globalThis.chrome` alone, the folded spelling
// deletes it). the kept guard puts the deleted member OUTSIDE the ternary behind a `?.` of its
// own - pulled into the alternate the ternary evaluates and deletes nothing, and left outside
// bare it reads off the guard's `void 0`. a `?.` over a hop pure CAN spell (`self`) reads an
// always-defined ponyfill and folds with the rest.
globalThis.chrome = { probeSlot: 1 };
globalThis.deleteBox = { slot: 1, nested: { slot: 2 } };
const ut = () => globalThis;
let st;
// KEPT: the `?.` guards the `window` probe read
export const probeGuarded = delete ut()?.window?.self?.chrome;
// ... and the tail rides outside behind a `?.` the source never spelled
export const probeGuardedPlainTail = delete ut()?.window?.self.deleteBox;
export const probeGuardedDeepTail = delete ut()?.window?.self.deleteBox.nested.slot;
// FOLDED: the `?.` is over `self`, a hop the pure package spells - always defined after the swap
export const resolvableHopFolds = delete globalThis.window.self?.Promise;
// KEPT: the probe read off a span pure lands always-defined is the environment probe too, and a
// seal changes nothing about that - the delete happens exactly where the source's `?.` says
export const sealedDeepProbeKeeps = delete (globalThis.self.window?.self).deleteBox;
// ... a STORE at the run's root spells the same span and keeps it, running once inside the test
export const storedRootProbeKeeps = delete (st = globalThis).self.window?.self.deleteBox;
// ... and so does a deeper tail, whose own hops ride outside the guard. the second row ends on a
// name the instance channel claims, off a container this file never WRITES - a written slot deopts
// that route, and the guard render this row covers is reached only through it
export const deepTailProbeKeeps = delete globalThis.self.window?.self.deleteBox.nested.slot;
export const deepTailClaimedName = delete globalThis.self.window?.self.untouchedBox.at;
export { st };
