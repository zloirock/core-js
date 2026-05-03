// `typeof (x satisfies unknown) === 'string'` - TSSatisfiesExpression wrapper inside
// typeof operand. peeled by `unwrapRuntimeExpr` symmetric with TS-as cast and non-null
// assertion. confirms uniform TS-wrapper handling across all three TS expression forms
function probe(x: unknown) {
  if (typeof (x satisfies unknown) === "string") {
    return x.at(0);
  }
  return null;
}
