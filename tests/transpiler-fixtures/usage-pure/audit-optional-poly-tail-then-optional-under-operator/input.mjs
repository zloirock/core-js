// polyfilled optional call (`?.at()` / `?.flat()` / `?.findLast()`), a NON-optional member tail
// (`.x`), then a SURVIVING optional continuation (`?.y`), under an operator / unary / logical
// context. the guard ternary must be parenthesized over the deoptionalized prefix only (with `?.y`
// outside) so the operator binds the guarded value, not the guard's nullish test or its alternate.
export function f(a, b, c) {
  const sq = a?.at(-1).x?.y ** 2;
  const neg = -b?.flat().x?.y;
  const or = c?.findLast(Boolean).x?.y || 0;
  return [sq, neg, or];
}
