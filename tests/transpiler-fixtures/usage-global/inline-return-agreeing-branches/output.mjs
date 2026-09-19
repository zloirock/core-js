import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Every branch returns the same free constructor. Keep branch effects and inject its static.
export const value = (() => {
  const local = flag;
  if (local) {
    observe('yes');
    return Map;
  }
  observe('no');
  return Map;
})().groupBy([1, 2], value => value % 2);