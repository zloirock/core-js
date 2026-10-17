import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// an OPTIONAL call root of a proven const-bound callee guards like the plain call - the
// callee cannot be undefined, so the call adds no source of undefined
const oc = () => _globalThis;
export const viaOptionalCallRoot = null == oc?.()?.window ? void 0 : _atMaybeArray(_ref = _Array$of(13)).call(_ref, 0);