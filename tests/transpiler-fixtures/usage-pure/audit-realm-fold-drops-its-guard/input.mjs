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

// a CALL root yielding the excluded root still yields the realm - the data subset carries `globalThis` - and
// its run lands whole on the ponyfill, so its `window` hop below `self` is the realm itself and the guard folds
export const guardedCallRoot = dh().self.window?.name;
export { q };
