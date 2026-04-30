// non-null assertion `x!` is a TSNonNullExpression wrapper around the bare Identifier;
// runtime passes `x` itself, so the assertion narrows the underlying binding. parser
// emits `TSNonNullExpression > Identifier`, `unwrapRuntimeExpr` peels it before the
// binding-name check
function assertString(x: unknown): asserts x is string {}
function probe(x: unknown) {
  assertString(x!);
  return x.at(0);
}
