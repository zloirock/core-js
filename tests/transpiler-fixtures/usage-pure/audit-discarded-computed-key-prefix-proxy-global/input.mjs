// A computed method key consumes its sequence prefix without stranding proxy-global rewrites.
// Real key effects run after the receiver and before the method read.
// The initial receiver read stays in that slot even when a proxy-global prefix folds away.
// Distinct methods cover instance, static, iterator and mixed prefixes.
let n = 0;
const arr = [[1]];
const instanceKey = arr[(globalThis, "includes")](1);
const staticKey = Array[(globalThis, "from")]([1, 2]);
const symbolKey = [...arr[(globalThis, Symbol.iterator)]()];
const mixedSe = arr[(n++, globalThis, "at")](0);
export { instanceKey, staticKey, symbolKey, mixedSe, n };
