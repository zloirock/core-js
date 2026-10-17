function nestedSeqKeepsLiteral(f, g) {
  const { w: { Array: { from: viaNestedSeq } } } = { w: (f(), (g(), globalThis)) };
  return viaNestedSeq;
}
export default [nestedSeqKeepsLiteral(() => 1, () => 2)];
