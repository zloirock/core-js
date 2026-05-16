// ObjectPattern with rename `({x: arg} = ...)` reassigns the param via destructure.
// distinct AST shape from `[arg] = ...` - `walkPatternIdentifiers` must descend through
// ObjectPattern.properties[].value to reach the `arg` binding. shorthand `{arg}` and
// nested object patterns walk the same path.
const Result = (arg => {
  ({
    x: arg
  } = {
    x: 'otherValue'
  });
  return arg;
})(Array);
const {
  from
} = Result;
from([1, 2]);