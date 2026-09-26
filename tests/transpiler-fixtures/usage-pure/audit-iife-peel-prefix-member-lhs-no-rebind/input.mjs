// NEGATIVE: MemberExpression LHS `arg.foo = X` mutates a property on the param's
// value but the binding itself stays bound to the caller-arg. peel must fire (Result
// === Array, polyfill emitted). a member-write binds no pattern identifier, so the
// param-rebind scan finds no rebind and treats the binding as unmutated.
const Result = (arg => {
  arg.foo = 'tag';
  return arg;
})(Array);
const { from } = Result;
from([1, 2]);
