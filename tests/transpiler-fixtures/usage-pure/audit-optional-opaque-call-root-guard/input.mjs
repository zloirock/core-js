// an OPAQUE inline-call proxy-nav root (`f()?.window`, `f = () => globalThis`) navigating an unponyfilled
// window hop: the guard test keeps the RAW source (its SE + short-circuit), while the guarded branch
// COLLAPSES onto the ponyfill - a memoized ref that provably holds the proxy-global carries the
// provenance, so a ctor-static / prototype / fallback chain resolves instead of reading native off
// the ref (native `MAX_SAFE_INTEGER` on ie11 = undefined). the instance dispatch keeps its
// prototype-navigated receiver off the ref by placement design. distinct method per line.
const f = () => globalThis;
const g = () => globalThis;
export const knownStatic = f()?.window?.Array.from?.([1]);
export const ctorStatic = g()?.window?.Number.MAX_SAFE_INTEGER.toFixed(2);
export const protoMethod = f()?.window?.Set.prototype.has.call(new Set([1]), 1);
export const fallbackSwap = f()?.window?.Promise.noSuchStatic?.then(x => x);
export const instanceMethod = g()?.window?.Array.prototype.includes.call([1, 2], 2);
