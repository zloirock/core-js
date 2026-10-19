// `((assertString as any)?.(x))` - an outer paren wraps an optional call expression. the
// optional-chain detection must peel Paren + TS wrappers (TSAsExpression etc.) to reach the
// inner ChainExpression / OptionalCallExpression; otherwise the optional signal is lost and
// `asserts x is string` narrowing applies even though the callee may be nullish at runtime
// and the assertion skipped. the guard must suppress, yielding the unknown-receiver `.at()`
function assertString(x: unknown): asserts x is string {}
function probe(x: unknown) {
  ((assertString as any)?.(x));
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return x.at(0);
}
