// A literal computed WeakSet key keeps its native constructor extraction from the paired realm element.
// The neighbouring Promise binding must not replace that positional hint.
const [{ ['WeakSet']: WS }, { Promise: PR }] = [globalThis, globalThis];
export const viaComputedLiteralKey = new WS();
