import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// The optional static retains its polyfill through a constructor carrier.
// A continuing instance read must not leave the static native.
export const effects = [];
let held;
let other;
export const r = _atMaybeArray(_ref = (held = Array, _Array$from)([1, 2])).call(_ref, -1);