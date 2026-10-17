import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
// literal root: ONE window test guards the claim, the branch reads the ponyfill ctor
export const litErased = null == _globalThis.window ? void 0 : _Set;