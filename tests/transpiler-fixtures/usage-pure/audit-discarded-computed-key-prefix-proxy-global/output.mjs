import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _getIterator from "@core-js/pure/actual/get-iterator";
// A computed method key consumes its sequence prefix without stranding proxy-global rewrites.
// Real key effects run after the receiver and before the method read.
// The initial receiver read stays in that slot even when a proxy-global prefix folds away.
// Distinct methods cover instance, static, iterator and mixed prefixes.
let n = 0;
const arr = [[1]];
const instanceKey = (arr, _includesMaybeArray(arr).call(arr, 1));
const staticKey = _Array$from([1, 2]);
const symbolKey = [..._getIterator(arr)];
const mixedSe = (arr, n++, _atMaybeArray(arr).call(arr, 0));
export { instanceKey, staticKey, symbolKey, mixedSe, n };