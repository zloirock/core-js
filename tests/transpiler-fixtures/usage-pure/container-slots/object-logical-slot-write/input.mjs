// A logical assignment can replace the constructor stored in the slot read by the pattern.
const assignedViaLogicalWrite = (function () {
  const logical = { k: Object };
  logical.k &&= Map;
  const { k: { groupBy } } = logical;
  return groupBy;
})();
export { assignedViaLogicalWrite };
