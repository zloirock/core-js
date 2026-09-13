import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An unknown later key may replace the named Array slot with Map. The possible Array
// static still needs its polyfill, while a read from the overriding value stays intact.
function read(key) {
  const ns = {
    Q: Array,
    [key]: Map
  };
  const {
    Q: {
      of: method
    }
  } = ns;
  return method;
}
export const kinds = [typeof read('other'), typeof read('Q')];