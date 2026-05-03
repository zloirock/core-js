import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `typeof x! === 'string'` - TS non-null assertion wrapper inside the typeof operand.
// `unwrapRuntimeExpr` strips TSNonNullExpression so the bare-Identifier match fires and
// the typeof guard narrows `x` to string in the truthy branch
function probe(x: unknown) {
  if (typeof x! === "string") {
    return _atMaybeString(x).call(x, 0);
  }
  return null;
}