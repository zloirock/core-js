import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
// an optional-chained mutator call bails the same way as the plain spelling
const filled = [[1], [2]];
filled == null ? void 0 : _fillMaybeArray(filled).call(filled, ["x"]);