import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// generic `Awaited<T>` substitutes BEFORE unwrapping: a type-param bound to Promise<X[]>
// must await through the SUBSTITUTED promise layer (peel-then-subst resolved to the raw
// Promise and dropped the member narrow entirely)
type A<T> = Awaited<T>;
declare const x: A<Promise<string[]>>;
_atMaybeArray(x).call(x, 0);