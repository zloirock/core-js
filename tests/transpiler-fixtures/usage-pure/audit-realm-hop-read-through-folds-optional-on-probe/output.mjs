import _globalThis from "@core-js/pure/actual/global-this";
// NEGATIVE: a `?.` ON the probe hop stays, and so does the read it guards
export const optionalOnProbe = _globalThis.window?.noSuchStatic;