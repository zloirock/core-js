import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
var _ref;
// a registry-safe COPYING method (with / toSpliced / toSorted return copies) keeps precision
const copied = [[1], [2]];
use(_withMaybeArray(copied).call(copied, 0, [9]));
export const viaCopyingMethod = _atMaybeArray(_ref = copied[0]).call(_ref, 5);