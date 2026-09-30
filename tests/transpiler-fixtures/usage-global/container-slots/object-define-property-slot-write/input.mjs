// Object.defineProperty receives the container and replaces its constructor slot.
const assignedViaDefineProperty = (function () {
  const defined = { k: Object };
  Object.defineProperty(defined, 'k', { value: Map });
  const { k: { groupBy } } = defined;
  return groupBy;
})();
export { assignedViaDefineProperty };
