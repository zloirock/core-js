import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// a read-only-referenced literal keeps its per-element precision
const sealed = [[1], [2]];
export const viaSealedRead = _includesMaybeArray(_ref = sealed[0]).call(_ref, 1);