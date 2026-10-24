import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A return before the store can still expose Object.groupBy.
function swap(box) {
  if (flag) return box;
  Object.assign(box, {
    M: Map
  });
  return box;
}
use(swap({
  M: Object
}).M.groupBy([1, 2], x => x % 2));