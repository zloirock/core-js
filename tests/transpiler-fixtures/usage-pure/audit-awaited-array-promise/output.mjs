import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
// Awaited<Array<Promise<X>>> in TS resolves to the Array (NOT Promise.all-like
// distribution). plugin's unwrapPromise stops at non-Promise outer. probe that
// Awaited keeps Array narrowing on Array<Promise<...>> without unwrapping the
// inner Promise (which would be incorrect TS semantics).
type R = Awaited<Array<Promise<number>>>;
declare const arr: R;
const last = _atMaybeArray(arr).call(arr, -1);
const ix = _findIndexMaybeArray(arr).call(arr, p => true);
export { last, ix };