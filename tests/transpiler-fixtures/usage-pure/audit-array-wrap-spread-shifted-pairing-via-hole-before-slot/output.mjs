import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// An array hole preserves the exact position of the following realm element.
// The native Map extraction still provides the hint for the later groupBy call.
const [, {
  Map: HM
}] = [, _globalThis];
export const viaHoleBeforeSlot = _Map$groupBy([3, 4], v => v);