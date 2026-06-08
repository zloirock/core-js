// a const-alias of a proxy global (`const g = globalThis`) must narrow a chained instance method the
// same as the bare global: `g.Array.from(...)` returns an Array, so `.at(0)` resolves the Array-specific
// `_atMaybeArray` helper, not the generic `_at`. the path-based isGlobalProxy delegates to the node-based
// resolver, which follows the const-alias (and a post-rewrite `_globalThis` alias via its polyfill hint)
const g = globalThis;
export const r = g.Array.from([1, 2, 3]).at(0);
