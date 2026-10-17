// `typeof x! === 'string'` - TS non-null assertion wrapper inside the typeof operand.
// the runtime-transparent peel strips TSNonNullExpression so the bare-Identifier match
// fires and the typeof guard narrows `x` to string in the truthy branch
function probe(x: unknown) {
  if (typeof x! === "string") {
    return x.at(0);
  }
  return null;
}
