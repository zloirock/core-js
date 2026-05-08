import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// three-level deeply nested conditional fallback receiver: each branch reaches its own
// constructor. flattenFallbackBranches recurses through nested ConditionalExpression both
// in consequent and alternate, collecting metas from all four leaves: Array, Map, Set,
// Iterator. usage-global enumerates each branch's polyfill dependency separately
export const {
  from
} = cond1 ? cond2 ? Array : _Map : cond3 ? _Set : _Iterator;