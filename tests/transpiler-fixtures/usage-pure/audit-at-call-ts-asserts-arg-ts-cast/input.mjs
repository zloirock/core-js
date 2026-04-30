// assertion-statement guard with TS-cast wrapped argument: `assertString(x as any)` /
// `assertString(x!)` / `assertString(x satisfies unknown)`. the assertion still narrows
// the underlying binding `x` regardless of cast wrappers — parser sees TSAsExpression /
// TSNonNullExpression / TSSatisfiesExpression around the bare Identifier, but the
// runtime call passes `x` itself. without `unwrapRuntimeExpr` peeling, the guard fails
// to match the binding name and falls back to generic `_at`
function assertString(x: unknown): asserts x is string {}
function probe(x: unknown) {
  assertString(x as any);
  return x.at(0);
}
