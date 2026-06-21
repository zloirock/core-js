// RestElement `[...arg] = X` binds arg to the rest-array of X. distinct from plain
// array binding `[arg]` - the rebind scan must handle the RestElement / SpreadElement
// case (oxc emits SpreadElement inside ArrayPattern in some shapes, both peel to
// `.argument`) and bail the peel.
const Result = (arg => {
  [...arg] = [1, 2];
  return arg;
})(Array);
const {
  from
} = Result;
from([1, 2]);