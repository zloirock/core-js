// A local property reader preserves the container's known constructor slot.
const readOnlyCallee = (function () {
  function onlyReads(t) { return t.k; }
  const readOnlyEscape = { k: Object };
  onlyReads(readOnlyEscape);
  const { k: { entries } } = readOnlyEscape;
  return entries;
})();
export { readOnlyCallee };
