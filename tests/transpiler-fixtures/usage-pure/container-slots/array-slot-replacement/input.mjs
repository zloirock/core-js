// Replacing an array element invalidates its initial constructor for a later nested read.
const arraySlotReplaced = (function () {
  const box = [Object];
  box[0] = Map;
  const { 0: { groupBy } } = box;
  return groupBy;
})();
export { arraySlotReplaced };
