import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// `Awaited<[Promise<X>, Promise<Y>]>` distributes element-wise per TS spec, yielding
// `[Awaited<X>, Awaited<Y>]`. tuple-element access on the awaited result must still
// narrow to the inner element type so instance-method dispatch picks the right polyfill
async function tupleAwait() {
  type Pair = Awaited<[Promise<number[]>, Promise<string[]>]>;
  declare const p: Pair;
  const item = p[0];
  _atMaybeArray(item).call(item, 0);
  _findLastMaybeArray(item).call(item, x => true);
}
tupleAwait();