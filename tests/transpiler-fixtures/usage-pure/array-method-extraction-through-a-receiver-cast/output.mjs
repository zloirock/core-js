import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
const rows = [[7]];
use(_includesMaybeArray(rows as number[][]));
export const last = _atMaybeArray(_ref = rows[0]).call(_ref, -1);