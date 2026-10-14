// usage-global counts a global present wherever the data subset it is configured for carries it: whether the
// build injects it (`WeakSet`) or the user's filter drops its constructor (`WeakMap`), the right of a `||` over it
// never runs and loads nothing. A global the subset lacks at the mode (`AsyncIterator` below `full`) decides
// nothing: the right keeps its module (`Math.sumPrecise`).
export const excluded = globalThis.WeakMap || Object.fromEntries(pairs);
export const injected = globalThis.WeakSet || Array.of(item);
export const uncarried = globalThis.AsyncIterator || Math.sumPrecise(list);
