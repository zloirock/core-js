// the IIFE arrow body is a nested logical whose leftmost operand is parenthesized in source
// (`(globalThis || x) || y`): the realm leftmost is always truthy, so every right arm is dead and the
// body collapses to the mirrored object, parenthesised at the body start on both emitters
function f({ Array: { from } } = (() => (globalThis || x) || y)()) {
  return from;
}
f();
