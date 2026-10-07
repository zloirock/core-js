import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// nested logical inside a conditional fallback: outer ConditionalExpression with one
// branch carrying a LogicalExpression. fallback-branch flatten recurses through both
// shapes uniformly, classifying each leaf identifier independently for per-branch deps;
// a `||` / `??` whose left always decides takes no dep for its dead right, which drops
export const {
  from
} = cond ? {
  from: _Array$from
} : _Set;