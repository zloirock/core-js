import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the destructured rhs is a const-IDENTIFIER bound to an array literal, not the literal itself
// (`const arr = [Map]; const [A] = arr`). the receiver resolver follows the const binding to the
// underlying array so the element alias still resolves - in declarations AND in reassignments
const arr = [Map];
const [A] = arr;
A.groupBy([], x => x);
const brr = [Object];
let B;
[B] = brr;
B.fromEntries([["k", 1]]);