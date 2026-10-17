import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// an optional-chained mutator call bails the same way as the plain spelling
const filled = [[1], [2]];
export const viaOptionalMutator = _atMaybeArray(_ref = filled[0]).call(_ref, 2);