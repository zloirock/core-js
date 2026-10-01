import "core-js/modules/es.object.get-own-property-names";
// A direct member read through an array slot resolves the constructor held there.
const memberReadThroughSlot = function () {
  const box = [Object];
  return box[0].getOwnPropertyNames({});
}();
export { memberReadThroughSlot };