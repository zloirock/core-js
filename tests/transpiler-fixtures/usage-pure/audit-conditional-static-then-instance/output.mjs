import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// destructure-from-Array `const { from } = Array` post-rewrite (or unrewritten on
// unplugin), then call `from('hi')` and chain `.at(-1)` on the result. Pass 19+
// staticPairFromDestructure / staticPairFromPolyfillEntry feeds resolver to narrow
// `arr` -> string|Array (Array.from return type). `.at(-1)` should dispatch the
// Array-narrowed instance entry. distinct second declaration uses `.findLast` to
// show alias-chain narrowing applies per-method, not just `.at`
const from = _Array$from;
const arr = from('hello');
const last = _atMaybeArray(arr).call(arr, -1);
const of2 = _Array$from;
const arr2 = of2([1, 2, 3]);
const odd = _findLastMaybeArray(arr2).call(arr2, x => x % 2);
export { last, odd };