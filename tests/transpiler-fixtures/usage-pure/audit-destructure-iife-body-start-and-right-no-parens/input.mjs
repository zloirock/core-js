// boundary companion to the `||` body-start case: with `&&` only the RIGHT operand is a mirrored
// value leaf and it sits AFTER `<gate> &&`, never at the arrow's expression-body start - so the
// spliced object literal needs NO parens (the `=> {` block hazard cannot arise here), unlike the
// `||` form whose leftmost operand does land at body-start
function f({ Array: { from } } = (() => globalThis && self)()) {
  return from;
}
f();
