// A later numeric key selects its own element rather than the first array element.
const laterSlot = (function () {
  const { 1: { findLast } } = [[5], [6, 7]];
  return findLast;
})();
export { laterSlot };
