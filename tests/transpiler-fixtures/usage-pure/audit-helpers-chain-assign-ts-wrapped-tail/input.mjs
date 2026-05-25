// fallback-receiver peel alternates chain-assign + paren+TS wrappers until stable.
// here a chain-assign sits inside a TS as-any cast, then another paren wraps the outer
// chain-assign, then a SE-prefix without observable effects, finally the conditional.
// distinct methods (Array.from, Set.union, Map.groupBy) anchor per-branch dispatch
let r;
export const { from } = (r = (cond ? Array : Iterator) as any);
export const { union } = (r = (0, cond ? Set : WeakSet));
export const { groupBy } = ((r = cond ? Map : WeakMap) as any);
export { r };
