import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Replacing a constructor slot with an array changes the receiver to an instance.
// The later at call needs only the array variant, never the string variant.
const slot = [_globalThis.Array];
slot[0] = [8];
export const value = _atMaybeArray(_ref = slot[0]).call(_ref, 0);