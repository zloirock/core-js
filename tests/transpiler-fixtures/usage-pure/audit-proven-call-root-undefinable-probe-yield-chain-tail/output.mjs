import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
const provenProbe = () => _globalThis.window;
export const probeYieldChainTail = null == provenProbe() ? void 0 : _atMaybeArray(_ref = _Array$of(1)).call(_ref, 0);