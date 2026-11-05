import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// Two realm elements retain independent positional constructor hints while their patterns stay native.
// A later Promise.allSettled call is served through the second binding.
const [{
  Array: F
}, {
  Promise: P
}] = [_globalThis, _globalThis];
export const viaBothB = _Promise$allSettled([]);