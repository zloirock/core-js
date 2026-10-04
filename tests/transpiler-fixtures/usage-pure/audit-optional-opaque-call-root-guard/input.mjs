// A call returning the proxy global keeps its optional window guard.
// Static, prototype and fallback reads resolve to ponyfills in the guarded branch.
// MAX_SAFE_INTEGER must remain available on IE11; instance dispatch retains the selected
// window value for its prototype navigation. Each row uses a distinct method.
const f = () => globalThis;
const g = () => globalThis;
export const knownStatic = f()?.window?.Array.from?.([1]);
export const ctorStatic = g()?.window?.Number.MAX_SAFE_INTEGER.toFixed(2);
export const protoMethod = f()?.window?.Set.prototype.has.call(new Set([1]), 1);
export const fallbackSwap = f()?.window?.Promise.noSuchStatic?.then(x => x);
export const instanceMethod = g()?.window?.Array.prototype.includes.call([1, 2], 2);
