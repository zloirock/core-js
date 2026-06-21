import _Array$from from "@core-js/pure/actual/array/from";
// NEGATIVE: nested ArrowFunctionExpression carrying `arg = X` in its body is created
// but never invoked - no runtime rebind happens to the outer param. peel must still fire
// (Result === Array, polyfill correctly emitted). the rebind scan must not descend into
// a nested function body, so the inner arrow's assignment isn't a false-positive rebind.
const Result = (arg => {
  () => arg = 'never-runs';
  return arg;
})(Array);
const from = _Array$from;
from([1, 2]);