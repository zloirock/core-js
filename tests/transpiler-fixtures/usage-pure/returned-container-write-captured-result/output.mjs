import _Map from "@core-js/pure/actual/map";
import _Reflect$defineProperty from "@core-js/pure/actual/reflect/define-property";
// A stored call result reads the replacement installed before return.
function swap(box) {
  _Reflect$defineProperty(box, "M", {
    value: _Map
  });
  return box;
}
const result = swap({
  M: Object
});
use(result.M.groupBy([1, 2], x => x % 2));