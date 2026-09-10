// a `delete` reads nothing over its navigation, so the hops fold with their guards and the deleted
// slot is reached off the ponyfill. what does NOT fold with them is a user WRITE inside that
// navigation: the store is the source's own act, so it keeps whatever short-circuit its value
// spells. the guard that keeps it goes over the navigation with the tail above it re-hung WHOLE
// behind one `?.` of its own - absorbing an intermediate hop into the alternate reads it there
// non-optionally; a guard around the whole OPERAND would hand `delete` a conditional instead,
// which deletes nothing at all.
let deleted, statik, claimless, stacked, alias2, kept, below;
const alias = globalThis;

// no write: the whole navigation folds, on a bare root and on an alias one alike
export const deletedBare = delete globalThis.window?.self?.Promise.noSuchStatic;
export const deletedAlias = delete alias.window?.self?.Promise.noSuchStatic;
// ... and on a proven call root, which drops with the fold
export const deletedCallRoot = delete (() => globalThis)().window?.self.noSuchStatic;

// a write AROUND the navigation whose value the probe reaches: the `?.` above the store decides
// whether the delete HAPPENS, so the ctor rides that guard's alternate and the deleted member hangs
// behind a `?.` of its own - off-window the store takes `undefined` and nothing is deleted
export const deletedSlot = delete (deleted = globalThis.window?.self)?.Promise.noSuchStatic;
// ... whatever claim leads the channel above it, or none at all
export const deletedStatic = delete (statik = globalThis.window?.self)?.Number.MAX_SAFE_INTEGER;
export const deletedClaimless = delete (claimless = globalThis.window?.self).noSuchStatic;
// the deleted member is never read, so the claim on it renders NOTHING - and a claim that renders
// nothing subsumes no receiver: the ctor below it is read on the way there and keeps its own claim
export const deletedProto = delete globalThis.Map.prototype.noSuchMethod;
export const deletedProtoNav = delete globalThis.window?.self?.Map.prototype.noSuchMethod;
// ... and the sequence-rooted store keeps its short-circuit like every other
export const deletedSequenceRoot = delete (alias2 = globalThis, kept = alias2.window?.self)?.Promise.noSuchStatic;
// a store of the bare ROOT hands on the very surface the run navigates, so the hops over it fold
// like any other - the store is not what the delete reads
export const deletedBelowRoot = delete (below = globalThis).window?.self.noSuchStatic;
// ... and a probe read off a BACKED hop is the environment read too, so the `?.` over it keeps the
// branch and the store takes the void the source stores there
export const deletedStacked = delete (stacked = globalThis.self?.window?.self).noSuchStatic;

export { deleted, statik, claimless, stacked, alias2, kept, below };
