import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Nested leaves retain unrelated siblings at every enclosing level.
// User-object getters and defaults keep their source order; pristine built-in reads
// follow the built-in-read contract across declarations and control-flow hosts.
const box = {
  y: [1]
};
const {
    junk: j13
  } = box,
  {
    y: _ref
  } = box,
  userMiddle = _atMaybeArray(_ref),
  {
    other: o4
  } = _ref,
  {
    more: m2
  } = box;
export { j13 };
export { userMiddle };
export { o4 };
export { m2 };