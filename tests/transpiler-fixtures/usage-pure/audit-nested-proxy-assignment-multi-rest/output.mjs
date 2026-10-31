import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, fromEntries, rest;
var _unused, _unused2;
({
  Array: _unused,
  Object: _unused2,
  ...rest
} = _globalThis);
from = _Array$from;
fromEntries = _Object$fromEntries;