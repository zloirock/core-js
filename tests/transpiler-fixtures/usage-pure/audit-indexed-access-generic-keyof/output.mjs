import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `pick<K extends keyof Items>(k: K): Items[K]` called with a literal arg. the `NamedType[K]`
// shape (vs the root-is-typeparam `T[k]`) needs the call-arg literal substituted for K, since
// K is out of scope at the call site - otherwise the keyof targeting fails and the narrow drops.
// the arg-literal substitution rewrites the index to `Items['a']` so the dispatcher narrows to `string[]`.
type Items = {
  a: string[];
  b: string[];
};
declare function pick<K extends keyof Items>(k: K): Items[K];
_atMaybeArray(_ref = pick('a')).call(_ref, 0);