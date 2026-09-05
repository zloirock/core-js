// optional chain over a polyfillable global followed by instance polyfill: receiver memoized
// in `_ref` and reused in the polyfill call. inner `?.` deopts apply only to the optional hop
export const a = globalThis?.foo?.includes(1);
export const b = globalThis?.foo?.bar?.at(0);
export const c = Promise?.foo?.includes(2);
export const d = Map?.x?.includes(3);
