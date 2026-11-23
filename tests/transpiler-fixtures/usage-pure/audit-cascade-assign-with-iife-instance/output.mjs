import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest;
console.log(_valuesMaybeArray(_ref = []).call(_ref)), {
  Array: {},
  ...(_ref2 = [from = _Array$from])[0]
} = _globalThis, rest = _ref2[0];
export { from, rest };