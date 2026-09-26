import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _unused, _unused2;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, inner, outer;
_ref = _globalThis, _ref2 = _ref["Array"], from = _Array$from, {
  from: _unused,
  ...inner
} = _ref2, _ref2, {
  Array: _unused2,
  ...outer
} = _ref, _ref;