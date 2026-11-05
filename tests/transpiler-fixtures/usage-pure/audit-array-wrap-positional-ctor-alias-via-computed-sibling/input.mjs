// A literal computed key in the first element does not hide the second element's Promise hint.
// The patterns stay native and the later allSettled call receives its static polyfill.
const [{ ['WeakSet']: WS }, { Promise: PR }] = [globalThis, globalThis];
export const viaComputedSibling = PR.allSettled([]);
