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
// a binding declared by destructuring an element / value that IS a built-in (`const [A] = [Map]`,
// `const { y: B } = { y: Object }`) aliases that built-in, so usage-global injects the static the
// binding calls - the receiver resolver follows the paired literal slot, like a direct `const A = Map`
const [A] = [Map];
A.groupBy([], x => x);
const {
  y: B
} = {
  y: Object
};
B.fromEntries([["k", 1]]);