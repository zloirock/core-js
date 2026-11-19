import _Array$from from "@core-js/pure/actual/array/from";
// delete and update target operands embedded in a destructure init - verify SE
// classification consistency: delete is SE per ALWAYS_EFFECTFUL_TYPES (UnaryExpression
// with operator 'delete'), update is SE per UpdateExpression. nested into SequenceExpression
// preceding receiver - synth-swap should preserve SE prefix and rewrite tail Array.
function f({
  from
} = (delete x.y, {
  from: _Array$from
})) {
  return from;
}
function g({
  at
} = (++counter, Array)) {
  return at;
}
f();
g();