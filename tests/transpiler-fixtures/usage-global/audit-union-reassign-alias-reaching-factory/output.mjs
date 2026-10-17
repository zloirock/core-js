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
// an Identifier receiver reassigned to hold another alias (`M = M0`, not a declarator init) reaches
// BOTH of M0's branches: the declared `Object` (c-false) and the reassigned `Map` (c-true). `.groupBy`
// exists on both, so `M.groupBy` injects es.object.group-by AND es.map.group-by - every binding channel
// (const init, plain reassign, pattern-LHS) preserves both the declared value and the reassignments
let M0 = Object;
if (c) M0 = Map;
let M;
M = M0;
M.groupBy(items, cb);