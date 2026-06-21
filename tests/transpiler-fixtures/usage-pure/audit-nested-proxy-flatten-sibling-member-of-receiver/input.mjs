// multi-decl with flattened nested-proxy + sibling member access on the same receiver:
// `globalThis.Map` is a polyfillable global member, so the member-access transform replaces
// the whole `globalThis.Map` range. text-substituting `globalThis` -> `_globalThis` inside it
// would compose to garbage `__Map`; skip the inner substitution when the access is polyfillable
const { Array: { from } } = globalThis, y = globalThis.Map;
export { from, y };
