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
// A detached static guard follows a native slot in a discarded assignment.
// Getter reads and the earlier instance write retain their source positions.
// Global mode keeps the source pattern and supplies its imports.
const events = [];
let M = Map;
if (flag) M = {
  get name() {
    events.push('name');
    return 'user';
  },
  get groupBy() {
    events.push('groupBy');
    return 7;
  },
  get at() {
    events.push('at');
    return 8;
  }
};
let nm, method, other;
({
  name: nm,
  at: other,
  groupBy: method
} = M);
use(nm, method, other, events);