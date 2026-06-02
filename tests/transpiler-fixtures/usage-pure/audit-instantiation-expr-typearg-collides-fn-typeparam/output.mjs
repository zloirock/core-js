import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a TS 4.7 instantiation expression `typeof fn<X, T>` whose explicit type-arg `T` collides with the
// function's own type-param name resolves in caller scope, not recaptured: `r` is `U := T_caller =
// number[]`, so `.at` injects the array variant. the capture bug would resolve `r` to string
type X = string;
type T = number[];
declare function fn<T, U>(): U;
declare const r: ReturnType<typeof fn<X, T>>;
_atMaybeArray(r).call(r, 0);