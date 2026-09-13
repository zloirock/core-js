// An excluded realm root keeps its terminal environment-probe guard, including
// through a stored root. Optionals over backed values remain redundant, and plain
// navigation through the run follows the ordinary collapse rule.
let q;
function dh() { return globalThis; }
export const guardedTail = globalThis.self.window?.name;
export const guardedHop = globalThis.self?.window.name;
export const guardedBoth = globalThis.self?.window?.name;
export const guardedDeep = globalThis.self.window.self?.name;
export const guardedOverStore = (q = globalThis).self.window?.name;
export const guardedOverParenStore = (q = (globalThis)).self.window?.name;

// NEGATIVE: an opaque CALL root is undefinable by its own canon, so the guard the source wrote over
// it stands - and the run under it is TERMINAL in the value that read consumes, so its probe hop
// keeps its own slot over the landed ponyfill rather than folding into it
export const guardedCallRoot = dh().self.window?.name;
export { q };
