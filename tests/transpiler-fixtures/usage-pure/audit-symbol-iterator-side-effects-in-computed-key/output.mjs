import _getIterator from "@core-js/pure/actual/get-iterator";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// comma expression in the computed key carries side effects that the
// `_getIteratorMethod(obj)` rewrite must preserve. transformer keeps the prefix in source
// verbatim and lets the inner `Symbol.iterator` resolve via the static polyfill.
export const a = (probe(), _getIteratorMethod(obj));
export const b = (probe(), _getIterator(obj));
export const c = (probe(), _getIteratorMethod(obj).call(obj, 42));
export const d = (probe1(), probe2(), _getIteratorMethod(obj));
export const e = obj == null ? void 0 : (probe(), _getIterator(obj));