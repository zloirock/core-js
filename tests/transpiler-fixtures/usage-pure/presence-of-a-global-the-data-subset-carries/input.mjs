// pure counts a global present as usage-global does, wherever the data subset it is configured for carries it:
// whether pure substitutes it (`WeakSet`, folded to its import) or the user's filter drops its constructor
// (`WeakMap`, read raw), the right of a `||` over it never runs and leaves with its import. A global the subset
// lacks at the mode (`AsyncIterator` below `full`) decides nothing: the right keeps its import (`Math.sumPrecise`).
export const excluded = globalThis.WeakMap || Object.fromEntries(pairs);
export const injected = globalThis.WeakSet || Array.of(item);
export const uncarried = globalThis.AsyncIterator || Math.sumPrecise(list);
