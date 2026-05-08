import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// `const from = Array.from` aliases the static; receiver of `from(...)` must still narrow to Array.
// `at` is the load-bearing method here because both Array-specific and generic entries exist;
// without alias-chain narrowing the generic instance polyfill would win.
const from = _Array$from;
const arr = from('hi');
_atMaybeArray(arr).call(arr, -1);
_findLastMaybeArray(arr).call(arr, x => x);
_flatMaybeArray(arr).call(arr);