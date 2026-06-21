// non-primitive check vs primitive extend: `T extends string ? Promise : T` with T = number[].
// per TS structural subtyping an object type (Array, Map, Promise, ...) can never extend a
// primitive (string, number, never, ...), so the conditional must deterministically pick the
// false branch -> T = number[] -> narrow Array dispatch, not a heterogeneous fold to Object
type Wrap<T> = T extends string ? Promise<number> : T;
declare const r: Wrap<number[]>;
r.at(0);
r.includes(1);
