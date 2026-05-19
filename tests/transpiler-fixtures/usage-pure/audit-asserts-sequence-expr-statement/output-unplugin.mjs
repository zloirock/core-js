import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `(sideEffect(), assertString(x))` as an ExpressionStatement: the SequenceExpression's
// tail IS the asserting call - `asserts x is string` narrowing must still apply to `x`
// from this point forward. parseAssertionStatementGuard must peel SequenceExpression
// tail (symmetry with hasOptionalChainInCall's SE walk) before checking CallExpression.
// `.at()` on the narrowed string picks the string-specific polyfill
declare function sideEffect(): void;
function assertString(x: unknown): asserts x is string {}
function probe(x: unknown) {
  (sideEffect(), assertString(x));
  return _atMaybeString(x).call(x, 0);
}