import _Object$keys from "@core-js/pure/actual/object/keys";
// An array element holding Object exposes its named static through an object pattern.
const constructorSlot = function () {
  const keys = _Object$keys;
  return keys;
}();
export { constructorSlot };