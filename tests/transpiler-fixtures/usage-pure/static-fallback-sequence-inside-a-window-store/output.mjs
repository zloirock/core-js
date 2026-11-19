import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// A sequence inside the stored value keeps its global substitution in the lifted test.
let held;
export const value = null == (held = (prefix(), _globalThis).window) ? void 0 : _Set.prototype.has;