// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
function assignForms(f, g) {
  let nestedSeq;
  let seqDefault;
  let hopOrDefault;
  let hopNav;
  let hopOptional;
  ({ Array: { from: nestedSeq } } = (f(), (g(), globalThis)));
  ({ Map: seqDefault } = (f(), globalThis ?? {}));
  ({ w: { Map: hopOrDefault } } = { w: globalThis || {} });
  ({ w: { Array: { from: hopNav } } } = { w: globalThis });
  ({ w: { Map: hopOptional } } = { w: globalThis?.globalThis });
  let hopSeq;
  let hopSeqDefault;
  ({ w: { Array: { from: hopSeq } } } = { w: (f(), (g(), globalThis)) });
  ({ w: { Map: hopSeqDefault } } = { w: (f(), globalThis ?? {}) });
  return [nestedSeq, seqDefault, hopOrDefault, hopNav, hopOptional, hopSeq, hopSeqDefault];
}
export default [assignForms(() => 1, () => 2)];
