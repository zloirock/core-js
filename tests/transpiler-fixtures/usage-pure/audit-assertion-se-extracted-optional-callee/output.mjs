import _at from "@core-js/pure/actual/instance/at";
// SE-extracted optional callee `(0, obj?.assertStr)(x)` - the call's runtime callee is
// the SequenceExpression's tail. `hasOptionalChainInCall` walks SE.tail so the optional
// segment in the tail still bails the assertion narrow. without the SE walk the bail was
// merely accidental (downstream resolver strict-checks the shape) - now explicit
declare const obj: {
  assertStr(x: unknown): asserts x is string;
} | undefined;
function probe(input: unknown) {
  (0, obj?.assertStr)(input);
  return _at(input).call(input, 0);
}