// multi-decl with flattened nested-proxy + sibling MemberExpression on the same receiver:
// `globalThis.Map` resolves to a polyfillable global member - the outer MemberExpression
// transform replaces the whole `globalThis.Map` range. text-substituting `globalThis` ->
// `_globalThis` inside the preserved declarator would land `_globalThis.Map` content INSIDE
// the outer's `_Map` range during compose, producing garbage `__Map`. skip the inner
// substitution when the enclosing MemberExpression itself resolves to a polyfillable member
const { Array: { from } } = globalThis, y = globalThis.Map;
export { from, y };
