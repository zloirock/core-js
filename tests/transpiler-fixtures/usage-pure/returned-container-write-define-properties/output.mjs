import _Map from "@core-js/pure/actual/map";
import _Object$defineProperties from "@core-js/pure/actual/object/define-properties";
// A definite store replaces Object before return; only Map supplies groupBy.
function swap(box) {
  _Object$defineProperties(box, {
    M: {
      value: _Map
    }
  });
  return box;
}
use(swap({
  M: Object
}).M.groupBy([1, 2], x => x % 2));