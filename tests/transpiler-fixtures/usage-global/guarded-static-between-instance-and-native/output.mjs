import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.function.name";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A guarded static beside an extracted instance leaf retains the same narrow guard.
// Pending instance writes stay before the static; the native trailing slot survives.
let M = Map;
if (flag) M = {
  groupBy: 7,
  name: 'user'
};
const {
  name: nm,
  groupBy: method,
  at: other
} = M;
use(nm, method, other);