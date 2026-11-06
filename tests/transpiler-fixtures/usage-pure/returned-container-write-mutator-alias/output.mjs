import _Map from "@core-js/pure/actual/map";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
// A definite store replaces Object before return; only Map supplies groupBy.
function swap(box) {
  const install = _Object$defineProperty;
  install(box, 'M', {
    value: _Map
  });
  return box;
}
use(swap({
  M: Object
}).M.groupBy([1, 2], x => x % 2));