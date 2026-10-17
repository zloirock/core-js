import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// both-global multi-element: each folds to its own positional global
const [{
  Array: F
}, {
  Promise: P
}] = [_globalThis, {
  Promise: _Promise
}];
export const viaBothB = _Promise$allSettled([]);