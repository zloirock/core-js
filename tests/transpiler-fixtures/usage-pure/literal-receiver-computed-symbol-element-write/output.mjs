import _getIterator from "@core-js/pure/actual/get-iterator";
var _ref;
// Constructing a literal receiver reads its elements before the computed symbol key.
// A key that writes the element binding cannot change the already selected array.
let value = 'held';
export const result = (_ref = [value], value = 'swapped', _getIterator(_ref)).next().value;