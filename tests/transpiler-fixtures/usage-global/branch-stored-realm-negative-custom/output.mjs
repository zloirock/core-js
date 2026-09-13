import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A stored realm in one arm does not turn the other arm into a realm.
// Provide Map for the realm while retaining the custom constructor and the store.
export function read(Custom, flag) {
  const custom = {
    Map: Custom
  };
  let held;
  return (flag ? held = globalThis : custom).Map;
}