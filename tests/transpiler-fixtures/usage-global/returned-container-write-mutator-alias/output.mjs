import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A definite store replaces Object before return; only Map supplies groupBy.
function swap(box) {
  const install = Object.defineProperty;
  install(box, 'M', {
    value: Map
  });
  return box;
}
use(swap({
  M: Object
}).M.groupBy([1, 2], x => x % 2));