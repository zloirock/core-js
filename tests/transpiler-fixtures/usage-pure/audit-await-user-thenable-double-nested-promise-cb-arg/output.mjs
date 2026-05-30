import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// User Thenable whose `then` callback first-arg is a DOUBLY-nested `Promise<Promise<string[]>>`.
// TS `Awaited<T>` is a recursive conditional, so `await x` peels BOTH Promise layers:
// Awaited<Promise<Promise<string[]>>> = string[]. So `arr` is string[] and `.at` must emit the
// array-narrow polyfill. A single (one-layer) peel would leave `arr` typed `Promise<string[]>`
// and drop the array narrow.
class Box {
  then(_cb: (v: Promise<Promise<string[]>>) => any): Box {
    return this;
  }
}
declare const b: Box;
const arr = await b;
_atMaybeArray(arr).call(arr, 0);