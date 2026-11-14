import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// An earlier static alias call retains its array result.
const from = _Array$from;
export const result = _atMaybeArray(_ref = from(input)).call(_ref, -1);
if (flag) _globalThis.Array = other;