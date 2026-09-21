import _Map from "@core-js/pure/actual/map";
import _Object$assign from "@core-js/pure/actual/object/assign";
// A definite store replaces Object before return; only Map supplies groupBy.
function swap(box) {
  _Object$assign(box, {
    M: _Map
  });
  return box;
}
use(swap({
  M: Object
}).M.groupBy([1, 2], x => x % 2));