import _globalThis from "@core-js/pure/actual/global-this";
// A literal computed WeakSet key keeps its native constructor extraction from the paired realm element.
// The neighbouring Promise binding must not replace that positional hint.
const [{
  ['WeakSet']: WS
}, {
  Promise: PR
}] = [_globalThis, _globalThis];
export const viaComputedLiteralKey = new WS();