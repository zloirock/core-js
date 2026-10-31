import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `type Q<T> = typeof identity<T>` is a TS 4.7 instantiation expression in an alias body.
// Call-return resolution must thread `T` into the typeof's instantiation so the result narrows to `number[]`.
declare function identity<U>(x: U): U;
type Q<T> = typeof identity<T>;
declare const f: Q<number[]>;
const arr = f([1, 2, 3]);
const head = _atMaybeArray(arr).call(arr, 0);
export { head };