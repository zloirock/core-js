import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// an optional-chained SAFE method keeps the precision - the optional lowering must not
// degrade a registry-known non-mutating call into an unknown one
const opted = [[1], [2]];
opted == null ? void 0 : _includesMaybeArray(opted).call(opted, 9);
export const viaOptionalSafeCall = _atMaybeArray(_ref = opted[0]).call(_ref, 3);