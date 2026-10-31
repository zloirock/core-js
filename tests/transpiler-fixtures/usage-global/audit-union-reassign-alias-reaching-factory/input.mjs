// an Identifier receiver reassigned to hold another alias (`M = M0`, not a declarator init) reaches
// BOTH of M0's branches: the declared `Object` (c-false) and the reassigned `Map` (c-true). `.groupBy`
// exists on both, so `M.groupBy` injects es.object.group-by AND es.map.group-by - every binding channel
// (const init, plain reassign, pattern-LHS) preserves both the declared value and the reassignments
let M0 = Object;
if (c) M0 = Map;
let M;
M = M0;
M.groupBy(items, cb);
