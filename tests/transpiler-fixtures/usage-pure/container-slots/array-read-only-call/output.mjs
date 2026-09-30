import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
// A detached slice call leaves the original array element available to the nested static read.
const detachedReadOnlyStillResolves = function () {
  const sliced = [Object];
  _sliceMaybeArray(sliced).call(sliced, 0);
  const {
    0: {
      getPrototypeOf
    }
  } = sliced;
  return getPrototypeOf;
}();
export { detachedReadOnlyStillResolves };