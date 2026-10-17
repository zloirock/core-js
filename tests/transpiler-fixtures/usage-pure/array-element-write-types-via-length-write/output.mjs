import _at from "@core-js/pure/actual/instance/at";
var _ref;
// a `length` write truncates arbitrary indices - a member WRITE host bails
const trimmed = [[1], [2]];
trimmed.length = 1;
export const viaLengthWrite = _at(_ref = trimmed[0]).call(_ref, 6);