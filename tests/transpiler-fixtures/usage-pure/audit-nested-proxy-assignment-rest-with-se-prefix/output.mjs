import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _unused;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest;
_ref = (console.log('se'), _globalThis), _ref2 = _ref.Array, from = _Array$from, _ref2, {
  Array: _unused,
  ...rest
} = _ref, _ref;