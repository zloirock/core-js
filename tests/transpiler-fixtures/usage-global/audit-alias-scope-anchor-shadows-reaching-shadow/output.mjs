import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a dead-init reaching value (unconditional overwrite before a closure read) resolves in the
// binding's scope too
let reaching = Object;
reaching = Map;
export function reachingShadow(Map) {
  return () => reaching.groupBy([4], v => v);
}