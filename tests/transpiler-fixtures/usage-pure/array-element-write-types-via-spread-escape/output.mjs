import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// a spread hands every element out at once - the holder may write elements, so it bails
const fanned = [[1], [2]];
use([...fanned]);
export const viaSpreadEscape = _includes(_ref = fanned[0]).call(_ref, 8);