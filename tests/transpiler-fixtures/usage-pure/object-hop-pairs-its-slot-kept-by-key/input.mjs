function keptByKey(key) {
  const ns = { Q: Array, [key]: Map };
  const { Q: { of: kept } } = ns;
  return kept;
}
export default [keptByKey('Q')];
