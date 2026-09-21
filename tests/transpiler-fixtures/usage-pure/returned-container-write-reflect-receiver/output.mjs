import _Map from "@core-js/pure/actual/map";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
// A definite store replaces Object before return; only Map supplies groupBy.
function swap(box) {
  _Reflect$set({}, 'M', _Map, box);
  return box;
}
use(swap({
  M: Object
}).M.groupBy([1, 2], x => x % 2));