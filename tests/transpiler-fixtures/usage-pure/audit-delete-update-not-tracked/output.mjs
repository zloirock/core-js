import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// delete and update target operands embedded in a destructure init - verify SE
// classification consistency: delete is SE per ALWAYS_EFFECTFUL_TYPES (UnaryExpression
// with operator 'delete'), update is SE per UpdateExpression. nested into SequenceExpression
// preceding receiver - synth-swap should preserve SE prefix and rewrite tail Array.
const x = {
  y: true
};
let counter = 0;
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
function withStatic({
  of
} = (++counter, {
  of: _Array$of
})) {
  return of(3);
}
export const result = [typeof f(), 'y' in x, typeof g(), withStatic(), counter];