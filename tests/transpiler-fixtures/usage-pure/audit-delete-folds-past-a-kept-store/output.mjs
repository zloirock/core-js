import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
// a `delete` reads nothing over its navigation, so the hops fold with their guards and the deleted
// slot is reached off the ponyfill. what does NOT fold with them is a user WRITE inside that
// navigation: the store is the source's own act, so it keeps whatever short-circuit its value
// spells. a guard rendered over the navigation instead would hand `delete` a conditional, which
// deletes nothing at all.
let deleted, statik, claimless, stacked, alias2, kept, below;
const alias = _globalThis;

// no write: the whole navigation folds, on a bare root and on an alias one alike
export const deletedBare = delete _Promise.noSuchStatic;
export const deletedAlias = delete _Promise.noSuchStatic;
// ... and on a proven call root, which drops with the fold
export const deletedCallRoot = delete _self.noSuchStatic;

// a write AROUND the navigation: the ctor folds into the deleted member's spelling, the store keeps
// the guard its own value spells
export const deletedSlot = delete (deleted = null == _globalThis.window ? void 0 : _self, _Promise).noSuchStatic;
// ... whatever claim leads the channel above it, or none at all
export const deletedStatic = delete (statik = null == _globalThis.window ? void 0 : _self)?.Number.MAX_SAFE_INTEGER;
export const deletedClaimless = delete (claimless = null == _globalThis.window ? void 0 : _self).noSuchStatic;
// the deleted member is never read, so the claim on it renders NOTHING - and a claim that renders
// nothing subsumes no receiver: the ctor below it is read on the way there and keeps its own claim
export const deletedProto = delete _Map.prototype.noSuchMethod;
export const deletedProtoNav = delete _Map.prototype.noSuchMethod;
// ... and the sequence-rooted store keeps its short-circuit like every other
export const deletedSequenceRoot = delete (alias2 = _globalThis, kept = null == alias2.window ? void 0 : _self, _Promise).noSuchStatic;
// a store of the bare ROOT hands on the very surface the run navigates, so the hops over it fold
// like any other - the store is not what the delete reads
export const deletedBelowRoot = delete (below = _globalThis, _globalThis).noSuchStatic;
// ... and the same over a stacked unresolvable prefix
export const deletedStacked = delete (stacked = _self).noSuchStatic;
export { deleted, statik, claimless, stacked, alias2, kept, below };