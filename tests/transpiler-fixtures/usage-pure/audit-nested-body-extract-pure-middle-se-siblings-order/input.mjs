// The body-extracted polyfill binding (`at`) sits in the MIDDLE property, flanked by sibling
// receiver values carrying side effects (`a: [x()]` before, `c: [z()]` after). its value is a
// CONSTANT array literal, so it memoizes into a single `_ref` and the residual keeps the real
// `a` / `c` bindings. order holds: the hoisted constant can't reorder, residual runs `x()` then `z()`
function x() { return 1; }
function z() { return 3; }

const { a, b: { at }, c } = { a: [x()], b: [1, 2, 3], c: [z()] };
at();
export const out = [a, c];
