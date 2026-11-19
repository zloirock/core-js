import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// The call after the seal evaluates its argument and retains the constructor as this.
export const value = ((null == _globalThis.window ? void 0 : _Set)?.hasOwnProperty)(argument());