import _at from "@core-js/pure/actual/instance/at";
// A comma prefix in the source slot runs once before the property read, both directly and under
// an array wrapper. A claim inside the prefix is rewritten where it stands.
function viaSeqSlot(mark, arr) {
  const viaSeq = _at((mark(), arr));
  const [_ref] = [{
    w: (mark(), arr)
  }];
  const viaSeqWrapped = _at(_ref.w);
  const viaSeqClaim = _at((_at(arr).call(arr, 0), arr));
  return [viaSeq, viaSeqWrapped, viaSeqClaim];
}
export default [viaSeqSlot(() => 1, [1, 2])];