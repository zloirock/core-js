import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `asserts x is string` invoked with a TS-cast argument: `assertString(x as any)`.
// TSAsExpression wraps the bare Identifier but at runtime the underlying binding `x`
// is still passed, so the assertion narrows it the same as without the cast
function assertString(x: unknown): asserts x is string {}
function probe(x: unknown) {
  assertString(x as any);
  return _atMaybeString(x).call(x, 0);
}