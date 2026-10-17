import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
_globalThis.callRootBox = {
  list: [[1]]
};
const provenProbe = () => _globalThis.window;
export const probeCallDispatch = null == (_ref = null == provenProbe() ? void 0 : _self.callRootBox.list) ? void 0 : _flatMaybeArray(_ref).call(_ref);