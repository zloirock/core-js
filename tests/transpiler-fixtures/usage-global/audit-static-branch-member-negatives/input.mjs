// negatives of the branching-static member enumeration: a SHADOWED branch is a local binding,
// not a global (only the Object branch injects); TYPED local receivers resolve no static branch
// (the type-narrowed instance primary stays the only dispatch); an SE-prefixed branch still
// classifies through its tail (usage-global never rewrites, the effect stays in source)
export function shadowed(Map) {
  return (globalThis.cond ? Map : Object).groupBy;
}
const a1 = [1];
const a2 = [2];
export const typedLocals = (globalThis.cond ? a1 : a2).at(-1);
function eff(x) { return x; }
export const seBranch = (globalThis.cond ? (eff(1), Reflect) : Object).ownKeys;
// a DOMINATING reassignment kills the branching init before the use - the init value never
// reaches the member, so following the alias would inject dead deps; the indirection
// resolver bails (positive indirection forms live in audit-branch-value-indirection)
let dominated = globalThis.cond ? Promise : Map;
dominated = {};
export const viaDominatedAlias = dominated.any;
// an inner shadow is a fresh binding - the outer branching alias must not leak through it
const shadowedAlias = globalThis.cond ? Promise : Map;
export function innerShadow(arg) {
  const shadowedAlias = arg;
  return shadowedAlias.race;
}
