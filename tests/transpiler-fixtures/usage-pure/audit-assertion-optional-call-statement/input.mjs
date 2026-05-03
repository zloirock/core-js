// optional-call assertion `assertArr?.(x)` does not narrow x: when assertArr resolves
// to nullish, the assertion is skipped and x retains its declared `unknown`. After
// parseAssertionStatementGuard bails on the optional chain, `.at(0)` falls back to the
// generic `_at` polyfill instead of the unsound `_atMaybeArray` narrow that would crash
// on a non-array runtime value
declare function assertArr(x: unknown): asserts x is number[];
function consume(x: unknown) {
  assertArr?.(x);
  x.at(0);
}
consume([1, 2]);
