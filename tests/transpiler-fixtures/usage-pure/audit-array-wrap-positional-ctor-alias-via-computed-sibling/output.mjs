import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// A literal computed key in the first element does not hide the second element's Promise hint.
// The patterns stay native and the later allSettled call receives its static polyfill.
const [{
  ['WeakSet']: WS
}, {
  Promise: PR
}] = [_globalThis, _globalThis];
export const viaComputedSibling = _Promise$allSettled([]);