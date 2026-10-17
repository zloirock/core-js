import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// a registry METHOD read outside a call position extracts the function value - its later
// call is untrackable, so the extraction bails regardless of which method leaves
const extracted = [[1], [2]];
export const viaMutatorExtraction = _includesMaybeArray(_ref = extracted[0]).call(_ref, 5);