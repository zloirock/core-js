import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `x satisfies T` is a TSSatisfiesExpression wrapper  -  runtime no-op forwarding `x`.
// like `x as T` and `x!`, the assertion narrows the underlying binding regardless of
// the cast wrapper. parity with binary/typeof guards which peel TS wrappers identically
function assertString(x: unknown): asserts x is string {}
function probe(x: unknown) {
  assertString(x satisfies unknown);
  // @ts-expect-error a runtime guard narrows the receiver where tsc does not, and the read sees the runtime value
  return _atMaybeString(x).call(x, 0);
}