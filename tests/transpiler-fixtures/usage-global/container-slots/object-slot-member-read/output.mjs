import "core-js/modules/es.object.get-own-property-descriptor";
// A direct member read through an object slot resolves the constructor held there.
const memberReadThroughObjectKey = function () {
  const w = {
    k: Object
  };
  return w.k.getOwnPropertyDescriptor({}, 'a');
}();
export { memberReadThroughObjectKey };