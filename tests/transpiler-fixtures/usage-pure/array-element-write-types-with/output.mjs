import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
// a registry-safe COPYING method (with / toSpliced / toSorted return copies) keeps precision
const copied = [[1], [2]];
use(_withMaybeArray(copied).call(copied, 0, [9]));