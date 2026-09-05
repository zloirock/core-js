// a nested pattern whose init the source COMPUTES - a call, a `new`, a member off a user object -
// extracts through the root read once, exactly where the source reads it: the declarator dies whole
// with the claim, so the dispatch's `mk().data` is the source's one evaluation. a slot default folds
// through the guard, a leaf default keeps its own, and an export or a sibling declarator changes nothing
const { data: { at: viaCall } } = mk();
const { data: { includes: viaNew } } = new Box();
const { data: { findLast: viaMember } } = holder.inner;
const { data: { toSorted: viaSlotDefault } = fallback } = mk();
const { data: { with: viaLeafDefault = null } } = mk();
const { data: { toReversed: besideSibling } } = mk(), tail = 1;
export const { data: { lastIndexOf: exported } } = mk();
export { viaCall, viaNew, viaMember, viaSlotDefault, viaLeafDefault, besideSibling, tail };
