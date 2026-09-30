import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// A direct member read through an array slot resolves the constructor held there.
const memberReadThroughSlot = function () {
  const box = [Object];
  return _Object$getOwnPropertyNames({});
}();
export { memberReadThroughSlot };