import _at from "@core-js/pure/actual/instance/at";
// a conditional over a NAKED type parameter distributes over a union argument: `Wrap<string | number>`
// is `string | number[]`, not `(string | number)[]`. the distributed arms are two different types and
// no instance helper covers both, so `w.at` dispatches generically instead of an array-specific
// helper that throws on the string arm
type Wrap<T> = T extends string ? T : T[];
declare const w: Wrap<string | number>;
_at(w) ? _at(w).call(w, 0) : w;