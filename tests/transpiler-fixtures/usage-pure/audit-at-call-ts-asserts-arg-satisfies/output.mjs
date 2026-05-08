import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `x satisfies T` is a TSSatisfiesExpression wrapper  -  runtime no-op forwarding `x`.
// like `x as T` and `x!`, the assertion narrows the underlying binding regardless of
// the cast wrapper. parity with binary/typeof guards which already use unwrapRuntimeExpr
function assertString(x: unknown): asserts x is string {}
function probe(x: unknown) {
  assertString(x satisfies unknown);
  return _atMaybeString(x).call(x, 0);
}