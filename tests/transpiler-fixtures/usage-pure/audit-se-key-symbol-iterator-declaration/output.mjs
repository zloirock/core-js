import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A computed iterator key with an effectful prefix runs before its method read.
// The receiver is captured first, the effect runs exactly once, and the iterator
// binding receives its polyfill without a residual property read.
let eff = 0;
const arr = [1, 2];
const it = null == arr ? arr[""] : (eff++, _getIteratorMethod(arr));
export const r = [it, eff];