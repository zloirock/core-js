import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Both stores preserve their values while the optional static retains its claim.
export const effects = [];
let held;
let other;
export const r = _atMaybeArray(_ref = (held = (other = _globalThis).Array, _Array$from)([1, 2])).call(_ref, -1);