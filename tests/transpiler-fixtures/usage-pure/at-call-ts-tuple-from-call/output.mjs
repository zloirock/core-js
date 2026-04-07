import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// regression: `const [a] = f()` used to collapse f's return type to the tuple's
// common element type, losing index-specific info. findExpressionAnnotation now
// handles CallExpression by pulling the callee's `returnType` annotation directly,
// so destructuring positions resolve against the tuple. expect `_atMaybeArray`.
function f(): [string[], number] {
  return [['a'], 1];
}
const [a, b] = f();
_atMaybeArray(a).call(a, 0);