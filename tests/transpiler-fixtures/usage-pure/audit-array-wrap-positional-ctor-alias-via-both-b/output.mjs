import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const [{
  Array: F
}, {
  Promise: P
}] = [_globalThis, _globalThis];
export const viaBothB = _Promise$allSettled([]);