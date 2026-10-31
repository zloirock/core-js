import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.define-property";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A stored call result reads the replacement installed before return.
function swap(box) {
  Reflect.defineProperty(box, "M", {
    value: Map
  });
  return box;
}
const result = swap({
  M: Object
});
use(result.M.groupBy([1, 2], x => x % 2));