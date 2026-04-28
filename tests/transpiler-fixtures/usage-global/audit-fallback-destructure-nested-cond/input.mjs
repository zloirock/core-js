// nested fallback receiver: `cond1 ? (cond2 ? Array : Iterator) : Set`. enumeration
// must recurse into branches that are themselves fallback shapes - without recursion the
// inner conditional resolves as a single consequent meta and Iterator's polyfill is
// silently dropped. fix: `flattenFallbackBranches` recursive walk, leaf branches resolve
// via `buildDestructuringInitMeta`
const { from } = cond1 ? (cond2 ? Array : Iterator) : Set;
from([1, 2]);
