import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// User imports the pure `array/from` polyfill under a custom name; the plugin must dedup against it.
// The user's binding must seed alias-chain narrowing so `arr.at` picks the array-specific polyfill.
import MyArrayFrom from '@core-js/pure/actual/array/from';
const arr = MyArrayFrom('hi');
_atMaybeArray(arr).call(arr, -1);
_findLastMaybeArray(arr).call(arr, x => x);
_flatMaybeArray(arr).call(arr);