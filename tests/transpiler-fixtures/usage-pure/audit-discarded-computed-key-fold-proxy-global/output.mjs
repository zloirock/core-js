import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// A computed method key folds through a concat or template while its effects stay ordered.
// A discarded proxy-global leaves no pending rewrite against the removed key.
// The receiver is evaluated before that prefix, even when the proxy read later folds away.
// Distinct methods keep the instance, static and effectful rows observable.
const arr = [[1]];
let n = 0;
const binaryFold = (arr, _flatMaybeArray(arr).call(arr));
const templateFold = (arr, _flatMapMaybeArray(arr).call(arr, x => [x]));
const staticFold = _Array$from([1, 2]);
const seFold = (arr, n++, _includesMaybeArray(arr).call(arr, [1]));
export { binaryFold, templateFold, staticFold, seFold, n };