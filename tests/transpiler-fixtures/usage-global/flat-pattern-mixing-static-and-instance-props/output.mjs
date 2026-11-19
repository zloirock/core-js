import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.function.name";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a flat pattern holding a static beside a prop that resolves as an instance member of the same
// constructor: both kinds must contribute their module, whichever path renders the pattern
const src = Array;
const {
  of,
  name
} = src;
const {
  groupBy
} = Map;
const {
  fromEntries
} = Object;
console.log(of, name, groupBy, fromEntries);