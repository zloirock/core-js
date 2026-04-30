// multi-declarator: flattened `globalThis` proxy destructure plus a sibling whose
// initialiser is an arrow with an EXPRESSION body (not a block) returning an instance
// method call. the sibling's arrow body still needs receiver-rewrite handling for the
// flatten-introduced `_ref` binding
const { Array: { from } } = globalThis, kls = (() => [].values())();
export { from, kls };
