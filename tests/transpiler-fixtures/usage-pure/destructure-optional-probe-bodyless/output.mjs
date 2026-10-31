import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A bodyless assignment still coerces its fully consumed source before any write.
const log = [];
let of;
if (_pushMaybeArray(log).call(log, 'before')) ({} = _globalThis.window?.[(_pushMaybeArray(log) || 0).call(log, _atMaybeArray(_ref = [7]).call(_ref, 0)), 'Array']), of = _Array$of;
export const result = [of(3), log];