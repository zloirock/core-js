import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// non-distributive conditional with union check: when union doesn't fully assign to the
// extends side, the false-branch fires globally. `Wrap<string | number>` resolves to T[]
// (Array of string|number). dispatch on `w.at` narrows to array
type Wrap<T> = T extends string ? T : T[];
declare const w: Wrap<string | number>;
_atMaybeArray(w) ? _atMaybeArray(w).call(w, 0) : w;