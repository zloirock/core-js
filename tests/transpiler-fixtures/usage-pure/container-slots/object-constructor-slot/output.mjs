import _Object$entries from "@core-js/pure/actual/object/entries";
// An object slot holding Object exposes its named static through a nested pattern.
const constructorUnderObjectKey = function () {
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
export { constructorUnderObjectKey };