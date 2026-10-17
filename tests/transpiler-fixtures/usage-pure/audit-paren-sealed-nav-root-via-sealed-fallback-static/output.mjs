import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
let c2 = 0;
export const viaSealedFallbackStatic = ((null == _globalThis.window ? void 0 : (c2++, _self)).Promise, _Promise).noSuchStatic;
export { c2 };