// negative case: prefix statement REASSIGNS the param. `arg = otherFn();` rebinds arg
// before `return arg;`, so identity peel would incorrectly lift Array as the value
// (runtime returns otherFn()'s result instead). `bodyPrefixReassignsParams` catches the
// Identifier-left AssignmentExpression and bails the peel. `Result` stays unresolved,
// no over-emission. regression guard for the SE-prefix branch.
const Result = (arg => {
  arg = otherFn();
  return arg;
})(Array);
const {
  from
} = Result;
from([1, 2]);