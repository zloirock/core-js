import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The uncertain nested receiver needs a private capture. Exported destructuring exposes
// only the source binding, while its guard still preserves an overriding constructor.
const ns = {
  Q: Array,
  [key]: Map
};
export const {
  Q: {
    of: method
  }
} = ns;