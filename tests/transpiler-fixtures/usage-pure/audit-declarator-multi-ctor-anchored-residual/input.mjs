// a MULTI-ctor declarator whose residual leaves (`Set.union`, `Map.customZ`) must read off the
// pure CONSTRUCTOR binding (`{ union } = _Set`), not the native proxy (which throws off-engine and
// reads undefined); poly leaves still extract via their own imports. re-anchoring fires only in
// the CLEAN case (every prop consumed-or-anchored, SE-free init, a CONSUMED sibling); else native
const { Array: { from }, Set: { union } } = globalThis;
const { Object: { fromEntries }, Map: { groupBy, customZ } } = globalThis;
// all-anchored, no consuming sibling: stays native (bail)
const { Set: { intersection }, WeakSet: { customW } } = globalThis;
export const out = [from, union, fromEntries, groupBy, customZ, intersection, customW];
