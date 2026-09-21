import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest;
console.log('se');
var _unused;
({
  Array: _unused,
  ...rest
} = _globalThis);
from = _Array$from;