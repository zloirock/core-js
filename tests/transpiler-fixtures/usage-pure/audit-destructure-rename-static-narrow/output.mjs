import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Destructure with rename: `const { from: customFrom } = Array` then call must still
// narrow the result through the `staticPairFromDestructure` extractor's renamed-property
// branch. Distinct methods (at, findLast) confirm narrowing applies at each call site.
const customFrom = _Array$from;
const arr = customFrom('xy');
_atMaybeArray(arr).call(arr, 0);
_findLastMaybeArray(arr).call(arr, x => x);