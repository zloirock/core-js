import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const [{
  Array: F
}, {
  Promise: P
}] = [_globalThis, _globalThis];
export const viaBothA = _Array$from([1]);