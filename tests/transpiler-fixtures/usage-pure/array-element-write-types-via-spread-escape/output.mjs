import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// The consumer receives a new array containing the original elements.
const fanned = [[1], [2]];
use([...fanned]);
export const viaSpreadEscape = _includesMaybeArray(_ref = fanned[0]).call(_ref, 8);