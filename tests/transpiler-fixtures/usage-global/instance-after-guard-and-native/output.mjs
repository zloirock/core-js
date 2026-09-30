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
// An instance read after a guarded static retains the intervening native read.
// Capturing after the detached guard keeps every binding exactly once.
let M = Map;
if (flag) M = {
  name: 'user',
  at: 8,
  groupBy: 7
};
const {
  groupBy: method,
  at: other,
  name: nm
} = M;
use(method, other, nm);