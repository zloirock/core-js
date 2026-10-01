import _Object$entries from "@core-js/pure/actual/object/entries";
// Indexing a data-only array does not change an independent constructor container.
const varIndexOnDataArray = function () {
  const dataArr = [1, 2, 3];
  const dataIdx = 1;
  const untouchedNeighbour = {
    k: Object
  };
  const {
    k: {
      entries
    }
  } = {
    k: {
      entries: _Object$entries
    }
  };
  return [dataArr[dataIdx], entries];
}();
export { varIndexOnDataArray };