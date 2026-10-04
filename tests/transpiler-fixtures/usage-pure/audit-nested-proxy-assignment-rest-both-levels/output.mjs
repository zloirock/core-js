import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _unused, _unused2;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, inner, outer;
({} = _globalThis), _ref = _globalThis.Array, from = _Array$from, {
  from: _unused,
  ...inner
} = _ref, {
  Array: _unused2,
  ...outer
} = _globalThis;