import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// iteration hands elements out like a spread does - it bails
const looped = [[1], [2]];
export const viaForOfEscape = _atMaybeArray(_ref = looped[0]).call(_ref, 9);