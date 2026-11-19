import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// a registry-known non-mutating method keeps the per-element precision
const scanned = [[1], [2]];
export const viaSafeCall = _atMaybeArray(_ref = scanned[0]).call(_ref, 1);