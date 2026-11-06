// nested SE-extracted callee `(0, (1, obj?.assertStr))(x)`. the call's runtime callee
// is the OUTER SE's tail = inner SE = `obj?.assertStr` (optional). hasOptionalChainInCall
// walks SE.tail recursively to reach the optional segment. without the SE walk the
// extracted shape would slip past optional-bail and grant unsound narrowing
declare const obj: {
  assertStr(x: unknown): asserts x is string;
} | undefined;

function probe(input: unknown) {
  // @ts-expect-error an assertion called through a non-identifier callee is the shape under test
  (0, (1, obj?.assertStr))(input);
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return input.at(0);
}
