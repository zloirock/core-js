// mixed LogicalExpression-inside-ConditionalExpression: `cond ? A : (B || C)`. inner `||`
// is a fallback shape via the fallback-branch slot collector's logical-expression branch;
// recursive walker descends through both ?:/|| forms so all three leaves register
const { from } = cond ? Array : (Iterator || Set);
from([1, 2, 3]);
