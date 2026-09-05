import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
// user-imported `_Array$from` (matching the plugin's shorthand) must register as an
// Array.from alias, so the call's return narrows to Array. distinct downstream methods
// cover generic-vs-array (concat) and Array-only (flatMap, findIndex) dispatch
import _Array$from from '@core-js/pure/actual/array/from';
const xs = _Array$from('abc');
_concatMaybeArray(xs).call(xs, [1]);
_flatMapMaybeArray(xs).call(xs, x => [x]);
_findIndexMaybeArray(xs).call(xs, x => x === 'a');