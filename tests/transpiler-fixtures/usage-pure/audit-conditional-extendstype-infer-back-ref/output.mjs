import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// inferred X declared in extendsType referenced backwards within same extendsType:
// outer X (if present in subst) must NOT capture the locally-bound X
type Wrap<U> = U extends [infer X, X] ? X[] : never;
declare const v: Wrap<[number, number]>;
_atMaybeArray(v).call(v, 0);