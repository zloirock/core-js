import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Replacing an object slot invalidates its initial constructor for a later nested read.
const objectSlotReplaced = function () {
  const w = {
    k: Object
  };
  w.k = Map;
  const {
    k: {
      groupBy
    }
  } = w;
  return groupBy;
}();
export { objectSlotReplaced };