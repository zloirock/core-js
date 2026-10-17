import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
const lent = [[1], [2]];
export const viaSafeExtraction = _atMaybeArray(_ref = lent[0]).call(_ref, -1);