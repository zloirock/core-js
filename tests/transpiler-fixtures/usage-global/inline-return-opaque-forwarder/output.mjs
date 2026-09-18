import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A transparent forwarder does not make the inner loop's return attributable.
// Keep the namespace needed by the unresolved static read after both calls.
function inner() {
  while (flag) return Map;
  return custom;
}
function outer() {
  return inner();
}
export const value = outer().groupBy([1, 2, 3], value => value % 2);