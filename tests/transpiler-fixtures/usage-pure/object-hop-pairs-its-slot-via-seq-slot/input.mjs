// A comma prefix in the source slot runs once before the property read, both directly and under
// an array wrapper. A claim inside the prefix is rewritten where it stands.
function viaSeqSlot(mark, arr) {
  const { w: { at: viaSeq } } = { w: (mark(), arr) };
  const [{ w: { at: viaSeqWrapped } }] = [{ w: (mark(), arr) }];
  const { w: { at: viaSeqClaim } } = { w: (arr.at(0), arr) };
  return [viaSeq, viaSeqWrapped, viaSeqClaim];
}
export default [viaSeqSlot(() => 1, [1, 2])];
