import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// alias of `Array` declared with `let` is reassignable, so `from`'s receiver shape can't
// be statically narrowed to Array. instance methods on the result (`findLast` / `at` /
// `includes`) must fall back to generic instance polyfills, not array-narrowed variants
let A = Array;
const from = _Array$from;
const arr = from('hi');
_findLastMaybeArray(arr).call(arr, c => c);
_atMaybeArray(arr).call(arr, -1);
_includesMaybeArray(arr).call(arr, 'h');