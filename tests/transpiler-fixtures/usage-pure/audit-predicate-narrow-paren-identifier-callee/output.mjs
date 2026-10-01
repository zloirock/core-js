import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `(isArr)(v)` - bare paren-wrapped Identifier callee (no TS cast). predicateCandidates must
// peel ParenthesizedExpression / TSParenthesizedType wrappers off the raw callee the same way
// it peels the TS-cast variant, otherwise the Identifier-branch bails and the predicate's
// `x is unknown[]` return type never reaches the narrow path - the array-specific
// `_atMaybeArray` would degrade to the generic `_at` dispatch
function isArr(x: unknown): x is unknown[] {
  return Array.isArray(x);
}
function probe(v: unknown) {
  if (isArr(v)) {
    return _atMaybeArray(v).call(v, 0);
  }
  return null;
}