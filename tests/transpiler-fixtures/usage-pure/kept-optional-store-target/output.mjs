import _globalThis from "@core-js/pure/actual/global-this";
// A kept optional store accepts a parenthesized write target.
// The stored realm still feeds the retained property read.
let held;
export const value = (held = _globalThis.window)?.foo;
export { held };