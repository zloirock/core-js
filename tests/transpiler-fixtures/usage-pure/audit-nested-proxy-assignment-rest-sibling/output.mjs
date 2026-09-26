import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
var _ref, _ref2, _ref3, _ref4, _ref5, _unused, _unused2;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest, fromEntries, inner;
_ref = _globalThis, _ref2 = _ref["Array"], from = _Array$from, _ref2, {
  Array: _unused,
  ...rest
} = _ref, _ref;
_ref3 = {
  Object: _ref4
} = _globalThis, _ref5 = _ref4, {} = _ref5, fromEntries = _Object$fromEntries, {
  fromEntries: _unused2,
  ...inner
} = _ref5, _ref5, _ref3;