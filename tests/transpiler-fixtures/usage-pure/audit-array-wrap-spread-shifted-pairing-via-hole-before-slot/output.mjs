import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// control: a HOLE before the slot is not a spread - positions stay static and the pairing
// folds (only a spread makes later positions runtime-determined)
const [, {
  Map: HM
}] = [, {
  Map: _Map
}];
export const viaHoleBeforeSlot = _Map$groupBy([3, 4], v => v);