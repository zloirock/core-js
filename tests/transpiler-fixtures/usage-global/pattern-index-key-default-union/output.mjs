import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an object pattern spelling an ARRAY index (`{ 0: w = ... }`) pairs the element under it, beside the
// slot default: a read of the reassigned binding reaches both - the element's `Object` and the
// default's `Map` - however many earlier questions asked about the same write without folding its key
let w = {
  k: Object
};
({
  0: w = {
    k: Map
  }
} = [{
  k: Object
}]);
const {
  k: {
    groupBy: g
  }
} = w;
export const grouped = g(src, x => x);