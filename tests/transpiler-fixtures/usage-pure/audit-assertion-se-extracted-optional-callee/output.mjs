import _at from "@core-js/pure/actual/instance/at";
// SE-extracted optional callee `(0, obj?.assertStr)(x)` - the call's runtime callee is the
// SequenceExpression's tail, which holds the optional segment. the optional-chain detection
// must walk into the SE tail so the assertion narrow still bails explicitly, rather than
// relying on a downstream shape check to bail accidentally
declare const obj: {
  assertStr(x: unknown): asserts x is string;
} | undefined;
function probe(input: unknown) {
  // @ts-expect-error an assertion called through a non-identifier callee is the shape under test
  (0, obj?.assertStr)(input);
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return _at(input).call(input, 0);
}