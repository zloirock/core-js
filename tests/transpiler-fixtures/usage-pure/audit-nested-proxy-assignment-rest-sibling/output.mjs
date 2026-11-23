import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
var _ref, _ref2, _unused;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest, fromEntries, inner;
({
  Array: {},
  ...(_ref = [from = _Array$from])[0]
} = _globalThis), rest = _ref[0];
({
  Object: _ref2
} = _globalThis);
fromEntries = _Object$fromEntries, {
  fromEntries: _unused,
  ...inner
} = _ref2;