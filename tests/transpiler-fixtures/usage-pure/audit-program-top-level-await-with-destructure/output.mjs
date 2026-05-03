import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Top-level `await` triggers asynchronous module evaluation. The plugin must still
// emit imports at program top + reorder `_ref` after them. Verify polyfilled
// destructure inside async-IIFE-equivalent setting works.
const data = await fetchData();
const arr = [data];
const last = _atMaybeArray(arr).call(arr, -1);
const found = _findLastMaybeArray(arr).call(arr, x => x);
export { last, found };