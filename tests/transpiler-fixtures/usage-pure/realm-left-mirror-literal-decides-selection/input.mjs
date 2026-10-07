// A residual-keeping destructure rebuilds a realm-read LEFT as a literal: a left the build serves (`Array`,
// `Object`, and `Number`, a global core-js extends in place) decides its selection alone, its right dead and
// its own effects in place; a caller default keeps the plain literal. A left the rebuild leaves possibly
// undefined (an arm it keeps raw), and a rebuilt RIGHT, keep the selection.
const { of, deep: { a } } = globalThis.Array || (log(), Fallback);
const { fromEntries, deep: { b } } = (globalThis.Object ?? X) || Y;
let from, c;
({ from, deep: { c } } = (log(), globalThis.Array) ?? Fallback);
const { fromAsync, deep: { d } } = (flag ? globalThis.Array : globalThis.WeakRef) || Fallback;
const { groupBy, deep: { e } } = globalThis.WeakRef || Object;
export function pick({ hasOwn, deep: { f } } = globalThis.Object || (log(), Fallback)) {
  return [hasOwn, f];
}
export { of, a, fromEntries, b, from, c, fromAsync, d, groupBy, e };
const { isInteger, deep: { g } } = globalThis.Number || (log(), Fallback);
const { isFinite, deep: { h } } = (globalThis.Number ?? X) || Y;
let parseFloat, i;
({ parseFloat, deep: { i } } = (log(), globalThis.Number) ?? Fallback);
export function pickNumber({ isSafeInteger, deep: { j } } = globalThis.Number || (log(), Fallback)) {
  return [isSafeInteger, j];
}
export { isInteger, g, isFinite, h, parseFloat, i };
