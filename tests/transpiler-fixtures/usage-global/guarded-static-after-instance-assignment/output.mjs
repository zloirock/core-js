import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.function.name";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A guarded static follows the earlier instance write in a discarded assignment.
// The native sibling retains its source slot; user getters read in property order.
// Global mode keeps the source pattern and supplies its imports.
let M = Map;
if (flag) M = supplied;
let nm, method, other;
({
  name: nm,
  groupBy: method,
  at: other
} = M);
use(nm, method, other);