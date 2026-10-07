import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// mixed LogicalExpression-inside-ConditionalExpression: `cond ? A : (B || C)`. inner `||`
// is a fallback shape via the fallback-branch slot collector's logical-expression branch;
// recursive walker descends through both ?:/|| forms; the mirrored `B` decides the inner `||`,
// so `C` is dead and drops with it
const {
  from
} = cond ? {
  from: _Array$from
} : {
  from: _Iterator$from
};
from([1, 2, 3]);