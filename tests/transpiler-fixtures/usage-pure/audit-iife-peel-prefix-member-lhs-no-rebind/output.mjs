import _Array$from from "@core-js/pure/actual/array/from";
// NEGATIVE: MemberExpression LHS `arg.foo = X` mutates a property on the param's
// value but the binding itself stays bound to the caller-arg. peel must fire (Result
// === Array, polyfill emitted). a member-write binds no pattern identifier, so the
// param-rebind scan finds no rebind and treats the binding as unmutated.
const Result = (arg => {
  arg.foo = 'tag';
  return arg;
})(Array);
const from = _Array$from;
from([1, 2]);