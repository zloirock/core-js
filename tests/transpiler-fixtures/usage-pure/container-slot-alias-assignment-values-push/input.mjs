const out = [];
{
  const written = { w: Object };
  const writtenAlias = written.w;
  written.w = Array;
  const viaWrittenSlot = writtenAlias.values;
  out.push(viaWrittenSlot);
}
export { out };
