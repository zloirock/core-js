import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _self from "@core-js/pure/actual/self";
// A user write inside a deleted navigation is the source's own act, so it keeps the short-circuit its
// value spells: a `?.` above the store decides whether the delete happens at all, and its guard takes
// the whole operator, deleting through the stored value in its alternate - around the operand alone
// it would hand `delete` a conditional, which deletes nothing. Without a write the `window` probe's
// guard takes the operator the same way, and the hops above the probe fold.
let deleted, statik, claimless, stacked, alias2, kept, below;
const alias = _globalThis;

// no write: on a bare root and on an alias one alike
export const deletedBare = null == _globalThis.window ? true : delete _Promise.noSuchStatic;
export const deletedAlias = null == alias.window ? true : delete _Promise.noSuchStatic;
// ... and on a proven call root, which stays in the guard's test
export const deletedCallRoot = null == (() => _globalThis)().window ? true : delete _self.noSuchStatic;

// a write AROUND the navigation whose value the probe reaches: the `?.` above the store decides
// whether the delete HAPPENS, so the whole operator rides that guard's alternate - off-window the
// store takes `undefined` and nothing is deleted
export const deletedSlot = null == (deleted = null == _globalThis.window ? void 0 : _self) ? true : delete _Promise.noSuchStatic;
// ... whatever constructor the tail reads after the store, or none at all
export const deletedStatic = delete (statik = null == _globalThis.window ? void 0 : _self)?.Number.MAX_SAFE_INTEGER;
export const deletedClaimless = delete (claimless = null == _globalThis.window ? void 0 : _self).noSuchStatic;
// ... and the sequence-rooted store keeps its short-circuit like every other
export const deletedSequenceRoot = null == (alias2 = _globalThis, kept = null == alias2.window ? void 0 : _self) ? true : delete _Promise.noSuchStatic;
// a store of the bare ROOT hands on the very surface the run navigates, so the hops over it fold
// like any other - the store is not what the delete reads
export const deletedBelowRoot = null == (below = _globalThis).window ? true : delete _self.noSuchStatic;
// ... and a probe read off a BACKED hop is the environment read too, so the `?.` over it keeps the
// branch and the store takes the void the source stores there
export const deletedStacked = delete (stacked = null == _self.window ? void 0 : _self).noSuchStatic;
export { deleted, statik, claimless, stacked, alias2, kept, below };