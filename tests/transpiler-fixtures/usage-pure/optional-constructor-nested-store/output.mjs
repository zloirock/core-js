import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
var _ref;
// The optional static retains its polyfill through a constructor carrier.
// A continuing instance read must not leave the static native.
export const effects = [];
let held;
let other;
export const r = _atMaybeArray(_ref = (held = other = (_pushMaybeArray(effects).call(effects, "prefix"), Array), _Array$from)([1, 2])).call(_ref, -1);