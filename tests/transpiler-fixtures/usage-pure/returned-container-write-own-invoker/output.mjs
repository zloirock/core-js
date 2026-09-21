import _Map from "@core-js/pure/actual/map";
// The private own call method forwards box without running swap.
// Its sole caller exposes only Object.groupBy, not the Object namespace.
swap.call = (receiver, box) => box;
function swap(box) {
  box.M = _Map;
  return box;
}
use(swap.call(null, {
  M: Object
}).M.groupBy([1, 2], x => x % 2));