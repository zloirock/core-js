// the IIFE arrow body is a nested logical whose leftmost operand is parenthesized in source and whose
// right arms run effects (`(globalThis || g()) || h()`): the logical stays, the mirrored object at
// the deepest left is protected at the body start on both emitters - babel reprints the source paren
// away and parenthesises the object, the unplugin splice keeps the source paren around it
function f({ Array: { from } } = (() => (globalThis || g()) || h())()) {
  return from;
}
f();
