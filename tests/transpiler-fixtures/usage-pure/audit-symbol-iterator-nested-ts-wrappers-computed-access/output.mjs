import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// computed-key receiver wrapped in two layers of TS `as any` casts: the rewrite must
// still recognise `Symbol.iterator` and emit the well-known-symbol polyfill.
const iter = _getIteratorMethod(obj);