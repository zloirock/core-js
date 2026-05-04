import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// user already imports the pure `array/from` polyfill under a custom local name. plugin
// must dedup against that import AND use the user's binding as the alias source for
// receiver-type narrowing through `getPolyfillBindingEntry` -> `staticPairFromPolyfillEntry`.
// each instance method exercises a distinct alias-aware narrowing path:
//   - `at` has both Array-specific and generic instance entries (registry has `instance/at`),
//     so it is the canonical proof that array-narrowing fires (otherwise generic `_at` wins)
//   - `findLast` only exists on Array.prototype (no generic instance variant), it would
//     resolve correctly even without narrowing - included to verify NO regression on a
//     method that uses a different resolver branch
//   - `flat` mirrors findLast structurally but lives in a different definition slot - guards
//     against accidental coupling to a single registry shape
import MyArrayFrom from '@core-js/pure/actual/array/from';
const arr = MyArrayFrom('hi');
_atMaybeArray(arr).call(arr, -1);
_findLastMaybeArray(arr).call(arr, x => x);
_flatMaybeArray(arr).call(arr);