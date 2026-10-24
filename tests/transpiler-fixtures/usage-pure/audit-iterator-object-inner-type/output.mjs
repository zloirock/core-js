import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// for-of on `IteratorObject<number[]>` must expose the inner element type
// `number[]` for `arr`, so `arr.at(0)` dispatches to the array-specific polyfill
declare const it: IteratorObject<number[]>;
for (const arr of it) _atMaybeArray(arr).call(arr, 0);