import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Nested leaves retain unrelated siblings at every enclosing level.
// User-object getters and defaults keep their source order; pristine built-in reads
// follow the built-in-read contract across declarations and control-flow hosts.
const box = {
  y: [1]
};
const soleUserBesideJunk = _atMaybeArray(box.y);
const {
  junk: j25
} = box;
export { soleUserBesideJunk };
export { j25 };