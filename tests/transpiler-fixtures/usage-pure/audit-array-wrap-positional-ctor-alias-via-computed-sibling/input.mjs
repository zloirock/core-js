// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const [{ ['WeakSet']: WS }, { Promise: PR }] = [globalThis, globalThis];
export const viaComputedSibling = PR.allSettled([]);
