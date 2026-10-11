import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
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
// an array level reached through a const alias of a selection the build decides reads the arm it always
// yields, as the selection spelled in place does - in a declaration and in an assignment
const pair = typeof Symbol != 'undefined' ? [Map] : [Object];
const [{
  groupBy
}] = pair;
const nested = typeof Symbol != 'undefined' && [{
  C: Array
}];
let of;
[{
  C: {
    of
  }
}] = nested;
export { groupBy, of };