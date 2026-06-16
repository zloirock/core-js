import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The body-extracted polyfill binding (`at`) sits in the MIDDLE property, flanked by sibling
// receiver values that carry side effects (`a: [x()]` before, `c: [z()]` after). the middle value
// `b: [1]` is a pure literal, so the body-extract fires - and must NOT pull the side-effecting
// siblings out of source order: the hoisted `_at...([1])` is side-effect-free, and the residual
// destructure re-runs the WHOLE receiver literal, so `x()` then `z()` still fire in order
function x() {
  return 1;
}
function z() {
  return 3;
}
const at = _atMaybeArray([1]);
const {
  a,
  b: {
    at: _unused
  },
  c
} = {
  a: [x()],
  b: [1],
  c: [z()]
};
at();
export const out = [a, c];