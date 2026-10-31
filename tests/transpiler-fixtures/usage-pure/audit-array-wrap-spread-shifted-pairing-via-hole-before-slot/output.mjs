import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
const [, {
  Map: HM
}] = [, _globalThis];
export const viaHoleBeforeSlot = _Map$groupBy([3, 4], v => v);