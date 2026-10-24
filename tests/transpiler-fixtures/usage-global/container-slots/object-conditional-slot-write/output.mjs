import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The closed truthy caller makes the slot write replace Object with Map before the read.
const conditionalSlotWrite = function (flag) {
  const maybe = {
    k: Object
  };
  if (flag) maybe.k = Map;
  const {
    k: {
      entries
    }
  } = maybe;
  return entries;
}(1);
export { conditionalSlotWrite };