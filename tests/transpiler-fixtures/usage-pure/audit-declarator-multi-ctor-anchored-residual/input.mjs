// a MULTI-ctor declarator: a missing-able ctor's residual leaves (`Set.union`, `Map.customZ`) read off the
// pure CONSTRUCTOR binding (`{ union } = _Set`), generalizing the single-ctor anchor per prop. reading them
// off the native proxy (`_globalThis.Set.union`) throws off-engine and reads native undefined. poly leaves
// still extract via their dedicated imports. re-anchoring fires only in the CLEAN case (every prop consumed-
// or-anchored, SE-free init, AND a CONSUMED sibling - babel's flatten dispatch is usage-driven, so an all-
// anchored pattern with no poly/alias leaf would not trigger it). a verbatim sibling / SE / disabled / rest /
// all-anchored form stays on the native residual
const { Array: { from }, Set: { union } } = globalThis;
const { Object: { fromEntries }, Map: { groupBy, customZ } } = globalThis;
// all-anchored, no consuming sibling: stays native (bail)
const { Set: { intersection }, WeakSet: { customW } } = globalThis;
export const out = [from, union, fromEntries, groupBy, customZ, intersection, customW];
