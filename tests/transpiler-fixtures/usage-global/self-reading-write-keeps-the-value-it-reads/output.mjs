import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a write whose value reads the alias itself - a fallback over it, a nullish fallback, a selection keeping it - may
// store the value the alias already held, so that value still reaches the static read after it: the read is served
// for the constructor the alias was declared with beside the fallback. the write runs after the read in its own
// value and overwrites nothing of what came before it
let P = Promise;
P = P || legacyP;
export const resolved = P.resolve(1);
let M = Map;
M = M ?? legacyM;
export const grouped = M.groupBy(list, key);
let A = Array;
A = flag ? legacyA : A;
export const made = A.from(list);