import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The alias holds the container identity, so it observes the later slot replacement.
// Following that alias must consult the original container's writes before peeling.
const holder = {
  value: Object
};
const alias = holder;
holder.value = Map;
export const {
  value: {
    groupBy
  }
} = alias;