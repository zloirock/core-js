// ParenthesizedExpression wrap around the reassignment is babel-stripped at parse but
// oxc preserves it. without descent through wrappers, the unplugin pipeline would see
// `ParenthesizedExpression` at top and skip the AssignmentExpression check, lifting
// `arg` as if `Result === Array` while runtime gives 'changed'. recursive walk descends
// into `.expression` slot uniformly with TS expression wrappers / ChainExpression.
const Result = (arg => {
  arg = 'changed';
  return arg;
})(Array);
const {
  from
} = Result;
from([1, 2]);