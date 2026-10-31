import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// ... the same over an opaque-but-proven root
const proven = () => _globalThis;
export const provenRootTailFolds = (null == proven().window ? void 0 : _self.window)?.chrome;