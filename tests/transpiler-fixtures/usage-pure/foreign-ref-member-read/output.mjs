import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A temporary name from another transform does not own a polyfill claim.
var _ref;
_ref = [3, 7];
export const value = _atMaybeArray(_ref).call(_ref, -1);