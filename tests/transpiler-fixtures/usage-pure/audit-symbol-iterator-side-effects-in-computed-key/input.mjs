// SequenceExpression in the computed key carries side effects that the
// `_getIteratorMethod(obj)` rewrite would silently drop. transformer must keep the SE
// in source verbatim and let the inner `Symbol.iterator` resolve via the static polyfill.
export const a = obj[(probe(), Symbol.iterator)];
export const b = obj[(probe(), Symbol.iterator)]();
export const c = obj[(probe(), Symbol.iterator)](42);
export const d = obj[(probe1(), probe2(), Symbol.iterator)];
export const e = obj?.[(probe(), Symbol.iterator)]();
