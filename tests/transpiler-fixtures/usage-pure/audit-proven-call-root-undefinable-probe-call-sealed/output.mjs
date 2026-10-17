import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
_globalThis.callRootBox = {
  list: [[1]]
};
const provenProbe = () => _globalThis.window;
export const probeCallSealed = (null == provenProbe() ? void 0 : _self).callRootBox;