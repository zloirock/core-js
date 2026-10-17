import _Map from "@core-js/pure/actual/map";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
// The descriptor makes Reflect.set fail, but descriptor-state analysis bails.
// Keep both constructor candidates; pure preserves the original receiver read.
function swap(box) {
  Object.defineProperty(box, "M", {
    writable: false
  });
  _Reflect$set(box, "M", _Map);
  return box;
}
use(swap({
  M: Object
}).M.groupBy([1, 2], x => x % 2));