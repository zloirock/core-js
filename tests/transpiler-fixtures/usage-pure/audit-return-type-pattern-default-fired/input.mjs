// pattern outer default fires when the call omits the arg:
// `function f({a} = {a: [1,2,3]})` called as `f()` extracts `a` from the default
// ObjectExpression on the AssignmentPattern's `right`, walking the key path against
// it. without this branch the no-arg destructure call resolves to null, the body
// type drops, and `.at(0)` falls to generic dispatch.
function f({ a } = { a: [1, 2, 3] }) {
  return a;
}
f().at(0);
