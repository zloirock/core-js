// `((assertString as any)?.(x))` - outer paren wraps an optional call expression.
// hasOptionalChainInCall must peel Paren + TS wrappers (TSAsExpression etc.) to reach
// the inner ChainExpression / OptionalCallExpression. without the peel, the optional
// chain signal is lost and `asserts x is string` narrowing applies even though the
// callee may be null/undefined at runtime (and the assertion would then be skipped).
// guard suppression yields the unknown-receiver `.at()` polyfill, NOT the string-specific one
function assertString(x: unknown): asserts x is string {}
function probe(x: unknown) {
  ((assertString as any)?.(x));
  return x.at(0);
}
