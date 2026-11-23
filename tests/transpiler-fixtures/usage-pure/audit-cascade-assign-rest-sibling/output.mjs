import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest;
({
  Array: {},
  ...(_ref = [from = _Array$from])[0]
} = _globalThis), rest = _ref[0];
export { from, rest };