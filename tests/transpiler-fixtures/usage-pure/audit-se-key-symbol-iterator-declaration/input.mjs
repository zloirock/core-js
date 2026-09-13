// A computed iterator key with an effectful prefix runs before its method read.
// The receiver is captured first, the effect runs exactly once, and the iterator
// binding receives its polyfill without a residual property read.
let eff = 0;
const arr = [1, 2];
const { [(eff++, Symbol.iterator)]: it } = arr;
export const r = [it, eff];
