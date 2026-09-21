import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest;
console.log(_valuesMaybeArray(_ref = []).call(_ref));
var _unused;
({
  Array: _unused,
  ...rest
} = _globalThis);
from = _Array$from;
export { from, rest };