// `Awaited<[Promise<X>, Promise<Y>]>` distributes element-wise per TS spec, yielding
// `[Awaited<X>, Awaited<Y>]`. tuple-element access on the awaited result must still
// narrow to the inner element type so instance-method dispatch picks the right polyfill
async function tupleAwait() {
  type Pair = Awaited<[Promise<number[]>, Promise<string[]>]>;
  declare const p: Pair;
  const item = p[0];
  item.at(0);
  item.findLast(x => true);
}
tupleAwait();
