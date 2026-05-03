import _at from "@core-js/pure/actual/instance/at";
// optional-call assertion `obj.assertStr?.(input)` does NOT narrow `input` in TS: when
// `obj` is null/undefined the call is skipped, the assertion never executes, and the
// binding stays at its declared type. parseAssertionStatementGuard bails on any optional
// chain in the call expression (ChainExpression wrapper / OptionalCallExpression /
// OptionalMemberExpression), so the post-statement `.at(0)` falls back to the generic
// `_at` polyfill instead of the unsound string-flavored narrow
declare const obj: {
  assertStr?(x: unknown): asserts x is string;
};
function take(input: unknown) {
  obj.assertStr?.(input);
  return _at(input).call(input, 0);
}