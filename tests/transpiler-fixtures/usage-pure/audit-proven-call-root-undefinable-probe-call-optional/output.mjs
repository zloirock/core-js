import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
_globalThis.callRootBox = {
  list: [[1]]
};
const provenProbe = () => _globalThis.window;
// the `?.` sits directly over the call: it is the only guard the source has
export const probeCallOptional = null == provenProbe() ? void 0 : _self.callRootBox.list;