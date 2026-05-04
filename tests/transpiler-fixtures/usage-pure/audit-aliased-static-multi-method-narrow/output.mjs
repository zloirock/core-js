import _Array$of from "@core-js/pure/actual/array/of";
import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
// multiple distinct aliased statics, each producing a distinct constructor narrow.
// `const of = Array.of` -> arr1 narrow, `const from = Array.from` -> arr2 narrow.
// each call of the aliased static MUST narrow to its specific Array via
// staticPairFromPolyfillEntry reading injector entry. distinct downstream methods on
// each receiver lock that entry-path read isn't conflated across two registered aliases
const of = _Array$of;
const from = _Array$from;
const arr1 = of(1, 2, 3);
const arr2 = from('hi');
_atMaybeArray(arr1).call(arr1, -1);
_findLastMaybeArray(arr2).call(arr2, x => x);
_flatMaybeArray(arr1).call(arr1);
_flatMapMaybeArray(arr2).call(arr2, x => x);