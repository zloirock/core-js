import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// receiver type resolution must follow alias chain through polyfilled bindings.
// `const from = Array.from` (or destructured `const { from } = Array`) creates an alias
// to `Array.from`; resolver must recognise that the alias's call returns Array so that
// `arr.at` narrows to `_atMaybeArray` instead of falling to generic `_at`.
//
// `findLast` / `flat` "appear" to narrow even without proper resolution because they
// only exist on Array.prototype - polyfill registry has no `instance/find-last` /
// `instance/flat` generic variant, so the array-specific entry is the default. `at`
// exists on Array, TypedArray, and String, so registry HAS generic `instance/at` -
// without explicit array narrowing, resolver picks generic. lock array-specific narrow
// for all three methods through the alias chain
const from = _Array$from;
const arr = from('hi');
_atMaybeArray(arr).call(arr, -1);
_findLastMaybeArray(arr).call(arr, x => x);
_flatMaybeArray(arr).call(arr);