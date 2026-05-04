// user imports under exactly the shorthand the plugin would itself emit (`_Array$from`).
// `registerUserPureImport` must store {source, hint, entry} keyed by that name; later
// `getBindingInfo(_Array$from).entry` must return `array/from` so the call's return type
// narrows downstream methods. distinct methods cover three resolver branches:
//   - `concat` exists on String/Array - generic vs array narrowing is observable
//   - `flatMap` is Array-only on prototype, no generic registry variant
//   - `findIndex` is Array-only, distinct from findLast/flat already in sibling fixture
import _Array$from from '@core-js/pure/actual/array/from';
const xs = _Array$from('abc');
xs.concat([1]);
xs.flatMap(x => [x]);
xs.findIndex(x => x === 'a');
