import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `(0, isArr)(v)` - SequenceExpression callee with Identifier as last element. predicate
// resolution must peel the SE tail (the last expression is the runtime callee; the prefix
// runs for side effects only) to recover the trailing Identifier predicate. without that peel,
// `x is unknown[]` never narrows v and the array-specific `_atMaybeArray` degrades to `_at`.
function isArr(x: unknown): x is unknown[] {
  return Array.isArray(x);
}
function probe(v: unknown) {
  if ((0, isArr)(v)) {
    return _atMaybeArray(v).call(v, 0);
  }
  return null;
}