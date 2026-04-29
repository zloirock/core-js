import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// two distinct functions with the SAME receiver-name + SAME destructure shape - each
// AssignmentPattern node is a separate AST node with its own identity, so per-node
// state (synth-swap WeakMap) must isolate them. f's `Array` and g's `Array` are different
// AssignmentPattern.right Identifier nodes; both must independently resolve and emit
// synth-literal swap, no cross-leak via shared WeakMap key
function f({
  from
} = {
  from: _Array$from
}) {
  return from([1]);
}
function g({
  from
} = {
  from: _Array$from
}) {
  return from([2]);
}
_globalThis.__call = () => [f(), g()];