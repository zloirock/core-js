import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
// A direct member read through an object slot resolves the constructor held there.
const memberReadThroughObjectKey = function () {
  const w = {
    k: Object
  };
  return _Object$getOwnPropertyDescriptor({}, 'a');
}();
export { memberReadThroughObjectKey };