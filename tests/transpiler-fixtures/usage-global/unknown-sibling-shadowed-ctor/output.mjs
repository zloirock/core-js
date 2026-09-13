import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The slot captured the realm's Array before entering the inner scope. Its uncertain
// read must compare against that constructor even when the local Array name holds Map.
function read(key) {
  const ns = {
    Q: Array,
    [key]: Map
  };
  return function capture(Array) {
    const {
      Q: {
        of: method
      }
    } = ns;
    return [method, Array];
  }(Map);
}
export const kinds = [typeof read('other')[0], typeof read('Q')[0]];