import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The private own call method forwards box without running swap.
// Its sole caller exposes only Object.groupBy, not the Object namespace.
swap.call = (receiver, box) => box;
function swap(box) {
  box.M = Map;
  return box;
}
use(swap.call(null, {
  M: Object
}).M.groupBy([1, 2], x => x % 2));