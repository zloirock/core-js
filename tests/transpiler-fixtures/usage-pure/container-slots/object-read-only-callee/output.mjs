import _Object$entries from "@core-js/pure/actual/object/entries";
// A local property reader preserves the container's known constructor slot.
const readOnlyCallee = function () {
  function onlyReads(t) {
    return t.k;
  }
  const readOnlyEscape = {
    k: Object
  };
  onlyReads(readOnlyEscape);
  const {
    k: {
      entries
    }
  } = {
    k: {
      entries: _Object$entries
    }
  };
  return entries;
}();
export { readOnlyCallee };