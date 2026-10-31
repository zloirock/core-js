import _Map from "@core-js/pure/actual/map";
// Replacing an object slot invalidates its initial constructor for a later nested read.
const objectSlotReplaced = function () {
  const w = {
    k: Object
  };
  w.k = _Map;
  const {
    k: {
      groupBy
    }
  } = w;
  return groupBy;
}();
export { objectSlotReplaced };