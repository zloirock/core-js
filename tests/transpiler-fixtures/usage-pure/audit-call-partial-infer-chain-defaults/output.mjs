import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `<T, U = T, V = U>(t: T): V` - chain of defaults: V = U, U = T. partial-infer fill
// populates U from default(T-ref) and V from default(U-ref); downstream substitution
// walks V -> U-ref -> T-ref -> inferred arg annotation. without the fill, V would resolve
// to typeParam scope-lookup that loses T inference
declare function chain<T, U = T, V = U>(t: T): V;
declare const v: number[];
const x = chain(v);
export const r = _atMaybeArray(x).call(x, 0);