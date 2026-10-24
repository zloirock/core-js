import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// a registry-safe COPYING method (with / toSpliced / toSorted return copies) keeps precision
const copied = [[1], [2]];
export const viaCopyingMethod = _atMaybeArray(_ref = copied[0]).call(_ref, 5);