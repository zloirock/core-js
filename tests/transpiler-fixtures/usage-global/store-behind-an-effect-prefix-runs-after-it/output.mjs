import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// usage-global reads a leaf through a store behind an effect prefix to the constructor in the stored
// literal's slot and loads its static, for one extraction and for several
var one, two;
export const {
  C: {
    groupBy
  }
} = (setup(), one = {
  C: Map
});
export const {
  C: {
    from
  },
  D: {
    of
  }
} = (setup(), two = {
  C: Array,
  D: Array
});