// mixed LogicalExpression-inside-ConditionalExpression: `cond ? A : (B || C)`. inner `||`
// is a fallback shape via the fallback-branch slot collector's logical-expression branch;
// recursive walker descends through both ?:/|| forms; the mirrored `B` decides the inner `||`,
// so `C` is dead and drops with it
const { from } = cond ? Array : (Iterator || Set);
from([1, 2, 3]);
