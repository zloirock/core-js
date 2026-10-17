import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a call in the MIDDLE of the probe chain: the render lands on the deepest member whose object
// is the pure proxy nav, and the call rides the chain's own short-circuit outside it
export const midCall = null == _globalThis.window ? void 0 : _self.foo().bar;