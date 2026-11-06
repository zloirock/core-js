import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `T extends Iterable<infer U> ? U[] : never` extracts the iterable element type and
// produces an array of it. Through the conditional alias, `r` narrows to `number[]` so
// `r.at(0)` rewrites to the array-specific instance polyfill.
type Iter<T> = T extends Iterable<infer U> ? U[] : never;
declare const r: Iter<Set<number>>;
_atMaybeArray(r).call(r, 0);