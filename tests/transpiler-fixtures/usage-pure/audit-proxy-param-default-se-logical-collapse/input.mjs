// A side-effect SequenceExpression wrapping a LOGICAL proxy-global param default
// (`= (effect(), globalThis.self.Array || Set)`) with a `...rest` sibling: the receiver survives as
// the param default, so each logical operand's proxy hop must be collapsed (`.self` dropped) the
// same way a non-SE logical default is. without peeling the SE tail before the logical check, the
// surviving default reads `_globalThis.self.Array` - undefined on a self-less realm (ie:11 / Node),
// throwing BEFORE the `||` can short-circuit. the SE prefix `effect()` is preserved
function effect() {}
function f({ from, ...rest } = (effect(), globalThis.self.Array || Set)) {
  return from([1]);
}
f();
