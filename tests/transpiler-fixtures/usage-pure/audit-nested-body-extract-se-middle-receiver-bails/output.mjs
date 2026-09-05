import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// When the receiver value of the body-extracted binding (`b: [y()]`) ITSELF carries a side effect,
// re-emitting it for the extraction would evaluate `y()` twice and pull it ahead of the sibling
// side effects (`x()` before, `z()` after). the slot memo keeps both: the value is written IN its
// slot (`b: _ref = [y()]`), so the literal still runs `x() -> y() -> z()` once, and the extraction
// reads the ref after the destructure - the `at` polyfill lands without reordering anything
function x() {
  return 1;
}
function y() {
  return 2;
}
function z() {
  return 3;
}
const {
  a,
  b: {
    at: _unused
  },
  c
} = {
  a: [x()],
  b: _ref = [y()],
  c: [z()]
};
const at = _atMaybeArray(_ref);
export const out = [a, c, typeof at];