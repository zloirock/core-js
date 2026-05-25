import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Set from "@core-js/pure/actual/set/constructor";
// mixed LogicalExpression-inside-ConditionalExpression: `cond ? A : (B || C)`. inner `||`
// is a fallback shape via the fallback-branch slot collector's logical-expression branch;
// recursive walker descends through both ?:/|| forms so all three leaves register
const { from } = cond ? { from: _Array$from } : ({ from: _Iterator$from } || _Set);
from([1, 2, 3]);