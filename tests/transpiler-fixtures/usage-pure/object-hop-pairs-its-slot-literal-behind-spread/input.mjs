function literalBehindSpread(extra) {
  const { w: { at: behindSpreadAt } } = { ...extra, w: [1, 2] };
  return behindSpreadAt;
}
export default [literalBehindSpread({})];
