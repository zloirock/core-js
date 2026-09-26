import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _unused;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest;
_ref = (console.log(_valuesMaybeArray(_ref2 = []).call(_ref2)), _globalThis), _ref3 = _ref["Array"], from = _Array$from, _ref3, {
  Array: _unused,
  ...rest
} = _ref, _ref;
export { from, rest };