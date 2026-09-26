import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// predicate call with SequenceExpression argument - `isArr(o, (0, v))`. arg-matching
// peels SE tail (last expression is the runtime value being passed; prefix runs for side
// effects only) to recover the Identifier binding. without peel, the arg-match bails on
// the non-Identifier SE shape and `x is unknown[]` never narrows v, degrading the
// array-specific `_atMaybeArray` to generic `_at`
function isArr(_opts: object, x: unknown): x is unknown[] {
  return Array.isArray(x);
}
function probe(v: unknown) {
  if (isArr({}, (0, v))) {
    return _atMaybeArray(v).call(v, 0);
  }
  return null;
}