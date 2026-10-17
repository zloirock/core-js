import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A fully consumed destructuring ASSIGNMENT whose init is a realm read under an effectful KEY: this method
// rewrites no init, so each read and its key's effect stay where the source wrote them, and every static
// the rows read keeps its module.
let c = 0;
let of, fromEntries, groupBy;
({
  of
} = globalThis[c++, 'Array']);
({
  fromEntries
} = globalThis[c++, 'Object']);
({
  groupBy
} = globalThis[c++, 'Map']);
export { of, fromEntries, groupBy, c };