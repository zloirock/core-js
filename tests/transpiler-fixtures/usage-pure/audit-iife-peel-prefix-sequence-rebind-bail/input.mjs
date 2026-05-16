// SequenceExpression hides the param reassignment from a top-level shape-only check:
// the assignment lives in the SE's tail (`side(), arg = 'changed'`). similar shapes
// with BinaryExpression / LogicalExpression / ConditionalExpression wrappers all reach
// here. peelZeroArgIifeReturn must walk descendants so the rebind is detected and the
// peel bails (runtime value of Result is 'changed', not Array).
const Result = (arg => {
  side(), arg = 'changed';
  return arg;
})(Array);
const { from } = Result;
from([1, 2]);
