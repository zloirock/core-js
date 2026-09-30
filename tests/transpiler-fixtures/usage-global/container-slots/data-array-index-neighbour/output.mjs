import "core-js/modules/es.object.entries";
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
  } = untouchedNeighbour;
  return [dataArr[dataIdx], entries];
}();
export { varIndexOnDataArray };