import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.function.name";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Global presence guard; the pure twin exercises receiver capture.
// A retained instance capture keeps the constructor guard of its later static sibling.
// A supplied object keeps its own getters and values in source property order.
const log = [];
let M = Map;
if (supplied) M = {
  get name() {
    log.push('name');
    return 'user';
  },
  get groupBy() {
    log.push('groupBy');
    return 7;
  },
  get at() {
    log.push('at');
    return 8;
  }
};
let nm, method, other;
({
  at: other,
  name: nm,
  groupBy: method
} = M);
use(nm, method, other, log);