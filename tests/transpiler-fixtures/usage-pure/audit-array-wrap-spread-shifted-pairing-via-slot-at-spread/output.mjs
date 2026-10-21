import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
let tail = [{}, {}];
let ax, AM, AS;
[ax, {
  Promise: AM
}] = [...tail, _globalThis];
const [{
  Set: C
}, {
  WeakMap: W
}] = [_globalThis, ...tail];
export const viaSlotAtSpread = new W();