import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// conditional where the extends side is unconstrained (`Array` without args).
// `Array<X>` is assignable to `Array` (= `Array<any>`) for any X, so the
// conditional fires its true-branch the same way TS evaluates it
// @ts-expect-error a generic named without its type arguments is the shape under test
type Foo<T> = T extends Array ? string[] : number;
declare function probe<T>(): Foo<T>;
const r = probe<Array<number>>();
_atMaybeArray(r).call(r, 0);