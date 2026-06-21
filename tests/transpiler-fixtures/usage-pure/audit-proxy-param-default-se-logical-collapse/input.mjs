// A side-effect SequenceExpression wrapping a LOGICAL proxy-global param default
// (`= (effect(), globalThis.self.Array || Set)`) with a `...rest` sibling: the receiver survives as
// the param default, so each logical operand's proxy hop must be collapsed (`.self` dropped) like a
// non-SE logical default. without peeling the SE tail first, the default reads
// `_globalThis.self.Array` - undefined on a self-less realm - throwing before `||` short-circuits.
function effect() {}
function f({ from, ...rest } = (effect(), globalThis.self.Array || Set)) {
  return from([1]);
}
f();
