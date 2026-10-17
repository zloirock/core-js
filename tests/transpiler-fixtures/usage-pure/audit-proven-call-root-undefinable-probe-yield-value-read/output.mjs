import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
const provenProbe = () => _globalThis.window;
export const probeYieldValueRead = null == provenProbe() ? void 0 : _self.Array;