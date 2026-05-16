import _Array$from from "@core-js/pure/actual/array/from";
// NEGATIVE: MemberExpression LHS `arg.foo = X` mutates a property on the param's
// value but the binding itself stays bound to the caller-arg. peel must fire (Result
// === Array, polyfill emitted). `walkPatternIdentifiers` has no MemberExpression case
// and falls through silently, so `patternBindsAnyParam` returns false correctly.
const Result = (arg => {
  arg.foo = 'tag';
  return arg;
})(Array);
const from = _Array$from;
from([1, 2]);