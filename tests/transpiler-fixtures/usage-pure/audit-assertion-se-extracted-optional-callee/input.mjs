// SE-extracted optional callee `(0, obj?.assertStr)(x)` - the call's runtime callee is the
// SequenceExpression's tail, which holds the optional segment. the optional-chain detection
// must walk into the SE tail so the assertion narrow still bails explicitly, rather than
// relying on a downstream shape check to bail accidentally
declare const obj: {
  assertStr(x: unknown): asserts x is string;
} | undefined;

function probe(input: unknown) {
  (0, obj?.assertStr)(input);
  return input.at(0);
}
