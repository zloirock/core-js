import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref;
_globalThis.callRootBox = {
  list: [[1]]
};
const provenProbe = () => _globalThis.window;
export const probeYieldInstanceTail = null == (_ref = null == provenProbe() ? void 0 : _self.callRootBox.list) ? void 0 : _at(_ref).call(_ref, 0);