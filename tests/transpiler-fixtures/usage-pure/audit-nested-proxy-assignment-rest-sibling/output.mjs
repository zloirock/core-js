import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
var _ref, _ref2, _ref3, _unused2;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest, fromEntries, inner;
var _unused;
({
  Array: _unused,
  ...rest
} = _globalThis);
from = _Array$from;
_ref = {
  Object: _ref2
} = _globalThis, _ref3 = _ref2, {} = _ref3, fromEntries = _Object$fromEntries, {
  fromEntries: _unused2,
  ...inner
} = _ref3, _ref3, _ref;