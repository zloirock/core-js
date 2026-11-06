// Deleting the constructor slot leaves the nested pattern to its own empty-object default.
const deletedSlot = (function () {
  const dropped = { k: Object };
  delete dropped.k;
  const { k: { groupBy } = {} } = dropped;
  return groupBy;
})();
export { deletedSlot };
