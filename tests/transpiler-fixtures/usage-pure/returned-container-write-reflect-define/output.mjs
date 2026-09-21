import _Map from "@core-js/pure/actual/map";
import _Reflect$defineProperty from "@core-js/pure/actual/reflect/define-property";
// A definite store replaces Object before return; only Map supplies groupBy.
function swap(box) {
  _Reflect$defineProperty(box, 'M', {
    value: _Map
  });
  return box;
}
use(swap({
  M: Object
}).M.groupBy([1, 2], x => x % 2));