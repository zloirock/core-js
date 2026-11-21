import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
const lent = [[1], [2]];
use(_includesMaybeArray(lent));
export const viaSafeExtraction = _atMaybeArray(_ref = lent[0]).call(_ref, -1);