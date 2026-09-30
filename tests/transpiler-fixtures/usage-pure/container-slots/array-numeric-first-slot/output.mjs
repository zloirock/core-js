import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A numeric object-pattern key selects the first array element for instance dispatch.
const firstSlot = function () {
  const at = _atMaybeArray([1, 2]);
  return at;
}();
export { firstSlot };