// the ASSIGNMENT-cascade twin of the declarator anchored-residual: a multi-ctor destructure on an
// AssignmentExpression host (`({ Array: { from }, Set: { customQ } } = globalThis)`) whose residual
// leaves off a MISSING-ABLE ctor (`Set.customQ`, `Map.customZ`) must read off the pure CONSTRUCTOR
// binding (`({ customQ } = _Set)`), not the native proxy (which throws off-engine / reads undefined).
// re-anchoring fires only when a sibling leaf is CONSUMED (SE-free, all-props consumed-or-anchored);
// an all-anchored line with no consumed sibling bails and stays on the substituted global proxy
// the residual keys here are ones NEITHER surface carries: a key core-js spells as a PROTOTYPE
// entry of that constructor (`Set.union`) is handed out as a static by the pure binding and by
// nothing else, so such a leaf declines the anchor and would measure that rule instead of this one
let from, customQ, fromEntries, groupBy, customZ, customR, customW;
({ Array: { from }, Set: { customQ } } = globalThis);
({ Object: { fromEntries }, Map: { groupBy, customZ } } = globalThis);
({ Set: { customR }, WeakSet: { customW } } = globalThis);
export const out = [from, customQ, fromEntries, groupBy, customZ, customR, customW];
