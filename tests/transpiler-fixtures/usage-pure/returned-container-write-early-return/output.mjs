import _Map from "@core-js/pure/actual/map";
import _Object$assign from "@core-js/pure/actual/object/assign";
// A return before the store can still expose Object.groupBy.
function swap(box) {
  if (flag) return box;
  _Object$assign(box, {
    M: _Map
  });
  return box;
}
use(swap({
  M: Object
}).M.groupBy([1, 2], x => x % 2));