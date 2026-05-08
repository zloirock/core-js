import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// nested logical inside a conditional fallback: outer ConditionalExpression with one
// branch carrying a LogicalExpression. flattenFallbackBranches recurses through both
// shapes uniformly, classifying each leaf identifier independently for per-branch deps
export const {
  from
} = cond ? Array || _Iterator : _Set ?? _Map;