import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// A later numeric key selects its own element rather than the first array element.
const laterSlot = function () {
  const findLast = _findLastMaybeArray([6, 7]);
  return findLast;
}();
export { laterSlot };