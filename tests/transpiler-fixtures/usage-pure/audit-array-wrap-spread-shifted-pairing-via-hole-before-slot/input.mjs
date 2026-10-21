// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
const [, { Map: HM }] = [, globalThis];
export const viaHoleBeforeSlot = HM.groupBy([3, 4], v => v);
