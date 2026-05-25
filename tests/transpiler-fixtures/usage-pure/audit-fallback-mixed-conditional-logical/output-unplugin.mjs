import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// nested logical inside a conditional fallback: outer ConditionalExpression with one
// branch carrying a LogicalExpression. fallback-branch flatten recurses through both
// shapes uniformly, classifying each leaf identifier independently for per-branch deps
export const { from } = cond ? ({ from: _Array$from } || { from: _Iterator$from }) : (_Set ?? _Map);