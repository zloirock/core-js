// An optional polyfilled call with a non-optional member tail used as the TEST of a conditional
// expression must wrap the whole guarded chain (`(a?.at(-1).x) ? 1 : 2`), not leave it bare
// (`cond ? void 0 : X.x ? 1 : 2`, where the `? :` would bind to the success branch only and the
// null path would yield void 0 instead of the alternate). same trailing-tail tip handling as the
// operator case, applied to the ConditionalExpression-test position
export function pick(a, b) {
  const test = a?.at(-1).x ? 1 : 2;
  const combine = b?.flat().map(x => x).at(-1).y ? 3 : 4;
  return [test, combine];
}
