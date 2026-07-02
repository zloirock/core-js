import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// TS wrappers around a refused-alias receiver are transparent: the cast / non-null peels to the
// bare identifier and the member read stays raw exactly like the unwrapped form
function viaCast(c: boolean) {
  let M: any;
  if (c) M = _Map;
  return typeof (M as any).groupBy;
}
function viaNonNull(c: boolean) {
  let P: any;
  if (c) P = _Promise;
  return typeof P!.try;
}
export const r = [viaCast(true), viaNonNull(true)];