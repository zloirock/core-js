import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// User Thenable whose `then` callback first-arg is a `PromiseLike<number[]>` (a Promise
// synonym). Awaited flattens through PromiseLike too: Awaited<PromiseLike<number[]>> =
// number[]. So `arr` is number[] and `.at` must emit the array polyfill. Flat (non-recursive)
// resolution would type `arr` as the PromiseLike and drop the array narrow.
class Box {
  then(_cb: (v: PromiseLike<number[]>) => any): Box {
    return this;
  }
}
declare const b: Box;
const arr = await b;
_atMaybeArray(arr).call(arr, 0);