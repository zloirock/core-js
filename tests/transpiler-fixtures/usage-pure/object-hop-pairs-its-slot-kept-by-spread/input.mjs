function keptBySpread(extra) {
  const { w: { Array: { of: kept } } } = { w: globalThis, ...extra };
  return kept;
}
export default [keptBySpread({})];
