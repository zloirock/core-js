import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `(0, isArr)(v)` - SequenceExpression callee with Identifier as last element. predicate
// candidate resolution peels through SE-tail (last expression is the runtime callee, the
// prefix runs for its side effects but doesn't change which function gets invoked) to
// recover the trailing Identifier predicate. without the SE peel, the Identifier-branch
// bails on the non-Identifier raw shape and `x is unknown[]` never narrows v, degrading
// the array-specific `_atMaybeArray` to the generic `_at` dispatch
function isArr(x: unknown): x is unknown[] {
  return Array.isArray(x);
}
function probe(v: unknown) {
  if ((0, isArr)(v)) {
    return _atMaybeArray(v).call(v, 0);
  }
  return null;
}