import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.set";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Every caller reaches an inert setter: Map is evaluated but never stored.
// The paired getter still returns Object; global needs only Object.groupBy.
function swap(box) {
  Reflect.set(box, "M", Map);
  return box;
}
use(swap({
  get M() {
    return Object;
  },
  set M(value) {}
}).M.groupBy([1, 2], x => x % 2));