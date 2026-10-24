// A detached slice call leaves the original array element available to the nested static read.
const detachedReadOnlyStillResolves = (function () {
  const sliced = [Object];
  sliced.slice.call(sliced, 0);
  const { 0: { getPrototypeOf } } = sliced;
  return getPrototypeOf;
})();
export { detachedReadOnlyStillResolves };
