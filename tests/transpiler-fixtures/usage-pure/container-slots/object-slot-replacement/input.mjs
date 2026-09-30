// Replacing an object slot invalidates its initial constructor for a later nested read.
const objectSlotReplaced = (function () {
  const w = { k: Object };
  w.k = Map;
  const { k: { groupBy } } = w;
  return groupBy;
})();
export { objectSlotReplaced };
