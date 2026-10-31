import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A nested assignment reads its uncertain slot before assigning the extracted static.
// The later computed property may win, so the runtime receiver selects the static.
function read(key) {
  const ns = {
    Q: Array,
    [key]: Map
  };
  let method;
  ({
    Q: {
      of: method
    }
  } = ns);
  return method;
}