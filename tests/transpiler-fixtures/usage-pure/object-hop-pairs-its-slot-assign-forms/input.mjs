// Direct realm assignments keep supported static and constructor claims.
// Literal-object hops retain native reads while preserving nested prefixes, defaults and stores.
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
  // A prefix inside the literal slot stays in that slot before the native nested read.
let hopSeq;
  let hopSeqDefault;
  ({ w: { Array: { from: hopSeq } } } = { w: (f(), (g(), globalThis)) });
  ({ w: { Map: hopSeqDefault } } = { w: (f(), globalThis ?? {}) });
  return [nestedSeq, seqDefault, hopOrDefault, hopNav, hopOptional, hopSeq, hopSeqDefault];
}
export default [assignForms(() => 1, () => 2)];
