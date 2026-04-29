// two distinct functions with the SAME receiver-name + SAME destructure shape - each
// AssignmentPattern node is a separate AST node with its own identity, so per-node
// state (synth-swap WeakMap) must isolate them. f's `Array` and g's `Array` are different
// AssignmentPattern.right Identifier nodes; both must independently resolve and emit
// synth-literal swap, no cross-leak via shared WeakMap key
function f({ from } = Array) {
  return from([1]);
}
function g({ from } = Array) {
  return from([2]);
}
globalThis.__call = () => [f(), g()];
