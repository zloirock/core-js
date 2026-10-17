function seqDefaultKeepsLiteral(f) {
  const { w: { Map: viaSeqDefault } } = { w: (f(), globalThis ?? {}) };
  return viaSeqDefault;
}
export default [seqDefaultKeepsLiteral(() => 1)];
