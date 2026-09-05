// An optional polyfilled call with a NON-optional member tail, sitting under an operator, must
// wrap the guard ternary across the whole chain INCLUDING the tail so the operator binds the
// guarded value (`(a?.at(-1).x) ** 2`), not just the tail (`a?.at(-1).x ** 2`, which would apply
// the operator to the success branch only and leave the null path unsquared / mis-grouped). the
// trailing member sits under its ChainExpression, so the guard wrap must reach the chain tip
export function f(a, b) {
  const exp = a?.at(-1).x ** 2;
  const neg = -b?.flat().length;
  return [exp, neg];
}
