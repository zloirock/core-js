import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Destructuring the returned slot observes its replacement, not the initial Object.
function swap(box) {
  Object.assign(box, {
    M: Map
  });
  return box;
}
const {
  M: {
    groupBy
  }
} = swap({
  M: Object
});
use(groupBy([1, 2], x => x % 2));