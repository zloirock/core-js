import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Map.counter++ — the member is UpdateExpression target. Should NOT mark as usage
// of Map.counter (read-only polyfill semantics), but the Map constructor itself is
// still a live reference — need its constructor polyfill.
Map.counter++;