import _at from "@core-js/pure/actual/instance/at";
var _ref;
// An external callback receives the source array and can replace an element.
const scanned = [[1], [2]];
scanned.forEach(f);
export const viaSafeCall = _at(_ref = scanned[0]).call(_ref, 1);