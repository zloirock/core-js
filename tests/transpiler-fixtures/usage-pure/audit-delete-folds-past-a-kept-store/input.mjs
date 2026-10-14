// A user write inside a deleted navigation is the source's own act, so it keeps the short-circuit its
// value spells: a `?.` above the store decides whether the delete happens at all, and its guard takes
// the whole operator, deleting through the stored value in its alternate - around the operand alone
// it would hand `delete` a conditional, which deletes nothing. Without a write the `window` probe's
// guard takes the operator the same way, and the hops above the probe fold.
let deleted, statik, claimless, stacked, alias2, kept, below;
const alias = globalThis;

// no write: on a bare root and on an alias one alike
export const deletedBare = delete globalThis.window?.self?.Promise.noSuchStatic;
export const deletedAlias = delete alias.window?.self?.Promise.noSuchStatic;
// ... and on a proven call root, which stays in the guard's test
export const deletedCallRoot = delete (() => globalThis)().window?.self.noSuchStatic;

// a write AROUND the navigation whose value the probe reaches: the `?.` above the store decides
// whether the delete HAPPENS, so the whole operator rides that guard's alternate - off-window the
// store takes `undefined` and nothing is deleted
export const deletedSlot = delete (deleted = globalThis.window?.self)?.Promise.noSuchStatic;
// ... whatever constructor the tail reads after the store, or none at all
export const deletedStatic = delete (statik = globalThis.window?.self)?.Number.MAX_SAFE_INTEGER;
export const deletedClaimless = delete (claimless = globalThis.window?.self).noSuchStatic;
// ... and the sequence-rooted store keeps its short-circuit like every other
export const deletedSequenceRoot = delete (alias2 = globalThis, kept = alias2.window?.self)?.Promise.noSuchStatic;
// a store of the bare ROOT hands on the very surface the run navigates, so the hops over it fold
// like any other - the store is not what the delete reads
export const deletedBelowRoot = delete (below = globalThis).window?.self.noSuchStatic;
// ... and a probe read off a BACKED hop is the environment read too, so the `?.` over it keeps the
// branch and the store takes the void the source stores there
export const deletedStacked = delete (stacked = globalThis.self?.window?.self).noSuchStatic;

export { deleted, statik, claimless, stacked, alias2, kept, below };
