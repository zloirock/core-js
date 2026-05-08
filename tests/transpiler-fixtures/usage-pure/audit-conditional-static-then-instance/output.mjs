import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// destructure `const { from } = Array` followed by a call must narrow the call's return
// to Array so the chained `.at(-1)` picks the array-specific instance polyfill. second
// destructure uses `.findLast` to confirm narrowing applies per-method, not just `.at`
const from = _Array$from;
const arr = from('hello');
const last = _atMaybeArray(arr).call(arr, -1);
const of2 = _Array$from;
const arr2 = of2([1, 2, 3]);
const odd = _findLastMaybeArray(arr2).call(arr2, x => x % 2);
export { last, odd };