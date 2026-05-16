// pattern-LHS reassignment of the IIFE param (`[arg] = ['otherValue']`) replaces the
// caller-provided binding before `return arg;`. peelZeroArgIifeReturn must NOT lift
// the body to the caller-arg, otherwise downstream sees `Result = Array` and rewrites
// `Result.from` to the polyfill while the runtime value is actually `'otherValue'`.
// covers ArrayPattern / ObjectPattern / RestElement on the assignment LHS.
const Result = (arg => {
  [arg] = ['otherValue'];
  return arg;
})(Array);
const { from } = Result;
from([1, 2]);
