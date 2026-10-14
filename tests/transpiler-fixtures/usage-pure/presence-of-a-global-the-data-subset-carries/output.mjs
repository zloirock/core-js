import _globalThis from "@core-js/pure/actual/global-this";
import _Math$sumPrecise from "@core-js/pure/actual/math/sum-precise";
import _WeakSet from "@core-js/pure/actual/weak-set";
// pure counts a global present as usage-global does, wherever the data subset it is configured for carries it:
// whether pure substitutes it (`WeakSet`, folded to its import) or the user's filter drops its constructor
// (`WeakMap`, read raw), the right of a `||` over it never runs and leaves with its import. A global the subset
// lacks at the mode (`AsyncIterator` below `full`) decides nothing: the right keeps its import (`Math.sumPrecise`).
export const excluded = _globalThis.WeakMap;
export const injected = _WeakSet;
export const uncarried = _globalThis.AsyncIterator || _Math$sumPrecise(list);