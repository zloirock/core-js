import _at from "@core-js/pure/actual/instance/at";
// `((assertString as any)?.(x))` - an outer paren wraps an optional call expression. the
// optional-chain detection must peel Paren + TS wrappers (TSAsExpression etc.) to reach the
// inner ChainExpression / OptionalCallExpression; otherwise the optional signal is lost and
// `asserts x is string` narrowing applies even though the callee may be nullish at runtime
// and the assertion skipped. the guard must suppress, yielding the unknown-receiver `.at()`
function assertString(x: unknown): asserts x is string {}
function probe(x: unknown) {
  ((assertString as any)?.(x));
  return _at(x).call(x, 0);
}