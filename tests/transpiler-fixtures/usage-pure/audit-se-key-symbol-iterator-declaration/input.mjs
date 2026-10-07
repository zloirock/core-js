// A computed iterator key with an effectful prefix runs before its method read.
// A receiver that may be nullish is rejected first, a literal binding is never nullish and
// needs no check; the effect runs exactly once, and the iterator binding receives its
// polyfill without a residual property read.
let eff = 0;
const arr = [1, 2];
const { [(eff++, Symbol.iterator)]: it } = arr;
const { [(eff++, Symbol.iterator)]: viaOpaque } = source;
export const r = [it, viaOpaque, eff];
