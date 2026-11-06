import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Wrapping the callee must preserve its static claim through the stored constructor.
let held;
export const result = _atMaybeArray(_ref = (held = Array, _Array$from)([1, 2])).call(_ref, -1);