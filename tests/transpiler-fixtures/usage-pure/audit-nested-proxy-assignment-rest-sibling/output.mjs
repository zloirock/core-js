import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
var _ref, _unused, _unused2;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest, fromEntries, inner;
({} = _globalThis), _globalThis.Array, from = _Array$from, {
  Array: _unused,
  ...rest
} = _globalThis;
({
  Object: _ref
} = _globalThis), fromEntries = _Object$fromEntries, {
  fromEntries: _unused2,
  ...inner
} = _ref;