import _sortMaybeArray from "@core-js/pure/actual/array/instance/sort";
import _Map from "@core-js/pure/actual/map";
// Sort may move another constructor into the index read by the nested pattern.
const repositionedBySort = function () {
  const sorted = [Object, _Map];
  _sortMaybeArray(sorted).call(sorted);
  const {
    0: {
      isSealed
    }
  } = sorted;
  return isSealed;
}();
export { repositionedBySort };