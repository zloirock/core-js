import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A kept optional store accepts a parenthesized write target.
// The stored realm still feeds the retained property read.
let held;
export const value = ((held) = globalThis.window)?.self.foo;
export { held };