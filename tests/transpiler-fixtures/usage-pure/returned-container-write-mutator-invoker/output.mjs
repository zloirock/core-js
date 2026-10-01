import _Map from "@core-js/pure/actual/map";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Reflect$apply from "@core-js/pure/actual/reflect/apply";
// A definite store replaces Object before return; only Map supplies groupBy.
function swap(box) {
  _Reflect$apply(_Object$assign, null, [box, {
    M: _Map
  }]);
  return box;
}
use(swap({
  M: Object
}).M.groupBy([1, 2], x => x % 2));