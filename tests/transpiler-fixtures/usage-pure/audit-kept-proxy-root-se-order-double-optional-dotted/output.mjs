import _globalThis from "@core-js/pure/actual/global-this";
let dd;
export const doubleOptionalDotted = (dd = _globalThis.window)?.Array.prototype.indexOf.call([2], 2);