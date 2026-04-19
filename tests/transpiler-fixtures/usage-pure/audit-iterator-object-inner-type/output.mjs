import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// IteratorObject<number[]> must be in SINGLE_ELEMENT_COLLECTIONS for inner type `number[]`
// to propagate through for-of to `arr`
declare const it: IteratorObject<number[]>;
for (const arr of it) _atMaybeArray(arr).call(arr, 0);