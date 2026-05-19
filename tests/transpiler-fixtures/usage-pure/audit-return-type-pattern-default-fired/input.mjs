// pattern outer default fires when call site omits the arg:
// `function f({a} = {a: [1,2,3]})` called as `f()` extracts `a` from the default
// ObjectExpression on the AssignmentPattern's `right`. `resolvePatternParam` walks
// the keyPath against the params[i].right path via `resolveObjectMemberPath`.
// without this branch the no-arg destructure call falls through to null and the
// body type drops, sending `.at(0)` to the generic dispatch
function f({ a } = { a: [1, 2, 3] }) {
  return a;
}
f().at(0);
