import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `var arr: string[]` declared without init, then assigned: the declared annotation
// narrows the binding to array. Distinct array-instance methods on each line, so each
// emitted polyfill maps to its source call.
var arr: string[];
arr = ['x', 'y', 'z'];
_findLastMaybeArray(arr).call(arr, s => s);
_atMaybeArray(arr).call(arr, 0);
_includesMaybeArray(arr).call(arr, 'y');