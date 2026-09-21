import _Map from "@core-js/pure/actual/map";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
// A conditional store can retain the original Object receiver.
function swap(box) {
  if (flag) _Reflect$set(box, "M", _Map);
  return box;
}
use(swap({
  M: Object
}).M.groupBy([1, 2], x => x % 2));