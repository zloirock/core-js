import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `T[K]` where `K` is a literal union `'a' | 'b'`. TSIndexedAccessType folds each
// union branch as a single-literal indexed access; foldUnionTypes picks the common
// outer type (Array) across the two member annotations
type S = {
  a: string[];
  b: number[];
};
declare const v: S['a' | 'b'];
_atMaybeArray(v).call(v, 0);