const out = [];
{
  const source = { w: Object };
  const wrapperWritten = { k: source };
  // This write definitely replaces source.w; only instance dispatch remains, without an Object guard.
  wrapperWritten.k.w = Map;
  const { w: { values: viaWrapperWritten } } = source;
  out.push(viaWrapperWritten);
}
export { out };
