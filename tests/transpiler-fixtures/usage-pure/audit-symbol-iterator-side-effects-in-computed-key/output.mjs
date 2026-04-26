import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// SequenceExpression in the computed key carries side effects that the
// `_getIteratorMethod(obj)` rewrite would silently drop. transformer must keep the SE
// in source verbatim and let the inner `Symbol.iterator` resolve via the static polyfill.
export const a = obj[probe(), _Symbol$iterator];
export const b = obj[probe(), _Symbol$iterator]();
export const c = obj[probe(), _Symbol$iterator](42);
export const d = obj[probe1(), probe2(), _Symbol$iterator];
export const e = obj?.[probe(), _Symbol$iterator]();