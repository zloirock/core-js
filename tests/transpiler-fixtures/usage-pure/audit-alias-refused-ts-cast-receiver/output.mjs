import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// TS wrappers around a refused-alias receiver are transparent: the cast / non-null peels to
// the bare identifier and the member read behaves exactly like the unwrapped form - the
// runtime ctor guard applies where the bare form guards, raw where it stays raw
function viaCast(c: boolean) {
  let M: any;
  if (c) M = _Map;
  return typeof (M === _Map ? _Map$groupBy : (M as any).groupBy);
}
function viaNonNull(c: boolean) {
  let P: any;
  if (c) P = _Promise;
  return typeof (P === _Promise ? _Promise$try : P!.try);
}
export const r = [viaCast(true), viaNonNull(true)];