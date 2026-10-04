import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A nested-instance assignment in a bodyless control body keeps both its RHS evaluation and
// polyfill read conditional. Placing the read after the body would run it unconditionally.
declare const a: number[];
let flat;
if (cond) {
  [,] = [a];
  flat = _flatMaybeArray(a);
}
export { flat };