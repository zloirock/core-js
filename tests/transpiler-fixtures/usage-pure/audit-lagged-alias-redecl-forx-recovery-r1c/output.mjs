import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _Map from "@core-js/pure/actual/map/constructor";
// Recovering a destructured alias preserves its writes and redeclarations. A bare var redeclaration adds no value; a loop-head
// write widens the later receiver.
var M;
M = _Map;
var M = [1, 2];
export const r1c = M == null ? void 0 : _toReversedMaybeArray(M).call(M);