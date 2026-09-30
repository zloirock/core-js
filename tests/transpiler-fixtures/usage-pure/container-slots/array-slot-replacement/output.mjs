import _Map from "@core-js/pure/actual/map";
// Replacing an array element invalidates its initial constructor for a later nested read.
const arraySlotReplaced = function () {
  const box = [Object];
  box[0] = _Map;
  const {
    0: {
      groupBy
    }
  } = box;
  return groupBy;
}();
export { arraySlotReplaced };