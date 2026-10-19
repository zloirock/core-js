import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `typeof (x satisfies unknown) === 'string'` - TSSatisfiesExpression wrapper inside
// typeof operand. peeled symmetrically with TS-as cast and non-null assertion. confirms
// uniform TS-wrapper handling across all three TS expression forms
function probe(x: unknown) {
  if (typeof (x satisfies unknown) === "string") {
    // @ts-expect-error a runtime guard narrows the receiver where tsc does not, and the read sees the runtime value
    return _atMaybeString(x).call(x, 0);
  }
  return null;
}