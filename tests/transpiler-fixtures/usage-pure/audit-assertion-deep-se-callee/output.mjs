import _at from "@core-js/pure/actual/instance/at";
// nested SE-extracted callee `(0, (1, obj?.assertStr))(x)`. the call's runtime callee
// is the OUTER SE's tail = inner SE = `obj?.assertStr` (optional). hasOptionalChainInCall
// walks SE.tail recursively to reach the optional segment. without the SE walk the
// extracted shape would slip past optional-bail and grant unsound narrowing
declare const obj: {
  assertStr(x: unknown): asserts x is string;
} | undefined;
function probe(input: unknown) {
  (0, 1, obj?.assertStr)(input);
  return _at(input).call(input, 0);
}