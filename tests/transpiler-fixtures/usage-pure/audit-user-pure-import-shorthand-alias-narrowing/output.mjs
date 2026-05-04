import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
// user imports under exactly the shorthand the plugin would itself emit (`_Array$from`).
// `registerUserPureImport` must store {source, hint, entry} keyed by that name; later
// `getBindingInfo(_Array$from).entry` must return `array/from` so the call's return type
// narrows downstream methods. distinct methods cover three resolver branches:
//   - `concat` exists on String/Array - generic vs array narrowing is observable
//   - `flatMap` is Array-only on prototype, no generic registry variant
//   - `findIndex` is Array-only, distinct from findLast/flat already in sibling fixture
import _Array$from from '@core-js/pure/actual/array/from';
const xs = _Array$from('abc');
_concatMaybeArray(xs).call(xs, [1]);
_flatMapMaybeArray(xs).call(xs, x => [x]);
_findIndexMaybeArray(xs).call(xs, x => x === 'a');