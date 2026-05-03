import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `typeof (x satisfies unknown) === 'string'` - TSSatisfiesExpression wrapper inside
// typeof operand. peeled by `unwrapRuntimeExpr` symmetric with TS-as cast and non-null
// assertion. confirms uniform TS-wrapper handling across all three TS expression forms
function probe(x: unknown) {
  if (typeof (x satisfies unknown) === "string") {
    return _atMaybeString(x).call(x, 0);
  }
  return null;
}