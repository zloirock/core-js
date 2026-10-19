import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// computed-key identifier alias wrapped in a TS cast: `arr[(k) as any]` where `k = 'at'`
// should still dispatch `.at` to the array instance polyfill
const arr = [1, 2, 3];
const k = 'at';
// @ts-expect-error a key read through a cast is the shape under test
_atMaybeArray(arr).call(arr, 0);