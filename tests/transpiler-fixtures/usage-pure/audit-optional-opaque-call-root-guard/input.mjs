// an OPAQUE inline-call proxy-nav root (`f()?.window`, `f = () => globalThis`) navigating an unponyfilled
// window hop: no resolver collapses a call root, so the guard test is the RAW source with any internal
// proxy-global substituted (`null == f()?.window ? void 0 : _Array$from`), and the static / fallback GUARDS
// rather than bailing to the raw un-polyfilled chain (native `from` on ie11 = missed polyfill) or folding +
// dropping the receiver nav (its SE + short-circuit). covers a known static, a ctor-static, a prototype
// method, an unknown-static fallback swap, and an instance dispatch. distinct method per line.
const f = () => globalThis;
const g = () => globalThis;
export const knownStatic = f()?.window?.Array.from?.([1]);
export const ctorStatic = g()?.window?.Number.MAX_SAFE_INTEGER.toFixed(2);
export const protoMethod = f()?.window?.Set.prototype.has.call(new Set([1]), 1);
export const fallbackSwap = f()?.window?.Promise.noSuchStatic?.then(x => x);
export const instanceMethod = g()?.window?.Array.prototype.includes.call([1, 2], 2);
