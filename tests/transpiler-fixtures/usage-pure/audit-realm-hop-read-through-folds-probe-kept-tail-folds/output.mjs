import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the probe reads off the root - guard kept, and the hop above it folds into the alternate
export const probeKeptTailFolds = null == _globalThis.window ? void 0 : _self.window.noSuchStatic;