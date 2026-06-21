import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The body-extracted polyfill binding (`at`) sits in the MIDDLE property, flanked by sibling
// receiver values carrying side effects (`a: [x()]` before, `c: [z()]` after). its value is a
// CONSTANT array literal, so it memoizes into a single `_ref` and the residual keeps the real
// `a` / `c` bindings. order holds: the hoisted constant can't reorder, residual runs `x()` then `z()`
function x() {
  return 1;
}
function z() {
  return 3;
}
const _ref = [1, 2, 3];
const at = _atMaybeArray(_ref);
const {
  a,
  b: {
    at: _unused
  },
  c
} = {
  a: [x()],
  b: _ref,
  c: [z()]
};
at();
export const out = [a, c];