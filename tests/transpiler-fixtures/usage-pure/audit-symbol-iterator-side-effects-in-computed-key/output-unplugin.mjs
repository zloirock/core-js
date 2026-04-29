import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// comma expression in the computed key carries side effects that the
// `_getIteratorMethod(obj)` rewrite must preserve. transformer keeps the prefix in source
// verbatim and lets the inner `Symbol.iterator` resolve via the static polyfill.
export const a = obj[(probe(), _Symbol$iterator)];
export const b = obj[(probe(), _Symbol$iterator)]();
export const c = obj[(probe(), _Symbol$iterator)](42);
export const d = obj[(probe1(), probe2(), _Symbol$iterator)];
export const e = obj?.[(probe(), _Symbol$iterator)]();