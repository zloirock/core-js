import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// An initless temporary does not prove a prior destructuring decision.
var _ref;
_ref = [3, 7];
const at = _atMaybeArray(_ref);
export const value = at.call(_ref, -1);