// Object.assign receives the container and may replace its constructor slot before the read.
const assignedViaObjectAssign = (function () {
  const merged = { k: Object };
  Object.assign(merged, { k: Map });
  const { k: { groupBy } } = merged;
  return groupBy;
})();
export { assignedViaObjectAssign };
