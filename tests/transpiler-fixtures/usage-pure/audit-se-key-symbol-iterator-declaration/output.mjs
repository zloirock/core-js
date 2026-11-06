import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A computed iterator key with an effectful prefix runs before its method read.
// A receiver that may be nullish is rejected first, a literal binding is never nullish and
// needs no check; the effect runs exactly once, and the iterator binding receives its
// polyfill without a residual property read.
let eff = 0;
const arr = [1, 2];
const it = (eff++, _getIteratorMethod(arr));
const viaOpaque = null == source ? source[""] : (eff++, _getIteratorMethod(source));
export const r = [it, viaOpaque, eff];