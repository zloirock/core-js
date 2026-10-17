import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Nested leaves retain unrelated siblings at every enclosing level.
// User-object getters and defaults keep their source order; pristine built-in reads
// follow the built-in-read contract across declarations and control-flow hosts.
const box = {
  y: [1]
};
const {
    junk: j11
  } = box,
  {
    y: _ref
  } = box,
  userLast = _atMaybeArray(_ref),
  {
    other: o2
  } = _ref;
export { j11 };
export { userLast };
export { o2 };