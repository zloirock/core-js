// a MULTI-ctor declarator whose residual leaves (`Set.customQ`, `Map.customZ`) must read off the
// pure CONSTRUCTOR binding (`{ customQ } = _Set`), not the native proxy (which throws off-engine and
// reads undefined); poly leaves still extract via their own imports. re-anchoring fires only in
// the CLEAN case (every prop consumed-or-anchored, SE-free init, a CONSUMED sibling); else native
// the residual keys here are ones NEITHER surface carries: a key core-js spells as a PROTOTYPE
// entry of that constructor (`Set.union`) is handed out as a static by the pure binding and by
// nothing else, so such a leaf declines the anchor and would measure that rule instead of this one
const { Array: { from }, Set: { customQ } } = globalThis;
const { Object: { fromEntries }, Map: { groupBy, customZ } } = globalThis;
// all-anchored, no consuming sibling: stays native (bail)
const { Set: { customR }, WeakSet: { customW } } = globalThis;
export const out = [from, customQ, fromEntries, groupBy, customZ, customR, customW];
