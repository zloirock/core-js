import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an identity self-assign (`M = M`) writes the alias's own value back and is a no-op for every
// flow-sensitive walk - for a PATTERN-bound alias exactly as for a plain declarator, so the static
// folds instead of falling to the runtime guard. the name the write is compared against is the
// binding's, which a pattern declarator does not spell in its id
let {
  Map: M
} = globalThis;
M = M;
export const viaObject = M.groupBy(list, fn);
let [A] = [globalThis.Array];
A = A;
export const viaArray = A.from([1]);