// the ASSIGNMENT-cascade twin of the declarator anchored-residual: a multi-ctor destructure on an
// AssignmentExpression host (`({ Array: { from }, Set: { union } } = globalThis)`) whose residual
// leaves off a MISSING-ABLE ctor (`Set.union`, `Map.customZ`) must read off the pure CONSTRUCTOR
// binding (`({ union } = _Set)`), not the native proxy (which throws off-engine / reads undefined).
// re-anchoring fires only when a sibling leaf is CONSUMED (SE-free, all-props consumed-or-anchored);
// an all-anchored line with no consumed sibling bails and stays on the substituted global proxy
let from, union, fromEntries, groupBy, customZ, intersection, customW;
({ Array: { from }, Set: { union } } = globalThis);
({ Object: { fromEntries }, Map: { groupBy, customZ } } = globalThis);
({ Set: { intersection }, WeakSet: { customW } } = globalThis);
export const out = [from, union, fromEntries, groupBy, customZ, intersection, customW];
