import _Array$from from "@core-js/pure/actual/array/from";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, mapped, others;
var _unused;
({
  Array: _unused,
  mapped = _flatMapMaybeArray(_ref = [10]).call(_ref, String),
  ...others
} = _globalThis);
from = _Array$from;
from([11]);
mapped;