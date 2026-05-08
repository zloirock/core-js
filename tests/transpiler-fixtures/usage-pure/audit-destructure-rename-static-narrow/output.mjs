import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// destructure with rename `const { from: customFrom } = Array` must still narrow the
// call's return through the renamed local. distinct methods (at, findLast) confirm the
// narrowing applies at each call site, not just the first
const customFrom = _Array$from;
const arr = customFrom('xy');
_atMaybeArray(arr).call(arr, 0);
_findLastMaybeArray(arr).call(arr, x => x);