import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// two distinct functions with the SAME receiver-name + SAME destructure shape - each
// default-value-param node is a separate AST node with its own identity, so per-node
// receiver-rewrite state must isolate them. f's `Array` and g's `Array` are different
// default-value-param right-side identifier nodes; both must independently resolve and
// emit the synthetic literal, with no cross-leak through any shared per-node state
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