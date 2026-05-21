import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `pick<K extends keyof Items>(k: K): Items[K]` called with a literal arg. K is bound
// at the call site via `buildTypeParamMap` (typeParamMap holds the inferred constraint
// type; the literal AST lives on the side-recorded argPath). resolveIndexedAccessSubst
// previously only handled the `T[k]` root-is-typeparam shape - for `NamedType[K]` it
// fell through to plain resolveTypeAnnotation, and `isKeyofTargeting` then failed
// because K is out of scope at the call site. the arg-literal substitution rewrites
// the indexNode to `Items['a']` so the standard dispatcher narrows to `string[]`
type Items = { a: string[]; b: string[] };
declare function pick<K extends keyof Items>(k: K): Items[K];
_atMaybeArray(_ref = pick('a')).call(_ref, 0);