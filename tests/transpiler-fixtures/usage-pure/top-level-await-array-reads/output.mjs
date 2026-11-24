import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Stable reads after top-level await keep their receiver.
const data = await fetchData();
const arr = [data];
const last = _atMaybeArray(arr).call(arr, -1);
const found = _findLastMaybeArray(arr).call(arr, x => x);
export { last, found };