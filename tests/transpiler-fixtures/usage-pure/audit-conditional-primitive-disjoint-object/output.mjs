import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// non-primitive check vs primitive extend: `T extends string ? Promise : T` with T = number[].
// per TS structural subtyping an object type (Array, Map, Promise, ...) can never extend a
// primitive (string, number, never, ...), so the conditional must deterministically pick the
// false branch -> T = number[] -> narrow Array dispatch, not a heterogeneous fold to Object
type Wrap<T> = T extends string ? Promise<number> : T;
declare const r: Wrap<number[]>;
_atMaybeArray(r).call(r, 0);
_includesMaybeArray(r).call(r, 1);