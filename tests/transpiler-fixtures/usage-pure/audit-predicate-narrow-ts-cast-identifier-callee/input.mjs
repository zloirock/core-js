// `(isArr as any)(v)` - TS cast wraps the Identifier callee. predicateCandidates must
// peel the raw callee through `unwrapRuntimeExpr` for parity with the Member-branch peel,
// otherwise the Identifier-branch bails on the non-Identifier raw shape and the predicate's
// `x is unknown[]` return type never narrows v. without the peel, the array-specific
// `_atMaybeArray` would degrade to the generic `_at` dispatch
function isArr(x: unknown): x is unknown[] {
  return Array.isArray(x);
}
function probe(v: unknown) {
  if ((isArr as any)(v)) {
    return v.at(0);
  }
  return null;
}
