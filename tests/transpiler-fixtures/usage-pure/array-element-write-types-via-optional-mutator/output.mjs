import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// an optional-chained mutator call bails the same way as the plain spelling
const filled = [[1], [2]];
filled == null ? void 0 : _fillMaybeArray(filled).call(filled, ["x"]);
export const viaOptionalMutator = _at(_ref = filled[0]).call(_ref, 2);