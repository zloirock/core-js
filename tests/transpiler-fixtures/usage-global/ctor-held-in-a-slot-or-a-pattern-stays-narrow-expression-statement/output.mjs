import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A constructor a value position STORES rather than hands out: a write puts it inside the receiver, and an argument landing in a
// destructuring parameter of a callee spelled inline binds the slots the pattern names.
const held = {
  k: Object
};
held.k = Map;
use(new held.k());