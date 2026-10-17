import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
let optionalNs = {
  Base: Boolean
};
if (c) optionalNs = {
  Base: Map
};
class OverOptional extends optionalNs?.Base {
  static go() {
    return super.groupBy([1], x => x);
  }
}
export { OverOptional };