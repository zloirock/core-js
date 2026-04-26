import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
const from = _Array$from;
// multi-decl with flattened nested-proxy + sibling MemberExpression on the same receiver:
// `globalThis.Map` resolves to a polyfillable global member - the outer MemberExpression
// transform replaces the whole `globalThis.Map` range. text-substituting `globalThis` ->
// `_globalThis` inside the preserved declarator would land `_globalThis.Map` content INSIDE
// the outer's `_Map` range during compose, producing garbage `__Map`. skip the inner
// substitution when the enclosing MemberExpression itself resolves to a polyfillable member
const y = _Map;
export { from, y };