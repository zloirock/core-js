import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The claimed b.at leaf sits between outer siblings a and c. Capture the completed object literal
// once, then read a, select the method from the captured b value, and read c in source property
// order.
function x() {
  return 1;
}
function z() {
  return 3;
}
const _ref = {
  a: [x()],
  b: [1, 2, 3],
  c: [z()]
};
const {
  a
} = _ref;
const at = _atMaybeArray(_ref.b);
const {
  c
} = _ref;
at();
export const out = [a, c];