import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a claimless ctor read in a `new` callee: the render stays inside the callee parens (a bare
// optional chain is not legal there), and an absent `window` throws in source and render alike
export const newCallee = new (null == _globalThis.window ? void 0 : _self.CustomOther)(1);